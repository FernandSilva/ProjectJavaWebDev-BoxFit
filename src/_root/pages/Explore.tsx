// src/pages/Explore.tsx

import { GridPostList, Loader, UserCard } from "@/components/shared";
import { Input } from "@/components/ui";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Select from "react-select";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetAllPosts,
  useGetFollowersPosts,
  useGetFollowingPosts,
  useGetUsers,
  useSearchUsersAndPosts,
} from "@/lib/react-query/queries";
import { Models } from "appwrite";

const options = [
  { value: "all", label: "All" },
  { value: "followers", label: "Followers" },
  { value: "following", label: "Following" },
];

type PostType = Models.Document;

const Explore = () => {
  const size = useWindowSize();
  const { user } = useUserContext();
  const { ref, inView } = useInView();

  const [searchValue, setSearchValue] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");

  const { data: allPosts, fetchNextPage: fetchNextAllPosts, isFetchingNextPage } =
    useGetAllPosts(searchValue);
  const { data: followersPosts } = useGetFollowersPosts(user?.id ?? "");
  const { data: followingPosts } = useGetFollowingPosts(user?.id ?? "");
  const { data: users, isLoading: isFetchingUsers } = useGetUsers(10);
  const { data: searchData, isLoading: isSearchLoading } = useSearchUsersAndPosts(searchValue);

  const sortedUsers = useMemo(() => {
    return users ? [...users].sort((a, b) => ((b.liked?.length || 0) - (a.liked?.length || 0))) : [];
  }, [users]);

  useEffect(() => {
    if (inView && !searchValue && filter === "all") {
      fetchNextAllPosts();
    }
  }, [inView, searchValue, filter, fetchNextAllPosts]);

  const filteredPosts = (): PostType[] => {
    if (filter === "followers") {
      return followersPosts?.documents || [];
    } else if (filter === "following") {
      return followingPosts?.documents || [];
    } else {
      return allPosts?.pages.flatMap((page) => page.documents) || [];
    }
  };

  const posts = filteredPosts();

  return (
    <div className="main-content !w-full">
      <div className="explore-container !w-full">
        <div className="explore-inner_container">
          <h2 className="h3-bold md:h2-bold w-full border-b border-gray-300 pb-2">
            Top Growers
          </h2>
          {isFetchingUsers ? (
            <Loader />
          ) : (
            <div className="overflow-hidden w-[300px] md:w-[900px]">
              <Swiper
                modules={[A11y]}
                spaceBetween={16}
                slidesPerView={
                  size.width > 1024 ? 4.5 : size.width > 640 ? 3.5 : 2.5
                }
              >
                {sortedUsers.map((user, index) => (
                  <SwiperSlide key={user.$id}>
                    <UserCard user={user} rank={index < 10 ? index + 1 : undefined} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          <h2 className="h3-bold md:h2-bold w-full border-b border-gray-300 pb-2 mt-10">
            Search Growers & Posts
          </h2>
          <Input
            type="text"
            placeholder="Search for growers or posts"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {searchValue.trim() !== "" ? (
          <div className="search-results mt-6">
            {isSearchLoading ? (
              <Loader />
            ) : searchData && (searchData.users.length > 0 || searchData.posts.length > 0) ? (
              <>
                <h3 className="h4-bold mt-4 mb-2">Matching Users</h3>
                <div className="flex flex-wrap gap-4">
                  {searchData.users.map((user) => (
                    <UserCard key={user.$id} user={user} />
                  ))}
                </div>

                <h3 className="h4-bold mt-8 mb-2">Matching Posts</h3>
                <GridPostList posts={searchData.posts} showComments={false} />
              </>
            ) : (
              <p className="text-gray-500">No matching users or posts found.</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex-between w-full mt-16 mb-7">
              <h3 className="body-bold md:h3-bold">Popular Today</h3>
              <div className="rounded-xl w-[170px]">
                <Select
                  options={options}
                  defaultValue={options[0]}
                  className="w-full"
                  onChange={(e) => setFilter(e?.value || "all")}
                  isSearchable={false}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-9 w-full">
              {posts.length === 0 && isFetchingNextPage ? (
                <Loader />
              ) : (
                <GridPostList posts={posts} showComments={false} />
              )}
            </div>
            <div ref={ref} className="py-4">
              {isFetchingNextPage && (
                <div className="flex-center w-full">
                  <img
                    src="/assets/icons/Loader1.svg"
                    alt="Loading"
                    className="w-8 h-8"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
