import { PostCard, UserCard } from "@/components/shared";
import {
  useGetFollowersPosts,
  useGetFollowingPosts,
  useGetUserPosts,
  useGetUsers,
} from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useMemo } from "react";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import NotificationsPermissionPrompt from "@/components/shared/NotificationPermissionsPrompt";

const Home = () => {
  const { user } = useUserContext();

  const { data: userPosts } = useGetUserPosts(user?.id);
  const { data: followersPosts } = useGetFollowersPosts(user?.id ?? "");
  const {
    data: followingPosts,
    isLoading: isPostLoading,
  } = useGetFollowingPosts(user?.id ?? "");

  const { data: creators, isLoading: isUserLoading } = useGetUsers(10);

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

  const renderFeedContent = () => {
    if (isPostLoading) {
      return (
        <div className="flex justify-center py-6">
          <img
            src="/assets/icons/Loader1.svg"
            alt="Loading"
            className="w-8 h-8 animate-spin"
          />
        </div>
      );
    }

    if (combinedPosts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center border">
          <p className="text-base text-gray-700">
            Welcome to <span className="font-bold text-green-600">BoxFit</span> 🥊<br />
            Follow other members or share your first post to start building your home page.
          </p>
          <img
            src="/assets/images/BF1.png"
            alt="Welcome"
            className="w-full max-w-md rounded-lg object-cover my-2"
          />
        </div>
      );
    }

    return combinedPosts.map((post) => (
      <PostCard key={post.$id} post={post as Models.Document} />
    ));
  };

  const renderCommunityBlock = () => (
    <div className="home-creators items-center">
      <h3 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
        BoxFit Community
      </h3>
      {isUserLoading ? (
        <div className="flex justify-center w-full py-4">
          <img
            src="/assets/icons/Loader1.svg"
            alt="Loading"
            className="w-8 h-8 animate-spin"
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-4 w-full items-center">
          {creators?.map((creator) => (
            <li key={creator.$id} className="w-full flex justify-center">
              <UserCard user={creator} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <NotificationsPermissionPrompt />

      <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden flex-col lg:flex-row">
        <section className="flex-1 overflow-y-auto px-4 lg:px-6 py-10">
          <div className="block lg:hidden mb-6">
            <h3 className="h3-bold text-left w-full border-b border-gray-300 pb-2">
              BoxFit Community
            </h3>
            <div className="flex overflow-x-auto gap-4 py-2">
              {isUserLoading ? (
                <div className="flex justify-center w-full py-4">
                  <img
                    src="/assets/icons/Loader1.svg"
                    alt="Loading"
                    className="w-8 h-8 animate-spin"
                  />
                </div>
              ) : (
                creators?.map((creator) => (
                  <div key={creator.$id} className="flex-shrink-0 p-1">
                    <Link to={`/profile/${creator.$id}`}>
                      <img
                        src={
                          creator.imageUrl ||
                          "/assets/icons/profile-placeholder.svg"
                        }
                        alt={creator.username}
                        className="h-12 w-12 rounded-full border border-gray-300"
                      />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <h2 className="h3-bold md:h2-bold mb-5">Feed</h2>

          <div className="home-posts">{renderFeedContent()}</div>
        </section>

        <aside className="hidden lg:flex flex-col w-[300px] border-l border-gray-100 overflow-y-auto px-6 py-10">
          {renderCommunityBlock()}
        </aside>
      </div>
    </>
  );
};

export default Home;
