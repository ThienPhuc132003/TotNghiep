// Enhanced white screen debugging script
(function () {
  console.log("🔍 Enhanced White Screen Debugging Started");
  console.log("Time:", new Date().toLocaleString());
  console.log("URL:", window.location.href);

  let checkCount = 0;
  const maxChecks = 15;

  // Store initial state
  const initialState = {
    bodyHTML: document.body.innerHTML,
    rootHTML: document.getElementById("root")?.innerHTML || "",
    timestamp: Date.now(),
  };

  console.log("📊 Initial State:", {
    bodyLength: initialState.bodyHTML.length,
    rootLength: initialState.rootHTML.length,
    hasContent: initialState.rootHTML.length > 100,
  });

  // Enhanced error monitoring
  const originalError = console.error;
  console.error = function (...args) {
    console.log("🚨 CONSOLE ERROR DETECTED:", args);
    console.log("Stack trace:", new Error().stack);
    originalError.apply(console, args);
  };

  // Monitor React errors
  window.addEventListener("error", (event) => {
    console.log("🚨 JAVASCRIPT ERROR:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    });
  });

  // Monitor unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.log("🚨 UNHANDLED PROMISE REJECTION:", {
      reason: event.reason,
      stack: event.reason?.stack,
    });
  });

  // Monitor for specific React errors
  const originalConsoleWarn = console.warn;
  console.warn = function (...args) {
    if (args.some((arg) => typeof arg === "string" && arg.includes("React"))) {
      console.log("⚠️ REACT WARNING:", args);
    }
    originalConsoleWarn.apply(console, args);
  };

  // Check for Redux state
  const checkReduxState = () => {
    try {
      if (window.__store__) {
        const state = window.__store__.getState();
        console.log("🔧 Redux Store State:", {
          user: {
            isAuthenticated: state.user?.isAuthenticated,
            profileExists: !!state.user?.userProfile,
            userId: state.user?.userProfile?.id,
          },
        });
      } else {
        console.log("❌ Redux store not found on window.__store__");
      }
    } catch (error) {
      console.log("❌ Error checking Redux state:", error);
    }
  };

  // Monitor DOM changes with detailed logging
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const target = mutation.target;
        console.log("📝 DOM MUTATION:", {
          type: mutation.type,
          target: target.tagName || target.nodeName,
          added: mutation.addedNodes.length,
          removed: mutation.removedNodes.length,
          targetId: target.id,
          targetClass: target.className,
        });

        // Check if content was removed (white screen)
        if (mutation.removedNodes.length > 0 && target.id === "root") {
          console.log("🚨 CONTENT REMOVED FROM ROOT:", {
            removedNodes: Array.from(mutation.removedNodes).map((node) => ({
              nodeType: node.nodeType,
              nodeName: node.nodeName,
              textContent: node.textContent?.substring(0, 100),
            })),
          });
        }
      }
    });
  });

  // Start observing
  const targetNode = document.getElementById("root") || document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
  });

  // Periodic checks
  const intervalId = setInterval(() => {
    checkCount++;
    const currentState = {
      bodyHTML: document.body.innerHTML,
      rootHTML: document.getElementById("root")?.innerHTML || "",
      timestamp: Date.now(),
    };

    const contentLost =
      initialState.rootHTML.length > 100 && currentState.rootHTML.length < 100;

    console.log(`⏱️ Check #${checkCount}/${maxChecks}:`, {
      timestamp: new Date().toLocaleString(),
      bodyLength: currentState.bodyHTML.length,
      rootLength: currentState.rootHTML.length,
      contentLost: contentLost,
      timeSinceStart: currentState.timestamp - initialState.timestamp + "ms",
    });

    if (contentLost) {
      console.log("🚨 WHITE SCREEN DETECTED! Content was lost between checks");
      console.log("📊 Before:", {
        length: initialState.rootHTML.length,
        preview: initialState.rootHTML.substring(0, 200),
      });
      console.log("📊 After:", {
        length: currentState.rootHTML.length,
        preview: currentState.rootHTML.substring(0, 200),
      });

      checkReduxState();
    }

    // Check Redux state every 5 checks
    if (checkCount % 5 === 0) {
      checkReduxState();
    }

    if (checkCount >= maxChecks) {
      clearInterval(intervalId);
      observer.disconnect();
      console.log("✅ Enhanced debugging completed");

      // Final state report
      console.log("📋 FINAL REPORT:", {
        initialContentLength: initialState.rootHTML.length,
        finalContentLength: currentState.rootHTML.length,
        contentWasLost:
          initialState.rootHTML.length > 100 &&
          currentState.rootHTML.length < 100,
        totalDuration: currentState.timestamp - initialState.timestamp + "ms",
      });
    }
  }, 1000);

  console.log(
    "👀 Enhanced monitoring started. Check console for detailed logs..."
  );
})();
