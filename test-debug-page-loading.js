// Test tutor revenue debug page loading
console.log("🔧 Testing Tutor Revenue Debug Page Loading");

async function testPageLoad() {
  try {
    // Test if the development server is running
    const response = await fetch("http://localhost:5173/");
    console.log("✅ Dev server is running, status:", response.status);

    // Test the specific page
    const pageResponse = await fetch(
      "http://localhost:5173/tai-khoan/ho-so/thong-ke-doanh-thu"
    );
    console.log("📄 Page response status:", pageResponse.status);

    if (pageResponse.status === 200) {
      const html = await pageResponse.text();
      console.log("✅ Page loaded successfully");

      // Check if it contains the expected content
      if (html.includes("root")) {
        console.log("✅ React root element found");
      } else {
        console.log("❌ React root element not found");
      }

      // Check for any error messages in HTML
      if (html.includes("500") || html.includes("Internal Server Error")) {
        console.log("❌ Server error detected in HTML");
      } else {
        console.log("✅ No server errors in HTML");
      }
    } else {
      console.log("❌ Page failed to load, status:", pageResponse.status);
    }
  } catch (error) {
    console.error("❌ Failed to test page:", error.message);

    // Check if it's a connection error
    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("fetch")
    ) {
      console.log("💡 Dev server might not be running. Try: npm run dev");
    }
  }
}

// Test direct import of the debug component
async function testComponentImport() {
  try {
    console.log("🧪 Testing component import...");

    // Try to check if the component file exists and is valid
    const componentPath =
      "src/pages/User/TutorPersonalRevenueStatisticsSimple.jsx";
    console.log("📁 Component path:", componentPath);

    // This would normally be done by the build system
    console.log("💡 Component should be imported by the routing system");
  } catch (error) {
    console.error("❌ Component import test failed:", error.message);
  }
}

// Test API endpoint availability
async function testApiEndpoint() {
  try {
    console.log("🌐 Testing API endpoint...");

    // Test the proxy endpoint
    const apiResponse = await fetch(
      "/api/manage-payment/search-with-time-by-tutor?tutorId=test&timeType=month&page=1&rpp=10"
    );
    console.log("🔌 API proxy response status:", apiResponse.status);

    if (apiResponse.status === 401) {
      console.log("🔑 API requires authentication (expected)");
    } else if (apiResponse.status === 404) {
      console.log("❌ API endpoint not found");
    } else if (apiResponse.status === 500) {
      console.log("❌ API server error");
    } else {
      console.log("✅ API endpoint is accessible");
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log("🚀 Starting comprehensive page tests...");
  console.log("=".repeat(50));

  await testPageLoad();
  console.log("-".repeat(30));

  await testComponentImport();
  console.log("-".repeat(30));

  await testApiEndpoint();
  console.log("-".repeat(30));

  console.log("✅ All tests completed");
}

// Run the tests
runAllTests().catch(console.error);
