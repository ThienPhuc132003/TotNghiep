// Browser console debug script - paste this into browser console
(function () {
  console.log("🔍 Starting debug session...");

  // Check if React DevTools is available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("✅ React DevTools available");
  } else {
    console.log("❌ React DevTools not available");
  }

  // Check Redux store
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("✅ Redux DevTools available");
  } else {
    console.log("❌ Redux DevTools not available");
  }

  // Check for errors in console
  const originalError = console.error;
  console.error = function (...args) {
    console.log("🚨 Console Error Captured:", args);
    originalError.apply(console, args);
  };

  // Check React root
  const root = document.getElementById("root");
  if (root) {
    console.log("✅ React root element found");
    console.log("📄 Root innerHTML length:", root.innerHTML.length);

    if (root.innerHTML.length === 0) {
      console.log("❌ Root element is empty!");
    }
  } else {
    console.log("❌ React root element not found");
  }

  // Check for any uncaught exceptions
  window.addEventListener("error", function (e) {
    console.log("🚨 Uncaught Error:", e.error);
    console.log("📍 Error details:", {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  // Check for unhandled promise rejections
  window.addEventListener("unhandledrejection", function (e) {
    console.log("🚨 Unhandled Promise Rejection:", e.reason);
  });

  // Monitor component mounting/unmounting
  setTimeout(() => {
    const root = document.getElementById("root");
    if (root && root.innerHTML.length === 0) {
      console.log("❌ Component seems to have unmounted or crashed");
      console.log("💡 Check for JavaScript errors above");
    } else {
      console.log("✅ Component appears to be mounted");
    }
  }, 2000);

  console.log("🔍 Debug session initialized. Watch console for errors.");
})();
