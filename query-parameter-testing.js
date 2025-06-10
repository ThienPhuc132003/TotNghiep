// Query Parameter Testing Script for TutorRevenueStatistics
// Paste this in browser console to test different query combinations

console.log("🔧 Query Parameter Testing for TutorRevenueStatistics");

// Test different query combinations
const testQueryConfigurations = [
  {
    name: "Minimal Query",
    query: {
      rpp: 10,
      page: 1,
    },
  },
  {
    name: "With Period Type",
    query: {
      rpp: 10,
      page: 1,
      periodType: "MONTH",
    },
  },
  {
    name: "With Period Type and Value",
    query: {
      rpp: 10,
      page: 1,
      periodType: "MONTH",
      periodValue: 1,
    },
  },
  {
    name: "With Simple Sort",
    query: {
      rpp: 10,
      page: 1,
      sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
    },
  },
  {
    name: "Full Query",
    query: {
      rpp: 10,
      page: 1,
      periodType: "MONTH",
      periodValue: 1,
      sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
    },
  },
];

// Function to test a specific query configuration
async function testQuery(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  console.log("Query:", config.query);

  try {
    // Build query string
    const queryString = new URLSearchParams();
    Object.entries(config.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value);
      }
    });

    // Make the API call
    const response = await fetch(
      `/api/manage-payment/search-with-time-for-tutor-revenue?${queryString}`,
      {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Response success:", data.success);
      console.log("✅ Items count:", data.data?.items?.length || 0);
      console.log("✅ Total:", data.data?.total || 0);

      if (data.data?.items?.length > 0) {
        console.log(
          "✅ First item structure:",
          Object.keys(data.data.items[0])
        );
        console.log("✅ First item data:", data.data.items[0]);
      }
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
}

// Function to test all configurations
async function testAllQueries() {
  console.log("🚀 Starting comprehensive query testing...\n");

  for (let i = 0; i < testQueryConfigurations.length; i++) {
    await testQuery(testQueryConfigurations[i]);

    // Wait between tests
    if (i < testQueryConfigurations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n🏁 All query tests completed!");
}

// Function to test a custom query
function testCustomQuery(customQuery) {
  const config = {
    name: "Custom Query",
    query: customQuery,
  };
  return testQuery(config);
}

// Export functions for manual testing
window.queryTests = {
  testAllQueries,
  testCustomQuery,
  testQuery,
  configurations: testQueryConfigurations,
};

console.log("📋 Available functions:");
console.log(
  "- queryTests.testAllQueries() - Test all predefined configurations"
);
console.log(
  "- queryTests.testCustomQuery({rpp: 10, page: 1}) - Test custom query"
);
console.log("- queryTests.configurations - View all test configurations");

// Auto-start testing if on the correct page
if (window.location.pathname.includes("/admin/doanh-thu-gia-su")) {
  console.log("🎯 Detected TutorRevenueStatistics page, ready for testing!");
  console.log(
    "💡 Run queryTests.testAllQueries() to start comprehensive testing"
  );
} else {
  console.log("ℹ️ Navigate to /admin/doanh-thu-gia-su to test the API");
}
