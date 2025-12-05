import { Models } from "appwrite";
import SavedGridPostList from "./SavedGridPostList";
import { PostCard } from "@/components/shared"; // ✅ use same renderer as Home

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  showCreator?: boolean;
  showComments?: boolean;
  disableCommentClick?: boolean;
  isExplorePage?: boolean;
};

function isServerPost(p: any) {
  // Heuristic: our Mongo posts have imageUrl (string or string[]), creator, likes array, etc.
  if (!p || typeof p !== "object") return false;
  if ("imageUrl" in p) return true;
  if ("creator" in p) return true;
  if (Array.isArray(p?.likes)) return true;
  return false;
}

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showCreator = true,
  showComments = true,
  disableCommentClick = false,
  isExplorePage = false,
}: GridPostListProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No posts available.</p>
      </div>
    );
  }

  return (
    <ul className="grid-container">
      {posts.map((post, index) => {
        const key = (post as any)?._id || (post as any)?.$id || index;

        // ✅ For our server posts, render the same card the Home feed uses.
        if (isServerPost(post)) {
          return <PostCard key={key} post={post as any} />;
        }

        // 🔁 Legacy/Appwrite-shaped items still use SavedGridPostList, unchanged.
        return (
          <SavedGridPostList
            key={key}
            post={post}
            showUser={showUser}
            showCreator={showCreator}
            showStats={showStats}
            showComments={showComments}
            disableCommentClick={disableCommentClick}
            isExplorePage={isExplorePage}
          />
        );
      })}
    </ul>
  );
};

export default GridPostList;
