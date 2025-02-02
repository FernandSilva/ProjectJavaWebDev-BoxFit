import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as z from "zod";

import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";

const SignupForm = () => {
  const { isLoading: isUserLoading } = useUserContext();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } =
    useCreateUserAccount();

  const handleSignup = async (userData: z.infer<typeof SignupValidation>) => {
    try {
      if (!userData.email || !userData.password) {
        throw new Error("Email and password are required");
      }

      // Create user account without automatically signing in.
      const newUser = await createUserAccount({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
      });
      console.log("New user created:", newUser);

      // Show a toast notification that stays on the screen
      toast.success(
        "Account created successfully! Please check your email for the login link.",
        { position: "top-center", autoClose: false }
      );
      form.reset();
      // User remains on the signup page.
    } catch (error: any) {
      const errorMessage =
        error?.response?.message || error?.message || "An unknown error occurred.";
      toast.error(errorMessage, { position: "top-center" });
      console.error("Signup error:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="flex-center flex-col">
        <img src="/assets/images/logo.jpeg" alt="logo" className="logo" />
        <h2 className="h3-bold md:h2 pt-2 sm:pt-1">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular">
          To use GrowBuddy, please enter your details
        </p>
        <form onSubmit={form.handleSubmit(handleSignup)} className="flex flex-col w-full mt-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="text-red text-[12px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className={`shad-input ${error ? "error" : ""}`} {...field} />
                </FormControl>
                {error && (
                  <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="text" className={`shad-input ${error ? "error" : ""}`} {...field} />
                </FormControl>
                {error && (
                  <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className={`shad-input ${error ? "error" : ""}`} {...field} />
                </FormControl>
                {error && (
                  <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="shad-button_primary"
            disabled={isCreatingAccount || isUserLoading}
          >
            {isCreatingAccount || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-small-regular text-light-3 text-center mt-2">
            Already have an account?
            <Link to="/sign-in" className="text-black hover:text-green-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </Form>
  );
};

export default SignupForm;



