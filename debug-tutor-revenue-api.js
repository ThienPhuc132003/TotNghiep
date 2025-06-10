// Debug script to test tutor revenue API endpoint
console.log("🔧 Testing Tutor Revenue Statistics API");

// Function to test the API endpoint
async function testTutorRevenueAPI() {
  try {
    // Get the token from localStorage or cookies
    const token =
      localStorage.getItem("token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      console.error("❌ No authentication token found");
      return;
    }

    console.log("✅ Token found:", token.substring(0, 20) + "...");

    // Test the API endpoint
    const apiUrl =
      "http://localhost:5173/api/manage-payment/search-with-time-by-tutor";
    const params = new URLSearchParams({
      tutorId: "test-tutor-id", // Replace with actual tutor ID
      timeType: "month",
      page: "1",
      rpp: "10",
    });

    console.log("🌐 Testing URL:", `${apiUrl}?${params}`);

    const response = await fetch(`${apiUrl}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", data);
    } else {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

// Function to get user info from Redux store
function getUserInfo() {
  try {
    // Try to access Redux store if available
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      console.log("🔍 Redux DevTools available");
    }

    // Check localStorage for user data
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const parsed = JSON.parse(userProfile);
      console.log("👤 User Profile from localStorage:", parsed);
      return parsed;
    }

    console.log("❌ No user profile found in localStorage");
    return null;
  } catch (error) {
    console.error("❌ Error getting user info:", error);
    return null;
  }
}

// Main debug function
function debugTutorRevenuePage() {
  console.log("=".repeat(50));
  console.log("🔧 TUTOR REVENUE STATISTICS DEBUG");
  console.log("=".repeat(50));

  // Check current URL
  console.log("🌐 Current URL:", window.location.href);

  // Check user authentication
  const userInfo = getUserInfo();

  // Check if user is a tutor
  if (userInfo && userInfo.roleId) {
    const isTutor = String(userInfo.roleId).toUpperCase() === "TUTOR";
    console.log("👨‍🏫 Is Tutor:", isTutor);

    if (isTutor) {
      console.log("✅ User is a tutor, testing API...");
      testTutorRevenueAPI();
    } else {
      console.log("❌ User is not a tutor");
    }
  }

  // Check for JavaScript errors
  window.addEventListener("error", (event) => {
    console.error("🚨 JavaScript Error:", event.error);
  });

  // Check for unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("🚨 Unhandled Promise Rejection:", event.reason);
  });
}

// Run the debug function
debugTutorRevenuePage();

// Export for manual testing
window.debugTutorRevenue = {
  testAPI: testTutorRevenueAPI,
  getUserInfo: getUserInfo,
  runFullDebug: debugTutorRevenuePage,
};

console.log("🎯 Debug functions available on window.debugTutorRevenue");
console.log("   - testAPI(): Test the API endpoint");
console.log("   - getUserInfo(): Get current user information");
console.log("   - runFullDebug(): Run complete debugging suite");
