import { Models } from "appwrite";
import SavedGridPostList from "./SavedGridPostList";

type GridPostListProps = {
  posts: Models.Document[]; // Array of post documents
  showUser?: boolean; // Controls visibility of user details
  showStats?: boolean; // Controls visibility of post stats (likes/comments)
  showCreator?: boolean; // Controls visibility of post creator details
  showComments?: boolean; // Controls visibility of post comments
};

const GridPostList = ({
  posts,
  showUser = true, // Default: Show user
  showStats = true, // Default: Show stats
  showCreator = true, // Default: Show creator
  showComments = true, // Default: Show comments
}: GridPostListProps) => {
  // Handle empty state
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
        />
      ))}
    </ul>
  );
};

export default GridPostList;
