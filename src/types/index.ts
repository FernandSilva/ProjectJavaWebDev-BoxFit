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
  userId: string;
  followsUserId: string;
};

export type IFollowUser = IUserRelationship;

export type IUnfollowUser = {
  documentId: string;
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
  senderImageUrl: string;
}

// ✅ Updated to include all six notification types
export interface Notification {
  $id: string;
  userId: string;
  senderId: string;
  type: "message" | "follow" | "comment" | "unfollow" | "postLike" | "comment-like"; // ✅ ADD postLike and comment-like here
  relatedId: string;
  referenceId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderImageUrl: string;
}


export interface NotificationResponse {
  documents: Notification[];
  total: number;
}

export interface IContextType {
  isAuthenticated: boolean;
  user: User | null;
  sessionExpired: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  checkAuthUser: () => Promise<boolean>;
  setSessionExpired: (value: boolean) => void;
}

export const QUERY_KEYS = {
  GET_POSTS: "getPosts",
  GET_RECENT_POSTS: "getRecentPosts",
  GET_POST_BY_ID: "getPostById",
  GET_USER_POSTS: "getUserPosts",
  GET_USERS: "getUsers",
  GET_USER_BY_ID: "getUserById",
  GET_USER_RELATIONSHIPS: "getUserRelationships",
  GET_USER_RELATIONSHIPS_LIST: "getUserRelationshipsList",
  GET_USER_RELATIONSHIPS_FOLLOWERSLIST: "getUserRelationshipsFollowersList",
  GET_INFINITE_POSTS: "getInfinitePosts",
  GET_MESSAGES: "getMessages",
  GET_CURRENT_USER: "getCurrentUser",
  GET_NOTIFICATIONS: "getNotifications",
  GET_USER_TOTAL_LIKES: "getUserTotalLikes",
  SEARCH_POSTS: "searchPosts",
  SEARCH_USERS_AND_POSTS: "searchUsersAndPosts",
};

export const INITIAL_USER: User = {
  $id: "",
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};
