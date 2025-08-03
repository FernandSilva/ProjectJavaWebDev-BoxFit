import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import SessionExpiredNotification from "@/components/shared/SessionExpiredNotification";

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
          {/* ✅ Show session expired notification ONLY for authenticated users */}
          {sessionExpired && !isAuthPage && (
            <SessionExpiredNotification
              title="⚠️ Session Expired"
              message="Your login session has expired, or you are not logged in correctly. Please log in again. If the issue persists, try clearing your browser cookies."
            />
          )}
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
