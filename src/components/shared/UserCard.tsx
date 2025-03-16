import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useGetUserTotalLikes } from "@/lib/react-query/queries";
import { FaStar } from "react-icons/fa";

type UserCardProps = {
  user: Models.Document;
  rank?: number;
};

const UserCard = ({ user, rank }: UserCardProps) => {
  const { data: totalLikes } = useGetUserTotalLikes(user.$id);

  return (
    <Link
      to={`/profile/${user.$id}`}
      className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 w-[320px] sm:w-[260px]"
    >
      {rank !== undefined && (
        <div className="absolute top-0 left-0 z-10 w-6 h-6">
          <FaStar className="w-full h-full text-yellow-500" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {rank}
          </div>
        </div>
      )}
      <div className="relative w-full h-[200px]">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={user.name}
          className="object-cover w-full h-full rounded-t-xl"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white flex items-center justify-between p-3 rounded-b-xl">
          <span className="text-sm font-semibold truncate">{user.name}</span>
          <div className="flex items-center gap-1">
            <img
              src="/assets/icons/liked.svg"
              alt="Liked"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">{totalLikes || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
