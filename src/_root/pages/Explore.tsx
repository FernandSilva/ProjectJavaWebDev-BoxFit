import { GridPostList, Loader, UserCard } from "@/components/shared";
import { Input } from "@/components/ui";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useWindowSize } from "@uidotdev/usehooks";

import { getAllUsers } from "@/lib/appwrite/api";
import {
  useGetAllPosts,
  useGetFollowersPosts,
  useGetFollowingPosts,
  useSearchPosts,
} from "@/lib/react-query/queries";
import { Models } from "appwrite";
import Select from 'react-select'

const options = [
  { value: 'all', label: 'All' },
  { value: 'followers', label: 'Followers' },
  { value: 'following', label: 'Following' }
]

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[] | any;
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.length > 0) {
    return <GridPostList posts={searchedPosts} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};

type PostType = Models.Document; // Define your post type accordingly

const Explore = ({ userId }: { userId: string }) => {
  const size = useWindowSize();
  const { ref, inView } = useInView();
  const [filter, setFilter] = useState("all");
  const { data: allPosts, fetchNextPage, hasNextPage } = useGetAllPosts();
  const { data: followingPosts } = useGetFollowingPosts(userId);
  const { data: followersPosts } = useGetFollowersPosts(userId);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedSearch);
  const [users, setUsers] = useState<Models.Document[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData: Models.Document[] = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsFetchingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage]);

  

  const filteredPosts = (): PostType[] => {
    if (filter === "followers") {
      return (
        followersPosts?.documents.map((post: PostType) => ({
          ...post,
          key: `followers-${post.$id}`,
        })) || []
      );
    } else if (filter === "following") {
      return (
        followingPosts?.documents.map((post: PostType) => ({
          ...post,
          key: `following-${post.$id}`,
        })) || []
      );
    } else {
      return (
        allPosts?.pages?.flatMap((page: any) =>
          page.documents.map((post: PostType) => ({
            ...post,
            key: `all-${post.$id}`,
          }))
        ) || []
      );
    }
  };

  const posts = filteredPosts();
  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && posts.length === 0;

  return (
    <div className="main-content !w-full">
      <div className="explore-container !w-full">
        <div className="explore-inner_container">
          <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
            Top Growers
          </h2>
          {isFetchingUsers ? (
            <Loader />
          ) : (
            <>
              {/* <div className="user-profiles-slider overflow-x-auto ">
              {users.map((user) => (
                <UserCard key={user.$id} user={user} />
              ))}
            </div> */}
              <div className="overflow-hidden w-[300px] md:w-[900px]">
                <Swiper
                  // install Swiper modules
                  modules={[ A11y]}
                  spaceBetween={16}
                  slidesPerView={size.width>640 ? 3:size.width<1200?4:2}
                  
                 
                  onSwiper={(swiper) => console.log(swiper)}
                  onSlideChange={() => console.log("slide change")}
                >
                  {users.map((user) => (
                    <SwiperSlide>
                      <UserCard key={user.$id} user={user} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}

          <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
            Search Posts
          </h2>
          <div className="flex gap-1 px-4 w-full rounded-lg bg-white text-black">
            <Input
              type="text"
              placeholder="Search"
              className="explore-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-between w-full mt-16 mb-7">
          <h3 className="body-bold md:h3-bold">Popular Today</h3>
          <div
            className=" rounded-xl cursor-pointer  w-[170px]"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
                
              color: "black",
              borderRadius: "0.75rem",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            
            
            <Select options={options} className="w-[100%]"/>
          </div>
        </div>

        <div className="flex flex-wrap gap-9 w-full">
          {shouldShowSearchResults ? (
            <SearchResults
              isSearchFetching={isSearchFetching}
              searchedPosts={searchedPosts}
            />
          ) : shouldShowPosts ? (
            <p className="text-black mt-10 text-center w-full">End of posts</p>
          ) : (
            <GridPostList posts={posts} />
          )}
        </div>

        {hasNextPage && !searchValue && (
          <div ref={ref} className="mt-10">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
