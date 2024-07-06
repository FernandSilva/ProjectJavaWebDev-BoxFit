import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useFollowStatus } from "@/lib/react-query/queries";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: iAm } = useUserContext();
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: followStatusData } = useFollowStatus(iAm?.id, user.$id);
  useEffect(() => {
    setIsFollowing(!!followStatusData);
  }, [followStatusData]);
  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <div className="flex items-center gap-2">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-8 h-8"
        />
        <p className="base-medium text-black text-center line-clamp-1">
          {user.name}
        </p>
      </div>
      <div className="flex-center flex-col gap-1">
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      {user.$id !== iAm.id ? (
        <Button type="button" size="sm" className="shad-button_primary px-5">
          {isFollowing ? "UnFollow" : "Follow"}
        </Button>
      ) : (
        <Button type="button" size="sm" className="shad-button_primary px-5">
          View
        </Button>
      )}
    </Link>
  );
};

export default UserCard;
