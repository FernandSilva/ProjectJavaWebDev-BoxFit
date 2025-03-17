// src/types/index.ts
import { ReactNode } from "react";

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption?: string;
  file?: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption?: string;
  imageId: string;
  imageUrl?: URL;
  file?: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  followers?: string[];
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IUserRelationship = {
  userId: string;       // The ID of the user who is performing the action
  followsUserId: string; // The ID of the user who is being followed/unfollowed
};

export type IFollowUser = IUserRelationship;

export type IUnfollowUser = {
  documentId: string; // Document ID representing the follow relationship
};

export interface IComment {
  postId: string;
  userId: string;
  text: string;
}

export interface ICreateComment {
  postId: string;
  userId: string;
  text: string;
}

export interface IDeleteComment {
  commentId: string;
}

// For general use in the app
export interface User {
  $id: string;
  name: string;
  username: string;
  email: string;
  id: string;
  imageUrl: string;
  bio: string;
  latestMessage?: {
    content: string;
    timestamp: string;
  } | null;
}

export interface Message {
  text: ReactNode;
  id: string;
  $id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  recipientId: string;
}

export interface Notification {
  $id: string; // Appwrite-generated document ID
  userId: string; // Recipient's ID
  senderId: string; // Sender's ID
  type: "message" | "like" | "follow" | "comment" | "delete"; 
  relatedId: string; // Related resource ID
  referenceId: string; // Additional reference
  content: string; // Notification content
  isRead: boolean; // Read status
  createdAt: string; // ISO date string
  senderName: string; // Sender's name
  senderImageUrl: string; // Sender's profile image URL
}

export interface NotificationResponse {
  documents: Notification[]; // Array of notifications
  total: number; // Total count
}

// Updated context type to include sessionExpired.
export interface IContextType {
  isAuthenticated: boolean;
  user: User | null;
  sessionExpired: boolean; // Added new property
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  checkAuthUser: () => Promise<boolean>;
}
