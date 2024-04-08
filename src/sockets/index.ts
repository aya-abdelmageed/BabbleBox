import chatSockets from "./chat.socket";
import { UserModel } from "models/index";
import syncGroups from "./syncGroup.socket";
import groupSockets from "./group.socket";

import {
  sendDeleteEvents,
  sendPinnedMessages,
  sendReactedMessages,
  sendSavedMessages,
} from "redisControllers/chat.redis";
export const connectedUsers = {};

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
    connectedUsers[userId] = socket.id;
    syncMessagesWhenOnline(userId, socket);
    syncGroups(socket);

    io.on("disconnect", async () => {
      // socket.leave(userId);
      delete connectedUsers[userId];
      try {
        await UserModel.findByIdAndUpdate(userId, {
          $set: { lastSeen: new Date() },
        });
      } catch (err) {
        console.log(err);
      }
    });

    chatSockets(io, socket);
    groupSockets(io, socket);
  });
};

export default setupSocket;
