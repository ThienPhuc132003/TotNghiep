/**
 * Debug Script for Admin Withdrawal Requests Page White Screen Issue
 */

console.log("🔍 DEBUGGING ADMIN WITHDRAWAL REQUESTS PAGE - WHITE SCREEN");
console.log("=".repeat(70));

// Function to check authentication status
function checkAdminAuthentication() {
  console.log("\n🔐 Checking Admin Authentication...");

  // Check cookies
  const getCookie = (name) => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === name) return value;
    }
    return null;
  };

  const token = getCookie("token");
  const role = getCookie("role");

  console.log(`Token exists: ${!!token}`);
  console.log(`Role: ${role}`);
  console.log(`Is admin role: ${role === "admin"}`);

  if (!token) {
    console.log("❌ No token found - User not authenticated");
    return false;
  }

  if (role !== "admin") {
    console.log("❌ Role is not 'admin' - Access denied");
    return false;
  }

  console.log("✅ Admin authentication verified");
  return true;
}

// Function to check route configuration
function checkRouteConfiguration() {
  console.log("\n🗺️ Checking Route Configuration...");

  const currentPath = window.location.pathname;
  console.log(`Current path: ${currentPath}`);
  console.log(`Expected path: /admin/rut-tien`);

  if (currentPath !== "/admin/rut-tien") {
    console.log("⚠️ Not on expected path");
    return false;
  }

  console.log("✅ On correct path");
  return true;
}

// Function to check component loading
function checkComponentLoading() {
  console.log("\n⚛️ Checking Component Loading...");

  // Check for React
  if (typeof React !== "undefined") {
    console.log("✅ React is loaded");
  } else if (window.React) {
    console.log("✅ React is loaded on window");
  } else {
    console.log("❌ React not found");
  }

  // Check for AdminDashboardLayout
  const adminContent = document.querySelector(".admin-content");
  console.log(`AdminDashboardLayout content: ${!!adminContent}`);

  // Check for component structure
  const title = document.querySelector(".admin-list-title");
  console.log(`Page title element: ${!!title}`);
  if (title) {
    console.log(`Title text: "${title.textContent}"`);
  }

  // Check for errors in console
  const errorCount = console.error._callCount || 0;
  console.log(`Console errors detected: ${errorCount > 0 ? "Yes" : "No"}`);
}

// Function to check network/API issues
function checkNetworkIssues() {
  console.log("\n🌐 Checking Network/API Issues...");

  // Check if fetch is available
  console.log(`Fetch API available: ${typeof fetch !== "undefined"}`);

  // Monitor API calls
  const originalFetch = window.fetch;
  let apiCallCount = 0;

  window.fetch = function (...args) {
    apiCallCount++;
    const url = args[0];
    console.log(`📡 API Call #${apiCallCount}: ${url}`);

    return originalFetch
      .apply(this, args)
      .then((response) => {
        console.log(
          `📊 Response for ${url}: ${response.status} ${response.statusText}`
        );
        return response;
      })
      .catch((error) => {
        console.log(`❌ Error for ${url}:`, error.message);
        throw error;
      });
  };

  // Restore after 30 seconds
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log(`📈 Total API calls monitored: ${apiCallCount}`);
  }, 30000);
}

// Function to check Redux store
function checkReduxStore() {
  console.log("\n🔧 Checking Redux Store...");

  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("✅ Redux DevTools available");
  }

  // Try to access store via window
  if (window.store) {
    const state = window.store.getState();
    console.log("Redux state:", state);
  } else {
    console.log("❌ Redux store not accessible on window.store");
  }
}

// Function to check browser console for errors
function checkConsoleErrors() {
  console.log("\n🐛 Checking Console Errors...");

  // Override console.error to catch errors
  const originalError = console.error;
  const errors = [];

  console.error = function (...args) {
    errors.push({
      timestamp: new Date().toISOString(),
      message: args.join(" "),
    });
    return originalError.apply(this, args);
  };

  // Check after 5 seconds
  setTimeout(() => {
    console.error = originalError;
    console.log(`Errors caught: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Recent errors:");
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] ${error.message}`);
      });
    }
  }, 5000);
}

// Function to check component mount status
function checkComponentMountStatus() {
  console.log("\n🎯 Checking Component Mount Status...");

  // Check for common admin page elements
  const elements = {
    AdminDashboardLayout: ".admin-content",
    "Page Title": ".admin-list-title",
    "Search Bar": ".admin-search",
    "Filter Container": ".search-bar-filter-container",
    Table: "table",
    "Loading Spinner": ".fa-spinner",
    "Error Alert": ".MuiAlert-root",
  };

  Object.entries(elements).forEach(([name, selector]) => {
    const element = document.querySelector(selector);
    console.log(`${name}: ${element ? "✅ Found" : "❌ Missing"}`);
  });
}

// Function to simulate component behavior
function simulateComponentBehavior() {
  console.log("\n🎭 Simulating Component Behavior...");

  // Try to trigger component methods if available
  const searchButton = document.querySelector(".refresh-button");
  if (searchButton) {
    console.log("Found search button, testing click...");
    try {
      searchButton.click();
      console.log("✅ Search button click successful");
    } catch (error) {
      console.log("❌ Search button click failed:", error.message);
    }
  }
}

// Main debug function
async function debugWhiteScreen() {
  console.log("🚀 Starting comprehensive debug...\n");

  const results = {
    auth: checkAdminAuthentication(),
    route: checkRouteConfiguration(),
    component: checkComponentLoading(),
    network: checkNetworkIssues(),
    redux: checkReduxStore(),
    errors: checkConsoleErrors(),
    mount: checkComponentMountStatus(),
  };

  // Wait a bit for async checks
  setTimeout(() => {
    console.log("\n📊 Debug Summary:");
    console.log("Authentication:", results.auth ? "✅ OK" : "❌ FAIL");
    console.log("Route Config:", results.route ? "✅ OK" : "❌ FAIL");

    console.log("\n🎯 Likely Causes:");
    if (!results.auth) {
      console.log("1. 🔐 Authentication issue - Admin not logged in");
      console.log("   Solution: Login as admin at /admin/login");
    }
    if (!results.route) {
      console.log("2. 🗺️ Route issue - Wrong path");
      console.log("   Solution: Navigate to /admin/rut-tien");
    }

    console.log("\n🛠️ Quick Fixes:");
    console.log("1. Check browser DevTools Console for React errors");
    console.log("2. Check Network tab for failed API calls");
    console.log("3. Verify admin login status");
    console.log("4. Clear browser cache and reload");
    console.log("5. Check if component imports are correct");

    console.log("\n🔄 Next Steps:");
    console.log("Run: simulateComponentBehavior() to test interactions");
    console.log("Run: checkComponentMountStatus() to check DOM elements");
  }, 2000);

  return results;
}

// Auto-run debug when script loads
debugWhiteScreen();

// Export functions for manual testing
window.debugAdminWithdrawal = {
  checkAuth: checkAdminAuthentication,
  checkRoute: checkRouteConfiguration,
  checkComponent: checkComponentLoading,
  checkNetwork: checkNetworkIssues,
  checkRedux: checkReduxStore,
  checkMount: checkComponentMountStatus,
  simulate: simulateComponentBehavior,
  fullDebug: debugWhiteScreen,
};

console.log("\n💡 Manual Debug Commands Available:");
console.log("- debugAdminWithdrawal.checkAuth()");
console.log("- debugAdminWithdrawal.checkComponent()");
console.log("- debugAdminWithdrawal.checkMount()");
console.log("- debugAdminWithdrawal.fullDebug()");
