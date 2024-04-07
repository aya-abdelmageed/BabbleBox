import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "models/index";
import { generateJWT } from "helpers/jwt";


export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      username,
      email,
      name,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate JWT token
    const token = generateJWT({ userId: newUser._id });
    res
      .status(201)
      .json({ message: "Signup successful", user: newUser, token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email }, "+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = generateJWT({ userId: user._id });
    user.password = "";
    console.log("Signin successful");
    res.json({
      message: "Signin successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, name, bio } = req.body;
    const profilePicture = req.file;

    const profilePictureUrl = profilePicture
      ? ""
      : "";

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        name,
        bio,
        profilePicture: profilePictureUrl,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
