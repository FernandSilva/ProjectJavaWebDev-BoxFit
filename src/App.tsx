// src/App.tsx
import SigninForm from "@/_auth/forms/SigninForm";
import SignupForm from "@/_auth/forms/SignupForm";
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
  Settings // Correct import here
  ,
  UpdateProfile
} from "@/_root/pages";
import { Toaster } from "@/components/ui/toaster";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";

import "./globals.css";
import 'swiper/css/bundle';

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore  />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/Chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} /> {/* Correct route here */}
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
