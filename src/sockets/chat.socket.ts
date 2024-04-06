import { UserModel, ChatModel, MessageModel } from "models/index";
import { Socket } from "socket.io";
import { generateJWT } from "helpers/jwt";
import { uploadFile } from "helpers/fileUploader";

// const checkUserJionedRoom = async (chatId, userId,io, socket) => {

//   if(socket.rooms.has(chatId)){
//     return;
//   }
//   else{
//     const chat = await ChatModel.findById(chatId);
//     if(chat.members.includes(userId)){
//       socket.join(chatId);
//       io.to(chatId).emit(JION_CHAT_ROOM, chatId);
//     }

// }

const JION_CHAT_ROOM = "join-chat-room";
const SEND_MESSAGE = "send-message";
const READ_MESSAGE = "read-message";
const EDIT_MESSAGE = "edit-message";
const DELETE_MESSAGE = "delete-message";
const PIN_MESSAGE = "pin-message";
const UNPIN_MESSAGE = "unpin-message";
const REACT_MESSAGE = "react-message";
const UNREACT_MESSAGE = "unreact-message";

const chatSockets = (io: any, socket: Socket) => {
  // Join chat room
  socket.on(JION_CHAT_ROOM, async ({ chatId, userId }) => {
    const user = await UserModel.findByIdAndUpdate(userId);
    if (user) {
      socket.join(chatId);
      user.chats.push(chatId);
      await user.save();
    }
  });

  // Send message
  socket.on(SEND_MESSAGE, async (data) => {
    try {
      let {
        chatId,
        senderId,
        text,
        mediaType,
        mediaData,
        mediaName,
        recipientUserName,
      } = data;
      let newChat = chatId ? false : true;
      if (!chatId) {
        const recipient = await UserModel.findOne({
          username: recipientUserName,
        });
        const sender = await UserModel.findById(senderId);
        const chat = await ChatModel.findOne({
          members: { $all: [senderId, recipient._id] },
        });
        if (!chat) {
          const newChat = new ChatModel({
            members: [senderId, recipient._id],
          });
          await newChat.save();
          sender.chats.push(newChat._id);
          await sender.save();
          console.log("newChat created", newChat);
          chatId = newChat._id;
          socket.join(chatId);
        }
      }
      socket.join(chatId);

      let mediaContent = "";
      if (mediaType && mediaData) {
        const buffer = Buffer.from(mediaData, "base64");
        const file = {
          originalname: mediaName,
          mimetype: mediaType,
          buffer,
        };
        mediaContent = await uploadFile(file, "chat-media");
      }

      const newMessageData = {
        chat: chatId,
        sender: senderId,
        content: text,
        media: {
          content: mediaContent,
          mediaType: mediaType,
        },
      };
      const newMessage = new MessageModel(newMessageData);
      await newMessage.save();
      io.to(chatId).emit(READ_MESSAGE, {
        ...newMessage._doc,
        newChat,
      });
    } catch (error) {
      console.error("Error in send-message:", error);
    }
  });
};

export default chatSockets;
