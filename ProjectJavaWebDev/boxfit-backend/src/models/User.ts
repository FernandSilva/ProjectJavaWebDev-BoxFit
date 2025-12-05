// src/models/User.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  username?: string;
  password: string; // stored as bcrypt hash
  imageUrl?: string;
  bio?: string;
  posts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toSafeJSON(): Record<string, any>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    // normalize + unique email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // optional but normalized
    username: {
      type: String,
      unique: false,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    // important: keep selectable for login (do NOT set select: false)
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Indexes (safety)
// ─────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// Pre-save: normalize + hash password
// ─────────────────────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  try {
    // Normalize email/username on every save
    if (this.isModified("email") && typeof this.email === "string") {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.isModified("username") && typeof this.username === "string") {
      this.username = this.username.toLowerCase().trim();
    }

    // Hash password if changed
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      // Minimal log for debugging (do not log hash)
      console.log("🔐 [UserModel] Password hashed for", this.email);
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

// ─────────────────────────────────────────────────────────────
// Methods
// ─────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate: string) {
  if (typeof candidate !== "string" || !candidate.length) {
    console.error("❌ [UserModel] comparePassword called with empty candidate");
    return false;
  }
  if (!this.password || typeof this.password !== "string") {
    // This is the condition that caused: "Illegal arguments: string, undefined"
    console.error(
      "❌ [UserModel] Stored password hash is missing/invalid for",
      this.email
    );
    return false;
  }
  return bcrypt.compare(candidate, this.password);
};

// Helper to strip sensitive fields
UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
