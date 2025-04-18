// src/_root/pages/Home.tsx
import { Loader, PostCard, UserCard } from "@/components/shared";
import {
  useGetFollowersPosts,
  useGetFollowingPosts,
  useGetUserPosts,
  useGetUsers,
} from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useMemo, useState } from "react";
import { useUserContext } from "@/context/AuthContext";

const Home = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const { user } = useUserContext();

  const { data: userPosts } = useGetUserPosts(user?.id);
  const { data: followersPosts } = useGetFollowersPosts(user?.id ?? "");
  const {
    data: followingPosts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetFollowingPosts(user?.id ?? "");

  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  const combinedPosts = useMemo(() => {
    const combined = [
      ...(userPosts?.documents || []),
      ...(followersPosts?.documents || []),
      ...(followingPosts?.documents || []),
    ];
    const unique = combined.filter(
      (post, index, self) =>
        index === self.findIndex((p) => p.$id === post.$id)
    );
    return unique.sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );
  }, [userPosts, followersPosts, followingPosts]);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-black">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-black">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full">
      <div className="home-container">
        <div className="home-posts md:max-w-screen-sm">
          <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2 overflow-x-hidden">
            Feed
          </h2>
          {isPostLoading && combinedPosts.length === 0 ? (
            <Loader />
          ) : (
            <ul className="flex flex-col gap-8 w-full">
              {combinedPosts.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="chatbot-container !right-[5%] sm:!right-[3%] !bottom-[85px] sm:!bottom-5">
        {/* Chatbot trigger icon (optional) */}
      </div>

      <div className="home-creators !overflow-x-hidden">
        <h3 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
          Top Growers
        </h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-4">
            {creators?.slice(0, 10).map((creator) => (
              <li key={creator.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
