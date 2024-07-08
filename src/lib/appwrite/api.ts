import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );


    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    throw error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// Add to api.ts

// Function to follow a user
export async function followUser(userId: string, followsUserId: string) {
  try {
    // Ensure you have a correct setup for ID.unique() or adjust it as necessary
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      ID.unique(),
      { userId, followsUserId }
    );
  } catch (error) {
    console.error("Failed to follow user:", error);
    throw error;
  }
}

// Function to unfollow a user
export async function unfollowUser(documentId: string) {
  try {
    return await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      documentId
    );
  } catch (error) {
    console.error("Failed to unfollow user:", error);
    throw error;
  }
}

// Function to get user relationships
export async function getUserRelationships(userId: string) {
  try {
    const followersPromise = databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [Query.equal("followsUserId", userId)]
    );
    const followingPromise = databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [Query.equal("userId", userId)]
    );

    const [followers, following] = await Promise.all([
      followersPromise,
      followingPromise,
    ]);

    return {
      followers: followers.total,
      following: following.total,
    };
  } catch (error) {
    console.error("Failed to get user relationships:", error);
    throw error;
  }
}
export async function getUserRelationshipsList(userId: string) {
  try {
    // Step 1: Get the list of followsUserId for the given userId
    const followResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [
        Query.equal("userId", userId)
      ]
    );

    const followsUserIds = followResponse.documents.map(doc => doc.followsUserId);

    // Step 2: Fetch user data for each followsUserId
    const usersData = [];
    for (const followsUserId of followsUserIds) {
      const userResponse = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        followsUserId
      );
      usersData.push(userResponse);
    }

    return usersData;

  } catch (error) {
    console.error("Failed to get the list of users I follow:", error);
    return [];
  }
}

// Function to check if one user is following another
export async function checkFollowStatus(userId: string, followsUserId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("followsUserId", followsUserId),
      ]
    );
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error("Failed to check follow status:", error);
    return null;
  }
}

// ============================================================
// COMMENTS
// ============================================================

// Fetch comments for a specific post
export const getCommentsByPostId = async (postId: string) => {
  try {
    return await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("postId", postId)]
    );
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }
};

// Create a new comment
export const createComment = async ({
  postId,
  userId,
  text,
  userImageUrl,
  userName,
}) => {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        postId,
        userId,
        text,
        userImageUrl, // Ensure this is correctly passed
        userName, // Ensure this is correctly passed
        createdAt: new Date().toISOString(),
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to create comment:", error);
    throw error;
  }
};

// Function to like a comment
export const likeComment = async ({ commentId, userId }) => {
  try {
    // Fetch the current comment data
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    // Increment the likes count and add the userId to the likedBy array
    const updatedComment = {
      likes: comment.likes + 1,
      likedBy: [...(comment.likedBy || []), userId],
    };

    // Update the comment document
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      updatedComment
    );
  } catch (error) {
    console.error("Failed to like comment:", error);
    throw error;
  }
};

// Function to unlike a comment
export const unlikeComment = async ({ commentId, userId }) => {
  try {
    // Fetch the current comment data
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    // Decrement the likes count and remove the userId from the likedBy array
    const updatedComment = {
      likes: comment.likes - 1,
      likedBy: comment.likedBy.filter((id) => id !== userId),
    };

    // Update the comment document
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      updatedComment
    );
  } catch (error) {
    console.error("Failed to unlike comment:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string) => {
  try {
    return await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId // Correct usage of commentId to identify the document
    );
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};

// ============================================================
// MESSAGES
// ============================================================

// Function to fetch messages
export const getMessages = async () => {
  try {
    return await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error; // Or handle more gracefully
  }
};

// Create a new message
export async function createMessage({ userId, content, username }) {
  const document = {
    userId,
    content,
    username,
    createdAt: new Date().toISOString(),
    $permissions: {
      read: ["*"], // Public read
      write: ["user:" + userId], // Only creator can modify
    },
  };

  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      ID.unique(),
      document
    );
  } catch (error) {
    console.error("Failed to create message:", error);
    throw error;
  }
}

// Delete a message
export const deleteMessage = async (messageId: string) => {
  try {
    return await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      messageId
    );
  } catch (error) {
    console.error("Failed to delete message:", error);
    throw error;
  }
};

// ============================================================
// USERS
// ============================================================

export const getAllUsers = async () => {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );
    return result.documents;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// ============================================================
// POSTS (NEW FUNCTIONS)
// ============================================================

// Function to get all posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Function to get posts from followed users
export async function getFollowingPosts(userId: string) {
  try {
    const userRelationships = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [Query.equal("userId", userId)]
    );

    const followingUserIds = userRelationships.documents.map(
      (rel) => rel.followsUserId
    );

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", followingUserIds), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Function to get posts from followers
export async function getFollowersPosts(userId: string) {
  try {
    const userRelationships = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [Query.equal("followsUserId", userId)]
    );

    const followerUserIds = userRelationships.documents.map(
      (rel) => rel.userId
    );

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", followerUserIds), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
