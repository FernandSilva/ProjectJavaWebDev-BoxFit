import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { NotificationResponse, Notification } from "@/types/index";

import { Models } from "appwrite";


// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: {
  email: string;
  password: string;
  name: string;
  username?: string;
}) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    console.log("New account created:", newAccount);

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    console.log("User saved to DB:", newUser);

    return newUser;
  } catch (error) {
    console.error("Error creating user account:", error);
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
export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    const activeSession = await getActiveSession();

    if (activeSession) {
      return activeSession; // Return the active session if already logged in
    }

    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log("Error signing in:", error);
    throw error;
  }
}

async function getActiveSession() {
  try {
    return await account.getSession("current");
  } catch (error) {
    if (error.code === 401) {
      // No active session found
      return null;
    }
    throw error;
  }
}


// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.log("Error fetching account:", error);
    return null; // Explicitly return null on error
  }
}


// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) {
      throw new Error("No current account found");
    }

    console.log("Current account ID:", currentAccount.$id);

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    console.log("Current user documents:", currentUser);

    if (currentUser.total === 0) {
      console.warn("No user document found for account ID:", currentAccount.$id);
      return null;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}






// ============================== SIGN OUT

/**
 * Signs out the current user by deleting the current session.
 * @returns A promise that resolves when the session is deleted.
 */
