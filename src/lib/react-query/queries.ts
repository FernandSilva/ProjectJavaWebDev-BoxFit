import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  checkFollowStatus,
  createPost,
  createUserAccount,
  deletePost,
  deleteSavedPost, followUser,
  getAllPosts,
  getCurrentUser,
  getFollowersPosts,
  getFollowingPosts,
  getInfinitePosts,
  getPostById,
  getRecentPosts,
  getUserById,
  getUserPosts,
  getUserRelationships,
  getUsers,
  likeComment,
  likePost,
  savePost,
  searchPosts,
  signInAccount,
  signOutAccount,
  unfollowUser,
  unlikeComment,
  updatePost,
  updateUser,
} from "@/lib/appwrite/api";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";


import {
  createComment,
  deleteComment,
  getCommentsByPostId,
} from "@/lib/appwrite/api";


import * as api from "@/lib/appwrite/api";

// ============================================================
// COMMENTS QUERIES
// ============================================================

// Fetch comments for a specific post
export const useGetCommentsByPost = (postId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST, postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
  });
};

// Mutation to create a comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      // Invalidate and refetch queries to update UI
      queryClient.invalidateQueries([QUERY_KEYS.GET_COMMENTS_BY_POST]);
    },
  });
};

// Mutation to delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      // Invalidate and refetch comments to reflect the change
      queryClient.invalidateQueries([QUERY_KEYS.GET_COMMENTS_BY_POST]);
    },
  });
};


export const useLikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation(likeComment, {
    onSuccess: () => {
      queryClient.invalidateQueries("comments");
    }
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation(unlikeComment, {
    onSuccess: () => {
      queryClient.invalidateQueries("comments");
    }
  });
};










// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// Hook to get user relationships
export const useGetUserRelationships = (userId: string) => {
  return useQuery([QUERY_KEYS.GET_USER_RELATIONSHIPS, userId], () => getUserRelationships(userId), {
    enabled: !!userId, // Only runs if userId is truthy
  });
};

// Hook for following a user
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ userId, followsUserId }: { userId: string; followsUserId: string }) => followUser(userId, followsUserId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEYS.GET_USER_RELATIONSHIPS]);
      },
    }
  );
};

// Hook for unfollowing a user
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (documentId: string) => unfollowUser(documentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEYS.GET_USER_RELATIONSHIPS]);
      },
    }
  );
};

// Combined hook for follow/unfollow functionality
export const useFollowUnfollowUser = () => {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const toggleFollowUnfollow = async ({
    userId,
    followUserId,
    follow,
  }: {
    userId: string;
    followUserId: string;
    follow: boolean;
  }) => {
    if (follow) {
      await followMutation.mutateAsync({ userId, followsUserId: followUserId });
    } else {
      await unfollowMutation.mutateAsync(followUserId); // Assuming the followUserId is the documentId for simplicity
    }
  };

  return {
    toggleFollowUnfollow,
    isLoading: followMutation.isLoading || unfollowMutation.isLoading,
  };
};

// Hook to get the current follow status and document ID
export const useFollowStatus = (userId: string, followsUserId: string) => {
  return useQuery(['followStatus', userId, followsUserId], () => checkFollowStatus(userId, followsUserId), {
    enabled: !!userId && !!followsUserId,
  });
};




// Fetch all messages
// Fetch all messages
// Fetch all messages
export const useGetMessages = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MESSAGES],
    queryFn: getMessages,  // Assuming getMessages is defined to fetch messages from Appwrite
    onError: (error) => {
      console.error("Failed to fetch messages:", error);
    }
  });
};


// Use mutation for creating a message
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMessage) => api.createMessage(newMessage),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.GET_MESSAGES]);
      // Optionally, show a success notification
    },
    onError: (error) => {
      // Handle errors, possibly show an error notification
      console.error("Error creating message:", error);
    }
  });
};


// Use mutation for deleting a message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.GET_MESSAGES]);
    },
  });
};






// NEW POST FILTER QUERIES
// ============================================================

// Fetch all posts
export const useGetAllPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getAllPosts,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

// Fetch posts from followed users
export const useGetFollowingPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_POSTS, userId],
    queryFn: () => getFollowingPosts(userId),
    enabled: !!userId,
  });
};

// Fetch posts from followers
export const useGetFollowersPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS_POSTS, userId],
    queryFn: () => getFollowersPosts(userId),
    enabled: !!userId,
  });
};

// Other queries and mutations...

