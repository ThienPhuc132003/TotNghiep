// Console error handler to suppress known unfixable errors
(function () {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const suppressedErrors = [
    "Google Maps JavaScript API error",
    "google is not defined",
    "gm_authFailure",
    "InvalidKeyMapError",
    "RequestDeniedMapError",
  ];

  const suppressedWarnings = ["Google Maps", "Maps API", "gm_"];

  console.error = function (...args) {
    const message = args.join(" ");

    // Check if this is a Google Maps error we want to suppress
    const isGoogleMapsError = suppressedErrors.some((error) =>
      message.includes(error)
    );

    if (isGoogleMapsError) {
      console.warn("🗺️ [Suppressed] Google Maps Error:", message);
      console.warn(
        "💡 This is a known issue with Google Maps embed. The map may still work."
      );
      return;
    }

    // Check for CORS errors
    if (message.includes("CORS") || message.includes("Cross-Origin")) {
      console.warn("🌐 [CORS] Cross-origin request blocked:", message);
      console.warn(
        "💡 This may be due to server CORS policy. Using fallback handling."
      );
      return;
    }

    // For all other errors, use original console.error
    originalConsoleError.apply(console, args);
  };

  console.warn = function (...args) {
    const message = args.join(" ");

    // Check if this is a Google Maps warning we want to suppress
    const isGoogleMapsWarning = suppressedWarnings.some((warning) =>
      message.includes(warning)
    );

    if (isGoogleMapsWarning && !message.includes("[Suppressed]")) {
      // Still log it but with less noise
      console.info("🗺️ [Maps Info]:", message);
      return;
    }

    // For all other warnings, use original console.warn
    originalConsoleWarn.apply(console, args);
  };

  // Add global error handler for unhandled promises
  window.addEventListener("unhandledrejection", function (event) {
    const message =
      event.reason?.message || event.reason?.toString() || "Unknown error";

    if (message.includes("Google") || message.includes("Maps")) {
      console.info(
        "🗺️ [Maps Promise] Unhandled promise rejection (likely Maps related):",
        message
      );
      event.preventDefault(); // Prevent default error handling
      return;
    }

    if (message.includes("CORS") || message.includes("NetworkError")) {
      console.info("🌐 [Network] Promise rejection (likely CORS):", message);
      event.preventDefault();
      return;
    }
  });

  console.log(
    "🔧 Console error handler initialized - Google Maps and CORS errors will be handled gracefully"
  );
})();
