// Debug script for white screen issue on tutor revenue page
console.log("🔍 Debugging White Screen Issue - Tutor Revenue Statistics");

// Test 1: Check if page loads initially
setTimeout(() => {
  console.log("⏱️ Test 1: Page load after 1 second");
  console.log("Current URL:", window.location.href);
  console.log(
    "Document body:",
    document.body.innerHTML.length > 0 ? "Has content" : "Empty"
  );

  // Check for React errors
  const errorElements = document.querySelectorAll(
    '[data-testid="error-boundary"], .error, .error-message'
  );
  if (errorElements.length > 0) {
    console.log("❌ Error elements found:", errorElements);
  }

  // Check for loading states
  const loadingElements = document.querySelectorAll(
    '.loading, .spinner, [data-testid="loading"]'
  );
  if (loadingElements.length > 0) {
    console.log("⏳ Loading elements found:", loadingElements);
  }

  // Check Redux state
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("🔧 Redux DevTools available");
  }

  // Check for authentication
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  console.log("🔑 Auth token exists:", !!token);
}, 1000);

// Test 2: Check after white screen appears
setTimeout(() => {
  console.log("⏱️ Test 2: After white screen (2 seconds)");
  console.log("Body content length:", document.body.innerHTML.length);
  console.log(
    "React root element:",
    document.getElementById("root")?.innerHTML.length || 0
  );

  // Check for any error messages in DOM
  const allText = document.body.textContent || "";
  if (allText.includes("error") || allText.includes("Error")) {
    console.log("❌ Error text found in DOM");
  }

  // Check network requests
  console.log("🌐 Check Network tab for failed API calls");
}, 2000);

// Test 3: Final check
setTimeout(() => {
  console.log("⏱️ Test 3: Final status check (3 seconds)");

  // Try to find specific elements
  const specificElements = {
    table: document.querySelector("table"),
    searchBar: document.querySelector('.search-bar, input[type="search"]'),
    buttons: document.querySelectorAll("button"),
    links: document.querySelectorAll("a"),
  };

  console.log("📊 Elements found:", {
    table: !!specificElements.table,
    searchBar: !!specificElements.searchBar,
    buttons: specificElements.buttons.length,
    links: specificElements.links.length,
  });
}, 3000);

// Monitor for console errors
const originalError = console.error;
console.error = function (...args) {
  console.log("🚨 Console Error Detected:", args);
  originalError.apply(console, args);
};

// Monitor for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.log("🚨 Unhandled Promise Rejection:", event.reason);
});

console.log("🔍 Debug script loaded. Watch console for results...");
