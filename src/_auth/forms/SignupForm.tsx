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
import { useState } from "react";
import { useCreateUserAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const { mutateAsync: signUpAccount, isLoading } = useCreateUserAccount();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      const session = await signUpAccount({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        name: userData.name,
      });

      if (!session) {
        throw new Error("Signup failed. Please try again.");
      }

      setShowEmailPopup(true);
    } catch (error: any) {
      const errMsg = error?.response?.message || error?.message || "An unknown error occurred.";
      toast.error(errMsg, {
        position: "bottom-center",
      });
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left: Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <Form {...form}>
          <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-8">
            <img src="/assets/images/logo.jpeg" alt="logo" className="logo" />
            <h2 className="h3-bold md:h2 pt-5 sm:pt-2">Create your GrowBuddy account</h2>
            <p className="text-light-3 small-medium md:base-regular mt-2">
              Join the community and start growing together!
            </p>

            {showEmailPopup && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mt-4">
                <strong>✅ Account Successfully Created!</strong>
                <p className="mt-1">
                  We’ve sent a login link to your email. Please check your inbox.
                </p>
                <p className="mt-1">If you don’t see it, check your spam or junk folder.</p>
              </div>
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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className={`shad-input pr-10 ${error ? "error" : ""}`}
                          {...field}
                        />
                        <span
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        >
                          {showPassword ? (
                            <img
                              src="/assets/icons/dot.svg"
                              alt="hide"
                              className="w-5 h-5 opacity-60"
                            />
                          ) : (
                            <img
                              src="/assets/icons/dot-single.svg"
                              alt="show"
                              className="w-5 h-5 opacity-60"
                            />
                          )}
                        </span>
                      </div>
                    </FormControl>
                    {error && (
                      <FormMessage className="text-red text-[12px]">{error.message}</FormMessage>
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
      </div>

      {/* Right: Side Image */}
      <div className="hidden md:block w-1/2">
        <img
          src="/assets/images/side-img.jpeg"
          alt="GrowBuddy"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignupForm;
