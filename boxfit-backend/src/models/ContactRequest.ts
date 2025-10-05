// src/models/ContactRequest.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IContactRequest extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactRequestSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
