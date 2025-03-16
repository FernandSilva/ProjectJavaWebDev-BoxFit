import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetNotifications, useDeleteNotification, useGetUserById } from "@/lib/react-query/queries";
import { Notification } from "@/types";

interface SenderProfilePictureProps {
  senderId: string;
  senderImageUrl: string;
}

const SenderProfilePicture: React.FC<SenderProfilePictureProps> = ({ senderId, senderImageUrl }) => {
  const { data: sender } = useGetUserById(senderId);
  // Use senderImageUrl if provided; otherwise use the fetched sender image or a placeholder.
  const ImageUrl =
    senderImageUrl && senderImageUrl.trim() !== ""
      ? senderImageUrl
      : (sender && sender.imageUrl) || "/assets/icons/profile-placeholder.svg";
  return <img src={ImageUrl} alt="Sender Profile" className="h-10 w-10 rounded-full" />;
};

const NotificationPage: React.FC = () => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maxVisibleNotifications, setMaxVisibleNotifications] = useState(5);

  const { data: fetchedNotifications, refetch: refetchNotifications } = useGetNotifications(user?.id);
  const { mutate: deleteNotification } = useDeleteNotification();

  useEffect(() => {
    if (fetchedNotifications?.documents) {
      setNotifications(fetchedNotifications.documents);
    }
  }, [fetchedNotifications]);

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId, {
      onSuccess: () => refetchNotifications(),
      onError: (error) => console.error("Failed to delete notification:", error),
    });
  };

  const clearNotifications = () => {
    notifications.forEach((notification) => {
      deleteNotification(notification.$id);
    });
    setNotifications([]);
  };

  const toggleViewAll = () => {
    setMaxVisibleNotifications((prev) => (prev === 5 ? notifications.length : 5));
  };

  const generateNotificationMessage = (notification: Notification) => {
    const senderName = notification.senderName || "Unknown Sender";
    switch (notification.type) {
      case "message":
        return notification.content;
      case "like":
      case "follow":
      case "comment":
        return `${senderName} ${notification.content}`;
      default:
        return notification.content;
    }
  };

  return (
    <div className="w-full flex flex-col p-4 md:p-8">
      <h2 className="h3-bold md:h2-bold border-b pb-3 mb-4">Notifications</h2>

      <div className="flex justify-between items-center mb-4 text-sm">
        <button onClick={toggleViewAll} className="text-blue-500 hover:text-blue-700">
          {maxVisibleNotifications === 5 ? "View All" : "Show Less"}
        </button>
        <button onClick={clearNotifications} className="text-red-500 hover:text-red-700">
          Clear All
        </button>
        <button onClick={() => refetchNotifications()} className="text-green-500 hover:text-green-700">
          Refresh
        </button>
      </div>

      <div className="w-full">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">No notifications</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.slice(0, maxVisibleNotifications).map((notification) => (
              <li
                key={notification.$id}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  notification.isRead ? "bg-gray-50" : "bg-green-50"
                }`}
              >
                <Link to={`/profile/${notification.senderId}`} className="flex gap-3 items-center">
                  <SenderProfilePicture
                    senderId={notification.senderId}
                    senderImageUrl={notification.senderImageUrl}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {generateNotificationMessage(notification)}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => handleDeleteNotification(notification.$id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
