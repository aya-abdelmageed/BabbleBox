import { MessageModel, UserModel, GroupModel } from "models/index";

import { Socket } from "socket.io";
import { connectedUsers } from "./index";

const CREATE_NEW_GROUP = "create-new-group";
const ADD_MEMBER_TO_GROUP = "add-member-to-group";
const REMOVE_MEMBER_FROM_GROUP = "remove-member-from-group";
const DELETE_GROUP = "delete-group";
const LEAVE_GROUP = "leave-group";
const SEND_MESSAGE = "send-message";
const READ_MESSAGE = "read-message";
const DELETE_MESSAGE = "delete-message";
const TOGGLE_PIN_MESSAGE = "toggle-pin-message";
const TOGGLE_MESSAGE_REACT = "toggle-message-react";
const JOIN_GROUP = "join-group";
const GET_OLD_MESSAGES = "get-old-messages";
const ADD_ADMIN_TO_GROUP = "add-admin-to-group";
const REMOVE_ADMIN_FROM_GROUP = "remove-admin-from-group";

const groupSockets = (io: any, socket: Socket) => {
  // Create new group
  socket.on(CREATE_NEW_GROUP, async (data) => {
    try {
      const { creatorId, name, members, description, groupUniqueName } = data;
      const newGroup = new GroupModel({
        owner: creatorId,
        name,
        members: members.length + 1,
        description,
        groupUniqueName,
      });
      await newGroup.save();
      socket.join(newGroup._id);
      const ownerData = await UserModel.findByIdAndUpdate(creatorId, {
        $push: { groups: newGroup._id, role: "owner" },
      }).exec();
      io.to(newGroup._id).emit(
        SEND_MESSAGE,
        `${ownerData.username} has created group`
      );
      io.to(creatorId).emit(JOIN_GROUP, newGroup);
      const membersData = await UserModel.find({
        _id: { $in: members },
      }).exec();
      membersData.forEach(async (member) => {
        member.groups.push({
          group: newGroup._id,
        });
        await member.save();
        if (connectedUsers[member._id]) {
          io.to(connectedUsers[member._id]).join(newGroup._id);
          io.to(newGroup._id).emit(
            SEND_MESSAGE,
            `${member.username} has joined group`
          );
          io.to(member._id).emit(JOIN_GROUP, newGroup);
        }
      });
    } catch (error) {
      console.error("Error in CREATE_NEW_GROUP:", error);
    }
  });

  // Add member to group
  socket.on(ADD_MEMBER_TO_GROUP, async (data) => {
    try {
      const { groupId, memberId } = data;
      const group = await GroupModel.findById(groupId);
      group.members = +1;
      await group.save();
      const member = await UserModel.findById(memberId);
      member.groups.push({ group: groupId });
      await member.save();
      io.to(groupId).emit(SEND_MESSAGE, `${member.username} has joined group`);
      if (connectedUsers[memberId]) {
        io.to(connectedUsers[memberId]).join(groupId);
        io.to(memberId).emit(JOIN_GROUP, group);
      }
    } catch (error) {
      console.error("Error in ADD_MEMBER_TO_GROUP:", error);
    }
  });

  socket.on(JOIN_GROUP, async (data) => {
    try {
      const { groupId, memberId } = data;
      const group = await GroupModel.findById(groupId);
      group.members += 1;
      await group.save();
      const member = await UserModel.findById(memberId);
      member.groups.push({ group: groupId });
      await member.save();
      io.to(groupId).emit(SEND_MESSAGE, `${member.username} has joined group`);
      if (connectedUsers[memberId]) {
        io.to(connectedUsers[memberId]).join(groupId);
        io.to(memberId).emit(JOIN_GROUP, group);
      }
    } catch (error) {
      console.error("Error in JOIN_GROUP:", error);
    }
  });

  // Remove member from group
  socket.on(REMOVE_MEMBER_FROM_GROUP, async (data) => {
    try {
      const { groupId, memberId, removerId } = data;
      const group = await GroupModel.findById(groupId);

      if (
        group.owner === removerId ||
        group.admins.find((admin) => admin.admin === removerId)
      ) {
        io.to(memberId).emit(
          REMOVE_MEMBER_FROM_GROUP,
          "You are not allowed to remove member"
        );
        return;
      }
      group.members -= 1;
      await group.save();
      const member = await UserModel.findById(memberId);
      member.groups = member.groups.filter(
        (groupData) => groupData.group != groupId
      );
      await member.save();
      io.to(groupId).emit(
        SEND_MESSAGE,
        `${member.username} has been removed from group`
      );
      if (connectedUsers[memberId])
        io.to(connectedUsers[memberId]).leave(groupId);
      io.to(memberId).emit(LEAVE_GROUP, groupId);
    } catch (error) {
      console.error("Error in REMOVE_MEMBER_FROM_GROUP:", error);
    }
  });

  // Delete group
  socket.on(DELETE_GROUP, async (data) => {
    try {
      const { groupId, creatorId } = data;
      const group = await GroupModel.findById(groupId);

      if (group.owner !== creatorId) {
        return;
      }
      await GroupModel.findByIdAndDelete(groupId).exec();
      await UserModel.updateMany(
        {
          "groups.group": groupId,
        },
        { $pull: { groups: { group: groupId } } }
      ).exec();

      io.to(groupId).emit(SEND_MESSAGE, "Group has been deleted");
      if (connectedUsers[creatorId]) {
        io.to(connectedUsers[creatorId]).leave(groupId);
      }
    } catch (error) {
      console.error("Error in DELETE_GROUP:", error);
    }
  });

  // Leave group
  socket.on(LEAVE_GROUP, async (data) => {
    try {
      const { groupId, memberId } = data;
      const group = await GroupModel.findById(groupId);
      if (!group) {
        io.to(memberId).emit(LEAVE_GROUP, "Group not found");
      }
      group.members -= 1;
      await group.save();
      const member = await UserModel.findById(memberId);
      member.groups = member.groups.filter(
        (groupData) => groupData.group != groupId
      );
      await member.save();
      io.to(groupId).emit(SEND_MESSAGE, `${member._id} has left group`);
      socket.leave(groupId);
    } catch (error) {
      console.error("Error in LEAVE_GROUP:", error);
    }
  });

  // Send message
  socket.on(SEND_MESSAGE, async (data) => {
    try {
      const { groupId, senderId, message, mediaContent, mediaType } = data;
      const newMessage = new MessageModel({
        sender: senderId,
        message,
        group: groupId,
        media: {
          content: mediaContent,
          tycontentTypepe: mediaType,
        },
      });
      await newMessage.save();

      io.to(groupId).emit(READ_MESSAGE, newMessage);
    } catch (error) {
      console.error("Error in SEND_MESSAGE:", error);
    }
  });

  // Delete message
  socket.on(DELETE_MESSAGE, async (data) => {
    try {
      const { messageId, senderId } = data;
      const message = await MessageModel.findById(messageId);
      if (message.sender !== senderId) {
        return;
      }
      await MessageModel.findByIdAndDelete(messageId).exec();
      io.to(message.group).emit(DELETE_MESSAGE, messageId);
    } catch (error) {
      console.error("Error in DELETE_MESSAGE:", error);
    }
  });

  // Toggle pin message
  socket.on(TOGGLE_PIN_MESSAGE, async (data) => {
    try {
      const { messageId, senderId, isPinned } = data;
      const message = await MessageModel.findByIdAndUpdate(messageId, {
        isPinned,
      }).exec();
      io.to(message.group).emit(TOGGLE_PIN_MESSAGE, message);
    } catch (error) {
      console.error("Error in TOGGLE_PIN_MESSAGE:", error);
    }
  });

  // Toggle message react
  socket.on(TOGGLE_MESSAGE_REACT, async (data) => {
    try {
      const { messageId, senderId, reaction, event } = data;
      const message = await MessageModel.findById(messageId);

      if (event === "remove") {
        message.reactions = message.reactions.filter(
          (r) => r.user !== senderId
        );
      } else {
        const react = message.reactions.find((r) => r.user === senderId);
        if (react) {
          react.emoji = reaction;
        } else {
          message.reactions.push({ user: senderId, emoji: reaction });
        }
      }
      await message.save();
      io.to(message.group).emit(TOGGLE_MESSAGE_REACT, message);
    } catch (error) {
      console.error("Error in TOGGLE_MESSAGE_REACT:", error);
    }
  });

  // Add admin to group
  socket.on(ADD_ADMIN_TO_GROUP, async (data) => {
    try {
      const { groupId, adminId, addedBy } = data;
      const group = await GroupModel.findById(groupId);
      group.admins.push({ admin: adminId, addedBy });
      await group.save();
      const admin = await UserModel.findById(adminId);
      admin.groups.map((groupData) => {
        if (groupData.group == groupId) {
          groupData.role = "admin";
        }
      });
      await admin.save();

      io.to(groupId).emit(
        SEND_MESSAGE,
        `${admin.username} has been added as admin to the group`
      );
      io.to(connectedUsers[adminId]).emit(ADD_ADMIN_TO_GROUP, admin);
    } catch (error) {
      console.error("Error in ADD_ADMIN_TO_GROUP:", error);
    }
  });

  // Remove admin from group
  socket.on(REMOVE_ADMIN_FROM_GROUP, async (data) => {
    try {
      const { groupId, adminId } = data;
      const group = await GroupModel.findById(groupId);
      group.admins = group.admins.filter((admin) => admin.admin != adminId);
      await group.save();
      const admin = await UserModel.findById(adminId);
      admin.groups.map((groupData) => {
        if (groupData.group == groupId) {
          groupData.role = "member";
        }
      });
      await admin.save();
      io.to(groupId).emit(
        SEND_MESSAGE,
        `${admin.username} has been removed as admin from the group`
      );
      io.to(connectedUsers[adminId]).emit(REMOVE_ADMIN_FROM_GROUP, admin);
    } catch (error) {
      console.error("Error in REMOVE_ADMIN_FROM_GROUP:", error);
    }
  });

  // Get old messages
  socket.on(GET_OLD_MESSAGES, async (data) => {
    try {
      const { groupId, date } = data;
      const messages = await MessageModel.find({
        group: groupId,
        createdAt: { $lte: date },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();
      socket.emit(GET_OLD_MESSAGES, messages);
    } catch (error) {
      console.error("Error in GET_OLD_MESSAGES:", error);
    }
  });
};


export default groupSockets;
