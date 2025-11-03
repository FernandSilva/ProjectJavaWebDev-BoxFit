import { Link, useLocation } from "react-router-dom";
// import { bottombarLinks } from "@/constants"; // Ensure this imports the updated links array
import "@/globals.css"; // Ensure CSS import is correct
import { RiHome2Line } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import { BiMessageDetail } from "react-icons/bi";
import { LiaBookmarkSolid } from "react-icons/lia";

const Bottombar = () => {
  const { pathname } = useLocation();
  // const isActive = pathname === link.route;
  const HomeActive = pathname === "/";
  const CreatePostActive = pathname === "/create-post";
  const SavedActive = pathname === "/saved";
  const MessageActive = pathname === "/Chat";
  // const isCreatePost = link.label === "Create Post";
  // const HomePost = link.label === "Create Post";
  // const CreatePost = link.label === "Create Post";
  // const SavedPost = link.label === "Create Post";
  // const MessagePost = link.label === "Create Post";

  

  return (
    <section className="bottom-bar">
      {/* {bottombarLinks.map((link) => { */}
        
        
        
          <>
          {}
          <Link
            key={`bottombar-Home`}
            to="/"
            className={`link ${HomeActive ? "active" : ""} `}>
            
            {}
            <RiHome2Line className="icon"/>
            <p>Create</p>
          </Link>     
          <Link
            key={`bottombar-Create`}
            to="/create-post"
            className={`link ${CreatePostActive ? "active" : ""} `}>
            
         
            <CiCirclePlus className="icon"/>
            <p>Create</p>
          </Link>     
         <Link to="/settings" className="link flex-center gap-3">
            <img src="/assets/icons/wallpaper.svg" alt="Explore" className="icon1" />
          </Link>    
          <Link
            key={`bottombar-Messages`}
            to="/Chat"
            className={`link ${MessageActive ? "active" : ""} `}>
            
          
            <BiMessageDetail className="icon"/>
            <p>Messages</p>
          </Link>     
          </>
        
    </section>
  );
};

export default Bottombar;


