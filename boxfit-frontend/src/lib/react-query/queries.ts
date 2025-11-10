import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ===== API Imports =====
import {
  // POSTS
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  savePost,
  deleteSavedPost,
  getRecentPosts,
  getUserPosts,
  getFollowingPosts,
  getFollowersPosts,
  getLikedPostsByUser,
  getSavedPostsByUser,

  // COMMENTS
  getCommentsByPostId,
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,

  // USERS + RELS
  getUsers,
  getUserById,
  updateUser,
  getUserRelationships,
  followUser,
  unfollowUser,
  checkFollowStatus,
  signUpAccount,
  signInAccount,
  signOutAccount,
  getCurrentUser,

  // MESSAGES
  fetchUsersAndMessages,
  getMessages,
  createMessage,
  deleteMessage,
  markMessagesAsRead,

  // NOTIFICATIONS
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearNotifications,

  // FILES
  uploadFile,
  getFilePreview,
  deleteFile,

  // SEARCH / CONTACT
 
  submitContactRequest,

} from "@/lib/appwrite/api";

// ======================================================================
// Query Keys
// ======================================================================
export const QK = {
  posts: (params?: any) => ["posts", params] as const,
  post: (id?: string) => ["post", id] as const,
  recentPosts: () => ["posts", "recent"] as const,
  userPosts: (userId?: string) => ["posts", "user", userId] as const,
  followingPosts: (userId?: string) => ["posts", "following", userId] as const,
  followersPosts: (userId?: string) => ["posts", "followers", userId] as const,

  likedPosts: (userId?: string) => ["likedPosts", userId] as const,
  savedPosts: (userId?: string) => ["savedPosts", userId] as const,

  comments: (postId?: string) => ["comments", postId] as const,
  users: (limit?: number) => ["users", limit] as const,
  user: (id?: string) => ["user", id] as const,
  relationships: (userId?: string) => ["user", userId, "relationships"] as const,
  followCheck: (userId?: string, followsUserId?: string) =>
    ["followCheck", userId, followsUserId] as const,
  contacts: (userId?: string, q?: string) => ["contacts", userId, q] as const,
  thread: (userId?: string, peerId?: string) => ["thread", userId, peerId] as const,
  notifications: (userId?: string) => ["notifications", userId] as const,
  search: (q: string) => ["search", q] as const,
  filePreview: (fileId?: string) => ["filePreview", fileId] as const,
};

// ======================================================================
// POSTS
// ======================================================================
export function usePosts(limit = 10, search = "") {
  return useQuery({
    queryKey: QK.posts({ limit, search }),
    queryFn: () => listPosts(limit, search),
  });
}

export function useRecentPosts() {
  return useQuery({
    queryKey: QK.recentPosts(),
    queryFn: () => getRecentPosts(),
  });
}

export function usePost(postId?: string) {
  return useQuery({
    queryKey: QK.post(postId),
    enabled: !!postId && postId !== "undefined",
    queryFn: () => getPostById(postId as string),
  });
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: QK.userPosts(userId),
    enabled: !!userId,
    queryFn: () => getUserPosts(userId as string),
  });
}

export function useFollowingPosts(userId?: string) {
  return useQuery({
    queryKey: QK.followingPosts(userId),
    enabled: !!userId,
    queryFn: () => getFollowingPosts(userId as string),
  });
}

export function useFollowersPosts(userId?: string) {
  return useQuery({
    queryKey: QK.followersPosts(userId),
    enabled: !!userId,
    queryFn: () => getFollowersPosts(userId as string),
  });
}

// Create / Update / Delete
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.posts({}) });
      qc.invalidateQueries({ queryKey: QK.recentPosts() });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QK.post(vars.postId) });
      qc.invalidateQueries({ queryKey: QK.posts({}) });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_data, postId) => {
      qc.removeQueries({ queryKey: QK.post(postId) });
      qc.invalidateQueries({ queryKey: QK.posts({}) });
      qc.invalidateQueries({ queryKey: QK.recentPosts() });
    },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likes,
      userId,
    }: {
      postId: string;
      likes: string[];
      userId: string;
    }) => likePost(postId, likes, userId),
    onSuccess: (_d, { postId, userId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) });
      qc.invalidateQueries({ queryKey: QK.posts({}) });
      if (userId) qc.invalidateQueries({ queryKey: QK.likedPosts(userId) });
    },
  });
}

// Save / Unsave
export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: QK.savedPosts(userId) });
    },
  });
}

export function useDeleteSavedPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saveId: string) => deleteSavedPost(saveId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.savedPosts(undefined) });
    },
  });
}

export function useLikedPosts(userId?: string) {
  return useQuery({
    queryKey: QK.likedPosts(userId),
    enabled: !!userId,
    queryFn: () => getLikedPostsByUser(userId as string),
  });
}

export function useSavedPosts(userId?: string) {
  return useQuery({
    queryKey: QK.savedPosts(userId),
    enabled: !!userId,
    queryFn: () => getSavedPostsByUser(userId as string),
  });
}

// ======================================================================
// COMMENTS
// ======================================================================
export function useComments(postId?: string) {
  return useQuery({
    queryKey: QK.comments(postId),
    enabled: !!postId && postId !== "undefined",
    queryFn: () => getCommentsByPostId(postId as string),
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: (_data, vars: any) => {
      if (vars?.postId) {
        qc.invalidateQueries({ queryKey: QK.comments(vars.postId) });
        qc.invalidateQueries({ queryKey: QK.post(vars.postId) });
      }
    },
  });
}

