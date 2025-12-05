// src/pages/Profile.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { GridPostList, Loader } from "@/components/shared";
import { Button } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import {
  useUser,
  useUserPosts,
  useLikedPosts,
  useSavedPosts,
  useCreateNotification,
  useSignOutAccount,
} from "@/lib/react-query/queries";
import { TbLogout2 } from "react-icons/tb";
import { BiMessageDetail } from "react-icons/bi";
import LikedPosts from "./LikedPosts";
import { INITIAL_USER } from "@/types";
import { normalizeImageUrl } from "@/lib/appwrite/api";

const idOf = (v: any) => v?._id || v?.$id || v?.id || "";

/* =============================================================== */
const Profile = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-gray-500">Invalid user ID.</p>
      </div>
    );
  }
  return <ProfileInner id={id} />;
};
/* =============================================================== */

function ProfileInner({ id }: { id: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated } = useUserContext();

  const viewerId = useMemo(() => idOf(user), [user]);
  const isOwnProfile = viewerId === id;

  // Core user
  const { data: currentUser } = useUser(id);

  // Posts, Likes, and Saved
  const { data: createdPosts, isLoading: loadingCreated } = useUserPosts(id);
  const { data: likedPosts, isLoading: loadingLiked } = useLikedPosts(id);
  const { data: savedPosts, isLoading: loadingSaved } = useSavedPosts(id);

  const { mutateAsync: signOut } = useSignOutAccount();

  // State
  const [activeTab, setActiveTab] = useState("posts");

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(INITIAL_USER);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigateToSettings = () => navigate("/settings");

  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const handleTabClick = (tab: string) => setActiveTab(tab);

  // ✅ normalize imageUrl for safety (string | string[])
  const normalizePosts = (arr: any[]) =>
    arr.map((p) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
    }));

  // ✅ NEW: always unwrap data into a plain array to satisfy TS
  const toArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.documents)) return res.documents;
    return [];
  };

  const renderPosts = () => {
    if (activeTab === "liked") {
      if (loadingLiked) return <Loader />;
      const likedArr = toArray(likedPosts);
      return (
        <GridPostList
          posts={normalizePosts(likedArr)}
          showUser={false}
          disableCommentClick={true}
          isExplorePage={false}
        />
      );
    }

    if (activeTab === "saved") {
      if (loadingSaved) return <Loader />;
      const savedArr = toArray(savedPosts);
      return (
        <GridPostList
          posts={normalizePosts(savedArr)}
          showUser={false}
          disableCommentClick={true}
          isExplorePage={false}
        />
      );
    }

    if (loadingCreated) return <Loader />;
    const createdArr = toArray(createdPosts);
    return (
      <GridPostList
        posts={normalizePosts(createdArr)}
        showUser={false}
        disableCommentClick={true}
        isExplorePage={false}
      />
    );
  };

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row max-xl:items-center lg:gap-7 lg:justify-between">
        <div className="flex lg:gap-6 gap-2">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-[4rem] h-[4rem] lg:h-[6rem] lg:w-[6rem] rounded-full"
          />
          <div className="flex flex-col justify-center">
            <h1 className="md:!text-[32px] h3-bold md:h1-semibold w-full">
              {currentUser.name || "Unknown User"}
            </h1>
            <p className="small-regular md:body-medium text-light-3">
              @{currentUser.username || "unknown"}
            </p>
            {currentUser.bio && (
              <p className="small-medium md:base-medium text-gray-600 mt-2">
                {currentUser.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between xl:justify-end xl:gap-4 md:mt-4 w-full">
          {isOwnProfile ? (
            <>
              <Link to={`/update-profile/${id}`}>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                >
                  Edit Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition"
                onClick={handleNavigateToSettings}
              >
                Info
              </Button>
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition"
                onClick={handleSignOut}
              >
                <TbLogout2 className="h-[14px] w-[14px]" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex justify-center gap-4 mt-4">
              <Button
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md transition bg-white hover:bg-green-500`}
                onClick={() => navigate("/Chat")}
              >
                <BiMessageDetail />
                <p className="text-sm">Message</p>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex justify-center max-w-5xl w-full my-4 border-b border-gray-300 gap-8">
        <button
          onClick={() => handleTabClick("posts")}
          className={`flex items-center gap-2 px-0.5 py-2 ${
            activeTab === "posts"
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-600 hover:text-green-500"
          }`}
        >
          <img src="/assets/icons/posts.svg" alt="posts" className="w-5 h-5" />
          <span className="hidden md:inline">Posts</span>
        </button>

        <button
          onClick={() => handleTabClick("liked")}
          className={`flex items-center gap-2 px-0.5 py-2 ${
            activeTab === "liked"
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-600 hover:text-green-500"
          }`}
        >
          <img src="/assets/icons/like.svg" alt="like" className="w-5 h-5" />
          <span className="hidden md:inline">Liked Posts</span>
        </button>

        <button
          onClick={() => handleTabClick("saved")}
          className={`flex items-center gap-2 px-0.5 py-2 ${
            activeTab === "saved"
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-600 hover:text-green-500"
          }`}
        >
          <img src="/assets/icons/save.svg" alt="saved" className="w-5 h-5" />
          <span className="hidden md:inline">Saved</span>
        </button>

        <button
          onClick={() => navigate("/Chat")}
          className={`flex items-center gap-2 px-0.5 py-2 ${
            pathname.includes("/Chat")
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-600 hover:text-green-500"
          }`}
        >
          <img src="/assets/icons/message.svg" alt="messages" className="w-5 h-5" />
          <span className="hidden md:inline">Messages</span>
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl w-full mx-auto">{renderPosts()}</div>

      <Routes>
        <Route path="/liked-posts" element={<LikedPosts />} />
      </Routes>
      <Outlet />
    </div>
  );
}

export default Profile;
