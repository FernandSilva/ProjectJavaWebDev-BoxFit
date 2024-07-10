import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const SavedGridPostList = ({
  post,
  showUser,
  showStats,
  showcreator,
}: {
  post: any;
  showUser: boolean;
  showcreator: boolean;
  showStats: boolean;
}) => {
  const { user } = useUserContext();
  const [fileType, setFileType] = useState("unknown");
  const firstImageUrl = post?.imageUrl?.[0];

  useEffect(() => {
    if (firstImageUrl) {
      fetchMimeType(firstImageUrl);
    }
  }, [firstImageUrl]);

  const fetchMimeType = async (url) => {
    try {
      const response = await fetch(url, {
        method: "HEAD",
      });
      const contentType = response.headers.get("Content-Type");
      if (contentType.startsWith("video/")) {
        setFileType("video");
      } else if (contentType.startsWith("image/")) {
        setFileType("image");
      } else {
        setFileType("unknown");
      }
    } catch (error) {
      console.error("Error fetching MIME type:", error);
      setFileType("unknown");
    }
  };

  return (
    <li key={post.$id} className="relative min-w-80 h-80">
      <Link to={`/posts/${post.$id}`} className="grid-post_link">
        {fileType === "video" && (
          <video className="post-card_img" src={firstImageUrl} loop />
        )}
        {fileType === "image" && (
          <img
            className="post-card_img"
            src={firstImageUrl}
            alt="File preview"
          />
        )}
      </Link>

      <div className="grid-post_user">
        {showUser && (
          <div className="flex items-center justify-start gap-2 flex-1">
            <img
              src={
                post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-8 h-8 rounded-full"
            />
            <p className="line-clamp-1">
              {showcreator ? user.name : post.creator.name}
            </p>
          </div>
        )}
        {showStats && <PostStats post={post} userId={user.id} />}
      </div>
    </li>
  );
};

export default SavedGridPostList;
