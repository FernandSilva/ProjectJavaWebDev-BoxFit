import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetNotifications, useMarkNotificationAsRead } from "@/lib/react-query/queries";
import { Notification } from "@/types";

const Topbar = () => {
  const { user, isLoading } = useUserContext();
  const navigate = useNavigate();

  const [hasUnread, setHasUnread] = useState(false);

  // ✅ Correct hook name: useGetNotifications()
  const { data: fetchedNotifications, refetch } = useGetNotifications(user?.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  useEffect(() => {
    if (fetchedNotifications?.documents?.length) {
      const unreadExists = fetchedNotifications.documents.some(
        (n: Notification) => !n.isRead
      );
      setHasUnread(unreadExists);
    }
  }, [fetchedNotifications]);

  const handleNotificationsClick = () => {
    if (!user) return;

    // Mark all unread notifications as read
    fetchedNotifications?.documents?.forEach((n: Notification) => {
      if (!n.isRead) {
        markAsRead(n.$id);
      }
    });

    setHasUnread(false);
    navigate("/notifications");
  };

  if (isLoading || !user) return null;

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <img src="/assets/images/Boxfitlogo.png" alt="BoxFit logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-800">BoxFit</span>
          </div>
        </Link>

        <div className="flex gap-4 items-center">
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
