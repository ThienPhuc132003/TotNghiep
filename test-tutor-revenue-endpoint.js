/**
 * Test script for TutorRevenueStatistics API endpoint
 * Run this in browser console to test the API endpoint
 */

async function testTutorRevenueAPI() {
  console.log("🧪 Testing TutorRevenueStatistics API Endpoint");
  console.log("===========================================");

  // Check if we have authentication token
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.log("❌ No auth token found. Please login first.");
    return;
  }

  console.log("✅ Auth token found");

  // Test parameters
  const testParams = {
    rpp: 10,
    page: 1,
    periodType: "MONTH",
    periodValue: 1,
    sort: JSON.stringify([{ key: "createdAt", type: "DESC" }]),
  };

  console.log("📤 Test Parameters:", testParams);

  // Build query string
  const queryString = new URLSearchParams(testParams).toString();
  const url = `${window.location.origin}/api/manage-payment/search-with-time-for-tutor-revenue?${queryString}`;

  console.log("🌐 Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    console.log("📊 Response Status:", response.status);
    console.log("📊 Response Headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("📥 Response Data:", data);

    if (response.ok && data.success) {
      console.log("✅ API call successful!");
      console.log("📊 Data Summary:");
      console.log(`   - Total items: ${data.data?.total || 0}`);
      console.log(`   - Items in response: ${data.data?.items?.length || 0}`);

      if (data.data?.items?.length > 0) {
        console.log("📋 First item structure:", data.data.items[0]);
      }

      if (data.data?.totalRevenueForTutor !== undefined) {
        console.log(`   - Total revenue: ${data.data.totalRevenueForTutor}`);
      }
    } else {
      console.log("❌ API call failed:");
      console.log("   Status:", response.status);
      console.log("   Message:", data.message || "Unknown error");
    }
  } catch (error) {
    console.error("❌ API Test Error:", error);

    // Check if it's a CORS or network error
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.log("💡 This might be a CORS or network connectivity issue");
      console.log(
        "💡 Check if the backend server is running on the correct port"
      );
    }
  }

  console.log("\n🔍 Troubleshooting Tips:");
  console.log("1. Ensure backend server is running");
  console.log("2. Check if API endpoint exists in backend");
  console.log("3. Verify authentication token is valid");
  console.log("4. Check CORS configuration");
  console.log("5. Verify Vite proxy configuration");
}

// Test the envConfig
function testEnvConfig() {
  console.log("🔧 Environment Configuration Test");
  console.log("================================");

  console.log("Environment mode:", import.meta?.env?.MODE || "unknown");
  console.log("Is development:", import.meta?.env?.DEV || false);
  console.log("Is production:", import.meta?.env?.PROD || false);
  console.log(
    "Vite API base URL:",
    import.meta?.env?.VITE_API_BASE_URL || "not set"
  );

  // Try to access envConfig if available
  try {
    if (window.API_CONFIG) {
      console.log("API_CONFIG found:", window.API_CONFIG);
    } else {
      console.log("API_CONFIG not available in window");
    }
  } catch (e) {
    console.log("Could not access API_CONFIG");
  }
}

// Export functions for console use
window.testTutorRevenueAPI = testTutorRevenueAPI;
window.testEnvConfig = testEnvConfig;

console.log("🛠️ TutorRevenue API Test Functions Available:");
console.log("- testTutorRevenueAPI() - Test the revenue API endpoint");
console.log("- testEnvConfig() - Check environment configuration");
console.log("\n💡 Run testTutorRevenueAPI() to start testing");
