import { Models } from "appwrite";
import SavedGridPostList from "./SavedGridPostList";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  showCreator?: boolean;
  showComments?: boolean;
  disableCommentClick?: boolean;
  isExplorePage?: boolean; // ✅ New
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showCreator = true,
  showComments = true,
  disableCommentClick = false,
  isExplorePage = false, // ✅ Default false
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
      {posts.map((post, index) => (
        <SavedGridPostList
          key={index}
          post={post}
          showUser={showUser}
          showCreator={showCreator}
          showStats={showStats}
          showComments={showComments}
          disableCommentClick={disableCommentClick}
          isExplorePage={isExplorePage} // ✅ Pass it
        />
      ))}
    </ul>
  );
};

export default GridPostList;