export const signOutAccount = async (): Promise<any> => {
  try {
    // Delete the current session (you may also use the session ID "current")
    return await account.deleteSession("current");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};




// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFiles(post.file);
    console.log({ uploadedFile });
    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = await getFilePreviews(uploadedFile);
    console.log({ fileUrl });
    if (!fileUrl) {
      // await deleteFile(uploadedFile);
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
        imageId: uploadedFile,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile[0]);
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
async function uploadFiles(files: File[]) {
  try {
    const fileIds = await Promise.all(
      files.map(async (file) => {
        const response = await uploadFile(file); // Assuming uploadFile returns the file ID
        return response.$id; // Adjust this based on the actual response structure
      })
    );
    return fileIds;
  } catch (error) {
    console.log(error);
    return [];
  }
}
// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFileDownload(appwriteConfig.storageId, fileId);

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}
export async function getFilePreviews(fileIds: string[]) {
  try {
    const fileUrls = await Promise.all(
      fileIds.map(async (fileId) => {
        // Fetch the file details
        const fileDetails = await storage.getFile(
          appwriteConfig.storageId,
          fileId
        );

        if (!fileDetails || !fileDetails.mimeType)
          throw new Error("File details not found");

        // Construct the file URL with file type
        const fileUrl = `${storage.getFileDownload(appwriteConfig.storageId, fileId)}?type=${fileDetails.mimeType}`;

        return fileUrl;
      })
    );
    return fileUrls;
  } catch (error) {
    console.log(error);
    return [];
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
  try {
    // Check if there are files to update
    const hasFilesToUpdate = post.file.length > 0;

    // Upload files to appwrite storage and get IDs
    let uploadedFileIds: string[] = [];
    if (hasFilesToUpdate) {
      uploadedFileIds = await uploadFiles(post.file);
      if (!uploadedFileIds || uploadedFileIds.length !== post.file.length) {
        throw new Error("Failed to upload all files.");
      }
    }

    // Get image URLs based on uploaded file IDs
    let imageUrls: string[] = [];
    if (uploadedFileIds.length > 0) {
      imageUrls = await getFilePreviews(uploadedFileIds);
      if (!imageUrls || imageUrls.length !== uploadedFileIds.length) {
        // Clean up uploaded files if getting URLs fails
        for (let i = 0; i < uploadedFileIds.length; i++) {
          await deleteFile(uploadedFileIds[i]);
        }
        throw new Error("Failed to get image URLs.");
      }
    }

    // Prepare updated images array
    const images = uploadedFileIds.map((fileId, index) => ({
      imageUrl: imageUrls[index],
      imageId: fileId,
    }));

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageId: uploadedFileIds,
        imageUrl: imageUrls,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete newly uploaded files
      for (let i = 0; i < uploadedFileIds.length; i++) {
        await deleteFile(uploadedFileIds[i]);
      }
      throw new Error("Failed to update post.");
    }

    // Safely delete old files after successful update
    for (let i = 0; i < post.imageId.length; i++) {
      await deleteFile(post.imageId[i]);
    }

    return updatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    return null; // or handle the error appropriately
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

export const likePost = async (
  postId: string,
  likesArray: string[],
  userId: string,
  postOwnerId: string,
  relatedId: string,
  referenceId: string
) => {
  try {
    if (!postId || typeof postId !== "string" || postId.length > 36) {
      throw new Error("Invalid postId");
    }

    // Update the document with the likes array
    return await databases.updateDocument(
      "65e6dd32daee0a037492", // Replace with your database ID
      "65e6ddc2ec2b81614419", // Replace with your collection ID
      postId, // Document ID
      {
        likes: likesArray,
        relatedId, // Optional fields for tracking
        referenceId, // Optional fields for tracking
      }
    );
  } catch (error) {
    console.error("Failed to like post:", error);
    throw error;
  }
};



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
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw new Error("No posts found");

    return posts;
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    throw error;
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
      [Query.equal("userId", userId)]
    );
    const followsUserIds = followResponse.documents.map(
      (doc) => doc.followsUserId
    );
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
// export async function getFollowers(userId: string) {
//   try {
//     // Step 1: Get the list of userIds who follow the given userId
//     const followResponse = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.userRelationshipsCollectionId,
//       [
//         Query.equal("UserId", userId)
//       ]
//     );

//     const followerUserIds = followResponse.documents.map(doc => doc.followsUserId);
//    console.log(followerUserIds)

//     // Step 2: Fetch user data for each followerUserId
//     const usersData = [];
//     for (const followerUserId of followerUserIds) {
//       const userResponse = await databases.getDocument(
//         appwriteConfig.databaseId,
//         appwriteConfig.userCollectionId,
//         followerUserId
//       );
//       usersData.push(userResponse);
//     }

//     return usersData;

//   } catch (error) {
//     console.error("Failed to get the list of followers:", error);
//     return [];
//   }
// }
export async function getFollowers(userId: string) {
  try {
    // Step 1: Get the list of userIds who follow the given userId
    const followResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId,
      [
        Query.equal("followsUserId", userId), // Ensure this matches the field name in your database
      ]
    );

    const followerUserIds = followResponse.documents.map((doc) => doc.userId);
    console.log("Follower User IDs:", followerUserIds);

    // Step 2: Fetch user data for each followerUserId
    const usersData = [];
    for (const followerUserId of followerUserIds) {
      const userResponse = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId, // Ensure this matches the correct collection ID
        followerUserId
      );
      usersData.push(userResponse);
    }

    return usersData;
  } catch (error) {
    console.error("Failed to get the list of followers:", error);
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
    const pageLimit = 5; // Number of comments per page

    // Fetch first page of comments
    const firstPageResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.limit(pageLimit), // Limit the number of documents returned
      ]
    );

    // Fetch total count of comments
    const totalCountResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.limit(100), // Fetch up to 100 documents to get an accurate count
      ]
    );

    const totalComments = totalCountResponse.documents.length; // Total number of comments

    return {
      comments: firstPageResponse.documents,
      totalComments: totalComments,
    };
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

