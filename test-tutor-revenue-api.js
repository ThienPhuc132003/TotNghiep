// Test TutorRevenueStatistics API endpoint
console.log("🔥 Testing TutorRevenueStatistics API endpoint...");

// Check if we're in browser environment
if (typeof window !== "undefined") {
  // Test API call
  const testAPICall = async () => {
    try {
      console.log("🔥 Current URL:", window.location.href);
      console.log("🔥 Cookies:", document.cookie);

      // Check if the component is mounted
      const componentExists = document.querySelector(
        ".list-of-admin-container"
      );
      console.log("🔥 Component container exists:", !!componentExists);

      // Check for any console errors
      const originalError = console.error;
      const errors = [];
      console.error = (...args) => {
        errors.push(args);
        originalError.apply(console, args);
      };

      // Wait a bit and check for errors
      setTimeout(() => {
        console.log("🔥 Collected errors:", errors);
        console.error = originalError;
      }, 3000);

      // Check if data is loading
      const loadingElement =
        document.querySelector(".loading") ||
        document.querySelector('[data-testid="loading"]');
      console.log("🔥 Loading element exists:", !!loadingElement);

      // Check if table exists
      setTimeout(() => {
        const tableElement =
          document.querySelector("table") ||
          document.querySelector(".table-container");
        console.log("🔥 Table element exists:", !!tableElement);

        // Check for error messages
        const errorElement =
          document.querySelector(".MuiAlert-root") ||
          document.querySelector(".error-message");
        console.log("🔥 Error element exists:", !!errorElement);
        if (errorElement) {
          console.log("🔥 Error message:", errorElement.textContent);
        }

        // Check network requests
        console.log("🔥 Checking network requests in dev tools...");
      }, 5000);
    } catch (error) {
      console.error("🔥 Test error:", error);
    }
  };

  // Run test after page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", testAPICall);
  } else {
    testAPICall();
  }
} else {
  console.log("🔥 Not in browser environment");
}
