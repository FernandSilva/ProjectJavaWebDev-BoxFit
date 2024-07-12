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

  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post.imageUrl.forEach((url: string) => {
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
            {" "}
            <source src={cleanUrls[0]} />
          </video>
        )}
        {fileTypes[0] === "image" && (
          <img
            className="post-card_img  !brightness-75 !h-auto"
            src={cleanUrls[0]}
            alt="File preview"
          />
        )}
        {fileTypes[0] === "unknown" && <p>Unknown file type</p>}
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
