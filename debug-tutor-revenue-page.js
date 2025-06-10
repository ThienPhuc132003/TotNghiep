// Debug script for TutorRevenueStatistics page
// Run this in the browser console while on the admin page

console.log("🔍 TutorRevenueStatistics Debug Script Started");

// Check if we're on the correct page
console.log("📍 Current URL:", window.location.href);

// Check authentication state
console.log("🔐 Checking authentication...");
const cookies = document.cookie;
console.log("🍪 Cookies:", cookies);

// Check if user is logged in by looking for auth tokens
const hasAuthCookie = cookies.includes("token") || cookies.includes("auth");
console.log("✅ Has auth cookie:", hasAuthCookie);

// Check localStorage for user data
const userData = localStorage.getItem("user");
console.log("👤 User data in localStorage:", userData);

// Check if the page components are loaded
console.log("🧩 Checking page components...");
const pageTitle = document.querySelector("h1, h2, h3");
console.log("📝 Page title element:", pageTitle?.textContent);

// Check for error messages
const errorElements = document.querySelectorAll(
  '[class*="error"], [class*="Error"], .alert-danger'
);
console.log("❌ Error elements found:", errorElements.length);
errorElements.forEach((el, index) => {
  console.log(`   Error ${index + 1}:`, el.textContent);
});

// Check for loading states
const loadingElements = document.querySelectorAll(
  '[class*="loading"], [class*="Loading"], [class*="spinner"]'
);
console.log("⏳ Loading elements found:", loadingElements.length);

// Test the API endpoint directly
console.log("🌐 Testing API endpoint...");

async function testTutorRevenueAPI() {
  try {
    console.log("📡 Making API request...");
    const response = await fetch(
      "/api/manage-payment/search-with-time-for-tutor-revenue?rpp=10&page=1&periodType=MONTH&periodValue=2024-12",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      }
    );

    console.log("📊 Response status:", response.status);
    console.log(
      "📋 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response successful:", data);
      return data;
    } else {
      const errorText = await response.text();
      console.log("❌ API Response error:", errorText);
      return { error: errorText, status: response.status };
    }
  } catch (error) {
    console.error("💥 API Request failed:", error);
    return { error: error.message };
  }
}

// Test the API
testTutorRevenueAPI().then((result) => {
  console.log("🎯 Final API test result:", result);
});

// Check React components in the page
console.log("⚛️ Checking React components...");
const reactRoot = document.querySelector("#root");
if (reactRoot) {
  console.log("✅ React root found");
  const hasReactComponents =
    reactRoot.innerHTML.includes("data-reactroot") ||
    reactRoot.innerHTML.length > 100;
  console.log("🔧 React components loaded:", hasReactComponents);
} else {
  console.log("❌ React root not found");
}

// Monitor for network requests
console.log("🌍 Setting up network monitoring...");
const originalFetch = window.fetch;
window.fetch = function (...args) {
  console.log("🌐 Network request:", args[0], args[1]);
  return originalFetch.apply(this, args).then((response) => {
    console.log("📡 Network response:", response.status, response.url);
    return response;
  });
};

console.log(
  "✨ Debug script setup complete! Check the browser network tab and console for live updates."
);
console.log(
  "💡 Tip: Navigate to different admin pages to test authentication."
);
