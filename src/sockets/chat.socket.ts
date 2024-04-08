import { ChatModel, MessageModel, UserModel } from "models/index";
import
  {
    deleteMessage,
    saveMessage,
    saveReactedMessage,
    togglePinMessage,
  } from "redisControllers/chat.redis";
import { Socket } from "socket.io";
import { connectedUsers } from "./index";

export const SEND_MESSAGE = "send-message";
export const READ_MESSAGE = "read-message";
export const DELETE_MESSAGE = "delete-message";
export const TOGGLE_PIN_MESSAGE = "toggle-pin-message";

export const TOGGLE_MESSAGE_REACT = "toggle-message-react";

const createNewChat = async ({ senderId, recipientId, chatId }) => {
  try {
    const recipient = await UserModel.findById(recipientId);
    const sender = await UserModel.findById(senderId);
    const chat = await ChatModel.findOne({
      members: { $all: [senderId, recipientId] },
    });
    if (!chat) {
      const newChat = new ChatModel({
        members: [senderId, recipient._id],
      });
      await newChat.save();
      sender.chats.push(newChat._id);
      recipient.chats.push(newChat._id);
      await sender.save();
      await recipient.save();

      chatId = newChat._id;
    }
  } catch (error) {
    console.error("Error in createNewChat:", error);
  }
};

const chatSockets = (io: any, socket: Socket) => {
  // Send message
  socket.on(SEND_MESSAGE, async (data) => {
    try {
      let { chatId, senderId, text, mediaType, mediaContent, recipientId } =
        data;

      if (!chatId)
        await createNewChat({
          senderId,
          recipientId,
          chatId,
        });

      socket.join(chatId);
      const newMessageData = {
        chat: chatId,
        recipient: recipientId,
        sender: senderId,
        content: text,
        media: {
          content: mediaContent,
          mediaType: mediaType,
        },
      };
      const newMessage = new MessageModel(newMessageData);

      if (!connectedUsers.has(recipientId))
        saveMessage(newMessage, recipientId);
      else io.to(recipientId).emit(READ_MESSAGE, newMessage);

      await newMessage.save();
    } catch (error) {
      console.error("Error in send-message:", error);
    }
  });

  socket.on(TOGGLE_PIN_MESSAGE, async (data) => {
    try {
      const { messageId, chatId, recipientId, isPinned } = data;
      const message = await MessageModel.findByIdAndUpdate(messageId, {
        isPinned,
      });

      if (!message) {
        return;
      }
      if (!connectedUsers.has(recipientId))
        togglePinMessage(message, recipientId);
      else io.to(recipientId).emit(TOGGLE_PIN_MESSAGE, message);
    } catch (error) {
      console.error("Error in pin-message:", error);
    }
  });

  socket.on(TOGGLE_MESSAGE_REACT, async (data) => {
    try {
      const { userId, messageId, chatId, recipientId, reaction, event } = data;
      const message = await MessageModel.findById(messageId);

      if (!message) {
        return;
      }
      if (event === "remove") {
        message.reactions = message.reactions.filter((r) => r.user !== userId);
      } else {
        const react = message.reactions.find((r) => r.user === userId);
        if (react) {
          react.emoji = reaction;
        } else {
          message.reactions.push({ user: userId, emoji: reaction });
        }
      }

      // Save the reacted message for the recipient if offline
      if (!connectedUsers.has(recipientId))
        saveReactedMessage(message, recipientId);
      else io.to(recipientId).emit(TOGGLE_MESSAGE_REACT, message);
    } catch (error) {
      console.error("Error in toggle-message-react:", error);
    }
  });

  // Delete message
  socket.on(DELETE_MESSAGE, async (data) => {
    try {
      const { messageId, recipientId, chatId } = data;

      if (!connectedUsers.has(recipientId))
        await deleteMessage(messageId, recipientId);
      else io.to(recipientId).emit(DELETE_MESSAGE, messageId);
    } catch (error) {
      console.error("Error in delete-message:", error);
    }
  });
};

export default chatSockets;
