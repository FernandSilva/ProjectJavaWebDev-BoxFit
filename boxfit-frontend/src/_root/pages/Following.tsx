// src/_root/pages/Following.tsx
import { Loader, UserCard } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { useUser, useUserRelationships } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const Following = () => {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser, isLoading: isUserLoading } = useUser(id || "");

  const { user } = useUserContext();
  const isOwnProfile = user?.id === currentUser?.$id;

  const { data: userRelationships, isLoading: isRelLoading } = useUserRelationships(id);

  if (isUserLoading || isRelLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!userRelationships || userRelationships.length === 0) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-gray-500">No following users found.</p>
      </div>
    );
  }

  return (
    <div
      className="pt-[20px] w-[100%]"
      style={{ borderTop: !isOwnProfile ? "1px solid rgba(0,0,0,0.1)" : "" }}
    >
      <ul className="grid 2xl:grid-cols-4 gap-4">
        {userRelationships.map((val: any) => (
          <li key={val.$id}>
            <UserCard user={val} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Following;
