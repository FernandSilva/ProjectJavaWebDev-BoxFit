import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: string; // reference to creator
  caption: string;
  imageUrl: string[];
  imageId: string[];
  likes: string[];
  saves: string[];
  comments: string[];
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    caption: { type: String, default: "" },
    imageUrl: [{ type: String }],
    imageId: [{ type: String }],
    likes: [{ type: String }],
    saves: [{ type: String }],
    comments: [{ type: String }],
    creator: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", PostSchema);
