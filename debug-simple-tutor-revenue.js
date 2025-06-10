// Debug script for simple tutor revenue component
// Run this in browser console to monitor component behavior

console.log("🔍 Starting Simple Tutor Revenue Debug...");

// Monitor Redux state
function checkReduxState() {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("✅ Redux DevTools detected");
  }

  // Try to access store from window (if exposed)
  if (window.store) {
    const state = window.store.getState();
    console.log("🟢 Redux state:", state);
    console.log("🟢 User profile:", state.user?.userProfile);
    console.log("🟢 Is authenticated:", state.user?.isAuthenticated);
  } else {
    console.log("❌ Redux store not accessible from window");
  }
}

// Monitor component renders
function monitorComponentRenders() {
  const originalConsoleLog = console.log;
  console.log = function (...args) {
    if (args[0] && args[0].includes("TutorRevenueSimple")) {
      console.warn("🔍 COMPONENT DEBUG:", ...args);
    }
    originalConsoleLog.apply(console, args);
  };
}

// Check for React errors
function setupErrorMonitoring() {
  window.addEventListener("error", (e) => {
    console.error("🚨 Global Error:", e.error);
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("🚨 Unhandled Promise Rejection:", e.reason);
  });
}

// Monitor DOM changes
function monitorDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.textContent &&
            (node.textContent.includes("Thống kê Doanh thu") ||
              node.textContent.includes("Truy cập bị từ chối"))
          ) {
            console.log(
              "🟢 Component content detected:",
              node.textContent.substring(0, 100)
            );
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("👀 DOM mutation observer started");
}

// Check current page
function checkCurrentPage() {
  console.log("📍 Current URL:", window.location.href);
  console.log("📍 Current pathname:", window.location.pathname);

  // Check if we're on the right page
  if (window.location.pathname === "/tai-khoan/ho-so/thong-ke-doanh-thu") {
    console.log("✅ On correct tutor revenue page");
  } else {
    console.log("❌ Not on tutor revenue page");
  }
}

// Check React components
function checkReactComponents() {
  // Check if React is loaded
  if (window.React) {
    console.log("✅ React loaded:", window.React.version || "version unknown");
  } else {
    console.log("❌ React not found in window");
  }

  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("✅ React DevTools detected");
  }
}

// Main debug function
function runDebug() {
  console.log("🚀 Running comprehensive debug...");

  checkCurrentPage();
  checkReactComponents();
  checkReduxState();
  setupErrorMonitoring();
  monitorComponentRenders();
  monitorDOMChanges();

  // Check page content every 2 seconds
  const intervalId = setInterval(() => {
    const bodyText = document.body.textContent || "";
    if (bodyText.includes("Thống kê Doanh thu")) {
      console.log("🎉 Component rendered successfully!");
      clearInterval(intervalId);
    } else if (bodyText.includes("Truy cập bị từ chối")) {
      console.log("🚫 Access denied message detected");
      clearInterval(intervalId);
    } else if (bodyText.trim() === "" || bodyText.length < 50) {
      console.log("⚠️ Page appears empty or minimal content");
    }
  }, 2000);

  // Stop checking after 30 seconds
  setTimeout(() => {
    clearInterval(intervalId);
    console.log("⏰ Debug monitoring stopped after 30 seconds");
  }, 30000);
}

// Auto-run debug
setTimeout(runDebug, 1000);

console.log("📋 Debug script loaded. Run runDebug() manually if needed.");
