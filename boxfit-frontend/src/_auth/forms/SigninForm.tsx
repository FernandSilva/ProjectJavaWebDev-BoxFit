import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useSignInAccount } from "@/lib/react-query/queries";
import { SigninValidation } from "@/lib/validation";
import { toast, ToastContainer } from "react-toastify";

const SigninForm = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, checkAuthUser } = useUserContext();
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: { email: "", password: "" },
  });

  const handleSignin = async (values: z.infer<typeof SigninValidation>) => {
    try {
      await signInAccount(values);
      await checkAuthUser();
      setIsAuthenticated(true);
      toast.success("✅ Logged in successfully!", { position: "bottom-center" });
      setTimeout(() => navigate("/"), 1200);
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.response?.message ||
        "Login failed. Please try again.";
      toast.error(msg, { position: "bottom-center" });
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <img
        src="/assets/images/Boxfitlogo.png"
        alt="BoxFit"
        className="w-20 h-20 mb-4"
      />
      <h2 className="text-2xl font-bold mb-2">Welcome Back to BoxFit</h2>
      <p className="text-gray-600 mb-6">Log in to continue your journey 💪</p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Logging in...
              </div>
            ) : (
              "Log In"
            )}
          </Button>

          <p className="text-small-regular text-center mt-2 text-light-3">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-green-600 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </Form>

      <ToastContainer />
    </div>
  );
};

export default SigninForm;
