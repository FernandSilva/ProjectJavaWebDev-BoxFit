import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: string;
  userId: string;
  text: string;
  userImageUrl?: string;
  userName?: string;
  likes: string[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    text: { type: String, required: true },
    userImageUrl: { type: String },
    userName: { type: String },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
