import { Input } from "@/components/ui";
import { appwriteConfig, databases } from "@/lib/appwrite/config";
import { User } from "@/types"; // Ensure this import points to your User type definition
import { useEffect, useState } from "react";

function UsersList({
  onSelectUser,
  selectedUser,
}: {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
}) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId
        );
        const typedUsers: User[] = result.documents.map((doc: any) => ({
          $id: doc.$id, // Make sure this matches the property expected by your User type
          name: doc.name,
          username: doc.username,
          email: doc.email,
          id:doc.$id,
          imageUrl: doc.imageUrl,
          bio: doc.bio,
        }));
        setUsers(typedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="users-list">
      <div className="flex items-center py-4 border-b  justify-between">
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
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          ></path>
          <path
            d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          ></path>
          <line
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            x1="16.848"
            x2="20.076"
            y1="3.924"
            y2="7.153"
          ></line>
        </svg>
      </div>
      <Input placeholder="Search for users" className="shad-input" />
      {users.map((user) => (
        <div
          key={user.$id}
          onClick={() => onSelectUser(user)}
          className={`user-item ${user.$id === selectedUser?.$id ? "!bg-gray-200" : "bg-white"} flex items-center gap-4`}
        >
          <img src={user.imageUrl} className="w-8 h-8 rounded-full" alt="" />
          <div>
            {" "}
            <span className="font-semibold"> {user.username} </span>
            <div className="text-gray-500 flex  justify-between w-full text-xs pt-1">
              <span>You sent a message </span> - <span>1h</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersList;
