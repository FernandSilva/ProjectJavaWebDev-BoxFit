import { Models } from "appwrite";
import { useState } from "react";
// import { useToast } from "@/components/ui/use-toast";
import { Chatbot, Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";

const Home = () => {
  // const { toast } = useToast();
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const [showChatbot, setShowChatbot] = useState(false);

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

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
      <div className="home-container ">
        <div className="home-posts md:max-w-screen-sm">
          <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2 overflow-x-hidden">
            Feed
          </h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col gap-8 w-full ">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chatbot trigger icon */}
      <div className="chatbot-container !right-[5%] sm:!right-[3%] !bottom-[85px] sm:!bottom-5">
        <img
          src="/assets/icons/GrowB.jpeg"
          alt="Open Chatbot"
          className="chatbot-trigger"
          onClick={toggleChatbot}
        />
        {showChatbot && <Chatbot />}
      </div>

      <div className="home-creators">
        <h3 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
          Top Growers
        </h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-4">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id}>
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