// Function to fetch users and messages
export async function fetchUsersAndMessages(currentUserId: string, searchQuery: string = "") {
  try {
    // Fetch all users from the user collection
    const usersResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );

    // Map users to include necessary fields and exclude the current user
    const users = usersResult.documents
      .map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        username: doc.username,
        email: doc.email,
        id: doc.$id,
        imageUrl: doc.imageUrl,
        bio: doc.bio,
        latestMessage: null, // Initialize with null, will be updated below
      }))
      .filter((user) => user.$id !== currentUserId); // Exclude current user

    // Filter users based on search query
    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Initialize an array to hold promises for fetching messages
    const usersWithLatestMessages = await Promise.all(
      filteredUsers.map(async (user) => {
        // Fetch messages sent by current user to this user
        const messagesSentByUser = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId,
          [
            Query.equal("recipientId", user.$id),
            Query.equal("userId", currentUserId),
          ]
        );

        // Fetch messages received by current user from this user
        const messagesReceivedByUser = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId,
          [
            Query.equal("recipientId", currentUserId),
            Query.equal("userId", user.$id),
          ]
        );


        // Sort messages by creation date
        const allMessages = [
          ...messagesSentByUser.documents, 
          ...messagesReceivedByUser.documents];

        // Convert string dates to timestamps for sorting
        allMessages.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
        
        // Get the latest message (if any)
        const latestMessage =
          allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;

        return {
          ...user,
          latestMessage: latestMessage
            ? {
                content: latestMessage.content,
                timestamp: latestMessage.$createdAt,
              }
            : null,
        };
      })
    );

    // Sort users based on the timestamp of the latest message in descending order
    usersWithLatestMessages.sort((a, b) => {
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return (
        new Date(b.latestMessage.timestamp).getTime() -
        new Date(a.latestMessage.timestamp).getTime()
      );
    });

    return usersWithLatestMessages; // Return users with messages
  } catch (error) {
    console.error("Error fetching users and messages:", error);
    throw new Error("Error fetching users and messages");
  }
}


// Fetch messages for a specific conversation
export const getMessages = async (recipientId: string, userId: string) => {
  try {
    const messagesSentByUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      [Query.equal("recipientId", recipientId), Query.equal("userId", userId)]
    );

    const messagesReceivedByUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      [Query.equal("recipientId", userId), Query.equal("userId", recipientId)]
    );

    const combinedMessages = [
      ...messagesSentByUser.documents,
      ...messagesReceivedByUser.documents,
    ];

    // Sort the combined messages by the createdAt timestamp
    combinedMessages.sort(
      (a, b) =>
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
    );

    return {
      total: combinedMessages.length,
      documents: combinedMessages,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Create a new message
export async function createMessage({
  userId,
  content,
  username,
  recipientId,
  senderImageUrl,
}: {
  userId: string;
  content: string;
  username: string;
  recipientId: string;
  senderImageUrl: string; // Ensure the sender's profile picture URL is included
}) {
  try {
    // Prepare the message payload
    const messagePayload = {
      userId,
      recipientId,
      content,
      username,
      createdAt: new Date().toISOString(), // Ensure `createdAt` is included
    };

    // Create the message in the database
    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      ID.unique(),
      messagePayload
    );

    // Prepare the notification payload
    const notificationPayload = {
      userId: recipientId,
      senderId: userId,
      type: "message",
      relatedId: recipientId, // Assuming the `relatedId` is the recipient
      referenceId: message.$id,
      content: `${username} sent you a message.`,
      isRead: false,
      createdAt: new Date().toISOString(), // Include `createdAt` for the notification
      senderName: username,
      senderImageUrl, // Pass the sender's profile picture
    };

    // Create a notification for the recipient
    await createNotification(notificationPayload);

    return message;
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
    // Step 1: Fetch all users
    const usersResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );

    const users = usersResult.documents;

    // Step 2: Fetch all user relationships
    const relationshipsResult = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userRelationshipsCollectionId
    );

    const relationships = relationshipsResult.documents;

    // Step 3: Create a follower count map
    const followerCounts = {};

    relationships.forEach((relationship) => {
      const followsUserId = relationship.followsUserId;
      if (!followerCounts[followsUserId]) {
        followerCounts[followsUserId] = 0;
      }
      followerCounts[followsUserId]++;
    });

    // Step 4: Sort users by their follower count
    const sortedUsers = users.sort((a, b) => {
      const aFollowers = followerCounts[a.$id] || 0;
      const bFollowers = followerCounts[b.$id] || 0;
      return bFollowers - aFollowers;
    });

    return sortedUsers;
  } catch (error) {
    console.error("Failed to fetch and sort users:", error);
    throw error;
  }
};
// export const getAllUsers = async () => {
//   try {
//     const result = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.userCollectionId
//     );

