import { Link } from "react-router-dom";
import { Models } from "appwrite";
import { useGetUserTotalLikes } from "@/lib/react-query/queries";
import { PiFireFill } from "react-icons/pi";

const UserCard = ({ user }: { user: Models.Document }) => {
  const { data: totalLikes } = useGetUserTotalLikes(user.$id);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
      <Link to={`/profile/${user.$id}`} className="flex flex-col">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={user.name}
          className="w-full h-[150px] object-cover rounded-t-xl"
        />

        <div className="p-3 flex justify-between items-center">
          <span className="text-sm font-semibold">{user.name}</span>
          <div className="flex items-center gap-1 text-sm">
            <PiFireFill className="text-red-500" />
            <span>{totalLikes || 0}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default UserCard;


