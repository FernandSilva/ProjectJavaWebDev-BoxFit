import { useState, useEffect } from "react";
import AboutUs from "@/components/settingpages/AboutUs";
import ContactUs from "@/components/settingpages/ContactUs";
import PrivacyPolicy from "@/components/settingpages/PrivacyPolicy";
import { FaBookOpen } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { FaShieldAlt, FaBell } from "react-icons/fa"; // ✅ Updated with bell
import { toast } from "react-toastify";

import { useStorePushSubscription } from "@/lib/react-query/queries";
import { subscribeToPush } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const Settings = () => {
  const [tab, setTab] = useState("about");
  const [pushEnabled, setPushEnabled] = useState(false);

  const { user } = useUserContext();
  const { mutateAsync: storePushSubscription } = useStorePushSubscription();

  useEffect(() => {
    if (Notification.permission === "granted") {
      setPushEnabled(true);
    }
  }, []);

  const handleTogglePush = async () => {
    if (pushEnabled) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          toast.info("Push notifications disabled. You can re-enable them anytime.");
        }
        setPushEnabled(false);
      } catch (err) {
        console.error("Unsubscribe error:", err);
        toast.error("Failed to disable push notifications.");
      }
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission denied.");
          return;
        }

        const subscription = await subscribeToPush(import.meta.env.VITE_VAPID_PUBLIC_KEY);
        if (subscription) {
          await storePushSubscription({ userId: user.id, subscription });
          setPushEnabled(true);
          toast.success("Push notifications enabled!");
        } else {
          toast.error("Push subscription failed.");
        }
      } catch (error) {
        console.error("Push setup error:", error);
        toast.error("An error occurred while enabling push notifications.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-r p-4 bg-gray-50">
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setTab("about")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${
              tab === "about" && "bg-green-200"
            }`}
          >
            <FaBookOpen className="text-green-700" /> About Us
          </button>
          <button
            onClick={() => setTab("contact")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${
              tab === "contact" && "bg-green-200"
            }`}
          >
            <BiSupport className="text-green-700" /> Contact Us
          </button>
          <button
            onClick={() => setTab("privacy")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${
              tab === "privacy" && "bg-green-200"
            }`}
          >
            <FaShieldAlt className="text-green-700" /> Privacy Policy
          </button>
          <button
            onClick={() => setTab("notifications")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-green-100 ${
              tab === "notifications" && "bg-green-200"
            }`}
          >
            <FaBell className="text-green-700" /> Notifications
          </button>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="w-full md:w-3/4 p-4">
        {tab === "about" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-700">About GrowBuddy</h2>
            <p className="text-sm text-gray-600 max-w-xl">
              GrowBuddy is a digital companion for urban growers, connecting a passionate community
              of cannabis cultivators. Share your grow journey, learn from others, and track your plant’s progress.
            </p>
            <p className="text-sm text-gray-600 max-w-xl">
              We’re currently working on an in-app AI assistant to help you with personalized growing support.
              Until then, you can chat with{" "}
              <a
                href="https://chatgpt.com/g/g-yFIOVM7k9-dr-grow-weed-bible"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                Dr. Grow – Weed Bible
              </a>
              , our GPT assistant available on ChatGPT.
            </p>
          </div>
        )}

        {tab === "contact" && <ContactUs />}
        {tab === "privacy" && <PrivacyPolicy />}

        {tab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-700">Push Notifications</h2>
            <p className="text-sm text-gray-600 max-w-xl">
              GrowBuddy uses push notifications to send real-time updates (likes, comments, messages)
              to your device even when the app is closed. You can turn them on or off here.
            </p>

            <div className="flex items-center gap-3">
              <label htmlFor="pushToggle" className="text-sm font-medium text-gray-700">
                Enable push notifications:
              </label>
              <input
                id="pushToggle"
                type="checkbox"
                checked={pushEnabled}
                onChange={handleTogglePush}
                className="accent-green-600 w-5 h-5"
              />
            </div>

            <p className="text-xs text-gray-500">
              🔒 Want to disable push notifications completely? Visit your browser or phone
              settings under site permissions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
