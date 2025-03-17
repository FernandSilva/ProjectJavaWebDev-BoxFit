// src/components/SessionExpiredNotification.tsx
import React, { useState, useEffect } from "react";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type SessionExpiredNotificationProps = {
  title: string;
  message: string;
  duration?: number; // in milliseconds
};

const SessionExpiredNotification: React.FC<SessionExpiredNotificationProps> = ({
  title,
  message,
  duration = 5000,
}) => {
  const [visible, setVisible] = useState(true);
  const { setIsAuthenticated, setUser } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();

  useEffect(() => {
    // Auto-hide notification after the specified duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      // Optionally, you might redirect to the login page here.
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="bg-red-500 text-white py-2 px-4 rounded flex items-center justify-between shadow-md">
        <span>{title}</span>
        <Button onClick={handleLogout} className="bg-red-600 text-white">
          Logout
        </Button>
      </div>
      <div className="bg-red-100 text-red-800 p-4 rounded-b shadow-sm">
        <p className="font-bold mb-2">System Login Error</p>
        <p>
          {message} <br />
          Please try refreshing the page or clearing your site cookies if the
          problem persists.
        </p>
      </div>
    </div>
  );
};

export default SessionExpiredNotification;
