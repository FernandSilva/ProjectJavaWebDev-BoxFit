import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  userId: string;
  followsUserId: string;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    userId: { type: String, required: true },
    followsUserId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFollow>("Follow", FollowSchema);
