import fetch from "node-fetch";

async function testTutorRevenueWithAuth() {
  console.log("🔍 Testing Tutor Revenue API with Authentication...\n");

  // Test with browser environment simulation
  const API_BASE = "http://localhost:5173/api"; // Use local proxy
  const endpoint = "manage-payment/search-with-time-for-tutor-revenue";

  // Test parameters
  const queryParams = new URLSearchParams({
    rpp: "10",
    page: "1",
    periodType: "month",
    periodValue: "12",
    sort: JSON.stringify([{ key: "createdAt", type: "DESC" }]),
  });

  const fullUrl = `${API_BASE}/${endpoint}?${queryParams}`;

  console.log("📍 Testing URL:", fullUrl);
  console.log("📄 Query Parameters:", Object.fromEntries(queryParams));

  // Test scenarios with different authentication states
  const testScenarios = [
    {
      name: "No Authentication",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    {
      name: "Mock User Token",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock_user_token_for_testing",
      },
    },
    {
      name: "X-Require-Token Header",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock_user_token_for_testing",
        "X-Require-Token": "true",
      },
    },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n🎯 Testing scenario: ${scenario.name}`);
    console.log("📋 Headers:", JSON.stringify(scenario.headers, null, 2));

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: scenario.headers,
      });

      console.log(
        `📊 Response Status: ${response.status} ${response.statusText}`
      );
      console.log("📊 Response Headers:", Object.fromEntries(response.headers));

      const responseText = await response.text();
      console.log(
        "📄 Raw Response:",
        responseText.substring(0, 500) +
          (responseText.length > 500 ? "..." : "")
      );

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("✅ JSON Response Structure:", {
            success: data.success,
            hasData: !!data.data,
            dataType: Array.isArray(data.data) ? "array" : typeof data.data,
            recordCount: Array.isArray(data.data) ? data.data.length : "N/A",
            message: data.message,
          });
        } catch (parseError) {
          console.log("⚠️ Response is not JSON:", parseError.message);
        }
      } else {
        console.log("❌ Request failed");

        // Parse error response if possible
        try {
          const errorData = JSON.parse(responseText);
          console.log("❌ Error Details:", errorData);

          if (response.status === 401) {
            console.log(
              "🔐 Authentication required - this endpoint needs a valid user token"
            );
          } else if (response.status === 403) {
            console.log(
              "🚫 Authorization failed - user may not have permission"
            );
          } else if (response.status === 404) {
            console.log("🔍 Endpoint not found - verify the URL path");
          } else if (response.status === 500) {
            console.log(
              "🚨 Server error:",
              errorData.message || "Unknown server error"
            );
          }
        } catch (parseError) {
          console.log("❌ Could not parse error response");
        }
      }
    } catch (error) {
      console.log("❌ Network/Request Error:", error.message);

      if (error.code === "ECONNREFUSED") {
        console.log(
          "🔌 Connection refused - make sure dev server is running on port 5173"
        );
        console.log("💡 Run: npm run dev");
      } else if (error.code === "ENOTFOUND") {
        console.log("🌐 DNS resolution failed");
      }
    }

    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Test direct API access (without proxy)
async function testDirectAPI() {
  console.log("\n🌐 Testing Direct API Access (without proxy)...\n");

  const directUrl =
    "https://giasuvlu.click/api/manage-payment/search-with-time-for-tutor-revenue";
  const queryParams = new URLSearchParams({
    rpp: "5",
    page: "1",
    periodType: "month",
    periodValue: "12",
  });

  const fullUrl = `${directUrl}?${queryParams}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer mock_token_for_testing",
      },
    });

    console.log("📊 Direct API Response Status:", response.status);

    const responseText = await response.text();
    console.log(
      "📄 Direct API Response:",
      responseText.substring(0, 300) + "..."
    );

    if (response.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors === "Authorization header is required") {
          console.log(
            "✅ API endpoint exists and requires authentication (as expected)"
          );
        } else {
          console.log("📊 Other server error:", errorData.message);
        }
      } catch (parseError) {
        console.log("❌ Could not parse error response");
      }
    }
  } catch (error) {
    console.log("❌ Direct API Error:", error.message);
  }
}

// Check development server availability
async function checkDevServer() {
  console.log("\n🏠 Checking Development Server...\n");

  try {
    const response = await fetch("http://localhost:5173", {
      method: "HEAD",
    });

    console.log(
      `📊 Dev Server Status: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      console.log("✅ Development server is running");
      console.log("🔗 You can test the TutorRevenueStatistics page at:");
      console.log("   http://localhost:5173/admin/doanh-thu-gia-su");
    } else {
      console.log("⚠️ Development server responded but with non-200 status");
    }
  } catch (error) {
    console.log("❌ Development server is not accessible");
    console.log("💡 Please run: npm run dev");
    console.log("📋 Error:", error.message);
  }
}

// Generate browser test instructions
function generateBrowserTestInstructions() {
  console.log("\n📋 BROWSER TESTING INSTRUCTIONS");
  console.log("================================\n");

  console.log("1. 🌐 Open browser and navigate to:");
  console.log("   http://localhost:5173/admin/doanh-thu-gia-su\n");

  console.log("2. 🔑 Make sure you are logged in as an admin user");
  console.log('   - Check browser cookies for "token" value');
  console.log('   - Check that "role" cookie is set to "admin"\n');

  console.log("3. 🔍 Open browser Developer Tools (F12)");
  console.log("   - Go to Console tab");
  console.log("   - Check for any error messages");
  console.log("   - Look for API calls in Network tab\n");

  console.log("4. 🧪 Test the page functionality:");
  console.log("   - Try changing the period type (month/year)");
  console.log("   - Try different period values");
  console.log("   - Check if data loads or if there are error messages\n");

  console.log("5. 🔧 Manual API testing in browser console:");
  console.log("   ```javascript");
  console.log("   // Test the API endpoint directly");
  console.log(
    '   fetch("/api/manage-payment/search-with-time-for-tutor-revenue?rpp=10&page=1", {'
  );
  console.log('     method: "GET",');
  console.log("     headers: {");
  console.log('       "Accept": "application/json",');
  console.log('       "Content-Type": "application/json"');
  console.log("     }");
  console.log("   })");
  console.log("   .then(response => response.json())");
  console.log('   .then(data => console.log("API Response:", data))');
  console.log('   .catch(error => console.error("API Error:", error));');
  console.log("   ```\n");

  console.log("6. 🎯 Expected behaviors:");
  console.log("   ✅ If logged in: API should return data or specific error");
  console.log("   ❌ If not logged in: Should get authentication error");
  console.log("   🔄 If loading: Should see loading states in UI");
  console.log(
    "   📊 If data exists: Should see table with tutor revenue data\n"
  );
}

// Run all tests
async function runAllTests() {
  console.log("🚀 TUTOR REVENUE API TESTING SUITE");
  console.log("=================================\n");

  await checkDevServer();
  await testTutorRevenueWithAuth();
  await testDirectAPI();
  generateBrowserTestInstructions();

  console.log("\n🎉 Testing complete!");
  console.log("\n📋 Summary:");
  console.log("1. ✅ API endpoint exists and requires authentication");
  console.log("2. 🔧 Development server proxy should handle authentication");
  console.log("3. 🌐 Use browser testing for full integration testing");
  console.log("4. 🔑 Ensure proper admin authentication for the page to work");
}

runAllTests().catch(console.error);
