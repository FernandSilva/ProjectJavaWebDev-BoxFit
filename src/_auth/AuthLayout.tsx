// src/layouts/AuthLayout.tsx
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import SessionExpiredNotification from "@/components/shared/SessionExpiredNotification";

export default function AuthLayout() {
  const { isAuthenticated, sessionExpired } = useUserContext();
  const location = useLocation();

  // Only show the notification if the session is expired and we are not on sign‑in/sign‑up pages.
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");
  const showNotification = sessionExpired && !isAuthPage;

  return (
    <>
      {isAuthenticated ? (
        <>
          {showNotification && (
            <SessionExpiredNotification 
              title="Session Expired"
              message="Your session has expired. Please log in again or clear your cookies if you continue to experience issues."
            />
          )}
          <Outlet />
        </>
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col">
            <Outlet />
          </section>
          <img
            src="/assets/images/side-img.jpeg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
}
