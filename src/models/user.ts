import  { Schema, Document, model } from "mongoose";

// Define interface for User document in the database.
interface UserDoc extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  groups: {
    group: Schema.Types.ObjectId;
    role: string;
    status: string;
    joinedAt: Date;
  }[];
  chats: {
    chat: Schema.Types.ObjectId;
    status: string;
  }[];
  friends: Schema.Types.ObjectId[];
  bio: string;
  blocked: string[];
  online: boolean;
  lastSeen: Date;
  token?: string;
  createdAt: Date;
  updatedAt: Date;
}
// Define the UserGroup schema.
// It defines the structure of a UserGroup document in the database.
const UserGroup = {
  group: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },

  role: {
    type: String,
    enum: ["admin", "member", "owner"],
    default: "member",
  },
  status: {
    type: String,
    enum: ["allowed", "banned", "restricted", "muted"],
    default: "allowed",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
};

// Define the main schema for the User model.
// It defines the structure of a User document in the database.
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    profilePicture: { type: String },
    groups: [UserGroup],
    chats: [
      {
        chat: { type: Schema.Types.ObjectId, ref: "Chat" },
        status: { type: String, default: "active", enum: ["active", "blocked"] },
      }],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    blocked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }

);

// Define User model
const UserModel = model<UserDoc>("User", UserSchema);

export { UserModel  };
