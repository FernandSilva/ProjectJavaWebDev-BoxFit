import { Loader, UserCard } from "@/components/shared";
import {
  useGetCurrentUser,
  useGetUserRelationshipsList,
} from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const Following = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { id } = useParams();
  const { data: userRelationships } = useGetUserRelationshipsList(id);
  console.log({ userRelationships });
  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {currentUser.liked.length === 0 && (
        <p className="text-black">No liked posts</p>
      )}

      <div>
        {userRelationships.map((val) => (
          <UserCard user={val} />
        ))}
      </div>
    </>
  );
};

export default Following;
