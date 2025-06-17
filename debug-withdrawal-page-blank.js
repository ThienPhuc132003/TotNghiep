/**
 * Debug Script for Admin Withdrawal Requests Page
 * Chạy script này trong console khi truy cập /admin/rut-tien để debug lỗi trang trắng
 */

console.log("🐛 DEBUGGING ADMIN WITHDRAWAL REQUESTS PAGE");
console.log("=".repeat(60));

// Test 1: Check current path
console.log("\n1️⃣ Checking current path:");
console.log(`Current URL: ${window.location.href}`);
console.log(`Current pathname: ${window.location.pathname}`);

// Test 2: Check if React is loaded
console.log("\n2️⃣ Checking React:");
if (window.React) {
  console.log("✅ React is loaded");
} else if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log("✅ React detected via DevTools");
} else {
  console.log("❌ React not detected");
}

// Test 3: Check for JavaScript errors
console.log("\n3️⃣ Checking for JavaScript errors:");
window.addEventListener("error", (e) => {
  console.error("❌ JavaScript Error:", e.error);
  console.error("File:", e.filename);
  console.error("Line:", e.lineno);
  console.error("Column:", e.colno);
});

// Test 4: Check if admin layout components exist
console.log("\n4️⃣ Checking admin layout:");
setTimeout(() => {
  const adminLayout = document.querySelector('[class*="admin"]');
  const adminContent = document.querySelector(".admin-content");
  const adminTitle = document.querySelector(".admin-list-title");

  console.log(
    `Admin layout elements: ${adminLayout ? "✅ Found" : "❌ Missing"}`
  );
  console.log(`Admin content: ${adminContent ? "✅ Found" : "❌ Missing"}`);
  console.log(`Admin title: ${adminTitle ? "✅ Found" : "❌ Missing"}`);

  if (adminTitle) {
    console.log(`Title text: "${adminTitle.textContent}"`);
  }
}, 2000);

// Test 5: Check for loading state
console.log("\n5️⃣ Checking loading state:");
setTimeout(() => {
  const loadingText = document.body.textContent;
  if (loadingText.includes("Đang tải")) {
    console.log("🔄 Page is still loading...");
  } else if (loadingText.trim().length === 0) {
    console.log("❌ Page is completely blank");
  } else {
    console.log("✅ Content is present");
  }
}, 1000);

// Test 6: Check authentication
console.log("\n6️⃣ Checking authentication:");
const token = localStorage.getItem("token") || getCookieValue("token");
const userProfile = localStorage.getItem("userProfile");

if (token) {
  console.log("✅ Token found");
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Token role:", payload.role || "Not specified");
    console.log("Token expires:", new Date(payload.exp * 1000));
  } catch (e) {
    console.log("⚠️ Cannot parse token");
  }
} else {
  console.log("❌ No authentication token found");
}

if (userProfile) {
  try {
    const profile = JSON.parse(userProfile);
    console.log("User role:", profile.role || "Not specified");
  } catch (e) {
    console.log("⚠️ Cannot parse user profile");
  }
} else {
  console.log("❌ No user profile found");
}

// Test 7: Check for API calls
console.log("\n7️⃣ Monitoring API calls:");
const originalFetch = window.fetch;
let apiCallCount = 0;

window.fetch = function (...args) {
  apiCallCount++;
  const url = args[0];
  console.log(
    `📡 API Call #${apiCallCount}: ${args[1]?.method || "GET"} ${url}`
  );

  return originalFetch
    .apply(this, args)
    .then((response) => {
      console.log(
        `📊 Response #${apiCallCount}: ${response.status} ${response.statusText}`
      );
      return response;
    })
    .catch((error) => {
      console.error(`❌ API Error #${apiCallCount}:`, error);
      throw error;
    });
};

// Test 8: Check component imports
console.log("\n8️⃣ Checking component imports:");
try {
  // Check if lazy loading is working
  console.log("Lazy loading status: Component should load dynamically");
} catch (error) {
  console.error("❌ Component import error:", error);
}

// Test 9: Check for console errors
console.log("\n9️⃣ Current console errors:");
const errors = [];
const originalError = console.error;
console.error = function (...args) {
  errors.push(args);
  originalError.apply(console, args);
};

setTimeout(() => {
  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} console errors:`);
    errors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error);
    });
  } else {
    console.log("✅ No console errors detected");
  }
}, 3000);

// Helper function
function getCookieValue(name) {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) return value;
  }
  return null;
}

// Test 10: Manual component check
console.log("\n🔟 Manual component check:");
console.log("If page is still blank after 5 seconds, check:");
console.log("1. Network tab for failed requests");
console.log("2. Console tab for error messages");
console.log("3. React DevTools for component tree");
console.log("4. Authentication status");

// Restore fetch after 30 seconds
setTimeout(() => {
  window.fetch = originalFetch;
  console.log("\n📊 API monitoring restored");
}, 30000);

console.log("\n" + "=".repeat(60));
console.log("🔍 DEBUG SCRIPT ACTIVE - Monitor console for updates");
