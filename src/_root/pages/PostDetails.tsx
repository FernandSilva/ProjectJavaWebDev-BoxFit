// PostDetails.tsx
import { GridPostList, Loader } from "@/components/shared";
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  useGetCommentsByPost,
  useGetPostById,
  useGetUserPosts,
  useLikeComment,
  useUnlikeComment,
  createNotification,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdAdd, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const { data: post, isLoading: postLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(post?.creator.$id || "");
  const { data: commentsData } = useGetCommentsByPost(id);
  const comments = commentsData?.comments || [];

  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post?.imageUrl?.forEach((url: string) => {
      const typeStartIndex = url.indexOf("?type=");
      let typeMatch = "unknown";
      if (typeStartIndex !== -1) {
        const typeEndIndex = url.indexOf("&", typeStartIndex);
        typeMatch = typeEndIndex !== -1
          ? url.substring(typeStartIndex + 6, typeEndIndex)
          : url.substring(typeStartIndex + 6);
      }
      types.push(typeMatch.split("/")[0]);
      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post?.imageUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
        if (entry.isIntersecting) {
          videoRefs.current[index]?.play().catch(() => {});
        } else {
          videoRefs.current[index]?.pause();
        }
      });
    });

    cleanUrls.forEach((_, index) => {
      const element = videoRefs.current[index];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [cleanUrls]);

  const handleSend = async () => {
    if (inputText.trim() && user) {
      const currentInput = inputText;
      createCommentMutation.mutate(
        {
          postId: id,
          userId: user.id,
          text: inputText,
          userImageUrl: user.imageUrl,
          userName: user.name,
        },
        {
          onSuccess: async (comment) => {
            setInputText("");
            await createNotification({
              userId: post?.creator?.$id ?? "",
              senderId: user.id,
              type: "comment",
              relatedId: post?.$id ?? "",
              referenceId: `comment_${comment?.$id ?? ""}`,
              content: `${user.name} commented: "${currentInput}"`,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user.name,
              senderImageUrl: user.imageUrl,
            });
          },
        }
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleEditPost = () => navigate(`/update-post/${post?.$id}`);
  const handleDeletePost = () => deletePostMutation.mutate({ postId: id, imageId: post?.imageId });

  const handleToggleLikeComment = async (commentId: string, liked: boolean) => {
    const comment = comments.find((c) => c.$id === commentId);
    if (!comment) return;

    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user!.id });
    } else {
      likeCommentMutation.mutate(
        { commentId, userId: user!.id },
        {
          onSuccess: async () => {
            await createNotification({
              userId: comment.userId ?? "",
              senderId: user?.id ?? "",
              type: "comment-like",
              relatedId: post?.$id ?? "",
              referenceId: `comment_${comment.$id}`,
              content: `${user?.name ?? ""} liked your comment.`,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user?.name ?? "",
              senderImageUrl: user?.imageUrl ?? "",
            });
          },
        }
      );
    }
  };

  const relatedPosts = userPosts?.documents.filter((p) => p.$id !== id);

  if (postLoading || !post) {
    return <div className="flex-center w-full h-full"><Loader /></div>;
  }

  return (
    <div className="post_details-container">
      <div className="flex max-w-5xl w-full">
        <div onClick={() => navigate(-1)} className="flex cursor-pointer items-center gap-2">
          <FaArrowLeft className="text-lg" />
          <p className="small-medium lg:base-medium">Back</p>
        </div>
      </div>

      <div className="post_details-card py-[10px] px-[20px]">
        <Swiper
          modules={[A11y, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          className="lg:w-[55%] w-[100%]"
          pagination
          onInit={(swiper) => setActiveIndex(swiper.activeIndex)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {cleanUrls.map((url, index) => (
            <SwiperSlide key={index}>
              {fileTypes[index] === "video" ? (
                <video className="post-card_img" loop ref={(el) => (videoRefs.current[index] = el!)} data-index={index}>
                  <source src={url} />
                </video>
              ) : (
                <img className="post-card_img" src={url} alt="File preview" />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="post_details-info md:w-[45%]">
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <Link to={`/profile/${post?.creator.$id}`} className="profile-link">
              <img
                src={post?.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="creator"
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
              />
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-black">{post?.creator.name}</p>
                <div className="text-xs text-gray-500">
                  {multiFormatDateString(post?.$createdAt)} • {post?.location}
                </div>
              </div>
            </Link>

            {user?.id === post?.creator.$id && (
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

          <div className="flex flex-col w-full small-medium lg:base-regular">
            <p>{post?.caption}</p>
            <ul className="flex gap-1 mt-2 flex-wrap">
              {(Array.isArray(post.tags) ? post.tags : post.tags?.split(",")).map((tag: string, index: number) => (
                <li key={index} className="text-light-3 small-regular">#{tag.trim()}</li>
              ))}
            </ul>

            <div
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="p-4 hover:bg-gray-200 w-fit cursor-pointer mx-auto"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%" }}
            >
              <MdAdd />
            </div>

            {showCommentBox && (
              <div className="comments-section mt-4">
                {comments.map((comment) => {
                  const liked = comment.likedBy.includes(user!.id);
                  return (
                    <div id={`comment-${comment.$id}`} key={comment.$id} className="comment-item flex gap-3 mb-4 items-start">
                      <img
                        src={comment.userImageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt={comment.userName}
                        className="h-7 w-7 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col w-full">
                            <p className="text-sm font-semibold">{comment.userName}</p>
                            <p className="text-sm break-words w-full">{comment.text}</p>
                          </div>
                          <div
                            onClick={() => handleToggleLikeComment(comment.$id, liked)}
                            className="ml-2 cursor-pointer flex-shrink-0"
                          >
                            <img
                              src={`/assets/icons/${liked ? "liked" : "unlike"}.svg`}
                              alt={liked ? "Unlike" : "Like"}
                              className="w-[16px] h-[16px] min-w-[16px]"
                            />
                          </div>
                        </div>
                        {comment.userId === user!.id && (
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="cursor-pointer" onClick={() => deleteCommentMutation.mutate(comment.$id)}>Edit</span>
                            <span className="text-red cursor-pointer" onClick={() => deleteCommentMutation.mutate(comment.$id)}>Delete</span>
                          </div>
                        )}
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
      </div>

      <div className="w-full max-w-5xl">
        <hr className="border w-full" />
        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>
        {isUserPostLoading || !relatedPosts ? <Loader /> : <GridPostList posts={relatedPosts} />}
      </div>
    </div>
  );
};

export default PostDetails;
