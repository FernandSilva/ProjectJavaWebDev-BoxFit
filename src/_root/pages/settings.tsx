import { useState, useEffect } from "react";
import { FaBookOpen } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { FaShieldAlt, FaBell } from "react-icons/fa";
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
          toast.info("Push notifications disabled.");
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
        toast.error("Error enabling push notifications.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-r p-4 bg-gray-900 text-white">
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setTab("about")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-gray-700 ${
              tab === "about" && "bg-gray-800"
            }`}
          >
            <FaBookOpen /> About Us
          </button>
          <button
            onClick={() => setTab("contact")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-gray-700 ${
              tab === "contact" && "bg-gray-800"
            }`}
          >
            <BiSupport /> Contact Us
          </button>
          <button
            onClick={() => setTab("privacy")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-gray-700 ${
              tab === "privacy" && "bg-gray-800"
            }`}
          >
            <FaShieldAlt /> Privacy Policy
          </button>
          <button
            onClick={() => setTab("notifications")}
            className={`flex items-center gap-2 text-left p-2 rounded hover:bg-gray-700 ${
              tab === "notifications" && "bg-gray-800"
            }`}
          >
            <FaBell /> Notifications
          </button>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="w-full md:w-3/4 p-6 bg-gray-50">
        {tab === "about" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">About BoxFit</h2>
            <p className="text-sm text-gray-700 max-w-xl">
              BoxFit is a premier boxing gym and a private boxing club dedicated to connecting gyms under one network.
              We provide professional training, shared resources, and a collaborative platform for boxing gyms to grow together.
            </p>
            <p className="text-sm text-gray-700 max-w-xl">
              Our mission is to create a strong community of fighters and trainers, sharing knowledge, workouts, and
              experiences to help each member reach their full potential in the sport.
            </p>
          </div>
        )}

        {tab === "contact" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <form className="space-y-3 max-w-md">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Your Message"
                className="w-full border p-2 rounded h-28"
              ></textarea>
              <button className="bg-gray-900 text-white px-4 py-2 rounded">Send Message</button>
            </form>
          </div>
        )}

        {tab === "privacy" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            <p className="text-sm text-gray-700 max-w-xl">
              At BoxFit, we value your privacy. You choose what to share, when to share, and with whom.  
              All content shared within the BoxFit network remains under your control.  
              By using our platform, you agree to respect other users' content and confidentiality.
            </p>
            <p className="text-sm text-gray-700 max-w-xl">
              This policy ensures a safe and secure environment where athletes and trainers can collaborate freely while maintaining personal privacy.
            </p>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Push Notifications</h2>
            <p className="text-sm text-gray-700 max-w-xl">
              Enable push notifications to receive updates on training schedules, posts, and private messages in real-time.
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="pushToggle" className="text-sm font-medium text-gray-800">
                Enable push notifications:
              </label>
              <input
                id="pushToggle"
                type="checkbox"
                checked={pushEnabled}
                onChange={handleTogglePush}
                className="accent-gray-900 w-5 h-5"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
