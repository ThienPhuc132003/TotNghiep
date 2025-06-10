import fetch from "node-fetch";

async function testTutorRevenueEndpoint() {
  console.log("🔍 Testing Tutor Revenue API Endpoint...\n");

  // Test the API directly through the production URL
  const baseUrl = "https://giasuvlu.click/api";
  const endpoint = "manage-payment/search-with-time-for-tutor-revenue";

  // Test parameters
  const queryParams = new URLSearchParams({
    rpp: "10",
    page: "1",
    periodType: "month",
    periodValue: "12",
    sort: JSON.stringify([{ key: "createdAt", type: "DESC" }]),
  });

  const fullUrl = `${baseUrl}/${endpoint}?${queryParams}`;

  console.log("📍 Testing URL:", fullUrl);
  console.log("📄 Query Parameters:", Object.fromEntries(queryParams));

  try {
    console.log("\n🌐 Making API request...");

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "TutorRevenue-Test/1.0",
      },
    });

    console.log("📊 Response Status:", response.status);
    console.log("📊 Response Status Text:", response.statusText);
    console.log("📊 Response Headers:", Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log("\n📄 Raw Response:", responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log("\n✅ JSON Response:", JSON.stringify(data, null, 2));
        console.log("\n✅ API endpoint is working!");

        if (data.data && Array.isArray(data.data)) {
          console.log(`📊 Found ${data.data.length} tutor revenue records`);
        } else {
          console.log("📊 Response structure may need verification");
        }
      } catch (parseError) {
        console.log("⚠️ Response is not valid JSON:", parseError.message);
      }
    } else {
      console.log("❌ API request failed");

      // Check for common error scenarios
      if (response.status === 401) {
        console.log(
          "🔐 Authentication required - this endpoint may need authentication tokens"
        );
      } else if (response.status === 404) {
        console.log("🔍 Endpoint not found - verify the URL path");
      } else if (response.status === 500) {
        console.log("🚨 Server error - backend may have issues");
      }
    }
  } catch (error) {
    console.log("❌ Network/Request Error:", error.message);

    if (error.code === "ENOTFOUND") {
      console.log(
        "🌐 DNS resolution failed - check if giasuvlu.click is accessible"
      );
    } else if (error.code === "ECONNREFUSED") {
      console.log("🔌 Connection refused - backend server may be down");
    }
  }
}

// Test with different parameter combinations
async function testMultipleScenarios() {
  console.log("🧪 Testing multiple scenarios...\n");

  const scenarios = [
    {
      name: "Current Month",
      params: { periodType: "month", periodValue: "12", rpp: "5", page: "1" },
    },
    {
      name: "Yearly Overview",
      params: { periodType: "year", periodValue: "2024", rpp: "10", page: "1" },
    },
    {
      name: "No Parameters",
      params: { rpp: "10", page: "1" },
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n🎯 Testing scenario: ${scenario.name}`);
    console.log("📋 Parameters:", scenario.params);

    const queryParams = new URLSearchParams(scenario.params);
    const fullUrl = `https://giasuvlu.click/api/manage-payment/search-with-time-for-tutor-revenue?${queryParams}`;

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Records: ${data.data?.length || "N/A"}`);
      } else {
        console.log(`   ❌ Failed`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Also test the local proxy
async function testLocalProxy() {
  console.log("\n🏠 Testing local proxy endpoint...\n");

  const localUrl =
    "http://localhost:5173/api/manage-payment/search-with-time-for-tutor-revenue";
  const queryParams = new URLSearchParams({
    rpp: "10",
    page: "1",
    periodType: "month",
    periodValue: "12",
  });

  const fullUrl = `${localUrl}?${queryParams}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Proxy Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Proxy is working!");
      console.log("📄 Data:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ Proxy request failed");
      const text = await response.text();
      console.log("📄 Error response:", text);
    }
  } catch (error) {
    console.log("❌ Proxy test failed:", error.message);
    console.log("💡 Make sure the dev server is running on port 5173");
  }
}

// Run all tests
async function runAllTests() {
  await testTutorRevenueEndpoint();
  await testMultipleScenarios();
  await testLocalProxy();

  console.log("\n🎉 Testing complete!");
  console.log("\n💡 Next steps:");
  console.log(
    "1. If authentication is required, implement token-based testing"
  );
  console.log("2. If the endpoint works, test the frontend integration");
  console.log("3. Check browser console for any CORS or authentication issues");
}

runAllTests().catch(console.error);
