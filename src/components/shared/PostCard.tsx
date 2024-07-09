import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const videoRefs = useRef([]);
  console.log({ post });
  useEffect(() => {
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        videoRef.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    });
  }, [post]);

  const [fileTypes, setFileTypes] = useState([]);

  useEffect(() => {
    async function fetchMimeTypes(urls) {
      try {
        const types = await Promise.all(
          urls.map(async (url) => {
            const response = await fetch(url, {
              method: "HEAD",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const contentType = response.headers.get("Content-Type");
            if (contentType.startsWith("video/")) {
              return "video";
            } else if (contentType.startsWith("image/")) {
              return "image";
            } else {
              return "unknown";
            }
          })
        );
        setFileTypes(types);
      } catch (error) {
        console.error("Error fetching MIME types:", error);
        setFileTypes(urls.map(() => "unknown"));
      }
    }

    fetchMimeTypes(post?.imageUrl);
  }, [post]);
  if (!post.creator) return;
  return (
    <div className="post-card">
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
              <p className="subtle-semibold lg:small-regular ">
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

      {/* <Link to={`/posts/${post.$id}`}> */}
      <div className="small-medium lg:base-medium py-5">
        <p>{post.caption}</p>
        <ul className="flex gap-1 mt-2">
          {post.tags.map((tag: string, index: string) => (
            <li key={`${tag}${index}`} className="text-light-3 small-regular">
              #{tag}
            </li>
          ))}
        </ul>
      </div>
      <Swiper
        modules={[A11y]}
        spaceBetween={16}
        slidesPerView={1}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log("slide change")}
      >
        {post?.imageUrl?.map((url, index) => (
          <SwiperSlide key={index}>
            {fileTypes[index] === "video" && (
              <video
                className="post-card_img"
                src={url}
                autoPlay
                loop
                ref={(el) => (videoRefs.current[index] = el)}
              />
            )}
            {fileTypes[index] === "image" && (
              <img className="post-card_img" src={url} alt="File preview" />
            )}
            {fileTypes[index] === "unknown" && <p>Unknown file type</p>}
          </SwiperSlide>
        ))}
      </Swiper>
      {/* </Link> */}

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
