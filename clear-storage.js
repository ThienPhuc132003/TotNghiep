// Script to clear localStorage for Redux Persist fix
console.log("Clearing localStorage for Redux Persist fix...");

// Clear all persist data
localStorage.removeItem("persist:user");
localStorage.removeItem("persist:admin");
localStorage.removeItem("persist:menu");
localStorage.removeItem("persist:ui");

// Clear root persist data if exists
localStorage.removeItem("persist:root");

// Clear any other Redux persist keys
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("persist:")) {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  }
});

console.log("Storage cleared! Please refresh the page and login again.");
