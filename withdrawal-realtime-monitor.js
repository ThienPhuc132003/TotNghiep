/**
 * Real-time Console Monitor for Withdrawal Component Debug
 *
 * Run this script in browser console while on /admin/rut-tien page
 * to monitor component lifecycle and identify issues
 */

console.log("🚀 WITHDRAWAL COMPONENT REAL-TIME MONITOR STARTED");
console.log("=".repeat(60));

// Current page check
console.log(`📍 Current URL: ${window.location.href}`);
console.log(`📍 Current Path: ${window.location.pathname}`);

if (window.location.pathname !== "/admin/rut-tien") {
  console.log("⚠️ Not on withdrawal page. Navigate to /admin/rut-tien first");
  console.log("Direct link: http://localhost:5176/admin/rut-tien");
}

// Monitor console logs
let componentLogCount = 0;
let apiCallCount = 0;
let errorCount = 0;

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function (...args) {
  const message = args.join(" ");

  // Track component-specific logs
  if (
    message.includes("ListOfWithdrawalRequestsPage") ||
    message.includes("DEBUG:") ||
    message.includes("fetchData for withdrawal")
  ) {
    componentLogCount++;
    console.info(`🎯 COMPONENT LOG #${componentLogCount}: ${message}`);
  }

  // Track API calls
  if (
    message.includes("API Response") ||
    message.includes("Query parameters") ||
    message.includes("manage-banking")
  ) {
    apiCallCount++;
    console.info(`📡 API LOG #${apiCallCount}: ${message}`);
  }

  originalLog.apply(console, args);
};

console.error = function (...args) {
  errorCount++;
  const message = args.join(" ");
  console.info(`❌ ERROR #${errorCount}: ${message}`);
  originalError.apply(console, args);
};

console.warn = function (...args) {
  const message = args.join(" ");
  console.info(`⚠️ WARNING: ${message}`);
  originalWarn.apply(console, args);
};

// Check if React app is mounted
setTimeout(() => {
  const reactRoot =
    document.querySelector("[data-reactroot]") ||
    document.getElementById("root");
  if (reactRoot) {
    console.log("✅ React app is mounted");
    console.log("React root element:", reactRoot);
  } else {
    console.log("❌ React app not found - critical issue");
  }
}, 1000);

// Monitor network requests
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const url = args[0];
  if (typeof url === "string" && url.includes("manage-banking")) {
    console.log(`🌐 WITHDRAWAL API CALL: ${args[1]?.method || "GET"} ${url}`);
  }
  return originalFetch.apply(this, args);
};

// Status check after 3 seconds
setTimeout(() => {
  console.log("\n📊 3-SECOND STATUS REPORT");
  console.log("=".repeat(40));
  console.log(`🎯 Component logs detected: ${componentLogCount}`);
  console.log(`📡 API calls detected: ${apiCallCount}`);
  console.log(`❌ Errors detected: ${errorCount}`);

  if (componentLogCount === 0) {
    console.log("\n❌ CRITICAL ISSUE: No component logs detected");
    console.log("Possible causes:");
    console.log("1. Component not mounting at all");
    console.log("2. JavaScript error preventing component load");
    console.log("3. Route configuration issue");
    console.log("4. Import/export error");
  } else if (componentLogCount > 0 && apiCallCount === 0) {
    console.log("\n⚠️ PARTIAL ISSUE: Component loads but no API calls");
    console.log("Possible causes:");
    console.log("1. useEffect not triggering");
    console.log("2. fetchData function issue");
    console.log("3. Dependency array problem");
  } else if (componentLogCount > 0 && apiCallCount > 0) {
    console.log("\n✅ COMPONENT APPEARS TO BE WORKING");
    console.log("If page is still white, check:");
    console.log("1. JSX render logic");
    console.log("2. AdminDashboardLayout props");
    console.log("3. CSS/styling issues");
  }

  // DOM check
  const adminContent = document.querySelector(".admin-content");
  const table = document.querySelector("table");

  if (adminContent) {
    console.log("✅ Admin content container found");
  } else {
    console.log("❌ Admin content container not found");
  }

  if (table) {
    console.log("✅ Table element found");
  } else {
    console.log("❌ Table element not found");
  }
}, 3000);

// Status check after 10 seconds
setTimeout(() => {
  console.log("\n📊 10-SECOND FINAL REPORT");
  console.log("=".repeat(40));
  console.log(`🎯 Total component logs: ${componentLogCount}`);
  console.log(`📡 Total API calls: ${apiCallCount}`);
  console.log(`❌ Total errors: ${errorCount}`);

  // Check if page has content
  const bodyText = document.body.innerText.toLowerCase();
  const hasContent =
    bodyText.includes("quản lý") ||
    bodyText.includes("yêu cầu") ||
    bodyText.includes("rút tiền") ||
    bodyText.includes("withdrawal");

  if (hasContent) {
    console.log("✅ Page has withdrawal-related content");
  } else {
    console.log("❌ Page appears empty or shows different content");
  }

  // Restore original functions
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
  window.fetch = originalFetch;

  console.log("\n🔧 DEBUGGING COMPLETE - Functions restored");
  console.log(
    "Navigate to /admin/rut-tien and run this script again if needed"
  );
}, 10000);

console.log("\n🔍 Monitoring started for 10 seconds...");
console.log("Navigate to /admin/rut-tien if not already there");
console.log("Watch for component logs, API calls, and errors");
