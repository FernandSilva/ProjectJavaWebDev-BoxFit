import { PostCard, UserCard } from "@/components/shared";
import {
  useAllPosts,
  useUsers,
} from "@/lib/react-query/queries"; // ✅ useAllPosts instead of user/followers/following posts
import { Models } from "appwrite";
import { useMemo } from "react";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useUserContext();

  console.log("👤 Logged in user:", user);

  // ===== ALL POSTS =====
  const { data: allPosts, isLoading: isAllPostsLoading } = useAllPosts();

  // ===== USERS =====
  const { data: creators, isLoading: isUserLoading } = useUsers(10);

  // ===== DEBUG LOGS =====
  console.log("🪶 allPosts:", allPosts);

  const extractPosts = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.documents)) return data.documents;
    return [];
  };

  const posts = useMemo(() => {
    const clean = extractPosts(allPosts);
    return clean.sort(
      (a, b) =>
        new Date(b.createdAt || b.$createdAt || 0).getTime() -
        new Date(a.createdAt || a.$createdAt || 0).getTime()
    );
  }, [allPosts]);

  const isPostLoading = isAllPostsLoading;

  const renderFeedContent = () => {
    if (isPostLoading) {
      return (
        <div className="flex justify-center py-6">
          <img src="/assets/icons/Loader1.svg" alt="Loading" className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      console.log("⚠️ No posts found — showing welcome message");
      return (
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-200">
          <p className="text-base text-gray-700 mb-3">
            👋 Welcome to <span className="font-bold text-green-600">BoxFit</span>!
            <br />
            Follow members or share your first post to get started 💪
          </p>
          <img
            src="/assets/images/BF1.png"
            alt="Welcome"
            className="w-full max-w-md rounded-lg object-cover my-2"
          />
          <Link
            to="/create-post"
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Create Your First Post
          </Link>
        </div>
      );
    }

    return posts.map((post: Models.Document) => (
      <PostCard key={post._id || post.$id || Math.random()} post={post} />
    ));
  };

  const renderCommunityBlock = () => (
    <div className="home-creators items-center">
      <h3 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
        BoxFit Community
      </h3>
      {isUserLoading ? (
        <div className="flex justify-center w-full py-4">
          <img src="/assets/icons/Loader1.svg" alt="Loading" className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <ul className="flex flex-col gap-4 w-full items-center">
          {creators?.map((creator: Models.Document) => (
            <li key={creator._id || creator.$id} className="w-full flex justify-center">
              <UserCard user={creator} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden flex-col lg:flex-row">
      {/* Main Feed */}
      <section className="flex-1 overflow-y-auto px-4 lg:px-6 py-10">
        {/* Mobile Community */}
        <div className="block lg:hidden mb-6">
          <h3 className="h3-bold text-left w-full border-b border-gray-300 pb-2">
            BoxFit Community
          </h3>
          <div className="flex overflow-x-auto gap-4 py-2">
            {isUserLoading ? (
              <div className="flex justify-center w-full py-4">
                <img src="/assets/icons/Loader1.svg" alt="Loading" className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              creators?.map((creator: Models.Document) => (
                <div key={creator._id || creator.$id} className="flex-shrink-0 p-1">
                  <Link to={`/profile/${creator._id || creator.$id}`}>
                    <img
                      src={creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={creator.username || creator.name || "User"}
                      className="h-12 w-12 rounded-full border border-gray-300 object-cover"
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

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[300px] border-l border-gray-100 overflow-y-auto px-6 py-10">
        {renderCommunityBlock()}
      </aside>
    </div>
  );
};

export default Home;
