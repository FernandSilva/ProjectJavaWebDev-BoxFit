import { Input } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import {
  useUsersAndMessages,
  useGetNotifications,
  useMarkNotificationAsRead,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { User } from "@/types";
import { useState, useEffect, useMemo } from "react";

function UsersList({
  onSelectUser,
  selectedUser,
  setSteps,
}: {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  setSteps?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useUserContext();

  const { data: fetchedData, isLoading } = useUsersAndMessages(user?.id, searchQuery);
  const { data: notifications, refetch: refetchNotifications } = useGetNotifications(user?.id);
  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();

  const unreadUserIds = useMemo(() => {
    return new Set(
      notifications?.documents
        .filter((n) => n.type === "message" && !n.isRead)
        .map((n) => n.senderId)
    );
  }, [notifications]);

  const allUsers: User[] = fetchedData || [];
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const filteredUsers = allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredUsers);
    }
  }, [searchQuery, allUsers]);

  const chatUsers = useMemo(() => {
    return allUsers.filter((user) => user.latestMessage !== null);
  }, [allUsers]);

  function handleSelectUser(user: User) {
    onSelectUser(user);
    if (setSteps) setSteps(1);

    const notification = notifications?.documents.find(
      (n) => n.senderId === user.$id && !n.isRead && n.type === "message"
    );

    if (notification) {
      markNotificationAsRead(notification.$id, {
        onSuccess: () => refetchNotifications(),
      });
    }
  }

  function renderUserItem(user: User) {
    const hasUnreadMessage = unreadUserIds.has(user.$id);
  
    return (
      <div
        key={user.$id}
        onClick={() => handleSelectUser(user)}
        className={`user-item ${
          user.$id === selectedUser?.$id ? "!bg-gray-200" : "bg-white"
        } flex items-center gap-4 p-2 border-b`}
      >
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="w-8 h-8 rounded-full"
          alt={`Profile of ${user.username}`}
        />
        <div className="w-full">
          <span className={`font-semibold ${hasUnreadMessage ? "text-black" : "text-gray-800"}`}>
            {user.username}
          </span>
  
          <div
            className={`flex justify-between w-full text-xs pt-1 gap-2 ${
              hasUnreadMessage ? "font-bold" : "font-normal"
            }`}
          >
            <span className="text-ellipsis max-w-[120px] overflow-hidden whitespace-nowrap">
              {user.latestMessage?.content || (hasUnreadMessage ? "New message..." : "")}
            </span>
            <span className="text-[10px]">
              {user.latestMessage?.timestamp
                ? multiFormatDateString(user.latestMessage.timestamp)
                : ""}
            </span>
          </div>
        </div>
        <img
          src={`/assets/icons/${hasUnreadMessage ? "notify.svg" : "notify1.svg"}`}
          alt="Message Notification"
          className="w-5 h-5"
        />
      </div>
    );
  }
  

  return (
    <div className="users-list h-[84vh] sm:h-auto !w-[100%] lg:!w-[30%]">
      <div className="flex items-center py-4 border-b justify-between">
        <h2 className="font-bold text-2xl">Chats</h2>
      </div>

      <div className="search-section py-4 border-b">
        <Input
          placeholder="Search for users"
          className="shad-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="p-4 text-gray-500">Loading users...</div>
      ) : searchQuery && searchResults.length === 0 ? (
        <div className="p-4 text-gray-500">No users found for "{searchQuery}".</div>
      ) : (
        <div>{(searchQuery ? searchResults : chatUsers).map(renderUserItem)}</div>
      )}
    </div>
  );
}

export default UsersList;
