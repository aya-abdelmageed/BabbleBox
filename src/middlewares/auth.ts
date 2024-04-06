import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key";

export const authenticateJWTReq = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};


export const authenticateJWTSocket = (
  socket: any,
  next: NextFunction
) => {
  const token = socket.handshake.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.request.user = decoded;

    next();
  } catch (error) {
    return next(new Error("Unauthorized: Invalid token"));
  }
}


