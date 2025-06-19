/**
 * Debug script to check if ListOfWithdrawalRequests component is mounting properly
 * Run this in browser console when on /admin/rut-tien page
 */

console.log("🔍 WITHDRAWAL MOUNTING DEBUG SCRIPT");
console.log("=".repeat(50));

// 1. Check current path
const currentPath = window.location.pathname;
console.log("1. Current path:", currentPath);
console.log("   Expected path: /admin/rut-tien");

if (currentPath !== "/admin/rut-tien") {
  console.warn("❌ Wrong path! Expected /admin/rut-tien");
  console.log("   Solution: Navigate to /admin/rut-tien");
} else {
  console.log("✅ Correct path");
}

// 2. Check if component debug logs are appearing
console.log("\n2. Looking for component debug logs...");
const originalLog = console.log;
let componentLogs = [];

console.log = function (...args) {
  const message = args.join(" ");
  if (
    message.includes("ListOfWithdrawalRequestsPage") ||
    message.includes("🔍 DEBUG:")
  ) {
    componentLogs.push(message);
    console.warn("📊 COMPONENT LOG DETECTED:", message);
  }
  return originalLog.apply(console, args);
};

// Restore console.log after 5 seconds
setTimeout(() => {
  console.log = originalLog;
  console.log("\n3. Component logs found:");
  if (componentLogs.length > 0) {
    componentLogs.forEach((log) => console.log("   📊", log));
    console.log("✅ Component is mounting and running");
  } else {
    console.log("❌ No component logs found - component may not be mounting");
  }
}, 5000);

// 3. Check if React components exist on page
console.log("\n4. Checking React components...");
const reactRoot = document.getElementById("root");
if (reactRoot) {
  console.log("✅ React root found");
  const reactFiber = reactRoot._reactInternalFiber || reactRoot._reactInternals;
  if (reactFiber) {
    console.log("✅ React fiber found - React is running");
  } else {
    console.log("❌ React fiber not found - React may not be running");
  }
} else {
  console.log("❌ React root not found");
}

// 4. Check if AdminDashboardLayout exists
console.log("\n5. Checking for AdminDashboardLayout...");
const adminElements = document.querySelectorAll(
  '[class*="admin"], [class*="Admin"], [class*="dashboard"], [class*="Dashboard"]'
);
console.log(`   Found ${adminElements.length} admin-related elements`);
if (adminElements.length > 0) {
  console.log("✅ Admin layout elements found");
  adminElements.forEach((el, i) => {
    if (i < 3) console.log(`     - ${el.className}`);
  });
} else {
  console.log("❌ No admin layout elements found");
}

// 5. Check for table elements
console.log("\n6. Checking for table elements...");
const tables = document.querySelectorAll(
  'table, [class*="table"], [class*="Table"]'
);
console.log(`   Found ${tables.length} table elements`);
if (tables.length > 0) {
  console.log("✅ Table elements found");
} else {
  console.log("❌ No table elements found");
}

// 6. Check network requests
console.log("\n7. Monitoring network requests...");
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const url = args[0];
  if (typeof url === "string" && url.includes("manage-banking")) {
    console.log("🌐 API CALL DETECTED:", url);
    console.log("   Arguments:", args);
  }
  return originalFetch.apply(this, args);
};

// Check for XMLHttpRequest too
const originalXHR = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, ...args) {
  if (url.includes("manage-banking")) {
    console.log("🌐 XHR CALL DETECTED:", method, url);
  }
  return originalXHR.apply(this, [method, url, ...args]);
};

// 7. Summary after 3 seconds
setTimeout(() => {
  console.log("\n" + "=".repeat(50));
  console.log("📋 MOUNTING DEBUG SUMMARY");
  console.log("=".repeat(50));

  console.log("Current URL:", window.location.href);
  console.log("Expected URL should end with: /admin/rut-tien");

  if (componentLogs.length > 0) {
    console.log("✅ Component mounting detected");
  } else {
    console.log("❌ Component mounting NOT detected");
    console.log("   Possible issues:");
    console.log("   - Component not imported properly");
    console.log("   - Route not matching");
    console.log("   - JavaScript error preventing mount");
    console.log("   - Lazy loading issue");
  }

  console.log("\n🔧 NEXT STEPS:");
  console.log("1. Check browser console for any JavaScript errors");
  console.log("2. Check Network tab for failed requests");
  console.log("3. Check if other admin pages work (e.g., /admin/yeu-cau)");
  console.log("4. Verify component import in App.jsx");
  console.log("5. Check if AdminPrivateRoutes is working");
}, 3000);

console.log("\n⏱️  Monitoring for 5 seconds...");
console.log(
  "Expected to see: '🔍 DEBUG: ListOfWithdrawalRequestsPage rendering...'"
);
