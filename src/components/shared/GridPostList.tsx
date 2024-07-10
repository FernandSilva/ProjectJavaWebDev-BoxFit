import { Models } from "appwrite";

import SavedGridPostList from "./SavedGridPostList";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  showcreator?:boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showcreator = true,
  
}: GridPostListProps) => {
  

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <SavedGridPostList post={post} showUser={showUser} showcreator={showcreator} showStats={showStats}  />
      ))}
    </ul>
  );
};

export default GridPostList;
