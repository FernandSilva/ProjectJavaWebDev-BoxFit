import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  userId: string;
  recipientId: string;
  content: string;
  username: string;
  senderImageUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    recipientId: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    senderImageUrl: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
