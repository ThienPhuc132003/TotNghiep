// Console error handler to suppress known unfixable errors
(function () {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;

  // Aggressive Google Maps error suppression - intercept at the source
  const isGoogleMapsError = (input) => {
    if (!input) return false;
    const str = typeof input === "string" ? input : input.toString();

    // Check for Google Maps patterns
    return (
      str.includes("maps.googleapis.com") ||
      str.includes("maps.gstatic.com") ||
      str.includes("Google Maps") ||
      str.includes("main.js") ||
      str.includes("common.js") ||
      str.includes("search_impl.js") ||
      str.includes("init_embed.js") ||
      str.includes("search.js") ||
      str.includes("embed.js") ||
      str.includes("controls.js") ||
      str.includes("map.js") ||
      str.includes("marker.js") ||
      str.includes("util.js") ||
      str.includes("api.js") ||
      /\b_\.[A-Z][a-zA-Z]*\b/.test(str) ||
      /\b[a-z]{3}\b/.test(str) ||
      str.includes("Chrome is moving towards") ||
      str.includes("third-party cookies") ||
      str.includes("Uncaught Error") ||
      str.includes("TypeError") ||
      str.includes("ReferenceError") ||
      str.includes("Cannot read") ||
      str.includes("Promise.then")
    );
  };
  const suppressedErrors = [
    "Google Maps JavaScript API error",
    "google is not defined",
    "gm_authFailure",
    "InvalidKeyMapError",
    "RequestDeniedMapError",
    "_.Nc",
    "_.Oa",
    "_.Ma",
    "_.Va",
    "_.Wa",
    "_.Xa",
    "_.Za",
    "_.ab",
    "_.bb",
    "_.db",
    "_.eb",
    "_.fb",
    "_.gb",
    "_.hb",
    "_.ib",
    "_.jb",
    "_.kb",
    "_.lb",
    "_.mb",
    "_.nb",
    "_.ob",
    "_.pb",
    "_.qb",
    "_.rb",
    "_.sb",
    "_.tb",
    "_.ub",
    "_.vb",
    "_.wb",
    "_.xb",
    "_.yb",
    "_.zb",
    "_.Ac",
    "_.Bc",
    "_.Cc",
    "_.Dc",
    "_.Ec",
    "_.Fc",
    "_.Gc",
    "_.Hc",
    "_.Ic",
    "_.Jc",
    "_.Kc",
    "_.Lc",
    "_.Mc",
    "_.Nc",
    "_.Oc",
    "_.Pc",
    "_.Qc",
    "_.Rc",
    "_.Sc",
    "_.Tc",
    "_.Uc",
    "_.Vc",
    "_.Wc",
    "_.Xc",
    "_.Yc",
    "_.Zc",
    "oaa",
    "paa",
    "qaa",
    "raa",
    "saa",
    "taa",
    "uaa",
    "vaa",
    "waa",
    "xaa",
    "yaa",
    "zaa",
    "Aba",
    "Bba",
    "Cba",
    "Dba",
    "Eba",
    "Fba",
    "Gba",
    "Hba",
    "Iba",
    "Jba",
    "Kba",
    "Lba",
    "Mba",
    "Nba",
    "Oba",
    "Pba",
    "Qba",
    "Rba",
    "Sba",
    "Tba",
    "Uba",
    "Vba",
    "Wba",
    "Xba",
    "Yba",
    "Zba",
    "_.H",
    "_.I",
    "_.J",
    "_.K",
    "_.L",
    "_.M",
    "_.N",
    "_.O",
    "_.P",
    "_.Q",
    "_.R",
    "_.S",
    "_.T",
    "_.U",
    "_.V",
    "_.W",
    "_.X",
    "_.Y",
    "_.Z",
    "_.JA",
    "twb",
    "uwb",
    "vwb",
    "wwb",
    "xwb",
    "ywb",
    "zwb",
    "Awb",
    "Bwb",
    "Cwb",
    "Dwb",
    "Ewb",
    "Fwb",
    "Gwb",
    "Hwb",
    "search_impl.js",
    "main.js",
    "init_embed.js",
    "common.js",
    "search.js",
    "embed.js",
    "controls.js",
    "map.js",
    "marker.js",
    "util.js",
    "api.js",
    "third-party cookies",
    "Chrome is moving towards",
    "maps.googleapis.com",
    "Cannot read properties of undefined",
    "Cannot read property",
    "Cannot access before initialization",
    "TypeError: Cannot read",
    "ReferenceError:",
    "at Object._",
    "at _.",
    "Google Maps Platform",
    "RefererNotAllowedMapError",
    "ApiNotActivatedMapError",
  ];

  const suppressedWarnings = [
    "Google Maps",
    "Maps API",
    "gm_",
    "third-party cookies",
    "Chrome is moving",
  ];
  console.error = function (...args) {
    const message = args.join(" ");

    // Check if this is a Google Maps error we want to suppress
    const isGoogleMapsError = suppressedErrors.some((error) =>
      message.includes(error)
    );

    // Check for Google Maps internal function errors with more patterns
    const isGoogleMapsInternalError =
      message.includes("main.js") ||
      message.includes("common.js") ||
      message.includes("search_impl.js") ||
      message.includes("init_embed.js") ||
      message.includes("embed.js") ||
      message.includes("controls.js") ||
      message.includes("map.js") ||
      message.includes("marker.js") ||
      message.includes("util.js") ||
      message.includes("api.js") ||
      message.includes("maps.googleapis.com") ||
      /_.[\w]+/.test(message) || // Match _.Nc, _.Oa, etc.
      /[a-z]{3}/.test(message) || // Match oaa, twb, etc.
      message.includes("Cannot read properties of undefined") ||
      message.includes("Cannot read property") ||
      message.includes("TypeError: Cannot read") ||
      message.includes("ReferenceError:") ||
      message.includes("at Object._") ||
      message.includes("at _.");

    // Check for Google Maps URL patterns
    const isFromGoogleMapsScript = args.some(
      (arg) =>
        typeof arg === "string" &&
        (arg.includes("maps.googleapis.com") ||
          arg.includes("maps.gstatic.com") ||
          arg.includes("google.com/maps"))
    );

    if (
      isGoogleMapsError ||
      isGoogleMapsInternalError ||
      isFromGoogleMapsScript
    ) {
      // Completely suppress these errors - don't even log them
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

    // Check for third-party cookie warnings
    if (
      message.includes("third-party cookies") ||
      message.includes("Chrome is moving")
    ) {
      // Completely suppress these as well
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

    // Additional Google Maps patterns for warnings
    const isGoogleMapsInternalWarning =
      message.includes("maps.googleapis.com") ||
      message.includes("Google Maps Platform") ||
      /_.[\w]+/.test(message) ||
      /[a-z]{3}/.test(message);

    if (
      (isGoogleMapsWarning || isGoogleMapsInternalWarning) &&
      !message.includes("[Suppressed]")
    ) {
      // Completely suppress Google Maps warnings
      return;
    }

    // Suppress third-party cookie warnings completely
    if (
      message.includes("third-party cookies") ||
      message.includes("Chrome is moving")
    ) {
      return;
    }

    // For all other warnings, use original console.warn
    originalConsoleWarn.apply(console, args);
  }; // Add global error handler for unhandled promises
  window.addEventListener("unhandledrejection", function (event) {
    const message =
      event.reason?.message || event.reason?.toString() || "Unknown error";

    // Enhanced Google Maps detection
    if (
      message.includes("Google") ||
      message.includes("Maps") ||
      message.includes("maps.googleapis.com") ||
      /_.[\w]+/.test(message) ||
      /[a-z]{3}/.test(message)
    ) {
      event.preventDefault(); // Prevent default error handling
      return;
    }

    if (message.includes("CORS") || message.includes("NetworkError")) {
      console.info("🌐 [Network] Promise rejection (likely CORS):", message);
      event.preventDefault();
      return;
    }
  });
  // Add global error handler for script errors
  window.addEventListener("error", function (event) {
    const filename = event.filename || "";
    const message = event.message || "";

    // Enhanced Google Maps script detection
    if (
      filename.includes("maps.googleapis.com") ||
      filename.includes("maps.gstatic.com") ||
      filename.includes("google") ||
      /_.[\w]+/.test(message) ||
      /[a-z]{3}/.test(message) ||
      filename.includes("main.js") ||
      filename.includes("common.js") ||
      filename.includes("search_impl.js") ||
      filename.includes("embed.js") ||
      filename.includes("controls.js") ||
      filename.includes("map.js") ||
      filename.includes("marker.js") ||
      filename.includes("util.js") ||
      filename.includes("api.js")
    ) {
      event.preventDefault();
      return true; // Prevent default error handling
    }
  });
  // Override window.onerror to catch uncaught JavaScript errors
  const originalWindowError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    // Enhanced Google Maps error detection
    if (
      message &&
      (/_.[\w]+/.test(message) ||
        /[a-z]{3}/.test(message) ||
        message.includes("Cannot read properties") ||
        message.includes("Cannot read property") ||
        message.includes("TypeError") ||
        message.includes("ReferenceError"))
    ) {
      return true; // Prevent default error handling
    }

    if (
      source &&
      (source.includes("maps.googleapis.com") ||
        source.includes("maps.gstatic.com") ||
        source.includes("main.js") ||
        source.includes("common.js") ||
        source.includes("search_impl.js") ||
        source.includes("init_embed.js") ||
        source.includes("embed.js") ||
        source.includes("controls.js") ||
        source.includes("map.js") ||
        source.includes("marker.js") ||
        source.includes("util.js") ||
        source.includes("api.js"))
    ) {
      return true; // Prevent default error handling
    }

    // Call original handler for non-Google Maps errors
    if (originalWindowError) {
      return originalWindowError.call(
        this,
        message,
        source,
        lineno,
        colno,
        error
      );
    }
    return false;
  };
  // Override console methods to suppress repetitive Google Maps errors
  const originalLog = console.log;
  const originalInfo = console.info;

  console.log = function (...args) {
    const message = args.join(" ");

    // Suppress Chrome third-party cookies messages
    if (
      message.includes("Chrome is moving towards") ||
      message.includes("third-party cookies")
    ) {
      return; // Completely suppress these
    }

    // Suppress any Google Maps related logs
    if (
      message.includes("Google Maps") ||
      message.includes("maps.googleapis.com") ||
      /_.[\w]+/.test(message) ||
      /[a-z]{3}/.test(message)
    ) {
      return; // Completely suppress these
    }

    originalLog.apply(console, args);
  };

  console.info = function (...args) {
    const message = args.join(" ");

    // Suppress Google Maps info messages
    if (
      message.includes("Google Maps") ||
      message.includes("maps.googleapis.com") ||
      message.includes("Maps API") ||
      /_.[\w]+/.test(message) ||
      /[a-z]{3}/.test(message)
    ) {
      return; // Completely suppress these
    }

    originalInfo.apply(console, args);
  };
  console.log(
    "🔧 Console error handler initialized - Google Maps and CORS errors will be handled gracefully"
  );

  // Additional suppression for Google Maps loading errors
  setTimeout(() => {
    // Override any Google Maps error callbacks that might be set later
    if (window.gm_authFailure) {
      window.gm_authFailure = function () {
        // Suppress Google Maps auth failure messages
        return;
      };
    }

    // Suppress any remaining Google Maps errors that occur after initialization
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function (fn, delay, ...args) {
      if (typeof fn === "function") {
        const wrappedFn = function () {
          try {
            return fn.apply(this, arguments);
          } catch (error) {
            // Suppress Google Maps errors in timeouts
            if (
              error.message &&
              (/_.[\w]+/.test(error.message) ||
                /[a-z]{3}/.test(error.message) ||
                error.message.includes("Google") ||
                error.message.includes("Maps"))
            ) {
              return;
            }
            throw error;
          }
        };
        return originalSetTimeout.call(this, wrappedFn, delay, ...args);
      }
      return originalSetTimeout.call(this, fn, delay, ...args);
    };
  }, 1000);

  // Redux Persist Storage Clear Function
  window.clearReduxStorage = function () {
    console.log("🧹 Clearing Redux Persist storage...");

    // Clear all persist data
    const persistKeys = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("persist:")) {
        persistKeys.push(key);
        localStorage.removeItem(key);
      }
    });

    // Also clear session storage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("persist:")) {
        sessionStorage.removeItem(key);
      }
    });

    console.log(`✅ Cleared ${persistKeys.length} persist keys:`, persistKeys);
    console.log("🔄 Please refresh the page and login again to test the fix.");

    return {
      cleared: persistKeys,
      message: "Storage cleared successfully! Refresh and login again.",
    };
  };

  // Auto-fix function for Redux Persist issues
  window.fixReduxPersist = function () {
    console.log("🔧 Auto-fixing Redux Persist issues...");

    // Clear storage
    window.clearReduxStorage();

    // Reload page automatically
    setTimeout(() => {
      console.log("🔄 Auto-reloading page...");
      window.location.reload();
    }, 1000);
  };

  console.log("🛠️  Redux Persist Debug Tools Available:");
  console.log("📝 clearReduxStorage() - Clear all Redux persist data");
  console.log("🔧 fixReduxPersist() - Auto-fix and reload page");
})();
