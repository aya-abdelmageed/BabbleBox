import chatSockets from "./chat.socket";
import { UserModel } from "models/index";
import {
  sendDeleteEvents,
  sendPinnedMessages,
  sendReactedMessages,
  sendSavedMessages,
} from "redisControllers/chat.redis";
export const connectedUsers = new Set();

const syncMessagesWhenOnline = async (userId, socket) => {
  await sendSavedMessages(userId, socket);
  await sendPinnedMessages(userId, socket);
  await sendReactedMessages(userId, socket);
  await sendDeleteEvents(userId, socket);
};

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    const { userId } = socket.request.user;

    socket.join(userId);
    connectedUsers.add(userId);
    syncMessagesWhenOnline(userId, socket);

    
    io.on("disconnect", async () => {
      // socket.leave(userId);
      connectedUsers.delete(userId);
      try {
        await UserModel.findByIdAndUpdate(userId, {
          $set: { lastSeen: new Date() },
        });
      } catch (err) {
        console.log(err);
      }
    });

    chatSockets(io, socket);
  });
};

export default setupSocket;
