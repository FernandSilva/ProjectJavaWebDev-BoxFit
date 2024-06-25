import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/globals.css"; // Corrected import for CSS
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo5.jpg"
            alt="logo"
            width={200}
            height={40}
          />
        </Link>

        <div className="flex gap-4">
          {/* Explore Link */}
          <Link to="/explore" className="link flex-center gap-3">
        <img
          src="/assets/icons/wallpaper.svg"
          alt="Explore"
          className="icon1" // Adjusted class for consistency
        />
          </Link>
          
          {/* Profile Link */}
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;

