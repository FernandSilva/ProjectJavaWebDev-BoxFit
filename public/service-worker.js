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
  // You can log or modify fetches here if caching is added later
});

// ✅ Handle push events with fallback and safety
self.addEventListener("push", (event) => {
  console.log("[GrowBuddy] Push event received", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error("❌ Push event data JSON parse error:", err);
    }
  }

  const title = data.title || "🌿 GrowBuddy Notification";
  const options = {
    body: data.body || "You have a new update from GrowBuddy.",
    icon: data.icon || "/assets/icons/GrowB-192x192.jpeg",
    badge: data.badge || "/assets/icons/GrowB-192x192.jpeg",
    data: {
      url: data.url || "https://www.growbuddy.club",
    },
    tag: data.tag || "growbuddy-general",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Handle click events to redirect or focus
self.addEventListener("notificationclick", (event) => {
  console.log("[GrowBuddy] Notification clicked");

  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || "https://www.growbuddy.club";

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
