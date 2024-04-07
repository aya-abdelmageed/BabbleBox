// Import mongoose
import mongoose, { Schema, Document } from "mongoose";

// Define interface for Message document
interface MessageDoc extends Document {
  sender: Schema.Types.ObjectId;
  content?: string;
  media?: {
    content: string;
    contentType: ["image", "video", "audio", "file"];
  
  };
  reactions?: {
    user: Schema.Types.ObjectId;
    emoji: string;
  }[];
  replies?: Schema.Types.ObjectId[];
  tags?: Schema.Types.ObjectId[];
  recipients: {
    recipient: Schema.Types.ObjectId;
    receivedAt: Date;
  }[];
  readBy: {
    reader: Schema.Types.ObjectId;
    readAt: Date;
  }[];
  group?: Schema.Types.ObjectId;
  chat?: Schema.Types.ObjectId;
  forwardedFrom?: Schema.Types.ObjectId;

  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema for Message model
const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
    },
    media: {
      content: String,
      contentType: ["image", "video", "audio", "file"],
    },

    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
        },
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    recipients: [
      {
        recipient: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        receivedAt: Date,
      },
    ],
    readBy: [
      {
        reader: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: Date,
      },
    ],
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },

    forwardedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define Message model
const MessageModel = mongoose.model<MessageDoc>("Message", MessageSchema);

export { MessageModel };
