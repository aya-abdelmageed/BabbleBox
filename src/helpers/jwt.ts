import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key";

export const generateJWT = (payload: any) => {

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "120d" }); 
};
