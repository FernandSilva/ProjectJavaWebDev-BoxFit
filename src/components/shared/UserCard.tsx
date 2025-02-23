import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useGetUserTotalLikes } from "@/lib/react-query/queries";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const { data: totalLikes } = useGetUserTotalLikes(user.$id);

  return (
    <Link
      to={`/profile/${user.$id}`}
      className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 w-[320px] sm:w-[260px]"
    >
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
