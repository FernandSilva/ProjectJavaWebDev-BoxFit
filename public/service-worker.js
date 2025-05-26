self.addEventListener("install", (event) => {
  console.log("[GrowBuddy] Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[GrowBuddy] Service Worker activated");
  return self.clients.claim();
});

// Optional: Handle fetch events if needed later
self.addEventListener("fetch", (event) => {
  // You can log or modify fetches here
});

// ✅ Handle push events
self.addEventListener("push", (event) => {
  console.log("[GrowBuddy] Push event received", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error("Push event data error:", err);
    }
  }

  const title = data.title || "GrowBuddy Alert 🌿";
  const options = {
    body: data.body || "You have a new notification.",
    icon: data.icon || "/assets/icons/GrowB-192x192.jpeg",
    badge: data.badge || "/assets/icons/GrowB-192x192.jpeg",
    data: {
      url: data.url || "https://www.growbuddy.club", // fallback URL
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Handle click events on the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  const urlToOpen = notificationData?.url || "https://www.growbuddy.club";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
