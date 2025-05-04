import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetNotifications, useMarkNotificationAsRead } from "@/lib/react-query/queries";
import { Notification } from "@/types";

const Topbar = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [hasUnread, setHasUnread] = useState(false);
  const { data: fetchedNotifications, refetch } = useGetNotifications(user?.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  useEffect(() => {
    if (fetchedNotifications?.documents?.length) {
      const unreadExists = fetchedNotifications.documents.some((n) => !n.isRead);
      setHasUnread(unreadExists);
    }
  }, [fetchedNotifications]);

  const handleNotificationsClick = () => {
    // Mark all unread as read
    fetchedNotifications?.documents?.forEach((n) => {
      if (!n.isRead) markAsRead(n.$id);
    });

    setHasUnread(false);
    navigate("/notifications");
  };

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo5.jpg" alt="logo" width={160} height={40} />
        </Link>

        <div className="flex gap-4 items-center">
          <Link to="/explore" className="link flex-center gap-3">
            <img src="/assets/icons/wallpaper.svg" alt="Explore" className="icon1" />
          </Link>

          <div className="relative">
            <img
              onClick={handleNotificationsClick}
              src={`/assets/icons/${hasUnread ? "notify.svg" : "notify1.svg"}`}
              alt="Notifications"
              className="h-6 w-6 cursor-pointer"
            />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs rounded-full px-1">
                •
              </span>
            )}
          </div>

          <Link to={`/profile/${user.id}`} className="flex-center gap-1">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
