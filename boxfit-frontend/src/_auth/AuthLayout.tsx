import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";


export default function AuthLayout() {
  const { isAuthenticated, sessionExpired } = useUserContext();
  const location = useLocation();

  // Detect if user is on sign-in/sign-up pages
  const isAuthPage =
    location.pathname.startsWith("/sign-in") ||
    location.pathname.startsWith("/sign-up");

  // Redirect unauthenticated users trying to access a protected route
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <>
      {isAuthenticated ? (
        <>
      
          <Outlet />
        </>
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col">
            <Outlet />
          </section>
          {/* <img
            src="/assets/images/side-img.jpeg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          /> */}
        </>
      )}
    </>
  );
}
