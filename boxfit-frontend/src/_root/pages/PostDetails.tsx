import { GridPostList, Loader } from "@/components/shared";
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  useComments,
  usePost,
  useUserPosts,
  useLikeComment,
  useUnlikeComment,
  useCreateNotification,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useEffect, useRef, useState, useMemo } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdAdd, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import React from "react";
import { useUserContext } from "@/context/AuthContext";

function inferTypeFromUrl(url: string): "image" | "video" | "unknown" {
  const u = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(u)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(u)) return "image";
  return "unknown";
}

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const notify = useCreateNotification();

  if (!id) {
    return (
      <div className="flex-center w-full h-full">
        <div className="text-sm text-red-500">Invalid post URL: missing post ID.</div>
      </div>
    );
  }

  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const { data: post, isLoading: postLoading } = usePost(id);
  const creator =
    typeof (post as any)?.creator === "string"
      ? { $id: (post as any).creator }
      : ((post as any)?.creator || {});
  const creatorId =
    (creator as any)?._id || (creator as any)?.$id || (creator as any)?.id || "";

  const { data: userPosts, isLoading: userPostsLoading } = useUserPosts(creatorId);
  const { data: commentsData } = useComments(id);
  const comments = commentsData?.comments || commentsData || [];

  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  const tagList = useMemo(() => {
    const raw = (post as any)?.tags;
    if (!raw) return [];
    return Array.isArray(raw)
      ? raw.filter(Boolean).map((t) => String(t).trim())
      : String(raw).split(",").map((t) => t.trim()).filter(Boolean);
  }, [post?.tags]);

  useEffect(() => {
    const srcs: string[] = Array.isArray((post as any)?.imageUrl)
      ? (post as any).imageUrl
      : [];
    const types: string[] = [];
    const urls: string[] = [];

    srcs.forEach((url: string) => {
      const detected = inferTypeFromUrl(url);
      types.push(detected);
      urls.push(url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, ""));
    });
    setFileTypes(types);
    setCleanUrls(urls);
  }, [post?.imageUrl]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = parseInt(entry.target.getAttribute("data-index") || "0", 10);
        if (entry.isIntersecting) videoRefs.current[idx]?.play().catch(() => {});
        else videoRefs.current[idx]?.pause();
      });
    });
    cleanUrls.forEach((_, idx) => {
      const el = videoRefs.current[idx];
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [cleanUrls]);

  const handleSend = () => {
    if (!user || !inputText.trim()) return;
    const text = inputText.trim();
    const postId = (post as any)?.$id || (post as any)?._id || id;

    createCommentMutation.mutate(
      {
        postId,
        userId: user.id,
        text,
        userImageUrl: user.imageUrl,
        userName: user.name,
      },
      {
        onSuccess: (comment) => {
          setInputText("");

          // ✅ Notify post owner if not self
          if (creatorId && String(creatorId) !== String(user.id)) {
            console.log("📨 Creating notification for comment:", { creatorId, userId: user.id });
            notify.mutate({
              userId: creatorId,
              senderId: user.id,
              type: "comment",
              content: text,
              relatedId: postId,
              referenceId: (comment as any)?._id || (comment as any)?.$id || "",
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user.name,
              senderImageUrl: user.imageUrl,
            });
          }
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleDeletePost = async () => {
    if (!id) return;
    deletePostMutation.mutate(id);
  };

  const relatedPosts =
    Array.isArray(userPosts?.documents) && id
      ? userPosts.documents.filter((p: any) => (p.$id || p._id) !== id)
      : [];

  const handleEditPost = () => {
    const pid = (post as any)?.$id || (post as any)?._id || "";
    if (pid) navigate(`/update-post/${pid}`);
  };

  const handleToggleLikeComment = (comment: any, liked: boolean) => {
    const commentId = comment?._id || comment?.$id || comment?.id;
    if (!commentId || !user?.id) return;

    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user.id });
    } else {
      likeCommentMutation.mutate(
        { commentId, userId: user.id },
        {
          onSuccess: () => {
            // ✅ Notify comment author (skip self)
            if (comment?.userId && String(comment.userId) !== String(user.id)) {
              console.log("📨 Creating notification for comment-like:", {
                commentOwner: comment.userId,
                userId: user.id,
              });
              notify.mutate({
                userId: comment.userId,
                senderId: user.id,
                type: "comment-like",
                content: `${user.name || "Someone"} liked your comment.`,
                relatedId: id,
                referenceId: commentId,
                isRead: false,
                createdAt: new Date().toISOString(),
                senderName: user.name,
                senderImageUrl: user.imageUrl,
              });
            }
          },
        }
      );
    }
  };

  if (postLoading || !post) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const creatorImage =
    (creator as any)?.imageUrl || "/assets/icons/profile-placeholder.svg";
  const creatorName = (creator as any)?.name || "Unknown";

  return (
    <div className="post_details-container">
      <div className="flex max-w-5xl w-full">
        <div onClick={() => navigate(-1)} className="flex cursor-pointer items-center gap-2">
          <FaArrowLeft className="text-lg cursor-pointer" />
          <p className="small-medium lg:base-medium">Back</p>
        </div>
      </div>

      <div className="post_details-card py-[10px] px-[20px]">
        {/* MEDIA */}
        {cleanUrls.length > 0 && (
          <Swiper modules={[A11y, Pagination]} spaceBetween={16} slidesPerView={1} pagination>
            {cleanUrls.map((url, index) => (
              <SwiperSlide key={`${url}-${index}`}>
                {fileTypes[index] === "video" ? (
                  <video
                    className="post-card_img"
                    loop
                    ref={(el) => (videoRefs.current[index] = el!)}
                    data-index={index}
                    controls
                  >
                    <source src={url} />
                  </video>
                ) : fileTypes[index] === "image" ? (
                  <img
                    className="post-card_img"
                    src={url}
                    alt="File preview"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "true";
                        target.src = "/assets/icons/profile-placeholder.svg";
                      }
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-500">Unknown file type</p>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* INFO */}
        <div className="post_details-info md:w-[45%]">
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <Link to={creatorId ? `/profile/${creatorId}` : "#"} className="profile-link">
              <img
                src={creatorImage}
                alt="creator"
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/icons/profile-placeholder.svg";
                }}
              />
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-black">{creatorName}</p>
                <div className="text-xs text-gray-500">
                  {multiFormatDateString(
                    (post as any)?.$createdAt || (post as any)?.createdAt
                  )}
                  {(post as any)?.location ? ` • ${(post as any).location}` : ""}
                </div>
              </div>
            </Link>

            {user?.id === creatorId && (
              <div className="flex gap-4 mt-2 sm:mt-0">
                <div onClick={handleEditPost} className="cursor-pointer flex items-center gap-2">
                  <MdEdit className="text-xs" />
                  <span className="text-xs">Edit</span>
                </div>
                <div onClick={handleDeletePost} className="cursor-pointer flex items-center gap-1">
                  <img src={"/assets/icons/delete.svg"} alt="delete" width={12} height={12} />
                  <span className="text-red text-xs">Delete</span>
                </div>
              </div>
            )}
          </div>

          <hr className="border w-full" />
          <p className="mt-2">{(post as any)?.caption}</p>

          {tagList.length > 0 && (
            <ul className="flex gap-1 mt-2 flex-wrap">
              {tagList.map((tag) => (
                <li key={tag} className="text-light-3 small-regular">
                  #{tag}
                </li>
              ))}
            </ul>
          )}

          {/* COMMENT SECTION */}
          <div
            onClick={() => setShowCommentBox((s) => !s)}
            className="p-4 hover:bg-gray-200 w-fit cursor-pointer mx-auto mt-3 rounded-full"
          >
            <MdAdd />
          </div>

          {showCommentBox && (
            <div className="comments-section mt-4">
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment: any) => {
                  const commentId = comment?._id || comment?.$id || comment?.id;
                  const liked = Array.isArray(comment?.likedBy)
                    ? comment.likedBy.includes(user?.id)
                    : false;

                  return (
                    <div key={commentId || Math.random()} className="comment-item flex gap-3 mb-4 items-start">
                      <img
                        src={comment.userImageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt={comment.userName}
                        className="h-7 w-7 rounded-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/assets/icons/profile-placeholder.svg";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col w-full">
                            <p className="text-sm font-semibold">{comment.userName}</p>
                            <p className="text-sm break-words w-full">{comment.text}</p>
                          </div>
                          <div
                            onClick={() => handleToggleLikeComment(comment, liked)}
                            className="ml-2 cursor-pointer flex-shrink-0"
                          >
                            <img
                              src={`/assets/icons/${liked ? "liked" : "unlike"}.svg`}
                              alt={liked ? "Unlike" : "Like"}
                              className="w-[16px] h-[16px]"
                            />
                          </div>
                        </div>
                        {comment.userId === user?.id && (
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span
                              className="text-red cursor-pointer"
                              onClick={() => deleteCommentMutation.mutate(commentId)}
                            >
                              Delete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}

              <div className="flex items-center gap-3 mt-3">
                <img
                  src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={user?.name}
                  className="h-7 w-7 rounded-full"
                />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border border-gray-300 text-sm rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <hr className="border w-full" />
        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>
        {userPostsLoading ? <Loader /> : <GridPostList posts={relatedPosts} />}
      </div>
    </div>
  );
};

export default PostDetails;
