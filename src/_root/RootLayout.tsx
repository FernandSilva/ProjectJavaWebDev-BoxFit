import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { useWindowSize } from "@uidotdev/usehooks";
import { useUserContext } from "@/context/AuthContext";
import { subscribeToPush } from "@/lib/utils"; // Adjust path if needed

const RootLayout = () => {
  const location = useLocation();
  const { width } = useWindowSize();
  const { isAuthenticated } = useUserContext();

  // ⏱️ Subscribe to push notifications on mount IF authenticated
  useEffect(() => {
    if (isAuthenticated) {
      subscribeToPush().then(() => {
        console.log("[Push] Subscribed to push notifications");
      }).catch((err) => {
        console.error("[Push] Subscription failed", err);
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section
        className={`flex-1 ${
          width && width < 640 && location.pathname === "/settings" ? "" : "flex"
        } ${
          width && width < 1024 && location.pathname === "/Chat"
            ? "h-auto"
            : "h-full"
        } text-black`}
      >
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
