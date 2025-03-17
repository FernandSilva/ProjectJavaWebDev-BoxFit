// src/components/SignupForm.tsx
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
// Alias useCreateUserAccount as useSignUpAccount for clarity.
import { useCreateUserAccount as useSignUpAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
// Import the error notification component (renamed as SessionExpiredNotification)
import CollapsibleErrorNotification from "@/components/shared/SessionExpiredNotification";

const SignupForm = () => {
  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();
  const [errorMessage, setErrorMessage] = useState("");

  const { mutateAsync: signUpAccount, isLoading } = useSignUpAccount();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (userData: z.infer<typeof SignupValidation>) => {
    try {
      if (!userData.email || !userData.password || !userData.username || !userData.name) {
        throw new Error("All fields are required");
      }

      // Optionally, clear any stale session if needed:
      // await account.deleteSession("current");

      const session = await signUpAccount({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        name: userData.name,
      });

      if (!session) {
        throw new Error("Signup failed. Please try again.");
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        throw new Error("Signup failed. Please try again.");
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.message ||
        error?.message ||
        "An unknown error occurred.";
      setErrorMessage(errMsg);
      toast.error(errMsg, {
        position: "bottom-center",
      });
      console.error("Signup error:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-4200 flex-center flex-col">
        <img src="/assets/images/logo.jpeg" alt="logo" className="logo" />
        <h2 className="h3-bold md:h2 pt-5 sm:pt-2">
          Create your GrowBuddy account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Join the community and start growing together!
        </p>
        {/* Show the collapsible error notification only if there is an error */}
        {errorMessage && (
          <CollapsibleErrorNotification
            title="System Login Error"
            message={errorMessage}
          />
        )}
        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-2 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Full Name</FormLabel>
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
            name="username"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="form-item">
                <FormLabel className="shad-form_label">Username</FormLabel>
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
              "Sign Up"
            )}
          </Button>

          <p className="text-small-regular text-light-3 text-center mt-2">
            Already have an account?
            <Link
              to="/sign-in"
              className="text-black hover:text-green-500 text-small-semibold ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
        <ToastContainer />
      </div>
    </Form>
  );
};

export default SignupForm;
