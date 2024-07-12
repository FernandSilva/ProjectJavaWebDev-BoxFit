import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, Pagination } from "swiper/modules";
import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);
  console.log({ post });
  useEffect(() => {
    const types: string[] = [];
    const urls: string[] = [];

    post.imageUrl.forEach((url: string) => {
      // Extract the type parameter from the URL
      const typeStartIndex = url.indexOf("?type=");
      let typeMatch = "unknown";
      if (typeStartIndex !== -1) {
        const typeEndIndex = url.indexOf("&", typeStartIndex);
        typeMatch =
          typeEndIndex !== -1
            ? url.substring(typeStartIndex + 6, typeEndIndex)
            : url.substring(typeStartIndex + 6);
      }

      console.log(`URL: ${url}, Type: ${typeMatch}`); // Log the URL and extracted type
      types.push(typeMatch.split("/")[0]);

      // Remove the type parameter from the URL and the last question mark if it's at the end
      const cleanUrl = url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, "");
      urls.push(cleanUrl);
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [post.imageUrl]);

  useEffect(() => {
    const playVideo = () => {
      if (videoRefs.current[activeIndex]) {
        videoRefs.current[activeIndex].play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    };
    playVideo();
  }, [activeIndex]);

  if (!post.creator) return null;

  return (
    <div className="post-card sm:max-w-screen-sm">
      <Link to={`/posts/${post.$id}`}>
        <>
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.creator.$id}`}>
                <img
                  src={
                    post.creator?.imageUrl ||
                    "/assets/icons/profile-placeholder1.svg"
                  }
                  alt="creator"
                  className="w-12 lg:h-12 rounded-full"
                />
              </Link>

              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-black">
                  {post.creator.name}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post.$createdAt)}
                  </p>
                  •
                  <p className="subtle-semibold lg:small-regular">
                    {post.location}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to={`/update-post/${post.$id}`}
              className={`${user.id !== post.creator.$id && "hidden"}`}
            >
              <img
                src={"/assets/icons/edit.svg"}
                alt="edit"
                width={20}
                height={20}
              />
            </Link>
          </div>

          <div className="small-medium lg:base-medium py-5">
            <p>{post.caption}</p>
            <ul className="flex gap-1 mt-2">
              {post.tags.map((tag: string, index: string) => (
                <li
                  key={`${tag}${index}`}
                  className="text-light-3 small-regular"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          </div>
        </>
      </Link>
      <div>
        <Swiper
          modules={[A11y, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination
          onInit={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            if (videoRefs.current[swiper.activeIndex]) {
              videoRefs.current[swiper.activeIndex].play().catch((error) => {
                console.error("Error playing video:", error);
              });
            }
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            if (videoRefs.current[swiper.activeIndex]) {
              videoRefs.current[swiper.activeIndex].play().catch((error) => {
                console.error("Error playing video:", error);
              });
            }
          }}
        >
          {cleanUrls.map((url, index) => {
            return (
              <SwiperSlide key={index} style={{ width: "100%" }}>
                {fileTypes[index] === "video" && (
                  <video
                    className="post-card_img"
                    loop
                    muted
                    ref={(el) => (videoRefs.current[index] = el)}
                  >
                    <source src={url} />
                  </video>
                )}
                {fileTypes[index] === "image" && (
                  <img className="post-card_img" src={url} alt="File preview" />
                )}
                {fileTypes[index] === "unknown" && <p>Unknown file type</p>}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
