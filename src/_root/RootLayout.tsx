import { Outlet, useLocation } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { useWindowSize } from "@uidotdev/usehooks";

const RootLayout = () => {
  const location = useLocation();
  console.log({ location });
  const { width } = useWindowSize();
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section
        className={` flex-1 ${width < 640 && location.pathname === "/settings" ? "" : "flex"} ${width < 1024 && location.pathname === "/Chat" ? "h-auto" : "h-full"}  text-black`}
      >
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
