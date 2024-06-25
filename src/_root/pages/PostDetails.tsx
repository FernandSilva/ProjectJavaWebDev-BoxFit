import React, { useState } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { Loader, GridPostList } from "@/components/shared";
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useGetCommentsByPost,
  useCreateComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  // Fetching post details, related user posts, and comments
  const { data: post, isLoading: postLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(post?.creator.$id);
  const { data: commentsData } = useGetCommentsByPost(id);
  const comments = commentsData?.documents || [];

  // Hooks for managing CRUD operations
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  // Local state management
  const [inputText, setInputText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleInputChange = (event) => setInputText(event.target.value);

  // Handles the creation of new comments
  const handleSend = () => {
    if (inputText.trim()) {
      createCommentMutation.mutate({
        postId: id,
        userId: user?.id,
        text: inputText,
        userImageUrl: user?.imageUrl,
        userName: user?.name
      }, {
        onSuccess: () => setInputText('') // Clear input after successful comment creation
      });
    }
  };

  // Support for submitting comment on Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  // Delete post and navigate upon successful deletion
  const handleDeletePost = () => {
    deletePostMutation.mutate({ postId: id, imageId: post?.imageId }, {
      onSuccess: () => navigate(-1)
    });
  };

  // Excludes the current post from related posts
  const relatedPosts = userPosts?.documents.filter(post => post.$id !== id);

  const handleEditPost = () => {
    navigate(`/update-post/${post?.$id}`);
  };

  // Handle liking and unliking a comment
  const handleToggleLikeComment = (commentId, liked) => {
    if (liked) {
      unlikeCommentMutation.mutate({ commentId, userId: user.id });
    } else {
      likeCommentMutation.mutate({ commentId, userId: user.id });
    }
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button onClick={() => navigate(-1)} variant="ghost" className="shad-button_ghost">
          <img src={"/assets/icons/back.svg"} alt="back" width={24} height={24} />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {/* Loader displays when data is fetching or not available */}
      {postLoading || !post ? <Loader /> : (
        <div className="post_details-card">
          <img src={post?.imageUrl} alt="creator" className="post_details-img" />
          <div className="post_details-info">
            <div className="Buttonsflex">
              <Button
                onClick={handleEditPost}
                variant="ghost"
                className={`${user.id !== post?.creator.$id ? "hidden" : ""}`}>
                <img src={"/assets/icons/edit3.svg"} alt="edit" width={24} height={24} />
              </Button>
              <Button
                onClick={handleDeletePost}
                variant="ghost"
                className={`${user.id !== post?.creator.$id ? "hidden" : ""}`}>
                <img src={"/assets/icons/delete.svg"} alt="delete" width={24} height={24} />
              </Button>
            </div>

            <div className="post-details-header">
              <Link to={`/profile/${post?.creator.$id}`} className="profile-link">
                <img src={post?.creator.imageUrl || "/assets/icons/profile-placeholder.svg"} alt="creator" className="w-8 h-8 lg:w-12 lg:h-12 rounded-full" />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-black">{post?.creator.name}</p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">{multiFormatDateString(post?.$createdAt)}</p>
                    •
                    <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                  </div>
                </div>
              </Link>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag, index) => (
                  <li key={`${tag}${index}`} className="text-light-3 small-regular">{tag}</li>
                ))}
              </ul>

              {/* Toggle to show/hide comments */}
              <Link
                onClick={() => setShowCommentBox(!showCommentBox)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D3D3D2")} // Tailwind green-500
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <img
                  src="/assets/icons/chat1.svg"
                  alt="Comments"
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                />
              </Link>

              {/* Display comments */}
              {showCommentBox && (
                <div className="comments-section mt-4">
                  {comments.map((comment, index) => {
                    const liked = comment.likedBy.includes(user.id);
                    return (
                      <div key={index} className="comment-item flex items-start gap-3 mb-3">
                        <img
                          src={comment.userImageUrl || "/assets/icons/profile-placeholder.svg"}
                          alt={comment.userName}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="comment-content bg-gray-100 p-2 rounded-lg flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{comment.userName}</p>
                            <button
                              onClick={() => handleToggleLikeComment(comment.$id, liked)}
                              className={`text-${liked ? "red" : "green"}-500 hover:text-${liked ? "red" : "green"}-700 transition duration-150`}
                            >
                              <img
                                src={`/assets/icons/${liked ? "unlike" : "liked"}.svg`}
                                alt={liked ? "Unlike" : "Like"}
                                width={16}
                                height={16}
                              />
                              
                            </button>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                          {comment.userId === user.id && (
                            <Button
                              variant="ghost"
                              className="text-xs text-red-500 mt-1"
                              onClick={() => deleteCommentMutation.mutate(comment.$id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Write a comment..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>
        {isUserPostLoading || !relatedPosts ? <Loader /> : <GridPostList posts={relatedPosts} />}
      </div>
    </div>
  );
};

export default PostDetails;
