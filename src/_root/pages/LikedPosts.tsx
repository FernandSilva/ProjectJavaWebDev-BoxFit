import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser, isLoading, isError } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (isError || !currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-red-500">Failed to load liked posts.</p>
      </div>
    );
  }

  if (currentUser.liked.length === 0) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-gray-500">You haven't liked any posts yet.</p>
      </div>
    );
  }

  // Reverse the posts to show the most recent likes first
  const reversedLikedPosts = [...currentUser.liked].reverse();

  return (
    <div className="liked-posts-container">
      <h1 className="text-lg font-semibold mb-4">Liked Posts</h1>
      <GridPostList posts={reversedLikedPosts} showStats={true} showComments={false} />
    </div>
  );
};

export default LikedPosts;
