import { Input } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import { useUsersAndMessages } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { User } from "@/types";
import { useState } from "react";

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
  const {
    data: users = [],
    isLoading,
    isError,
  } = useUsersAndMessages(user?.id);

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isError) return <div>Error loading users</div>;

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
      {isLoading
        ? [1, 2, 3, 4, 5].map((val) => (
            <div role="status" className="max-w-sm p-2 rounded animate-pulse">
              <div className="flex items-center mt-4">
                <svg
                  className="w-10 h-10 me-3 text-gray-200 dark:text-gray-700"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          ))
        : filteredUsers
        .filter((user) => user.latestMessage) // Filter users who have a latestMessage
        .map((user) => (
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
                  <span className="text-ellipsis max-w-[120px] overflow-hidden whitespace-nowrap">
                    {user.latestMessage.content}
                  </span>{" "}
                  <span className="text-[10px]">
                    {multiFormatDateString(user.latestMessage.timestamp)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default UsersList;
