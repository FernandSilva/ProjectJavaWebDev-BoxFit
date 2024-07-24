import { Link, NavLink, useLocation } from "react-router-dom";

import { Loader } from "@/components/shared";
import { sidebarLinks } from "@/constants";
import { useUserContext } from "@/context/AuthContext";
import { INavLink } from "@/types";
import { CiBookmark } from "react-icons/ci";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user, isLoading } = useUserContext();

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.jpeg"
            alt="logo"
            className="w-[8rem] mx-auto object-contain"
          />
        </Link>

        {isLoading || !user.email ? (
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
              <li key={link.label} className={`leftsidebar-link group `}>
                <NavLink
                  to={link.route}
                  className={`flex gap-4 items-center py-2 px-4  rounded-md ${isActive ? "text-green-500 !font-bold" : "text-black !font-normal "}`}
                >
                  {link.label === "Saved" ? (
                    <CiBookmark
                      className={`h-6 w-6 filter ${isActive ? "text-black" : "text-black"}`}
                    />
                  ) : (
                    <img
                      src={link.imgURL}
                      alt={link.label}
                      className={`h-6 w-6 filter ${isActive ? "" : ""}`}
                    />
                  )}
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default LeftSidebar;
