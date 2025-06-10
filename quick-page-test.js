// Quick test to check if the debug component is working
setTimeout(() => {
  console.log("🔧 Checking page status after 3 seconds...");

  const currentUrl = window.location.href;
  console.log("Current URL:", currentUrl);

  // Check if we're on the right page
  if (currentUrl.includes("thong-ke-doanh-thu")) {
    console.log("✅ On the revenue statistics page");

    // Check if debug component is rendered
    const h1 = document.querySelector("h1");
    if (h1 && h1.textContent.includes("Debug: Tutor Revenue Statistics")) {
      console.log("✅ Debug component rendered successfully!");

      // Check authentication display
      const authStatus = document.querySelector("h3");
      if (authStatus) {
        console.log("Auth status:", authStatus.textContent);
      }

      // Check if API test button exists
      const testButton = document.querySelector("button");
      if (testButton) {
        console.log("✅ API test button found");

        // Auto-click the test button if user is authenticated
        const isAuthenticated =
          authStatus && authStatus.textContent.includes("Authenticated");
        if (isAuthenticated) {
          console.log("🧪 Auto-testing API...");
          testButton.click();
        }
      }
    } else {
      console.log("❌ Debug component not rendered");

      // Check for error messages
      const bodyText = document.body.textContent || document.body.innerText;
      if (bodyText.includes("500")) {
        console.log("❌ 500 Server Error detected");
      } else if (bodyText.includes("404")) {
        console.log("❌ 404 Not Found detected");
      } else if (bodyText.includes("Loading")) {
        console.log("⏳ Page is still loading");
      } else {
        console.log("❓ Unknown page state");
        console.log("Page content preview:", bodyText.substring(0, 200));
      }
    }
  } else {
    console.log("❌ Not on the revenue statistics page");
  }

  // Check for JavaScript errors
  const errors = window.jsErrors || [];
  if (errors.length > 0) {
    console.log("🚨 JavaScript errors detected:", errors);
  } else {
    console.log("✅ No JavaScript errors detected");
  }
}, 3000);

// Capture JavaScript errors
window.jsErrors = [];
window.addEventListener("error", (event) => {
  window.jsErrors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    error: event.error,
  });
  console.error("🚨 JavaScript Error:", event.error);
});

console.log(
  "🔧 Page test script loaded - waiting 3 seconds for page to load..."
);
