import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  userId: string;        // person doing the follow
  followsUserId: string; // person being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    userId: { type: String, required: true, index: true },
    followsUserId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFollow>("Follow", FollowSchema);
