import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetNotifications, useDeleteNotification } from "@/lib/react-query/queries";
import { Notification } from "@/types";

const Topbar = () => {
  const { user } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [maxVisibleNotifications, setMaxVisibleNotifications] = useState(5);
  const [hasUnread, setHasUnread] = useState(false);

  const { data: fetchedNotifications, refetch: refetchNotifications } = useGetNotifications(user?.id);
  const { mutate: deleteNotification } = useDeleteNotification();

  useEffect(() => {
    if (fetchedNotifications) {
      const { documents = [] } = fetchedNotifications;
      setNotifications(documents);
      const unread = documents.filter((notification) => !notification.isRead).length;
      setUnreadCount(unread);
      setHasUnread(unread > 0);
    }
  }, [fetchedNotifications]);

  const handleNotificationClick = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown && unreadCount > 0) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".notification-container")) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showDropdown]);

  const generateNotificationMessage = (notification: Notification) => {
    const senderName = notification.senderName || "Unknown Sender";
    switch (notification.type) {
      case "message":
        return `${notification.content}`;
      case "like":
      case "follow":
      case "comment":
        return `${senderName} ${notification.content}`;
      default:
        return notification.content;
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId, {
      onSuccess: () => {
        refetchNotifications();
        setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
      },
      onError: (error) => console.error("Failed to delete notification:", error),
    });
  };

  const clearNotifications = () => {
    notifications.forEach((notification) => {
      deleteNotification(notification.$id);
    });
    setNotifications([]);
    setUnreadCount(0);
    setHasUnread(false);
  };

  const toggleViewAll = () => {
    setMaxVisibleNotifications(maxVisibleNotifications === 5 ? notifications.length : 5);
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

          <div className="relative notification-container">
            <div onClick={handleNotificationClick} className="relative flex items-center outline-none">
              <img
                src={`/assets/icons/${hasUnread ? "notify.svg" : "notify1.svg"}`}
                alt="Notifications"
                className="h-6 w-6"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <ul className="flex flex-col gap-2 p-4">
                  {notifications.slice(0, maxVisibleNotifications).map((notification) => (
                    <li
                      key={notification.$id}
                      className={`p-3 text-sm rounded-md flex items-center gap-3 ${
                        notification.isRead ? "bg-gray-100" : "bg-green-50 text-black"
                      }`}
                    >
                      <Link to={`/profile/${notification.senderId}`}>
                        <img
                          src={notification.senderimageUrl || "/assets/icons/profile-placeholder.svg"}
                          alt={notification.senderName}
                          className="h-10 w-10 rounded-full"
                        />
                      </Link>
                      <div>
                        <p className="font-medium">{generateNotificationMessage(notification)}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification.$id)}
                        className="text-red-500 text-xs ml-auto"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                  {notifications.length === 0 && <li className="text-center text-gray-500">No notifications</li>}
                </ul>
                <div className="flex justify-between p-2 text-xs bg-gray-50">
                  <button onClick={toggleViewAll} className="text-blue-500">
                    {maxVisibleNotifications === 5 ? "View All" : "Show Less"}
                  </button>
                  <button onClick={clearNotifications} className="text-red-500">Clear All</button>
                  <button onClick={refetchNotifications} className="text-green-500">Refresh</button>
                </div>
              </div>
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
