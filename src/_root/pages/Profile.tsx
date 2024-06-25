import { Route, Routes, Link, Outlet, useParams, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { GridPostList, Loader } from "@/components/shared";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { useSignOutAccount, useGetUserById, useGetUserRelationships } from "@/lib/react-query/queries"; // Corrected the imports here
import { useFollowUser, useUnfollowUser } from '@/lib/react-query/queries';
// Import the hook at the top of your file
import { useFollowStatus } from '@/lib/react-query/queries';  // Adjust the path as necessary

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-green-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-3">{label}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { id: profileId } = useParams(); // This is the ID of the profile being viewed
  const { user, setUser, setIsAuthenticated } = useUserContext(); // This should give you the logged-in user's info
  const { pathname } = useLocation();
  const { data: currentUser } = useGetUserById(id || "");
  const { data: userRelationships } = useGetUserRelationships(id);
  const { mutate: signOut } = useSignOutAccount();  // Now correctly imported
  const isOwnProfile = user?.id === currentUser?.$id;

  const followStatus = useFollowStatus(user?.id, profileId);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = () => {
    if (!followStatus.data) {
      followMutation.mutate({ userId: user?.id, followsUserId: profileId });
    }
  };

  const handleUnfollow = () => {
    if (followStatus.data) {
      unfollowMutation.mutate(followStatus.data.$id);
    }
  };

  const handleSignOut = async (e) => {
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

  const handleNavigateToSettings = () => {
    navigate("/settings");
  };

  if (!currentUser) return <div className="flex-center w-full h-full"><Loader /></div>;

  return (
    <div className="profile-container">
      <div className="profile-inner_container flex flex-col xl:flex-row max-xl:items-center flex-1 gap-7">
        <img src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"} alt="profile" className="w-28 h-28 lg:h-36 lg:w-36 rounded-full" />
        <div className="flex flex-col flex-1 justify-between md:mt-2">
          <div className="flex flex-col w-full">
            <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">{currentUser.name}</h1>
            <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">@{currentUser.username}</p>
          </div>
          <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
            <Link to={`/profile/${id}`} className="flex-center gap-2 cursor-pointer">
              <p className="small-semibold lg:body-bold text-green-500">{currentUser.posts.length}</p>
              <p className="small-medium lg:base-medium text-light-3">Posts</p>
            </Link>
            <Link to={`/profile/${id}/followers`} className="flex-center gap-2 cursor-pointer">
              <p className="small-semibold lg:body-bold text-green-500"> {userRelationships?.followers || 0}</p>
              <p className="small-medium lg:base-medium text-light-3">Followers</p>
            </Link>
            <Link to={`/profile/${id}/following`} className="flex-center gap-2 cursor-pointer">
              <p className="small-semibold lg:body-bold text-green-500">{userRelationships?.following || 0}</p>
              <p className="small-medium lg:base-medium text-light-3">Following</p>
            </Link>
          </div>
          <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">{currentUser.bio}</p>
         
          <div className="flex justify-center xl:justify-end gap-4 mt-4 w-full">
            {isOwnProfile && (
              <>
                <Link to={`/update-profile/${currentUser.$id}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 border border-black text-white rounded-md hover:bg-green-500 hover:text-white transition duration-150 ease-in-out">
                  <img src={"/assets/icons/edit.svg"} alt="edit" width={20} height={20} />
                  <span className="text-sm font-medium">Edit Profile</span>
                </Link>

                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition duration-150 ease-in-out" onClick={handleNavigateToSettings}>
                  <img src="/assets/icons/settings.svg" alt="settings" width={14} height={14} />
                  <span className="text-sm font-medium">Settings</span>
                </Button>

                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition duration-150 ease-in-out" onClick={handleSignOut}>
                  <img src="/assets/icons/logout.svg" alt="logout" width={14} height={14} />
                  <span className="text-sm font-medium">Logout</span>
                </Button>
              </>
            )}
            {!isOwnProfile && (
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition duration-150 ease-in-out" onClick={handleFollow} disabled={followMutation.isLoading}>
                  Follow
                </Button>
                <Button variant="ghost" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition duration-150 ease-in-out" onClick={handleUnfollow} disabled={unfollowMutation.isLoading}>
                  Unfollow
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex justify-center max-w-5xl w-full my-4 border-b border-gray-300 gap-8">
          <Link
            to={`/profile/${id}`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname === `/profile/${id}` ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img src={"/assets/icons/posts.svg"} alt="posts" className="w-5 h-5" />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname === `/profile/${id}/liked-posts` ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img src={"/assets/icons/like.svg"} alt="like" className="w-5 h-5" />
            <span className="hidden md:inline">Liked Posts</span>
          </Link>
          <Link
            to={`/Chat`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname.includes(`/Chat`) ? "text-green-500 border-b-2 border-green-500" : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img src={"/assets/icons/message.svg"} alt="comments" className="w-5 h-5" />
            <span className="hidden md:inline">Messages</span>
          </Link>
        </div>
      )}

      <Routes>
        <Route index element={<GridPostList posts={currentUser.posts} showUser={false} />} />
        {currentUser.$id === user.id && <Route path="/liked-posts" element={<LikedPosts />} />}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
