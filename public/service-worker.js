self.addEventListener("install", (event) => {
    console.log("[GrowBuddy] Service Worker installed");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("[GrowBuddy] Service Worker activated");
    return self.clients.claim();
  });
  
  // Optional: Listen for fetches (needed if you want caching later)
  self.addEventListener("fetch", (event) => {
    // You can log or modify fetches here
  });
  