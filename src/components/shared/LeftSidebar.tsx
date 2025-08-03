import { Link, NavLink, useLocation } from "react-router-dom";
import { Loader } from "@/components/shared";
import { sidebarLinks } from "@/constants";
import { useUserContext } from "@/context/AuthContext";
import { INavLink } from "@/types";
import { CiBookmark } from "react-icons/ci";
import { useGetNotifications, useMarkNotificationAsRead } from "@/lib/react-query/queries";
import { useEffect, useState, useRef } from "react";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user, isLoading } = useUserContext();

  const { data: notificationsData, refetch } = useGetNotifications(user?.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const [hasUnread, setHasUnread] = useState(false);
  const hasMarkedRead = useRef(false); // Prevents multiple marking

  const handleNotificationView = () => {
    if (notificationsData?.documents && !hasMarkedRead.current) {
      const unread = notificationsData.documents.filter((n) => !n.isRead);
      if (unread.length > 0) {
        unread.forEach((n) => markAsRead(n.$id));
        hasMarkedRead.current = true;
        setHasUnread(false);
        refetch();
      }
    }
  };

  useEffect(() => {
    if (notificationsData?.documents) {
      const unread = notificationsData.documents.some((n) => !n.isRead);
      if (!hasMarkedRead.current) setHasUnread(unread);
    }
  }, [notificationsData]);

  useEffect(() => {
    if (pathname === "/notifications") {
      handleNotificationView();
    }
  }, [pathname]);

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <img src="/assets/images/Boxfitlogo.png" alt="BoxFit logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-800">BoxFit</span>
        </div>
        </Link>

        {isLoading || !user ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-10 w-10 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold !text-base">{user.name}</p>
              <p className="small-regular text-light-3">@{user.username}</p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-4">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li key={link.label} className="leftsidebar-link group">
                <NavLink
                  to={link.route}
                  className={`flex gap-4 items-center py-2 px-4 rounded-md ${
                    isActive ? "text-green-500 !font-bold" : "text-black !font-normal"
                  }`}
                >
                  {link.label === "Saved" ? (
                    <CiBookmark className="h-6 w-6 text-black" />
                  ) : (
                    <img src={link.imgURL} alt={link.label} className="h-6 w-6" />
                  )}
                  {link.label}
                </NavLink>
              </li>
            );
          })}

          {/* Notifications Tab */}
          <li className="leftsidebar-link group">
            <NavLink
              to="/notifications"
              onClick={handleNotificationView}
              className={`flex gap-4 items-center py-2 px-4 rounded-md ${
                pathname === "/notifications" ? "text-green-500 !font-bold" : "text-black !font-normal"
              }`}
            >
              <img
                src={`/assets/icons/${hasUnread ? "notify.svg" : "notify1.svg"}`}
                alt="Notifications"
                className="h-6 w-6"
              />
              Notifications
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default LeftSidebar;
