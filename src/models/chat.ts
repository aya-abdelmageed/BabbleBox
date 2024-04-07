import { Schema, Document, model } from "mongoose";

// Define schema for Chat model
interface ChatDoc extends Document {
  members: Schema.Types.ObjectId[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        maxlength: 2,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChatModel = model<ChatDoc>("Chat", ChatSchema);

export { ChatModel };
