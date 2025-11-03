import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: String, required: true },
    postId: { type: String },
    commentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ILike>("Like", LikeSchema);
