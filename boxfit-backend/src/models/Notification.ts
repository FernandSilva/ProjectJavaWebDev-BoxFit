import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  senderId: string;
  type: "message" | "comment" | "comment-like" | "post-like" | "follow" | "unfollow";
  relatedId: string;
  referenceId: string;
  content: string;
  isRead: boolean;
  senderName?: string;
  senderImageUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true },
    senderId: { type: String, required: true },
    type: { type: String, required: true },
    relatedId: { type: String },
    referenceId: { type: String },
    content: { type: String },
    isRead: { type: Boolean, default: false },
    senderName: { type: String },
    senderImageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
