import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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

import { useUserContext } from "@/context/AuthContext";
import { useSignInAccount } from "@/lib/react-query/queries";
import { SigninValidation } from "@/lib/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { account } from "@/lib/appwrite/config"; // Ensure account is exported

const SigninForm = () => {
  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (userData: z.infer<typeof SigninValidation>) => {
    try {
      if (!userData.email || !userData.password) {
        throw new Error("Email and password are required");
      }

      // Clear any stale session first
      try {
        await account.deleteSession("current");
      } catch (e) {
        console.warn("No existing session to delete");
      }

      // Create a new session
      const session = await signInAccount({
        email: userData.email,
        password: userData.password,
      });

      if (!session) {
        throw new Error("Login failed. Please try again.");
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.message || error?.message || "An unknown error occurred.";
      toast.error(errorMessage, {
        position: "bottom-center",
      });
      console.error("Sign-in error:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-4200 flex-center flex-col">
        <img src="/assets/images/logo.jpeg" alt="logo" className="logo" />

        <h2 className="h3-bold md:h2 pt-5 sm:pt-2">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details.
        </p>
        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-2 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className={`shad-input ${error ? "error" : ""}`}
                    {...field}
                  />
                </FormControl>
                {error && (
                  <FormMessage className="text-red text-[12px]">
                    {error.message}
                  </FormMessage>
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
                  <Input
                    type="password"
                    className={`shad-input ${error ? "error" : ""}`}
                    {...field}
                  />
                </FormControl>
                {error && (
                  <FormMessage className="text-red text-[12px]">
                    {error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary">
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-small-regular text-light-3 text-center mt-2">
            Don&apos;t have an account?
            <Link
              to="/sign-up"
              className="text-black hover:text-green-500 text-small-semibold ml-1"
            >
              Sign up
            </Link>
          </p>
        </form>
        <ToastContainer />
      </div>
    </Form>
  );
};

export default SigninForm;
