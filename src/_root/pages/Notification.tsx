import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  return <img src={fallback} alt="Sender" className="h-10 w-10 rounded-full" />;
};

const NotificationPage: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maxVisibleNotifications, setMaxVisibleNotifications] = useState(5);

  const { data: fetchedNotifications, refetch } = useGetNotifications(user?.id);
  const { mutate: deleteNotification } = useDeleteNotification();

  useEffect(() => {
    if (fetchedNotifications?.documents) {
      setNotifications(fetchedNotifications.documents);
    }
  }, [fetchedNotifications]);

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id, { onSuccess: () => refetch() });
  };

  const clearNotifications = () => {
    notifications.forEach((n) => deleteNotification(n.$id));
    setNotifications([]);
  };

  const toggleViewAll = () => {
    setMaxVisibleNotifications((prev) =>
      prev === 5 ? notifications.length : 5
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    const { relatedId: postId, referenceId: reference, type, senderId } = notification;
  
    switch (type) {
      case "message":
        return navigate(`/chat?user=${senderId}`);
  
      case "postLike":
      case "like":  // 🔁 Support legacy post like
        if (postId) return navigate(`/posts/${postId}`);
        break;
  
      case "comment-like":
      case "comment":
        if (postId) {
          const commentId = reference?.startsWith("comment_") ? reference.replace("comment_", "") : reference;
          return navigate(`/posts/${postId}#comment-${commentId}`);
        }
        break;
  
      case "follow":
      case "unfollow":
        if (senderId) return navigate(`/profile/${senderId}`);
        break;
  
      default:
        console.warn("Unhandled notification type:", type, notification);
    }
  };
  
  

  const generateMessage = (n: Notification) => {
    const name = n.senderName || "Unknown";
  
    switch (n.type) {
      case "message":
        return n.content;
  
      case "comment":
        return `${name} commented on your post: ${n.content}`;
  
      case "comment-like":
        return `${name} liked your comment.`;
  
      case "postLike":
        return `${name} liked your post.`;
  
      case "follow":
        return `${name} started following you.`;
  
      case "unfollow":
        return `${name} unfollowed you.`;
  
      default:
        return n.content;
    }
  };
  

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col p-4 md:p-8">
      <h2 className="h3-bold md:h2-bold border-b pb-3 mb-4">Notifications</h2>

      <div className="flex-1 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No notifications</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.slice(0, maxVisibleNotifications).map((n) => (
              <li
                key={n.$id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                  n.isRead ? "bg-gray-50" : "bg-green-50"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <SenderProfilePicture
                    senderId={n.senderId}
                    senderImageUrl={n.senderImageUrl}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {generateMessage(n)}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(e, n.$id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm">
            <button
              onClick={toggleViewAll}
              className="text-blue-500 hover:text-blue-700"
            >
              {maxVisibleNotifications === 5 ? "View All" : "Show Less"}
            </button>
            <button
              onClick={clearNotifications}
              className="text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
