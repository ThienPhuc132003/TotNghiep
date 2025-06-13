// Debug script for TutorClassroomPage white screen issue
console.log("🔍 Debugging TutorClassroomPage white screen issue...");

// Function to check for basic React errors
function checkReactErrors() {
  console.log("📋 Checking for React component errors...");

  // Check if React is loaded
  if (typeof React === "undefined") {
    console.error("❌ React is not loaded!");
    return false;
  }

  // Check for console errors
  const originalError = console.error;
  let hasErrors = false;

  console.error = function (...args) {
    hasErrors = true;
    console.log("🚨 Console Error Detected:", args);
    originalError.apply(console, args);
  };

  setTimeout(() => {
    console.error = originalError;
    if (!hasErrors) {
      console.log("✅ No immediate console errors detected");
    }
  }, 3000);

  return true;
}

// Function to check if user is logged in and has proper role
function checkUserAuth() {
  console.log("👤 Checking user authentication...");

  try {
    // Check Redux store
    const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__.getState()
      : null;

    if (reduxState && reduxState.user) {
      console.log("✅ Redux user state:", reduxState.user);

      // Check if user has tutor role
      if (reduxState.user.userProfile?.role === "TUTOR") {
        console.log("✅ User has TUTOR role");
        return true;
      } else {
        console.warn(
          "⚠️ User does not have TUTOR role:",
          reduxState.user.userProfile?.role
        );
        return false;
      }
    } else {
      console.warn("⚠️ No Redux user state found");
      return false;
    }
  } catch (error) {
    console.error("❌ Error checking user auth:", error);
    return false;
  }
}

// Function to check API connectivity
async function checkAPIConnectivity() {
  console.log("🌐 Checking API connectivity...");

  try {
    // Try to access the API endpoint
    const response = await fetch(
      "/api/classroom/search-for-tutor?page=1&rpp=2",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📡 API Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", data);
      return true;
    } else {
      console.warn(
        "⚠️ API Response not OK:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ API Connectivity Error:", error);
    return false;
  }
}

// Function to check CSS loading
function checkCSSLoading() {
  console.log("🎨 Checking CSS loading...");

  const stylesheets = Array.from(document.styleSheets);
  const tutorClassroomCSS = stylesheets.find(
    (sheet) => sheet.href && sheet.href.includes("TutorClassroomPage.style.css")
  );

  if (tutorClassroomCSS) {
    console.log("✅ TutorClassroomPage CSS loaded");
    return true;
  } else {
    console.warn("⚠️ TutorClassroomPage CSS not found");
    return false;
  }
}

// Function to check for JavaScript errors in the component
function checkComponentErrors() {
  console.log("🔧 Checking for component-specific errors...");

  // Look for specific error patterns
  const errorPatterns = [
    "calculateClassProgress",
    "parseDateTimeLearn",
    "statusLabels",
    "getSafeAvatarUrl",
    "handleAvatarError",
  ];

  errorPatterns.forEach((pattern) => {
    try {
      if (typeof window[pattern] === "undefined") {
        console.log(
          `📝 Function ${pattern} might be missing from global scope (this is usually OK)`
        );
      }
    } catch (error) {
      console.warn(`⚠️ Error checking ${pattern}:`, error);
    }
  });
}

// Function to check route protection
function checkRouteProtection() {
  console.log("🛡️ Checking route protection...");

  // Check if on correct path
  const currentPath = window.location.pathname;
  const expectedPath = "/tai-khoan/ho-so/quan-ly-lop-hoc";

  if (currentPath === expectedPath) {
    console.log("✅ On correct path:", currentPath);
    return true;
  } else {
    console.warn(
      "⚠️ Not on expected path. Current:",
      currentPath,
      "Expected:",
      expectedPath
    );
    return false;
  }
}

// Main debug function
async function debugTutorClassroomPage() {
  console.log("🚀 Starting TutorClassroomPage debug...");
  console.log("=" * 50);

  const checks = {
    react: checkReactErrors(),
    css: checkCSSLoading(),
    route: checkRouteProtection(),
    auth: checkUserAuth(),
    component: checkComponentErrors(),
  };

  // API check (async)
  checks.api = await checkAPIConnectivity();

  console.log("=" * 50);
  console.log("📊 Debug Summary:");
  console.table(checks);

  // Provide recommendations
  console.log("🔧 Recommendations:");

  if (!checks.react) {
    console.log("❌ Fix React loading issues first");
  }

  if (!checks.auth) {
    console.log("❌ Check user authentication and role");
  }

  if (!checks.api) {
    console.log("❌ Check API connectivity and token");
  }

  if (!checks.css) {
    console.log("❌ Check CSS loading");
  }

  if (!checks.route) {
    console.log("❌ Navigate to correct route");
  }

  const allChecksPass = Object.values(checks).every((check) => check === true);

  if (allChecksPass) {
    console.log(
      "✅ All checks pass! The white screen might be due to data loading or component rendering logic."
    );
    console.log(
      "💡 Try refreshing the page or checking the Network tab for failed requests."
    );
  } else {
    console.log("❌ Some checks failed. Fix the issues above and try again.");
  }

  return checks;
}

// Auto-run debug if on the problematic page
if (window.location.pathname === "/tai-khoan/ho-so/quan-ly-lop-hoc") {
  console.log("🎯 Auto-detected TutorClassroomPage, running debug...");
  debugTutorClassroomPage();
} else {
  console.log(
    "📍 Not on TutorClassroomPage. Navigate to /tai-khoan/ho-so/quan-ly-lop-hoc first, then run debugTutorClassroomPage()"
  );
}

// Export for manual use
window.debugTutorClassroomPage = debugTutorClassroomPage;
console.log("💡 You can also manually run: debugTutorClassroomPage()");
