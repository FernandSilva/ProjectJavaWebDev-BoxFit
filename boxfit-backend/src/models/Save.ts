import mongoose, { Schema, Document } from "mongoose";

export interface ISave extends Document {
  userId: string;
  postId: string;
  createdAt: Date;
}

const SaveSchema = new Schema<ISave>(
  {
    userId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISave>("Save", SaveSchema);
