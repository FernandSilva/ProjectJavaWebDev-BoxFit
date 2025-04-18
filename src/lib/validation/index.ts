import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email("Invalid email address").nonempty("Email is required"),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});



export const SigninValidation = z.object({
  email: z.string().email("Invalid email address").nonempty("Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().max(1000, { message: "Maximum 1000 characters." }).optional(),
  file: z.custom<File[]>(),
  location: z.string().max(1000, { message: "Maximum 1000 characters." }).optional(),
  tags: z.string().optional(),
});
