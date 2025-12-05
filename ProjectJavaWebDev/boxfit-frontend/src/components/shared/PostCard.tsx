import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, Pagination } from "swiper/modules";
import { Models } from "appwrite";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";

import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useCreateNotification,
} from "@/lib/react-query/queries";

type PostCardProps = {
  post: Models.Document;
  disableCommentClick?: boolean;
};

// --- helpers -------------------------------------------------
const pickId = (v: any) => v?._id || v?.$id || v?.id || "";

const inferTypeFromUrl = (url: string): "image" | "video" | "unknown" => {
  const base = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(base)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(base)) return "image";
  return "unknown";
};

const normalizeArray = (v: any) => (Array.isArray(v) ? v : []);

// -------------------------------------------------------------

const PostCard = ({ post, disableCommentClick = false }: PostCardProps) => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const postId = useMemo(() => pickId(post), [post]);
  const creator =
    typeof (post as any)?.creator === "string"
      ? { $id: (post as any).creator }
      : ((post as any)?.creator || {});
  const creatorId = pickId(creator);

  // media
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [cleanUrls, setCleanUrls] = useState<string[]>([]);

  useEffect(() => {
    const srcs: string[] = Array.isArray((post as any)?.imageUrl)
      ? (post as any).imageUrl
      : [];
    const types: string[] = [];
    const urls: string[] = [];

    srcs.forEach((url) => {
      const typeStartIndex = url.indexOf("?type=");
      let baseType: string | null = null;
      if (typeStartIndex !== -1) {
        const typeEndIndex = url.indexOf("&", typeStartIndex);
        const typeStr =
          typeEndIndex !== -1
            ? url.substring(typeStartIndex + 6, typeEndIndex)
            : url.substring(typeStartIndex + 6);
        baseType = (typeStr.split("/")[0] || "").toLowerCase();
      }
      const detected = baseType || inferTypeFromUrl(url);
      types.push(detected);
      urls.push(url.replace(/\?type=[^&]*(&|$)/, "").replace(/\?$/, ""));
    });

    setFileTypes(types);
    setCleanUrls(urls);
  }, [(post as any)?.imageUrl]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(entry.target.getAttribute("data-index") || "0", 10);
          if (entry.isIntersecting) {
            videoRefs.current[idx]?.play().catch(() => {});
          } else {
            videoRefs.current[idx]?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    cleanUrls.forEach((_, index) => {
      const el = videoRefs.current[index];
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [cleanUrls]);

  // likes/saves state (optimistic)
  const likesArr: string[] = normalizeArray((post as any)?.likes);
  const [liked, setLiked] = useState<boolean>(
    !!(user?.id && likesArr.includes(user.id))
  );
  const [likesCount, setLikesCount] = useState<number>(likesArr.length);

  const savesRaw: any[] = normalizeArray((post as any)?.saves);
  const isSavedInitially =
    !!user?.id &&
    savesRaw.some((s) => (typeof s === "string" ? s === user.id : s?.userId === user.id));
  const [saved, setSaved] = useState<boolean>(isSavedInitially);

  useEffect(() => {
    setLiked(!!(user?.id && likesArr.includes(user.id)));
    setLikesCount(likesArr.length);
  }, [user?.id, (post as any)?.likes]);

  useEffect(() => {
    const nowSaved =
      !!user?.id &&
      savesRaw.some((s) => (typeof s === "string" ? s === user.id : s?.userId === user.id));
    setSaved(nowSaved);
  }, [user?.id, (post as any)?.saves]);

  // mutations
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();
  const deleteSavedPostMutation = useDeleteSavedPost();
  const notify = useCreateNotification();

  // handlers
  const gotoPost = () => {
    if (postId) navigate(`/posts/${postId}`);
  };

  const gotoCreator = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (creatorId) navigate(`/profile/${creatorId}`);
  };

  const onEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (postId) navigate(`/update-post/${postId}`);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !postId) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    const nextLikes = nextLiked
      ? Array.from(new Set([...likesArr, user.id]))
      : likesArr.filter((u) => u !== user.id);

    likePostMutation.mutate(
      {
        postId,
        likes: nextLikes,
        userId: user.id,
        postOwnerId: creatorId,
        relatedId: postId,
        referenceId: postId,
      },
      {
        onSuccess: () => {
          if (nextLiked && creatorId && String(creatorId) !== String(user.id)) {
            console.log("📨 Creating notification for like:", {
              creatorId,
              userId: user.id,
            });
            notify.mutate({
              userId: creatorId,
              senderId: user.id,
              type: "postLike",
              content: `${user.name || "Someone"} liked your post.`,
              relatedId: postId,
              referenceId: postId,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user.name,
              senderImageUrl: user.imageUrl,
            });
            console.log("🔔 notify.mutate triggered → sending to backend");

          }
          console.log("🔔 notify.mutate triggered → sending to backend");

        },
        onError: () => {
          setLiked(!nextLiked);
          setLikesCount((c) => (nextLiked ? Math.max(0, c - 1) : c + 1));
        },
      }
    );
  };

  const getMySaveId = (): string | null => {
    const mine = savesRaw.find((s) =>
      typeof s === "string" ? s === user?.id : s?.userId === user?.id
    );
    if (!mine) return null;
    return mine?._id || mine?.$id || mine?.id || null;
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !postId) return;

    if (saved) {
      const saveId = getMySaveId();
      if (!saveId) {
        setSaved(false);
        return;
      }
      setSaved(false);
      deleteSavedPostMutation.mutate(saveId, {
        onError: () => setSaved(true),
      });
      return;
    }

    setSaved(true);
    savePostMutation.mutate(
      { userId: user.id, postId },
      {
        onSuccess: () => {
          if (creatorId && String(creatorId) !== String(user.id)) {
            notify.mutate({
              userId: creatorId,
              senderId: user.id,
              type: "postSave",
              content: `${user.name || "Someone"} saved your post.`,
              relatedId: postId,
              referenceId: postId,
              isRead: false,
              createdAt: new Date().toISOString(),
              senderName: user.name,
              senderImageUrl: user.imageUrl,
            });
          }
        },
        onError: () => setSaved(false),
      }
    );
  };

  const creatorImage =
    creator?.imageUrl || "/assets/icons/profile-placeholder.svg";

  return (
    <div className="post-card sm:max-w-screen-sm cursor-pointer" onClick={gotoPost}>
      {/* Header */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <img
            src={creatorImage}
            alt="creator"
            className="w-12 lg:h-12 rounded-full"
            onClick={gotoCreator}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/icons/profile-placeholder.svg";
            }}
          />
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-black">
              {creator?.name || "Unknown User"}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString((post as any)?.$createdAt || (post as any)?.createdAt)}
              </p>
              {(post as any)?.location && (
                <>
                  • <p className="subtle-semibold lg:small-regular">{(post as any).location}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {user?.id === creatorId && (
          <img
            src="/assets/icons/edit.svg"
            alt="edit"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={onEdit}
          />
        )}
      </div>

      {/* Caption + tags */}
      <div className="small-medium lg:base-medium py-5">
        <p>{(post as any)?.caption}</p>
        {Array.isArray((post as any)?.tags) && (post as any).tags.length > 0 && (
          <ul className="flex gap-1 mt-2 flex-wrap">
            {(post as any).tags.map((tag: string, i: number) => (
              <li key={`${tag}-${i}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Media */}
      {cleanUrls.length > 0 && (
        <Swiper modules={[A11y, Pagination]} spaceBetween={16} slidesPerView={1} pagination>
          {cleanUrls.map((url, index) => (
            <SwiperSlide key={`${url}-${index}`}>
              {fileTypes[index] === "video" ? (
                <video
                  className="post-card_img"
                  loop
                  preload="auto"
                  ref={(el) => (videoRefs.current[index] = el!)}
                  data-index={index}
                  controls
                >
                  <source src={url} />
                </video>
              ) : fileTypes[index] === "image" ? (
                <img
                  className="post-card_img"
                  src={url}
                  alt="File preview"
                  style={{ 
                            objectFit: "cover",
                            width: "70%",
                            height: "auto",     // ✅ important
                            maxHeight: "80vh"   // ✅ prevents stretching on desktop
                          }}

                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = "true";
                      target.src = "/assets/icons/profile-placeholder.svg";
                    }
                  }}
                />
              ) : (
                <p className="text-sm text-gray-500">Unknown file type</p>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 px-1 select-none">
        <button
          aria-label={liked ? "Unlike" : "Like"}
          onClick={handleToggleLike}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={`/assets/icons/${liked ? "liked" : "unlike"}.svg`}
            alt={liked ? "Unlike" : "Like"}
            className="w-6 h-6"
          />
          <span className="text-sm">{likesCount}</span>
        </button>

        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={handleToggleSave}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={`/assets/icons/${saved ? "saved" : "save"}.svg`}
            alt={saved ? "Unsave" : "Save"}
            className="w-6 h-6"
          />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
