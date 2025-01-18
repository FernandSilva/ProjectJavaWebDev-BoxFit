import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type SavedGridPostListProps = {
  post: any; // Post object
  showUser: boolean; // Display user info
  showStats: boolean; // Display post stats (likes/comments)
  showCreator: boolean; // Display creator info
  showComments: boolean; // Display comments section
};

const SavedGridPostList = ({
  post,
  showUser,
  showStats,
  showCreator,
  showComments,
}: SavedGridPostListProps) => {
  const { user } = useUserContext();
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);

  // Extract file types and clean URLs dynamically
  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post?.imageUrl?.forEach((url: string) => {
      // Extract the file type from the URL
      const typeMatch = url.match(/type=([^&]*)/);
      const type = typeMatch ? typeMatch[1].split("/")[0] : "unknown";
      types.push(type);

      // Clean the URL by removing parameters
      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post.imageUrl]);

  return (
    <li key={post.$id} className="relative min-w-80 h-80">
      {/* Post Link and Media */}
      <Link to={`/posts/${post.$id}`} className="grid-post_link">
        {fileTypes[0] === "video" && (
          <video
            className="post-card_img !brightness-75 !h-auto"
            src={cleanUrls[0]}
            loop
            autoPlay
            muted
          >
            <source src={cleanUrls[0]} />
          </video>
        )}
        {fileTypes[0] === "image" && (
          <img
            className="post-card_img !brightness-75 !h-auto"
            src={cleanUrls[0]}
            alt="File preview"
          />
        )}
        {fileTypes[0] === "unknown" && (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
            <p>Unknown file type</p>
          </div>
        )}
      </Link>

      {/* Post Details */}
      <div className="grid-post_user mt-2">
        {/* User Info */}
        {showUser && (
          <div className="flex items-center gap-2">
            <img
              src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={post.creator?.name || "Creator"}
              className="w-8 h-8 rounded-full"
            />
            <p className="line-clamp-1 font-medium text-gray-700">
              {post.creator?.name || "Unknown Creator"}
            </p>
          </div>
        )}

        {/* Post Stats */}
        {showStats && (
          <PostStats
            isPost={true}
            post={post}
            userId={user?.id || ""}
            showComments={showComments}
          />
        )}
      </div>
    </li>
  );
};

export default SavedGridPostList;
