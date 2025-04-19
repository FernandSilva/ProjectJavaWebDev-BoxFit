// src/_root/pages/Notification.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetNotifications,
  useDeleteNotification,
  useGetUserById,
} from "@/lib/react-query/queries";
import { Notification } from "@/types";

interface SenderProfilePictureProps {
  senderId: string;
  senderImageUrl?: string;
}

const SenderProfilePicture: React.FC<SenderProfilePictureProps> = ({
  senderId,
  senderImageUrl,
}) => {
  const { data: sender } = useGetUserById(senderId);
  const fallback =
    senderImageUrl?.trim() !== ""
      ? senderImageUrl
      : sender?.imageUrl || "/assets/icons/profile-placeholder.svg";
  return <img src={fallback} alt="Sender Profile" className="h-10 w-10 rounded-full" />;
};

const NotificationPage: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
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
    setMaxVisibleNotifications((prev) =>
      prev === 5 ? notifications.length : 5
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case "comment":
      case "like":
        // Only navigate if relatedId looks like a valid post ID
        if (notification.relatedId?.length === 28) {
          navigate(`/posts/${notification.relatedId}`);
        } else {
          console.warn("Invalid post ID in notification:", notification.relatedId);
        }
        break;
      case "message":
        navigate(`/chat?user=${notification.senderId}`);
        break;
      case "follow":
        navigate(`/profile/${notification.senderId}`);
        break;
      default:
        console.warn("Unhandled notification type:", notification.type);
    }
  };
  

  const generateNotificationMessage = (notification: Notification) => {
    const senderName = notification.senderName || "Unknown Sender";
    switch (notification.type) {
      case "message":
        return notification.content;
      case "like":
        return `${senderName} liked your comment.`;
      case "follow":
        return `${senderName} followed you.`;
      case "comment":
        return `${senderName} commented on your post: ${notification.content}`;
      default:
        return notification.content;
    }
  };

  return (
    <div className="w-full flex flex-col p-4 md:p-8">
      <h2 className="h3-bold md:h2-bold border-b pb-3 mb-4">Notifications</h2>

      <div className="w-full">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">No notifications</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications
              .slice(0, maxVisibleNotifications)
              .map((notification) => (
                <li
                  key={notification.$id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                    notification.isRead ? "bg-gray-50" : "bg-green-50"
                  }`}
                >
                  <div className="flex gap-3 items-center">
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
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.$id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex justify-between items-center mt-8 text-sm">
          <button onClick={toggleViewAll} className="text-blue-500 hover:text-blue-700">
            {maxVisibleNotifications === 5 ? "View All" : "Show Less"}
          </button>
          <button onClick={clearNotifications} className="text-red-500 hover:text-red-700">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
