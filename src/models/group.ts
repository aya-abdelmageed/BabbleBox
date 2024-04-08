import { Document, Schema, model } from "mongoose";

interface GroupDoc extends Document {
  name: string;
  description?: string;
  admins: {
    admin: Schema.Types.ObjectId;
    addedBy: Schema.Types.ObjectId;
  }[];
  owner: Schema.Types.ObjectId;
  pinned: boolean;
  privacy: "public" | "private";
  acceptMembers: "all" | "admin";
  banned: Schema.Types.ObjectId[];
  members:number;
  restricted: {
    user: Schema.Types.ObjectId;
    until: Date;
  }[];
  muted: {
    user: Schema.Types.ObjectId;
    until: Date;
  }[];
}

// Define schema for Group model
const GroupSchema = new Schema(
  {
    name: { type: String, required: true },

    description: { type: String },
    groupImage: { type: String },
    groupUniqueName: { type: String, unique: true },

    admins: [
      {
        admin: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    acceptMembers: {
      type: String,
      enum: ["all", "admin"],
      default: "all",
    },
    members: { type: Number, default: 0 },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    banned: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    restricted: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        until: Date,
      },
    ],
    muted: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        until: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const GroupModel = model<GroupDoc>("Group", GroupSchema);
export { GroupModel };
