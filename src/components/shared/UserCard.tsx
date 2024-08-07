import { Models } from "appwrite";
import { Link } from "react-router-dom";

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

  const surname = user.name.split(" ").slice(-1).join(" "); // Assumes the surname is the last part of the full name

  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="user-card_image"
      />
      <div className="user-card_overlay">
        <p className="small-regular text-white text-center line-clamp-1">
          @{user.username}
        </p>
      </div>
    </Link>
  );
};

export default UserCard;

