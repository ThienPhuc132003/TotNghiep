// Debug script để kiểm tra lỗi trang rút tiền
// Chạy trong console khi truy cập /admin/rut-tien

console.log("=== DEBUG WITHDRAWAL PAGE ERROR CHECK ===");

// Kiểm tra component có load không
setTimeout(() => {
  const withdrawalElements = document.querySelectorAll(
    '[data-testid*="withdrawal"], [class*="withdrawal"]'
  );
  console.log("Withdrawal elements found:", withdrawalElements.length);

  // Kiểm tra lỗi React trong console
  const errors = [];
  const originalError = console.error;
  console.error = function (...args) {
    errors.push(args);
    originalError.apply(console, args);
  };

  // Kiểm tra DOM có render không
  const appRoot = document.getElementById("root");
  console.log("App root exists:", !!appRoot);
  console.log("App root content:", appRoot ? appRoot.innerHTML.length : 0);

  // Kiểm tra routing
  console.log("Current URL:", window.location.pathname);
  console.log("React Router active:", window.history?.pushState ? true : false);

  // Kiểm tra network requests
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes("manage-banking")) {
        console.log("API call detected:", entry.name, entry.responseStatus);
      }
    }
  });
  observer.observe({ entryTypes: ["resource"] });

  setTimeout(() => {
    console.log("Captured errors:", errors);
    observer.disconnect();
  }, 5000);
}, 2000);

// Kiểm tra component có trong global không
setTimeout(() => {
  console.log(
    "Window object keys (React related):",
    Object.keys(window).filter(
      (key) =>
        key.toLowerCase().includes("react") ||
        key.toLowerCase().includes("component")
    )
  );
}, 1000);
