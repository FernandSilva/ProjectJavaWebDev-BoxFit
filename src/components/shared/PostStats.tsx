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
} from "@/lib/react-query/queries";
import { checkIsLiked, multiFormatDateString } from "@/lib/utils";
import { CiBookmark } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { PiFireLight } from "react-icons/pi";
import moment from "moment";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  isPost?: boolean;
  showComments?:boolean
};

const PostStats = ({ post, userId, isPost, showComments }: PostStatsProps) => {
  const location = useLocation();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();
  const deleteCommentMutation = useDeleteComment();
  const createCommentMutation = useCreateComment();
console.log({post})
  const likesList = post?.likes?.map((user: Models.Document) => user.$id);

  const [inputText, setInputText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);

  const { user } = useUserContext();

  const { data: commentsData } = useGetCommentsByPost(post.$id);

  const comments = commentsData?.comments || [];
  const totalComment = commentsData?.totalComments;

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record?.post?.$id === post?.$id
  );
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: any) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  const handleSavePost = (e: any) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };
  const handleSend = () => {
    if (inputText.trim()) {
      createCommentMutation.mutate(
        {
          postId: post.$id,
          userId: user?.id,
          text: inputText,
          userImageUrl: user?.imageUrl,
          userName: user?.name,
        },
        {
          onSuccess: () => setInputText(""), // Clear input after successful comment creation
        }
      );
    }
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";
  const handleToggleLikeComment = (commentId, liked) => {
    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user.id });
    } else {
      likeCommentMutation.mutate({ commentId, userId: user.id });
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };
  const sendbutton = () => {
    if (inputText.trim().length === 0) {
      return;
    } else {
      handleSend();
    }
  };
  const handleCommentsSection=()=>{
    {showComments && setShowCommentBox(!showCommentBox)}
  }
  console.log({likes})

  return (
    <>
      <div
        className={`flex justify-between items-center z-20 ${containerStyles}`}
      >
        <div className="flex gap-6 mr-5">
          <div className="flex gap-1">
            {isPost ? (
              <>
                {!checkIsLiked(likes, userId) ? (
                  <PiFireLight
                    className="w-[20px] h-[24px] cursor-pointer"
                    onClick={(e) => handleLikePost(e)}
                  />
                ) : (
                  <img
                    src="/assets/icons/liked.svg"
                    alt="like"
                    width={20}
                    height={20}
                    onClick={(e) => handleLikePost(e)}
                    className="cursor-pointer"
                  />
                )}
              </>
            ) : (
              <img
                src={`${
                  checkIsLiked(likes, userId)
                    ? "/assets/icons/liked.svg"
                    : "/assets/icons/like.svg"
                }`}
                alt="like"
                width={20}
                height={20}
                onClick={(e) => handleLikePost(e)}
                className="cursor-pointer"
              />
            )}
            <p className="small-medium lg:base-medium">{likes?.length}</p>
          </div>
          <div className="flex gap-1">
            <FaRegComment
              className="w-[26px] h-[22px] cursor-pointer"
              onClick={handleCommentsSection}
            />
            <p className="small-medium lg:base-medium">{totalComment}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isSaved ? (
            <CiBookmark
              className="w-[26px] h-[24px] cursor-pointer "
              onClick={(e) => handleSavePost(e)}
            />
          ) : (
            <IoBookmark
              className="w-[26px] h-[24px] cursor-pointer"
              onClick={(e) => handleSavePost(e)}
            />
          )}

          {/* <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        /> */}
        </div>
      </div>
      {showCommentBox && (
        <div className="comments-section mt-4">
          {comments.map((comment, index) => {
            const liked = comment.likedBy.includes(user.id);
            console.log(comments)
            return (
              <div
                key={index}
                className="comment-item flex items-center gap-3 mb-3"
              >
                <img
                  src={
                    comment.userImageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt={comment.userName}
                  className="h-7 w-7 rounded-full"
                />
                <div className="comment-content  p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col justify-center gap-1">
                      <div className="flex  items-center justify-between">
                        <p className="text-sm font-semibold">
                          {comment.userName}:
                        </p>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div
                      onClick={() =>
                        handleToggleLikeComment(comment.$id, liked)
                      }
                      className={`text-${liked ? "red" : "green"}-500 hover:text-${liked ? "red" : "green"}-700 transition duration-150 cursor-pointer`}
                    >
                      <img
                        src={`/assets/icons/${!liked ? "unlike" : "liked"}.svg`}
                        alt={liked ? "Unlike" : "Like"}
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 flex gap-1">
                    <span>
                  {multiFormatDateString(comment?.$createdAt)}
                    </span>
                    <span>
                  {moment(comment?.$createdAt).format("h:mm a")}
                    </span>
                  </div>
                  {comment.userId === user.id && (
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="text-xs text-gray-800 mt-1"
                        onClick={() =>
                          deleteCommentMutation.mutate(comment.$id)
                        }
                      >
                        Edit
                      </div>
                      <div
                        className="text-xs text-red mt-1"
                        onClick={() =>
                          deleteCommentMutation.mutate(comment.$id)
                        }
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 mt-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={user.name}
              className="h-7 w-7 rounded-full"
            />
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              className="flex-1 p-2 border border-gray-300 !text-sm rounded-lg"
            />
            <IoMdSend
              className="w-[26px] h-[24px] cursor-pointer "
              onClick={sendbutton}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostStats;
