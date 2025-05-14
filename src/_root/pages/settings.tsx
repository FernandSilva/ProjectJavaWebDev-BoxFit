import { useState } from "react";
import AboutUs from "@/components/settingpages/AboutUs";
import ContactUs from "@/components/settingpages/ContactUs";
import PrivacyPolicy from "@/components/settingpages/PrivacyPolicy";
import { FaBookOpen } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";

const Settings = () => {
  const [tab, setTab] = useState("about");

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <aside className="w-full md:w-1/4 border-r p-4 bg-gray-50">
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setTab("about")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${tab === "about" && "bg-green-200"}`}
          >
            <FaBookOpen className="text-green-700" /> About Us
          </button>
          <button
            onClick={() => setTab("contact")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${tab === "contact" && "bg-green-200"}`}
          >
            <BiSupport className="text-green-700" /> Contact Us
          </button>
          <button
            onClick={() => setTab("privacy")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${tab === "privacy" && "bg-green-200"}`}
          >
            <FaShieldAlt className="text-green-700" /> Privacy Policy
          </button>
        </nav>
      </aside>

      <main className="w-full md:w-3/4">
        {tab === "about" && <AboutUs />}
        {tab === "contact" && <ContactUs />}
        {tab === "privacy" && <PrivacyPolicy />}
      </main>
    </div>
  );
};

export default Settings