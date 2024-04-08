import { MessageModel, UserModel } from "models/index";

export const GET_SYNCED_GROUPS = "get-synced-groups";

export const GET_SYNCED_GROUP_MESSAGES = "get-synced-group-messages";

export const RECIEVE_NEW_GROUP_MESSAGE = "recieve-new-group-message";

export const RECIEVE_UPDATED_GROUP_MESSAGE = "recieve-updated-group-message";

const syncMessages = async (socket: any, groupId, user) => {
  try {
    const newMessages = await MessageModel.find({
      group: groupId,
      createdAt: { $gte: user.lastSeen },
    });

    socket.emit(RECIEVE_NEW_GROUP_MESSAGE, newMessages);

    let updatedMessages = await MessageModel.find({
      group: groupId,
      updatedAt: { $gte: user.lastSeen },
      _v: { $ne: 0 },
    });

    socket.emit(RECIEVE_UPDATED_GROUP_MESSAGE, updatedMessages);
  } catch (error) {
    console.error("Error in get-synced-group-messages:", error);
  }
};
const syncGroups = async (socket: any) => {
  try {
    const { userId } = socket.request.user;
    const user = await UserModel.findById(userId);
    user.groups.forEach((group) => {
      socket.join(group.group);
    });

    user.groups.forEach(async (group) => {
      await syncMessages(socket, group.group, user);
    });
  } catch (error) {
    console.error("Error in get-synced-groups:", error);
  }
};

export default syncGroups;
