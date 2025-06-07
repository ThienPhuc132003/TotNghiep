// Student Navigation Issue Debug Tool
console.log("🐛 Student Navigation Issue Debugger");

// Function to monitor React Router navigation
function monitorReactRouter() {
  // Try to access React Router hooks if available
  if (window.React && window.ReactRouterDOM) {
    console.log("✅ React Router detected");
  } else {
    console.log("⚠️ React Router not directly accessible");
  }

  // Monitor URL changes
  let currentURL = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentURL) {
      console.log(`🔄 URL Changed: ${currentURL} → ${window.location.href}`);
      currentURL = window.location.href;

      // Check if redirected to homepage
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "/home"
      ) {
        console.log("🚨 DETECTED HOMEPAGE REDIRECT!");
        console.log("This might be the student redirect issue");
      }
    }
  });

  observer.observe(document, { childList: true, subtree: true });
}

// Function to test student meeting join flow
function testStudentMeetingJoin() {
  console.log("\n👨‍🎓 Testing Student Meeting Join Flow");

  // Look for student-specific elements
  const studentElements = {
    enterButtons: document.querySelectorAll(
      '.scp-enter-btn, button:contains("Vào lớp học")'
    ),
    modals: document.querySelectorAll(
      ".scp-modal-overlay, .scp-meeting-list-modal"
    ),
    joinButtons: document.querySelectorAll(
      '.scp-btn-join, button:contains("Tham gia")'
    ),
  };

  console.log("Student elements found:");
  console.log("- Enter buttons:", studentElements.enterButtons.length);
  console.log("- Modals:", studentElements.modals.length);
  console.log("- Join buttons:", studentElements.joinButtons.length);

  // Add event listeners to track clicks
  studentElements.enterButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      console.log(`📍 Student clicked "Vào lớp học" button ${i + 1}`);

      // Check after a short delay for modal opening
      setTimeout(() => {
        const modal = document.querySelector(".scp-modal-overlay");
        if (modal) {
          console.log("✅ Modal opened successfully");

          // Look for join buttons in modal
          const joinBtns = modal.querySelectorAll(".scp-btn-join");
          console.log(`Found ${joinBtns.length} join buttons in modal`);

          joinBtns.forEach((joinBtn, j) => {
            joinBtn.addEventListener("click", () => {
              console.log(`📍 Student clicked "Tham gia" button ${j + 1}`);
              console.log("Monitoring for navigation...");

              // Monitor for potential redirect
              setTimeout(() => {
                const currentPath = window.location.pathname;
                console.log("After join click, current path:", currentPath);

                if (currentPath === "/") {
                  console.log("🚨 HOMEPAGE REDIRECT DETECTED!");
                } else if (currentPath.includes("phong-hop-zoom")) {
                  console.log("✅ Successfully navigated to meeting room");
                } else {
                  console.log("❓ Unexpected navigation path:", currentPath);
                }
              }, 1000);
            });
          });
        } else {
          console.log("❌ Modal did not open");
        }
      }, 500);
    });
  });
}

// Function to check for authentication/role issues
function checkAuthenticationState() {
  console.log("\n🔑 Checking Authentication State");

  // Check localStorage for tokens
  const tokens = {
    userToken: localStorage.getItem("accessToken"),
    zoomToken: localStorage.getItem("zoomAccessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };

  console.log("Tokens present:");
  console.log("- User token:", !!tokens.userToken);
  console.log("- Zoom token:", !!tokens.zoomToken);
  console.log("- Refresh token:", !!tokens.refreshToken);

  // Check Redux store if available
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("Redux DevTools available");
  }

  // Check for user profile in localStorage or sessionStorage
  const userProfile =
    localStorage.getItem("userProfile") ||
    sessionStorage.getItem("userProfile");
  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      console.log("User profile found:", {
        userId: profile.userId,
        role: profile.role,
        type: profile.userType,
      });
    } catch (e) {
      console.log("User profile exists but couldn't parse");
    }
  } else {
    console.log("❌ No user profile found");
  }
}

// Function to intercept fetch requests
function interceptAPIRequests() {
  console.log("\n🌐 Setting up API Request Interceptor");

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    const options = args[1] || {};

    if (
      typeof url === "string" &&
      (url.includes("/meeting/") || url.includes("api"))
    ) {
      console.log(`📡 API Request: ${options.method || "GET"} ${url}`);

      if (options.headers) {
        console.log("Headers:", options.headers);
      }
    }

    return originalFetch
      .apply(this, args)
      .then((response) => {
        if (typeof url === "string" && url.includes("/meeting/")) {
          console.log(`📡 API Response: ${response.status} for ${url}`);

          if (!response.ok) {
            console.log("❌ API Error detected");
          }
        }
        return response;
      })
      .catch((error) => {
        if (typeof url === "string" && url.includes("/meeting/")) {
          console.log(`🚨 API Error: ${error.message} for ${url}`);
        }
        throw error;
      });
  };
}

// Function to check for React errors
function checkReactErrors() {
  console.log("\n⚛️ Setting up React Error Monitoring");

  // Override console.error to catch React errors
  const originalError = console.error;
  console.error = function (...args) {
    const message = args[0];
    if (typeof message === "string") {
      if (message.includes("Warning") || message.includes("Error")) {
        console.log("🚨 React Error/Warning:", message);
      }
      if (message.includes("navigate") || message.includes("router")) {
        console.log("🔄 Navigation related error:", message);
      }
    }
    return originalError.apply(console, args);
  };

  // Listen for unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.log("🚨 Unhandled Promise Rejection:", event.reason);
  });
}

// Initialize all monitoring
function initDebugger() {
  console.log("\n🚀 Initializing Student Navigation Debugger");

  monitorReactRouter();
  checkAuthenticationState();
  interceptAPIRequests();
  checkReactErrors();

  // Wait a bit then test
  setTimeout(() => {
    testStudentMeetingJoin();
  }, 1000);
}

// Start debugging
initDebugger();

// Export functions for manual use
window.studentDebug = {
  testStudentMeetingJoin,
  checkAuthenticationState,
  monitorReactRouter,
};

console.log("\n💡 Available debug functions:");
console.log("- studentDebug.testStudentMeetingJoin()");
console.log("- studentDebug.checkAuthenticationState()");
console.log("- studentDebug.monitorReactRouter()");
