import { Schema, Document, model } from "mongoose";

// Define schema for Chat model
interface ChatDoc extends Document {
    members: Schema.Types.ObjectId[]; // Array of member IDs
    pinned: boolean; // Indicates if the chat is pinned
    createdAt: Date; // Date of creation
    updatedAt: Date; // Date of last update
}

const ChatSchema: Schema = new Schema(
    {
        members: [
            {
                type: Schema.Types.ObjectId, // Reference to the User model
                ref: "User",
                maxlength: 2, // Maximum of 2 members allowed
            },
        ],
        pinned: {
            type: Boolean,
            default: false, // Default value for pinned is false
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const ChatModel = model<ChatDoc>("Chat", ChatSchema); // Create the Chat model

export { ChatModel }; // Export the Chat model
