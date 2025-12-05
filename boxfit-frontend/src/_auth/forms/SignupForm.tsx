import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useSignUpAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: signUpAccount, isLoading } = useSignUpAccount();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const handleSignup = async (values: z.infer<typeof SignupValidation>) => {
    try {
      const res = await signUpAccount({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      toast.success("✅ Account created successfully!", {
        position: "bottom-center",
      });

      setTimeout(() => navigate("/sign-in"), 1200);
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.response?.message ||
        "Signup failed. Please try again.";
      toast.error(msg, { position: "bottom-center" });
      console.error("Signup error:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-8">
        <img src="/assets/images/Boxfitlogo.png" alt="BoxFit" className="logo" />
        <h2 className="h3-bold md:h2 pt-5 sm:pt-2 text-center">
          Create your BoxFit Account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2 text-center">
          Join the BoxFit community today!
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-3 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="John Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="johnnyfit" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="you@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary mt-2">
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-small-regular text-center mt-2 text-light-3">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-green-600 font-semibold">
              Log In
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </Form>
  );
};

export default SignupForm;
