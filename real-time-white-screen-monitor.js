// Real-time monitoring script for white screen issue
console.log("🔍 Starting real-time monitoring for white screen issue...");

// Monitor DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      console.log("📝 DOM changed:", {
        added: mutation.addedNodes.length,
        removed: mutation.removedNodes.length,
        target: mutation.target.tagName || "Unknown",
      });
    }
  });
});

// Start observing
const targetNode = document.getElementById("root") || document.body;
observer.observe(targetNode, {
  childList: true,
  subtree: true,
});

// Monitor React errors
window.addEventListener("error", (event) => {
  console.error("🚨 JavaScript Error:", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
});

// Monitor unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Unhandled Promise Rejection:", event.reason);
});

// Monitor Redux state changes (if available)
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log("🔧 Redux DevTools available");
}

// Check every second for changes
let checkCount = 0;
const intervalId = setInterval(() => {
  checkCount++;
  const rootElement = document.getElementById("root");
  const bodyContent = document.body.innerHTML;

  console.log(`⏱️ Check #${checkCount}:`, {
    timestamp: new Date().toLocaleString(),
    rootExists: !!rootElement,
    rootContent: rootElement?.innerHTML?.length || 0,
    bodyContent: bodyContent.length,
    url: window.location.href,
  });

  // Stop after 10 checks
  if (checkCount >= 10) {
    clearInterval(intervalId);
    observer.disconnect();
    console.log("✅ Monitoring complete");
  }
}, 1000);

console.log("👀 Monitoring started. Check console for updates...");
