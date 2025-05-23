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
        {combinedPosts.length === 0 && !isPostLoading && (
  <div className="bg-white rounded-xl shadow p-5 mt-6 flex flex-col items-center text-center border">
     <p className="text-lg text-gray-700">
      Your feed is waiting to grow 🌿 <br />
      Follow other members or share your first post to start building your home page.
    </p>
    <p></p>
    <img
      src="/assets/images/side-img.jpeg"
      alt="Welcome"
      className="w-full max-w-md rounded-lg object-cover mb-4"
    />
   
  </div>
)}

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

      <div className="home-creators !overflow-y-auto max-h-[calc(100vh-100px)] pr-2">
              <h3 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
                Community
              </h3>
              {isUserLoading && !creators ? (
                <Loader />
              ) : (
                <ul className="flex flex-col gap-4">
                  {creators?.map((creator) => (
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
