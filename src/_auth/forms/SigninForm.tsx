// src/pages/SigninForm.tsx
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
import SessionExpiredNotification from "@/components/shared/SessionExpiredNotification";

const SigninForm = () => {
  const navigate = useNavigate();
  const { checkAuthUser, sessionExpired } = useUserContext();
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: { email: "", password: "" },
  });

  const handleSignin = async (userData: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(userData);
      if (!session) throw new Error("Login failed. Please try again.");
      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.message || error?.message || "An unknown error occurred.";
      setLoginError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <img src="/assets/images/Boxfitlogo.png" alt="BoxFit logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-800">BoxFit</span>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/sign-up')} className="bg-green-600 text-white hover:bg-green-700">Register</Button>
          <Button onClick={() => setShowLogin(!showLogin)} className="bg-gray-200 hover:bg-gray-300 text-black">Login</Button>
        </div>
      </div>

      {/* Login Form */}
      {showLogin && (
        <div className="bg-white px-6 py-4 shadow-md max-w-md mx-auto w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignin)} className="flex flex-col gap-4">
              {/* {sessionExpired && (
                <SessionExpiredNotification 
                  title="Session Expired"
                  message="Your session has expired. Please log in again."
                />
              )} */}
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                          onClick={() => setShowPassword((prev) => !prev)}
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
              <Button type="submit">
                {isLoading ? (<><Loader /> Loading...</>) : "Log In"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-10 px-4 py-10 md:px-20 w-full max-w-[1440px] mx-auto">
        <img src="/assets/images/BF1.png" alt="Gym" className="rounded-lg shadow-md w-full h-auto" />

        <section>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Welcome to BoxFit Gym</h2>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            BoxFit is more than just a boxing gym—it's a community. Our focus is on combining the discipline of boxing with total fitness training, helping people of all backgrounds find strength, confidence, and purpose through movement.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">Meet Our Head Coach</h3>
              <p className="text-gray-700 mb-4">
                Our lead coach is a professional boxer from South Africa with over 10 years of competitive experience. With 15+ years in the boxing industry, he’s trained champions, youth fighters, and beginners alike. 
              </p>
              <p className="text-gray-700 mb-4">
                Specializing in pad work, combinations, and amateur boxing basics, he’s passionate about building the next generation of fighters and helping adults unlock their hidden strength through the art of boxing.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Why Choose BoxFit?</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Structured and safe training environments</li>
                <li>Women’s boxing and fitness-focused programs</li>
                <li>Youth mentorship and amateur boxing clinics</li>
                <li>One-on-one coaching and team training options</li>
              </ul>
            </div>

            <div>
              <img src="/assets/images/BF3.png" alt="Boxing coach" className="rounded-lg shadow-md w-full h-auto" />
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-2">Training for All Ages</h3>
            <p className="text-gray-700 mb-2">
              From school-age children to adults, our tailored programs cater to all skill levels. Whether your goal is to become an amateur boxer, improve your fitness, or just learn how to throw a proper jab—BoxFit is here for you.
            </p>
            <p className="text-gray-700">
              Our space promotes discipline, energy, and respect. We believe boxing teaches more than punches—it teaches life skills.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white text-center py-4">
        <p>📲 Contact us: <a href="https://instagram.com/boxfit" target="_blank" rel="noopener noreferrer" className="underline">@boxfit</a></p>
      </footer>
    </div>
  );
};

export default SigninForm;
