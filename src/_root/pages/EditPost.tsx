import { useParams } from "react-router-dom";
import { Loader } from "@/components/shared";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex-center w-full h-full">
        <p>Invalid Post ID</p>
      </div>
    );
  }

  const { data: post, isLoading } = useGetPostById(id);

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <h2 className="h3-bold md:h2-bold text-left border-b border-gray-300 pb-2 w-full">Edit Post</h2>
        </div>
        {isLoading ? <Loader /> : <PostForm action="Update" post={post} />}
      </div>
    </div>
  );
};

export default EditPost;
