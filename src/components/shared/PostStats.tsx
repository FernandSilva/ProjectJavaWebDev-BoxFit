// PostStats.tsx
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreateComment,
  useDeleteSavedPost,
  useGetCommentsByPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
  useCreateNotification,
  useLikeComment,
  useUnlikeComment,
} from "@/lib/react-query/queries";
import { checkIsLiked, multiFormatDateString } from "@/lib/utils";
import { CiBookmark } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { PiFireLight } from "react-icons/pi";

const PostStats = ({ post, userId, isPost, showComments }: any) => {
  const location = useLocation();
  const { user } = useUserContext();

  const { data: commentsData } = useGetCommentsByPost(post.$id);
  const comments = commentsData?.comments || [];
  const totalComment = commentsData?.totalComments || 0;

  const [likes, setLikes] = useState<string[]>(post.likes?.map((like: any) => like.$id) || []);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const createNotification = useCreateNotification();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  const { data: currentUser } = useGetCurrentUser();
  const savedPostRecord = currentUser?.save?.find((record: any) => record?.post?.$id === post.$id);

  useEffect(() => setIsSaved(!!savedPostRecord), [currentUser, savedPostRecord]);

  const handleLikePost = () => {
    if (!user?.id) return;

    const isLiked = likes.includes(userId);
    const updatedLikes = isLiked ? likes.filter((id) => id !== userId) : [...likes, userId];

    if (!isLiked) {
      createNotification.mutate({
        userId: post.creator.$id,
        senderId: user.id,
        senderName: user.name,
        type: "like",
        relatedId: post.$id,
        referenceId: post.$id,
        content: `liked your post: "${post.caption || ""}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        senderImageUrl: user.imageUrl,
      });
    }

    setLikes(updatedLikes);
    likePost({ postId: post.$id, likesArray: updatedLikes, userId });
  };

  const handleToggleLikeComment = (comment: any) => {
    const liked = comment.likedBy.includes(user.id);
    const mutation = liked ? unlikeCommentMutation : likeCommentMutation;

    mutation.mutate(
      { commentId: comment.$id, userId: user.id },
      {
        onSuccess: () => {
          if (!liked) {
            createNotification.mutate({
              userId: comment.userId,
              senderId: user.id,
              senderName: user.name,
              type: "like",
              relatedId: comment.$id,
              referenceId: comment.$id,
              content: `${user.name} liked your comment.`,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderImageUrl: user.imageUrl,
            });
          }
        },
      }
    );
  };

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-6">
          <div className="flex items-center gap-1">
            <img
              src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
              className="cursor-pointer w-6 h-6"
              onClick={handleLikePost}
            />
            <p>{likes.length}</p>
          </div>

          <div className="flex items-center gap-1" onClick={() => setShowCommentBox(!showCommentBox)}>
            <FaRegComment className="cursor-pointer w-6 h-6" />
            <p>{totalComment}</p>
          </div>
        </div>

        <div>
          {isSaved ? (
            <IoBookmark className="cursor-pointer w-6 h-6" onClick={() => deleteSavePost(savedPostRecord.$id)} />
          ) : (
            <CiBookmark className="cursor-pointer w-6 h-6" onClick={() => savePost({ userId: user.id, postId: post.$id })} />
          )}
        </div>
      </div>

      {showCommentBox && (
        <div className="comments-section mt-4">
          {comments.map((comment: any) => (
            <div key={comment.$id} className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <img src={comment.userImageUrl} className="h-7 w-7 rounded-full" />
                <div>
                  <strong>{comment.userName}</strong>: {comment.text}
                  <div className="text-xs text-gray-500">{multiFormatDateString(comment.$createdAt)}</div>
                </div>
              </div>
              <img
                src={comment.likedBy.includes(user.id) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
                className="cursor-pointer w-5 h-5"
                onClick={() => handleToggleLikeComment(comment)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PostStats;
