import { Models } from "appwrite";

import SavedGridPostList from "./SavedGridPostList";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  showcreator?:boolean;
  showComments?:boolean
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showcreator = true,
  showComments
  
}: GridPostListProps) => {
  

  return (
    <ul className="grid-container">
      {posts.map((post, index) => (
        <SavedGridPostList key={index} post={post} showUser={showUser} showcreator={showcreator} showStats={showStats}  showComments={showComments}/>
      ))}
    </ul>
  );
};

export default GridPostList;
