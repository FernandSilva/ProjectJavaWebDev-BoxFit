import React from "react";

// You can replace the Unicode star below with an actual icon if you prefer.
const SessionExpiredNotification = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 z-50 shadow-md">
      <div className="flex items-center justify-center">
        {/* You could use an icon library here; for example, a yellow star */}
        <span className="text-2xl mr-2">⭐</span>
        <div>
          <strong className="font-bold">Session Expired!</strong>
          <span className="ml-2">
            Your session is no longer valid. Please log in again from the home page.
            If you continue to experience issues, try clearing your site cookies.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredNotification;
