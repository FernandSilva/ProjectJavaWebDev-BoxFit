import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Textarea,
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreatePost, useUpdatePost, useCreateNotification } from "@/lib/react-query/queries";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  const { mutateAsync: createPost, isLoading: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost();
  const { mutateAsync: createNotification } = useCreateNotification();

  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    try {
      if (!user || !user.$id) {
        toast({ title: "User not authenticated." });
        return;
      }

      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          toast({ title: `${action} post failed. Please try again.` });
          return;
        }

        toast({ title: "Post updated successfully!" });
        navigate(`/posts/${post.$id}`);
      } else {
        const newPost = await createPost({
          ...value,
          userId: user.$id, // ✅ Fix: Use $id instead of id
        });

        if (!newPost) {
          toast({ title: `${action} post failed. Please try again.` });
          return;
        }

        // ✅ Send notifications to followers
        if (user.followers?.length) {
          for (const followerId of user.followers) {
            createNotification({
              userId: followerId,
              senderId: user.$id,
              type: "postLike",
              relatedId: newPost.$id,
              isRead: false,
              createdAt: new Date().toISOString(),
              referenceId: newPost.$id,
              content: `${user.name} created a new post.`,
              senderName: user.name,
              senderImageUrl: user.imageUrl,
            });
          }
        }

        toast({ title: "Post created successfully!" });
        navigate("/");
      }
    } catch (error) {
      console.error("Error handling post form submission:", error);
      toast({ title: `${action} post failed. Please try again.` });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 md:gap-9 w-full max-w-5xl">
        <div className="flex flex-col lg:flex-row items-start gap-4 md:gap-8 justify-between">
          <div className="w-[100%] lg:w-[50%]">
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Caption</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write Caption Here"
                      className="shad-textarea custom-scrollbar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Add File</FormLabel>
                  <FormControl>
                    <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 items-center justify-center md:justify-end">
          <Button type="button" className="shad-button_dark_4" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />} {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