//     console.log("Fetched user documents:", result.documents); // Log the fetched documents

//     // Ensure documents have 'followers' field and it is a number
//     const sortedUsers = result.documents.sort((a, b) => {
//       console.log(`Comparing ${a.followers} with ${b.followers}`); // Log the comparison
//       return b.followers - a.followers;
//     });

//     console.log("Sorted user documents:", sortedUsers); // Log the sorted documents

//     return sortedUsers;
//   } catch (error) {
//     console.error("Failed to fetch users:", error);
//     throw error;
//   }
// };

// ============================================================
// POSTS (NEW FUNCTIONS)
// ============================================================

// Function to get all posts
export async function getAllPosts(searchQuery = "", pageParam = null) {
  try {
    const queries = [Query.orderDesc("$createdAt"), Query.limit(10)];

    if (searchQuery) {
      queries.push(Query.search("tags", searchQuery));
    }

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam));
    }

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    const lastDocument = posts.documents[posts.documents.length - 1];

    return {
      documents: posts.documents,
      nextCursor: lastDocument ? lastDocument.$id : null,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error(error.message);
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
    // Log the posts to check the structure

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

// ============================================================
// NOTIFICATIONS
// ============================================================



// Create a notification


// Create a notification
export const createNotification = async (notification: {
  userId: string;
  senderId: string;
  type: string;
  relatedId: string;
  referenceId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderImageUrl: string;
}) => {
  try {
    console.log("Creating notification with data:", notification);
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      notification
    );
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
};

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  if (!notificationId) throw new Error("Notification ID is required");

  try {
    return await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Clear all notifications (optional)
export const clearNotifications = async (userId: string) => {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("userId", userId)]
    );

    await Promise.all(
      notifications.documents.map((notification) =>
        deleteNotification(notification.$id)
      )
    );
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};





// Ensure the updateNotification function exists and is exported
export async function updateNotification(notificationId: string) {
  try {
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );
    return response;
  } catch (error) {
    console.error("Failed to update notification:", error);
    throw error;
  }
}



export const getUserTotalLikes = async (userId: string): Promise<number> => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId, // <-- Ensure this matches your actual posts collection ID
      [Query.equal("creator", userId)]
    );

    const totalLikes = posts.documents.reduce((sum, post) => {
      const likesCount = post.likes?.length || 0;
      return sum + likesCount;
    }, 0);

    return totalLikes;
  } catch (error) {
    console.error("Error fetching total likes:", error);
    return 0;
  }
};

export const markMessagesAsRead = async (senderId: string, recipientId: string) => {
  const messages = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.messageCollectionId,
    [
      Query.equal("userId", senderId),
      Query.equal("recipientId", recipientId),
      Query.equal("isRead", false)
    ]
  );

  const updatePromises = messages.documents.map((message) =>
    databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      message.$id,
      { isRead: true }
    )
  );

  return Promise.all(updatePromises);
};




export async function searchPostsApi(searchQuery: string): Promise<Models.Document[]> {
  try {
    // Base query: order by creation time descending
    const queries = [Query.orderDesc("$createdAt")];

    if (searchQuery.trim() !== "") {
      // Use a type-cast to bypass the missing 'or' definition in the type definitions.
      queries.push(
        (Query as any).or([
          Query.search("username", searchQuery),
          Query.search("name", searchQuery),
          Query.search("description", searchQuery), // or use "caption" if that's your field
          Query.search("tags", searchQuery),
        ])
      );
    }

    const postsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    return postsResponse.documents;
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    throw new Error(error.message);
  }
}



import { refreshSession } from "@/lib/react-query/queries";

export const fetchWithAuth = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      await refreshSession();
    }
    return response.json();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
