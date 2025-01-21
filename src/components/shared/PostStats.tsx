import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreateComment,
  useDeleteComment,
  useDeleteSavedPost,
  useGetCommentsByPost,
  useGetCurrentUser,
  useLikeComment,
  useLikePost,
  useSavePost,
  useUnlikeComment,
  useCreateNotification,
} from "@/lib/react-query/queries";
import { checkIsLiked, multiFormatDateString } from "@/lib/utils";
import { CiBookmark } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { PiFireLight } from "react-icons/pi";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  isPost?: boolean;
  showComments?: boolean;
};

const PostStats = ({ post, userId, isPost, showComments }: PostStatsProps) => {
  const location = useLocation();
  const { user } = useUserContext();

  // Fetch comments for the post
  const { data: commentsData } = useGetCommentsByPost(post.$id);
  const comments = commentsData?.comments || [];
  const totalComment = commentsData?.totalComments || 0;

  const likesList = post?.likes?.map((like: Models.Document) => like.$id) || [];
  const [likes, setLikes] = useState<string[]>(likesList);
  const [inputText, setInputText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mutations
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();
  const deleteCommentMutation = useDeleteComment();
  const createCommentMutation = useCreateComment();
  const createNotification = useCreateNotification();

  const { data: currentUser } = useGetCurrentUser();
  const savedPostRecord = currentUser?.save?.find(
    (record: Models.Document) => record?.post?.$id === post.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  const handleLikePost = (e: React.MouseEvent<SVGElement | HTMLImageElement>) => {
    e.stopPropagation();

    if (!user?.id) {
      console.error("Error: User ID is required to like a post.");
      return;
    }

    let updatedLikes = [...likes];
    const isLiked = updatedLikes.includes(userId);

    if (isLiked) {
      updatedLikes = updatedLikes.filter((id) => id !== userId);
    } else {
      updatedLikes.push(userId);

      // Trigger notification when liking a post
      createNotification.mutate({
        userId: post.creator?.$id || "", // Notify the post creator
        senderId: user.id, // The current user liking the post
        senderName: user.name, // Current user's name
        type: "like",
        relatedId: post.$id, // ID of the liked post
        referenceId: post.$id, // Reference the same post ID for tracking
        content: `liked your post: "${post.caption || ""}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        senderimageUrl: user.imageUrl || "/assets/icons/profile-placeholder.svg",
      });
    }

    setLikes(updatedLikes);

    likePost({
      postId: post.$id,
      likesArray: updatedLikes,
      userId, // The user liking the post
      postOwnerId: post.creator?.$id || "", // Owner of the post
      relatedId: post.$id, // Ensure relatedId is included
      referenceId: post.$id, // Ensure referenceId is included
    });
  };

  const handleSavePost = (e: React.MouseEvent<SVGElement | HTMLImageElement>) => {
    e.stopPropagation();

    if (!user?.id) {
      console.error("Error: User ID is required to save a post.");
      return;
    }

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: user.id, postId: post.$id });
    setIsSaved(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSendComment = () => {
    if (inputText.trim() && user?.id) {
      createCommentMutation.mutate(
        {
          postId: post.$id,
          userId: user.id,
          text: inputText,
          userImageUrl: user?.imageUrl || "",
          userName: user?.name || "",
        },
        {
          onSuccess: () => setInputText(""),
        }
      );
    }
  };

  const handleToggleLikeComment = (commentId: string, liked: boolean) => {
    if (!user?.id) {
      console.error("Error: User ID is required to like/unlike a comment.");
      return;
    }

    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user.id });
    } else {
      likeCommentMutation.mutate({ commentId, userId: user.id });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendComment();
    }
  };

  const handleCommentsSection = () => {
    if (showComments) {
      setShowCommentBox(!showCommentBox);
    }
  };

  return (
    <>
      <div
        className={`flex justify-between items-center ${
          location.pathname.startsWith("/profile") ? "w-full" : ""
        }`}
      >
        <div className="flex gap-6">
          {/* Likes Section */}
          <div className="flex items-center gap-1">
            {isPost ? (
              checkIsLiked(likes, userId) ? (
                <img
                  src="/assets/icons/liked.svg"
                  alt="Liked"
                  className="cursor-pointer"
                  width={20}
                  height={20}
                  onClick={handleLikePost}
                />
              ) : (
                <PiFireLight
                  className="cursor-pointer w-6 h-6"
                  onClick={handleLikePost}
                />
              )
            ) : (
              <img
                src={
                  checkIsLiked(likes, userId)
                    ? "/assets/icons/liked.svg"
                    : "/assets/icons/like.svg"
                }
                alt="Like"
                className="cursor-pointer"
                width={20}
                height={20}
                onClick={handleLikePost}
              />
            )}
            <p>{likes.length}</p>
          </div>

          {/* Comments Section */}
          <div className="flex items-center gap-1">
            <FaRegComment
              className="cursor-pointer w-6 h-6"
              onClick={handleCommentsSection}
            />
            <p>{totalComment}</p>
          </div>
        </div>

        {/* Save Section */}
        <div className="flex items-center">
          {isSaved ? (
            <IoBookmark
              className="cursor-pointer w-6 h-6"
              onClick={handleSavePost}
            />
          ) : (
            <CiBookmark
              className="cursor-pointer w-6 h-6"
              onClick={handleSavePost}
            />
          )}
        </div>
      </div>

      {/* Comments Box */}
      {showCommentBox && (
        <div className="comments-section mt-4">
          {comments.map((comment) => {
            const liked = comment.likedBy.includes(userId);
            return (
              <div key={comment.$id} className="comment-item flex gap-3">
                <img
                  src={
                    comment.userImageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="User"
                  className="h-7 w-7 rounded-full"
                />
                <div>
                  <p>
                    <strong>{comment.userName}</strong>: {comment.text}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {multiFormatDateString(comment.$createdAt)}
                  </p>
                  <button
                    onClick={() => handleToggleLikeComment(comment.$id, liked)}
                    className={`text-${liked ? "red" : "green"}-500`}
                  >
                    {liked ? "Unlike" : "Like"}
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 mt-3">
            <img
              src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={user?.name}
              className="h-7 w-7 rounded-full"
            />
            <input
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              className="w-full border rounded-md p-2"
            />
            <IoMdSend
              className="cursor-pointer w-6 h-6"
              onClick={handleSendComment}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostStats;
