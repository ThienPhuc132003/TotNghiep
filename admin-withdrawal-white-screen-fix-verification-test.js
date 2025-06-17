// Withdrawal Page White Screen Fix Verification Test
// This script verifies the fix for the admin withdrawal page white screen issue

console.log("🔍 ADMIN WITHDRAWAL PAGE - WHITE SCREEN FIX VERIFICATION");
console.log("=".repeat(70));

// Check Current URL
console.log("\n📍 Current URL Check:");
console.log("URL:", window.location.href);
console.log("Expected:", "Admin withdrawal page at /admin/rut-tien");

// Check if React App is Running
console.log("\n⚛️ React App Status:");
const reactRoot = document.getElementById("root");
if (reactRoot) {
  console.log("✅ React root element found");
  console.log(
    "Content preview:",
    reactRoot.innerHTML.substring(0, 200) + "..."
  );

  // Check if page content loaded
  if (reactRoot.innerHTML.includes("Quản lý Yêu cầu Rút tiền")) {
    console.log("✅ Page title found - Withdrawal page loaded successfully!");
  } else if (reactRoot.innerHTML.includes("admin-content")) {
    console.log("✅ Admin content structure found");
  } else if (reactRoot.innerHTML.length > 100) {
    console.log("⚠️ Page has content but may not be withdrawal page");
  } else {
    console.log("❌ Page appears to be blank/white screen");
  }
} else {
  console.log("❌ React root element not found");
}

// Check for JavaScript Errors
console.log("\n🚨 JavaScript Errors Check:");
window.addEventListener("error", function (event) {
  console.log("❌ JavaScript Error:", event.error);
});

// Check Console Errors
const originalError = console.error;
const errors = [];
console.error = function (...args) {
  errors.push(args);
  originalError.apply(console, args);
};

setTimeout(() => {
  console.log("\n📊 Error Summary:");
  if (errors.length === 0) {
    console.log("✅ No console errors detected");
  } else {
    console.log(`❌ ${errors.length} console errors found:`, errors);
  }
}, 3000);

// Check Component Structure
console.log("\n🏗️ Component Structure Check:");
setTimeout(() => {
  const adminContent = document.querySelector(".admin-content");
  const withdrawalTitle = document.querySelector(".admin-list-title");
  const table = document.querySelector("table");

  if (adminContent) {
    console.log("✅ Admin content container found");
  }
  if (withdrawalTitle) {
    console.log("✅ Withdrawal page title found:", withdrawalTitle.textContent);
  }
  if (table) {
    console.log("✅ Data table found");
  }

  if (adminContent && withdrawalTitle) {
    console.log("\n🎉 SUCCESS: Withdrawal page is working properly!");
    console.log("✅ White screen issue has been fixed");
  } else {
    console.log("\n❌ ISSUE: Withdrawal page components not found");
  }
}, 2000);

// Test Navigation to Withdrawal Page
console.log("\n🔗 Navigation Test:");
console.log("To test the withdrawal page:");
console.log("1. Navigate to: http://localhost:5174/admin/login");
console.log("2. Login with admin credentials");
console.log("3. Navigate to: http://localhost:5174/admin/rut-tien");
console.log("4. Verify page loads without white screen");

// Summary
setTimeout(() => {
  console.log("\n" + "=".repeat(70));
  console.log("📋 VERIFICATION COMPLETE");
  console.log(
    "Check the results above to confirm if the white screen issue is fixed."
  );
  console.log("=".repeat(70));
}, 5000);
