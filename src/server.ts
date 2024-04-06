import dotenv from "dotenv";
dotenv.config();

import express from "express";
import startConnection from "./helpers/connectDB";
// import cors from "cors";
import { UserModel } from "./models";
import router from "./routes";
import { createServer } from "http";
import { Server } from "socket.io";
import setupSocket from "./helpers/connectSocket";
import path from "path";
import { authenticateJWTSocket } from "middlewares/auth";
// Create Express app
const app = express();

// Middleware
app.use(express.json());
// app.use(cors());
app.use(express.static(path.join(__dirname, "src")));

const httpServer = createServer(app);
const io = new Server(httpServer, {});
io.use(authenticateJWTSocket);
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
});

setupSocket(io);
// Routes
app.use("/api", router);
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Setup Socket.io

// Connect to MongoDB
startConnection();

// Routes
app.get("/", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

