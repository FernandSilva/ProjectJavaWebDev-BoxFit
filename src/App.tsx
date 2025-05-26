import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
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
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const location = useLocation();

  // Show splash loader on initial app mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle beforeinstallprompt event for PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      console.log("[GrowBuddy] beforeinstallprompt event captured");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Only show the install button on public routes
  const showInstallPrompt =
    deferredPrompt &&
    ["/", "/sign-in", "/sign-up"].includes(location.pathname);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt as any;
    if (!prompt) return;

    prompt.prompt();
    const result = await prompt.userChoice;
    console.log("[GrowBuddy] User install choice:", result.outcome);

    setDeferredPrompt(null);

    // ✅ Ask for push notification permission if install was accepted
    if (result.outcome === "accepted") {
      try {
        const permission = await Notification.requestPermission();
        console.log("[GrowBuddy] Push notification permission:", permission);
      } catch (err) {
        console.error("Notification permission request failed", err);
      }
    }
  };

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

      {/* 📲 PWA Install Prompt with Notification Permission */}
      {showInstallPrompt && (
        <button
          className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
          onClick={handleInstallClick}
        >
          📲 Add GrowBuddy to Home Screen
        </button>
      )}

      <Toaster />
    </main>
  );
};

export default App;
