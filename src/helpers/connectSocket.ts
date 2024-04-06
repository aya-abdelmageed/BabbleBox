import chatSockets from "../sockets/chat.socket";

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.request.user?.userId;
    socket.join(userId);
    

    io.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    chatSockets(io, socket);
  });
};

export default setupSocket;
