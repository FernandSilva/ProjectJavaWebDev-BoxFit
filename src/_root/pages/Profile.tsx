import { LikedPosts } from "@/_root/pages";
import { GridPostList, Loader } from "@/components/shared";
import { Button } from "@/components/ui";
import { INITIAL_USER, useUserContext } from "@/context/AuthContext";
import { IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { AiFillEdit } from "react-icons/ai";
import {
  useFollowUser,
  useGetUserById,
  useGetUserRelationships,
  useSignOutAccount,
  useUnfollowUser,
} from "@/lib/react-query/queries"; // Corrected the imports here
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

// Import the hook at the top of your file
import { useFollowStatus } from "@/lib/react-query/queries"; // Adjust the path as necessary

// interface StatBlockProps {
//   value: string | number;
//   label: string;
// }

// const StatBlock = ({ value, label }: StatBlockProps) => (
//   <div className="flex-center gap-2">
//     <p className="small-semibold lg:body-bold text-green-500">{value}</p>
//     <p className="small-medium lg:base-medium text-light-3">{label}</p>
//   </div>
// );

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { id: profileId } = useParams(); // This is the ID of the profile being viewed
  const { user, setUser, setIsAuthenticated } = useUserContext(); // This should give you the logged-in user's info
  const { pathname } = useLocation();
  const { data: currentUser } = useGetUserById(id || "");
  const { data: userRelationships } = useGetUserRelationships(id);
  const { mutate: signOut } = useSignOutAccount(); // Now correctly imported
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

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className=" flex flex-col xl:flex-row  max-xl:items-center  lg:gap-7 lg:justify-between">
        <div className="flex lg:gap-6 gap-2">
        <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-[4rem] h-[4rem] lg:h-[6rem] lg:w-[6rem] rounded-full hidden md:inline"
          />
          <div className="md:hidden flex flex-col gap-1">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-[4rem] h-[4rem] lg:h-[6rem] lg:w-[6rem] rounded-full"
          />
          <div className=" md:hidden">
              <h1 className="lg:text-center xl:text-left !text-[14px]   w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium !text-[12px] text-light-3 ">
                @{currentUser.username}
              </p>
              
            </div>
          </div>
          <div className="flex flex-col  md:mt-2">
            <div className="hidden md:flex flex-col w-full ">
              <h1 className="lg:text-center xl:text-left  md:!text-[32px] h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium !text-[14px] text-light-3 lg:text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>
            <div className="flex flex-row mt-[10px] md:mt-[0px] gap-2 md:gap-8 pt-[10px] lg:pt-[20px] items-center justify-center xl:justify-start  z-20">
              <Link
                to={`/profile/${id}`}
                className="flex-center gap-1 md:gap-2 cursor-pointer"
              >
                <p className="small-semibold lg:body-bold text-green-500">
                  {currentUser.posts.length}
                </p>
                <p className="small-medium lg:base-medium text-light-3">
                  Posts
                </p>
              </Link>
              <Link
                to={`/profile/${id}/followers`}
                className="flex-center gap-1 md:gap-2 cursor-pointer"
              >
                <p className="small-semibold lg:body-bold text-green-500">
                  {" "}
                  {userRelationships?.followers || 0}
                </p>
                <p className="small-medium lg:base-medium text-light-3">
                  Followers
                </p>
              </Link>
              <Link
                to={`/profile/${id}/following`}
                className="flex-center gap-1 md:gap-2 cursor-pointer"
              >
                <p className="small-semibold lg:body-bold text-green-500">
                  {userRelationships?.following || 0}
                </p>
                <p className="small-medium lg:base-medium text-light-3">
                  Following
                </p>
              </Link>
            </div>
            <p className="small-medium md:base-medium text-center hidden md:flex xl:text-left pt-[10px] lg:pt-[20px] max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>
        </div>
        <div className="w-[100%] md:hidden pl-[10px] py-[10px]">
        <p className="text-[10px]  text-[#555555]">
              {currentUser.bio}
            </p>
        </div>
        <div className="flex justify-between xl:justify-end xl:gap-4 md:mt-4 w-full">
          {isOwnProfile && (
            <>
              <Link to={`/update-profile/${currentUser.$id}`}>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2  text-gray-700 border border-gray-300  rounded-md hover:bg-gray-200  transition duration-150 ease-in-out"
                >
                  {/* <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={14}
                    height={14}
                    /> */}
                  {/* <AiFillEdit className="h-[14px] w-[14px]" /> */}
                  <span className="md:text-sm text-[14px] font-medium">Edit Profile</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition duration-150 ease-in-out"
                onClick={handleNavigateToSettings}
              >
                {/* <img
                    src="/assets/icons/settings.svg"
                    alt="settings"
                    width={14}
                    height={14}
                  /> */}
                {/* <IoSettingsOutline className="h-[14px] w-[14px]" /> */}
                <span className="text-sm font-medium">Settings</span>
              </Button>

              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition duration-150 ease-in-out"
                onClick={handleSignOut}
              >
                {/* <img
                    src="/assets/icons/logout.svg"
                    alt="logout"
                    width={14}
                    height={14}
                  /> */}
                <TbLogout2 className="h-[14px] w-[14px]" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </>
          )}
          {!isOwnProfile && (
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition duration-150 ease-in-out"
                onClick={handleFollow}
                disabled={followMutation.isLoading}
              >
                Follow
              </Button>
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-green-500 rounded-md transition duration-150 ease-in-out"
                onClick={handleUnfollow}
                disabled={unfollowMutation.isLoading}
              >
                Unfollow
              </Button>
            </div>
          )}
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex justify-center max-w-5xl w-full my-4 border-b border-gray-300 gap-8">
          <Link
            to={`/profile/${id}`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname === `/profile/${id}`
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              className="w-5 h-5"
            />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname === `/profile/${id}/liked-posts`
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              className="w-5 h-5"
            />
            <span className="hidden md:inline">Liked Posts</span>
          </Link>
          <Link
            to={`/Chat`}
            className={`flex items-center gap-2 px-0.5 py-2 transition-colors duration-150 ease-in-out ${
              pathname.includes(`/Chat`)
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            <img
              src={"/assets/icons/message.svg"}
              alt="comments"
              className="w-5 h-5"
            />
            <span className="hidden md:inline">Messages</span>
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
