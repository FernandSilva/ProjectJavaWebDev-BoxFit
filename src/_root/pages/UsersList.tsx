import { useEffect, useState } from "react";
import { Input } from "@/components/ui";
import { appwriteConfig, databases } from "@/lib/appwrite/config";
import { User, Message } from "@/types"; // Update with your User and Message types
import { multiFormatDateString } from "@/lib/utils";

function UsersList({
  onSelectUser,
  selectedUser,
  setSteps,
}: {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  setSteps?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [users, setUsers] = useState<User[] | any>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersResult = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId
        );
        const typedUsers: User[] = usersResult.documents.map((doc: any) => ({
          $id: doc.$id,
          name: doc.name,
          username: doc.username,
          email: doc.email,
          id: doc.$id,
          imageUrl: doc.imageUrl,
          bio: doc.bio,
          latestMessage: null, // Initialize with null, will be updated below
        }));
        setUsers(typedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const messagesResult = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId
        );
        const messages: Message[] | any = messagesResult.documents.map(
          (doc: any) => ({
            id: doc.$id,
            userId: doc.senderId,
            recipientId: doc.recipentId,
            timestamp: doc.$createdAt, // Assuming you have a timestamp field
            content: doc.content, // Example of message content field
          })
        );

        // Process messages to find the latest message for each user
        const usersWithLatestMessages = users.map((user) => {
          // Find messages involving this user
          const userMessages = messages.filter(
            (msg) => msg.userId === user.$id || msg.recipientId === user.$id
          );

          // Sort messages by timestamp (most recent first)
          userMessages.sort((a, b) => b.timestamp - a.timestamp);

          // Get the latest message (if any)
          const latestMessage =
            userMessages.length > 0
              ? userMessages[userMessages.length - 1]
              : null;

          return {
            ...user,
            latestMessage: latestMessage
              ? {
                  content: latestMessage.content,
                  timestamp: latestMessage.timestamp,
                }
              : null,
          };
        });

        setUsers(usersWithLatestMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
    fetchMessages();
  }, [users]); // Depend on users to update when users state changes

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-list h-[84vh] sm:h-auto !w-[100%] lg:!w-[30%] ">
      <div className="flex items-center py-4 border-b justify-between">
        <h2 className="font-bold text-2xl">Chats</h2>
        <svg
          aria-label="New message"
          className="x1lliihq x1n2onr6 x5n08af"
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 0 24 24"
          width="24"
        >
          <title>New message</title>
          <path
            d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
          <path
            d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="16.848"
            x2="20.076"
            y1="3.924"
            y2="7.153"
          ></line>
        </svg>
      </div>
      <Input
        placeholder="Search for users"
        className="shad-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredUsers.map((user) => (
        <div
          key={user.$id}
          onClick={() => {
            onSelectUser(user);
            if (setSteps) setSteps(1);
          }}
          className={`user-item ${
            user.$id === selectedUser?.$id ? "!bg-gray-200" : "bg-white"
          } flex items-center gap-4`}
        >
          <img
            src={user.imageUrl}
            className="w-8 h-8 rounded-full"
            alt={`Profile of ${user.username}`}
          />
          <div className="w-full">
            <span className="font-semibold">{user.username}</span>
            {user.latestMessage && (
              <div className="text-gray-500 flex justify-between w-full text-xs pt-1 gap-2">
                <span>{user.latestMessage.content}</span>{" "}
                <span className="text-[10px]">
                  {multiFormatDateString(user.latestMessage.timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersList;