export function useLikeComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      likeComment(commentId, userId),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useUnlikeComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      unlikeComment(commentId, userId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ======================================================================
// USERS + RELATIONSHIPS
// ======================================================================
export function useUsers(limit?: number) {
  return useQuery({
    queryKey: QK.users(limit),
    queryFn: () => getUsers(limit),
  });
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: QK.user(userId),
    enabled: !!userId,
    queryFn: () => getUserById(userId as string),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: QK.user(vars.userId) });
      qc.invalidateQueries({ queryKey: QK.users(undefined) });
    },
  });
}

export function useUserRelationships(userId?: string) {
  return useQuery({
    queryKey: QK.relationships(userId),
    enabled: !!userId,
    queryFn: () => getUserRelationships(userId as string),
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, followsUserId }: { userId: string; followsUserId: string }) =>
      followUser(userId, followsUserId),
    onSuccess: (_d, { userId, followsUserId }) => {
      qc.invalidateQueries({ queryKey: QK.followCheck(userId, followsUserId) });
      qc.invalidateQueries({ queryKey: QK.relationships(userId) });
      qc.invalidateQueries({ queryKey: QK.relationships(followsUserId) });
    },
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => unfollowUser(docId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useFollowCheck(userId?: string, followsUserId?: string) {
  return useQuery({
    queryKey: QK.followCheck(userId, followsUserId),
    enabled: !!userId && !!followsUserId,
    queryFn: () => checkFollowStatus(userId as string, followsUserId as string),
  });
}

// ======================================================================
// MESSAGES
// ======================================================================
export function useContacts(userId?: string, q = "") {
  return useQuery({
    queryKey: QK.contacts(userId, q),
    enabled: !!userId,
    queryFn: () => fetchUsersAndMessages(userId as string, q),
  });
}

export function useThread(userId?: string, peerId?: string) {
  return useQuery({
    queryKey: QK.thread(userId, peerId),
    enabled: !!userId && !!peerId,
    queryFn: () => getMessages(userId as string, peerId as string),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMessage,
    onSuccess: (_d, vars: any) => {
      if (vars?.userId && vars?.recipientId) {
        qc.invalidateQueries({ queryKey: QK.thread(vars.userId, vars.recipientId) });
        qc.invalidateQueries({ queryKey: QK.contacts(vars.userId, "") });
      }
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useMarkMessagesAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, recipientId }: { senderId: string; recipientId: string }) =>
      markMessagesAsRead(senderId, recipientId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ======================================================================
// NOTIFICATIONS
// ======================================================================
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: QK.notifications(userId),
    enabled: !!userId,
    queryFn: () => getNotifications(userId as string),
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useClearNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => clearNotifications(userId),
    onSuccess: (_d, userId) => qc.invalidateQueries({ queryKey: QK.notifications(userId) }),
  });
}



// ======================================================================
// FILES
// ======================================================================
export function useFilePreview(fileId?: string) {
  return useQuery({
    queryKey: QK.filePreview(fileId),
    enabled: !!fileId,
    queryFn: () => getFilePreview(fileId as string),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ======================================================================
// AUTH
// ======================================================================
export function useSignUpAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signUpAccount,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK.users() });
      return data;
    },
  });
}

export function useSignInAccount() {
  return useMutation({ mutationFn: signInAccount });
}

export function useSignOutAccount() {
  return useMutation({ mutationFn: signOutAccount });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
}





// ======================================================================
// FOLLOWERS LIST
// ======================================================================
export function useFollowersList(userId?: string) {
  return useQuery({
    queryKey: ["followersList", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/users/${userId}/followers`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch followers");
      return res.json();
    },
  });
}

// Follow Status Alias
export function useFollowStatusQuery(userId?: string, followsUserId?: string) {
  return useQuery({
    queryKey: QK.followCheck(userId, followsUserId),
    enabled: !!userId && !!followsUserId,
    queryFn: () => checkFollowStatus(userId as string, followsUserId as string),
  });
}
export { useFollowStatusQuery as useFollowStatus };

// ======================================================================
// ALL POSTS (Home Page)
// ======================================================================
export function useAllPosts(limit = 50, search = "") {
  return useQuery({
    queryKey: QK.posts({ limit, search }),
    queryFn: () => listPosts(limit, search),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });
}

// --- Create Notification ---
export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Defensive logging and request
      console.log("📩 Creating notification →", data);

      // Dynamically import createNotification if needed
      const { createNotification } = await import("@/lib/appwrite/api");

      const result = await createNotification(data);
      console.log("✅ Notification created →", result);
      return result;
    },
    onSuccess: (created, vars: any) => {
      const targetId = created?.userId || vars?.userId;
      console.log("🔁 Refetch notifications for:", targetId);

      if (targetId) {
        qc.invalidateQueries({ queryKey: QK.notifications(targetId) });
      }

      // Optional — refresh posts when related (e.g., like notifications)
      qc.invalidateQueries({ queryKey: QK.posts({}) });
    },
    onError: (err) => {
      console.error("❌ useCreateNotification error:", err);
    },
  });
}
