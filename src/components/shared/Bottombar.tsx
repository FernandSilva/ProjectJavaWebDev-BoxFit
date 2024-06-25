import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants"; // Ensure this imports the updated links array
import "@/globals.css"; // Ensure CSS import is correct

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const isCreatePost = link.label === "Create Post";
        
        return (
          
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`link ${isActive ? "active" : ""} ${isCreatePost ? "create-post" : ""}`}>
            
            <img
              src={link.imgURL}
              alt={link.label}
              className="icon"
            />
            <p>{link.label}</p>
          </Link>     

        

        );
      })}
    </section>
  );
};

export default Bottombar;


