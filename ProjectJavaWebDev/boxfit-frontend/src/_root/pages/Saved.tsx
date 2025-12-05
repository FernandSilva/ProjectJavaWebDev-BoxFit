// src/_root/pages/Saved.tsx
import { Models } from "appwrite";
import { GridPostList, Loader } from "@/components/shared";
import { useCurrentUser } from "@/lib/react-query/queries";

const Saved = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) return <Loader />;
  if (!currentUser) return <p className="text-light-4">No user found.</p>;

  const savePosts = currentUser.save
    ?.map((savePost: { post: Models.Document }) => ({
      ...savePost.post,
    }))
    .reverse();

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="save"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
          Saved Posts
        </h2>
      </div>

      <ul className="w-full flex justify-center max-w-5xl gap-9">
        {savePosts?.length > 0 ? (
          <GridPostList
            posts={savePosts}
            showStats={true}
            showCreator={false}
            showComments={false} // ✅ Hide comment section
          />
        ) : (
          <p className="text-light-4">No saved posts</p>
        )}
      </ul>
    </div>
  );
};

export default Saved;
