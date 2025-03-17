import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import SessionExpiredNotification from "@/components/shared/SessionExpiredNotification";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  return (
    <>
      {/* If the user is not authenticated, show the session expired notification */}
      {!isAuthenticated && <SessionExpiredNotification />}
      
      {isAuthenticated ? (
        // If authenticated, redirect to the home page (or your protected route)
        <Navigate to="/" />
      ) : (
        <div className="flex flex-1">
          <section className="flex flex-1 justify-center items-center flex-col">
            <Outlet />
          </section>
          <img
            src="/assets/images/side-img.jpeg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </div>
      )}
    </>
  );
}
