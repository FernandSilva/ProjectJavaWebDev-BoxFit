// src/_root/pages/AllUsers.tsx
import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useUsers } from "@/lib/react-query/queries";
import { Models } from "appwrite";

const AllUsers = () => {
  const { toast } = useToast();

  const {
    data: creators,
    isLoading,
    isError: isErrorCreators,
  } = useUsers();

  if (isErrorCreators) {
    toast({ title: "Something went wrong while fetching users." });
    return (
      <div className="flex-center w-full h-full">
        <p className="text-red-500">Failed to load users.</p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full border-b border-gray-300 pb-2">
          BoxFit Community
        </h2>

        {isLoading && !creators ? (
          <Loader />
        ) : creators && creators.length > 0 ? (
          <ul className="user-grid">
            {creators.map((creator: Models.Document) => (
              <li key={creator.$id} className="flex-1 min-w-[200px] w-full">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-4 text-center">
            No users found in the community yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
