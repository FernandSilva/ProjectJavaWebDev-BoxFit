import { GridPostList, Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  useGetCommentsByPost,
  useGetPostById,
  useGetUserPosts,
  useLikeComment,
  useUnlikeComment,
  createNotification
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdAdd, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import moment from "moment";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log({ id });
  const { user } = useUserContext();

  // Fetching post details, related user posts, and comments
  const { data: post, isLoading: postLoading, error } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  console.log({ error });
  const videoRefs = useRef([]);
  console.log({ post });
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: commentsData } = useGetCommentsByPost(id);
  const comments = commentsData?.comments || [];
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);

  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post?.imageUrl?.forEach((url: string) => {
      // Extract the type parameter from the URL
      const typeStartIndex = url.indexOf("?type=");
      let typeMatch = "unknown";
      if (typeStartIndex !== -1) {
        const typeEndIndex = url.indexOf("&", typeStartIndex);
        typeMatch =
          typeEndIndex !== -1
            ? url.substring(typeStartIndex + 6, typeEndIndex)
            : url.substring(typeStartIndex + 6);
      }

      console.log(`URL: ${url}, Type: ${typeMatch}`); // Log the URL and extracted type
      types.push(typeMatch.split("/")[0]);

      // Remove the type parameter from the URL and the last question mark if it's at the end
      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post?.imageUrl]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Trigger when 50% of the element is in view
    };

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const { target, isIntersecting } = entry;
        const index = parseInt(target.getAttribute("data-index") || "0", 10);

        if (isIntersecting) {
          if (videoRefs.current[index]) {
            videoRefs.current[index].play().catch((error) => {
              console.error("Error playing video:", error);
            });
          }
        } else {
          if (videoRefs.current[index]) {
            videoRefs.current[index].pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    cleanUrls.forEach((_, index) => {
      const element = videoRefs.current[index];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [cleanUrls]);

  // Hooks for managing CRUD operations
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  // Local state management
  const [inputText, setInputText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleInputChange = (event) => setInputText(event.target.value);

  // Handles adding comments and sending notifications
  const handleSend = async () => {
    if (inputText.trim()) {
      createCommentMutation.mutate(
        {
          postId: id,
          userId: user?.id,
          text: inputText,
          userImageUrl: user?.imageUrl,
          userName: user?.name,
        },
        {
          onSuccess: async (comment) => {
            setInputText("");
            await createNotification({
              userId: post?.creator.$id,
              senderId: user?.id,
              type: "comment",
              content: `${user?.name} commented: "${inputText}"`,
              relatedId: post?.$id,
              referenceId: comment?.$id,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user?.name,
              ImageUrl: user?.imageUrl,
            });
          },
        }
      );
    }
  };

  // Support for submitting comment on Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

   // Delete post and send notification
  const handleDeletePost = async () => {
    deletePostMutation.mutate(
      { postId: id, imageId: post?.imageId },
      {
        onSuccess: async () => {
          navigate(-1);
          await createNotification({
            userId: post?.creator.$id,
            senderId: user?.id,
            type: "delete",
            content: `${user?.name} deleted a post.`,
            relatedId: post?.$id,
            referenceId: post?.$id,
            isRead: false,
            createdAt: new Date().toISOString(),
            senderName: user?.name,
            ImageUrl: user?.imageUrl,
          });
        },
      }
    );
  };


  // Excludes the current post from related posts
  const relatedPosts = userPosts?.documents.filter((post) => post.$id !== id);

  const handleEditPost = () => {
    navigate(`/update-post/${post?.$id}`);
  };

  // Handles liking/unliking comments and sending notifications
  const handleToggleLikeComment = async (commentId, liked) => {
    const comment = comments.find((c) => c.$id === commentId);
    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user.id });
    } else {
      likeCommentMutation.mutate(
        { commentId, userId: user.id },
        {
          onSuccess: async () => {
            await createNotification({
              userId: comment?.userId,
              senderId: user?.id,
              type: "like",
              content: `${user?.name} liked your comment.`,
              relatedId: comment?.$id,
              referenceId: comment?.$id,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user?.name,
              ImageUrl: user?.imageUrl,
            });
          },
        }
      );
    }
  };

  console.log(post);

  return (
    <div className="post_details-container">
      <div className="flex max-w-5xl w-full">
        <div
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2"
        >
          <FaArrowLeft className="text-lg cursor-pointer" />
          <p className="small-medium lg:base-medium">Back</p>
        </div>
      </div>

      {/* Loader displays when data is fetching or not available */}
      {postLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card py-[10px] px-[20px] ">
          <Swiper
            modules={[A11y, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            className="lg:w-[55%] w-[100%]"
            pagination
            onInit={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          >
            {cleanUrls.map((url, index) => {
              console.log({ url });

              return (
                <SwiperSlide key={index} style={{ width: "100%" }}>
                  {fileTypes[index] === "video" && (
                   <video
                   className="post-card_img"
                   loop
                   ref={(el) => (videoRefs.current[index] = el)}
                   data-index={index} // Add data-index for IntersectionObserver
                 >
                   <source src={url} />
                 </video>
                  )}
                  {fileTypes[index] === "image" && (
                    <img
                      className="post-card_img"
                      src={url}
                      alt="File preview"
                    />
                  )}
                  {fileTypes[index] === "unknown" && <p>Unknown file type</p>}
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="post_details-info md:w-[45%]">
            <div className="flex flex-col gap-1 md:gap-0 sm:flex-row md:items-start sm:justify-between w-full">
              <div className="post-details-header  ">
                <Link
                  to={`/profile/${post?.creator.$id}`}
                  className="profile-link"
                >
                  <img
                    src={
                      post?.creator.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                  />
                  <div className="flex flex-col ">
                    <p className="base-medium lg:body-bold text-black">
                      {post?.creator.name}
                    </p>
                    <div className="flex-center gap-2 text-light-3">
                      <p className="subtle-semibold lg:small-regular !text-xs">
                        {multiFormatDateString(post?.$createdAt)}
                        {moment(post?.$createdAt).format("h:m a")}
                      </p>
                      • <br />
                      <p className="subtle-semibold lg:small-regular !text-xs">
                        {post?.location}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="Buttonsflex flex py-[5px] md:py-[0px] gap-4">
                <div
                  onClick={handleEditPost}
                  className={`${user.id !== post?.creator.$id ? "hidden" : ""} cursor-pointer flex items-center gap-2`}
                >
                  <MdEdit className="text-xs" />
                  <span className="text-xs">Edit</span>
                </div>
                <div
                  onClick={handleDeletePost}
                  className={`cursor-pointer flex items-center gap-1 ${user.id !== post?.creator.$id ? "hidden" : ""}`}
                >
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={12}
                    height={12}
                  />
                  <span className="text-red  text-xs">Delete</span>
                </div>
              </div>
            </div>

            <hr className="border w-full " />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag, index) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {/* Toggle to show/hide comments */}
              <div
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="p-4 hover:bg-gray-200 w-fit cursor-pointer mx-auto"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "background-color 0.3s",
                }}
              >
                <MdAdd />
              </div>

              {/* Display comments */}
              {showCommentBox && (
                <div className="comments-section mt-4">
                  {comments.map((comment, index) => {
                    const liked = comment.likedBy.includes(user.id);
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
                            <div className="flex items-center gap-1">
                              <div className="flex items-center justify-between">
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
                                src={`/assets/icons/${liked ? "unlike" : "liked"}.svg`}
                                alt={liked ? "Unlike" : "Like"}
                                width={16}
                                height={16}
                              />
                            </div>
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
                      src={
                        user.imageUrl || "/assets/icons/profile-placeholder.svg"
                      }
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full" />
        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;