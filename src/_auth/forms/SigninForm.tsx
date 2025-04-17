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
import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useSignInAccount } from "@/lib/react-query/queries";
import { SigninValidation } from "@/lib/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionExpiredNotification from "@/components/shared/SessionExpiredNotification";

const SigninForm = () => {
  const navigate = useNavigate();
  const { checkAuthUser, sessionExpired } = useUserContext();
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      const errMsg = error?.response?.message || error?.message || "An unknown error occurred.";
      setLoginError(errMsg);
      toast.error(errMsg, {
        position: "bottom-center",
      });
      console.error("Sign-in error:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-10">
        <img src="/assets/images/logo.jpeg" alt="logo" className="logo" />

        <h2 className="h3-bold md:h2 pt-5 sm:pt-2">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details.
        </p>

        {sessionExpired && (
          <SessionExpiredNotification 
            title="Session Expired"
            message="Your session has expired. Please log in again. If the issue persists, clear your site cookies."
          />
        )}

        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative mt-4 w-full">
            <strong>⚠️ Login Error</strong>
            <p className="mt-1">{loginError}</p>
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-4 w-full mt-6"
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
                    className={`shad-input px-4 py-3 ${error ? "error" : ""}`}
                    {...field}
                  />
                </FormControl>
                {error && <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>}
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={`shad-input px-4 py-3 pr-10 ${error ? "error" : ""}`}
                      {...field}
                    />
                    <span
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <img src="/assets/icons/dot.svg" alt="hide" className="w-5 h-5 opacity-60" />
                      ) : (
                        <img src="/assets/icons/dot-single.svg" alt="show" className="w-5 h-5 opacity-60" />
                      )}
                    </span>
                  </div>
                </FormControl>
                {error && <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary mt-4">
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-small-regular text-light-3 text-center mt-2">
            Don't have an account?
            <Link to="/sign-up" className="text-black hover:text-green-500 text-small-semibold ml-1">
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
