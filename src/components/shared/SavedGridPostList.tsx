import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type SavedGridPostListProps = {
  post: any;
  showUser: boolean;
  showStats: boolean;
  showCreator: boolean;
  showComments: boolean;
  disableCommentClick?: boolean; // ✅ Add this prop
};

const SavedGridPostList = ({
  post,
  showUser,
  showStats,
  showCreator,
  showComments,
  disableCommentClick = false, // ✅ Default to false
}: SavedGridPostListProps) => {
  const { user } = useUserContext();
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);

  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post?.imageUrl?.forEach((url: string) => {
      const typeMatch = url.match(/type=([^&]*)/);
      const type = typeMatch ? typeMatch[1].split("/")[0] : "unknown";
      types.push(type);

      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post.imageUrl]);

  return (
    <li key={post.$id} className="relative min-w-80 h-80">
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

      <div className="grid-post_user mt-2">
        {showUser && showCreator && (
          <div className="flex items-center gap-2">
            <p className="line-clamp-1 font-medium text-gray-700"></p>
          </div>
        )}

        {showStats && (
          <PostStats
            isPost={true}
            post={post}
            userId={user?.id || ""}
            showComments={showComments}
            disableCommentClick={disableCommentClick} // ✅ Pass to PostStats
          />
        )}
      </div>
    </li>
  );
};

export default SavedGridPostList;
