import React, { useEffect, useState } from 'react';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { User } from '@/types'; // Ensure this import points to your User type definition

function UsersList({ onSelectUser }: { onSelectUser: (user: User) => void }) {
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
          imageUrl: doc.imageUrl,
          bio: doc.bio
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
      {users.map(user => (
        <div key={user.$id} onClick={() => onSelectUser(user)} className="user-item">
          {user.username}
        </div>
      ))}
    </div>
  );
}

export default UsersList;




