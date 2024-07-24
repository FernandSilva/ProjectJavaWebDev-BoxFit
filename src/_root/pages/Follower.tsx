import { Loader, UserCard } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import {
    useGetUserById,
    useGetUserRelationshipsFollowersList
} from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const Follower = () => {
  const { id } = useParams();
  const { data: currentUser } = useGetUserById(id || "");

  const {user} = useUserContext();
  const isOwnProfile = user?.id === currentUser?.$id;

  
  const { data: userRelationships } = useGetUserRelationshipsFollowersList(id);
  if (!userRelationships)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
    <div className="pt-[20px] w-[100%]"
    style={{borderTop:!isOwnProfile ? "1px solid rgb(0,0,0,0.1)":""}}>

    
      <ul  className="grid 2xl:grid-cols-4 gap-4">
        {userRelationships.map((val) => (
          <li key={val.$id}>
            <UserCard user={val} />
          </li>
        ))}
      </ul>
      </div>
    </>
  );
};

export default Follower;
