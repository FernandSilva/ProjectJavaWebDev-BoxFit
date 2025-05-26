// src/components/shared/NotificationsPermissionPrompt.tsx
import { useEffect, useState } from "react";
import { subscribeToPush } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useStorePushSubscription } from "@/lib/react-query/queries";
import { toast } from "react-toastify";

const NotificationsPermissionPrompt = () => {
  const [visible, setVisible] = useState(false);
  const { user } = useUserContext();
  const { mutateAsync: storePushSubscription } = useStorePushSubscription();

  useEffect(() => {
    if (Notification.permission === "default") {
      setVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const subscription = await subscribeToPush(import.meta.env.VITE_VAPID_PUBLIC_KEY);
        if (subscription) {
          await storePushSubscription({ userId: user.id, subscription });
          toast.success("Push notifications enabled!");
        }
      } else {
        toast.info("Push notifications were denied.");
      }
    } catch (error) {
      toast.error("Failed to enable push notifications.");
      console.error("Push error:", error);
    } finally {
      setVisible(false);
    }
  };

  const handleDismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="fixed top-[64px] left-0 w-full z-50 flex justify-center">
      <div className="bg-green-100 border border-green-500 text-green-800 rounded-md shadow-lg px-4 py-3 w-full max-w-md mx-4 sm:mx-0 sm:w-[500px] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold">Enable Push Notifications?</p>
          <p className="text-sm text-green-700">
            Stay notified about likes, comments, and DMs even when you’re away.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-600 hover:underline"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPermissionPrompt;
