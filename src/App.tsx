// src/App.tsx
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import SigninForm from "@/_auth/forms/SigninForm";
import SignupForm from "@/_auth/forms/SignupForm";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";

import {
  AllUsers,
  Chat,
  CreatePost,
  EditPost,
  Explore,
  Home,
  PostDetails,
  Profile,
  Saved,
  Settings,
  UpdateProfile,
  Notification,
} from "@/_root/pages";

import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import "swiper/css/bundle";

const App = () => {
  const [loading, setLoading] = useState(true);

  // Show splash loader on initial app mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // adjust timing if needed
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-white">
        <img
          src="/assets/icons/Loader1.svg"
          alt="Loading..."
          className="w-12 h-12 animate-spin"
        />
      </div>
    );
  }

  return (
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notification />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
