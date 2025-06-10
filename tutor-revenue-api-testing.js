/**
 * TutorRevenueStatistics API Testing and Debugging Script
 *
 * This script tests both the specific tutor revenue endpoint and the general payment endpoint
 * to determine the correct data structure and fix any remaining issues.
 */

// API Testing Configuration
const API_CONFIG = {
  baseURL: "http://localhost:8080/api",
  endpoints: {
    tutorRevenue: "manage-payment/search-with-time-for-tutor-revenue",
    generalPayment: "manage-payment/search-with-time",
  },
};

// Test Query Parameters
const testQuery = {
  rpp: 10,
  page: 1,
  periodType: "MONTH",
  periodValue: 1,
  // Will add filter for search testing
};

/**
 * Test API endpoint with different configurations
 */
async function testTutorRevenueAPI() {
  console.log("🧪 TESTING TUTOR REVENUE STATISTICS API");
  console.log("=".repeat(60));

  // Enable API logging
  if (window.apiLogger) {
    window.apiLogger.enable();
    console.log("✅ API Logging enabled");
  }

  // Test 1: Basic request to tutor revenue endpoint
  console.log("\n🔍 Test 1: Testing tutor revenue specific endpoint");
  try {
    const response1 = await fetch(
      `${API_CONFIG.baseURL}/${
        API_CONFIG.endpoints.tutorRevenue
      }?${new URLSearchParams(testQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      }
    );

    console.log("📊 Response Status:", response1.status);
    console.log(
      "📋 Response Headers:",
      Object.fromEntries(response1.headers.entries())
    );

    if (response1.ok) {
      const data1 = await response1.json();
      console.log("✅ Tutor Revenue Endpoint Response:");
      console.log(JSON.stringify(data1, null, 2));

      // Analyze data structure
      analyzeDataStructure(data1, "Tutor Revenue Endpoint");
    } else {
      console.log("❌ Tutor Revenue Endpoint Failed:", response1.statusText);
      const errorText = await response1.text();
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.log("❌ Tutor Revenue Endpoint Error:", error);
  }

  // Test 2: General payment endpoint as fallback
  console.log("\n🔍 Test 2: Testing general payment endpoint (fallback)");
  try {
    const response2 = await fetch(
      `${API_CONFIG.baseURL}/${
        API_CONFIG.endpoints.generalPayment
      }?${new URLSearchParams(testQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      }
    );

    console.log("📊 Response Status:", response2.status);

    if (response2.ok) {
      const data2 = await response2.json();
      console.log("✅ General Payment Endpoint Response:");
      console.log(JSON.stringify(data2, null, 2));

      // Analyze data structure
      analyzeDataStructure(data2, "General Payment Endpoint");
    } else {
      console.log("❌ General Payment Endpoint Failed:", response2.statusText);
    }
  } catch (error) {
    console.log("❌ General Payment Endpoint Error:", error);
  }

  // Test 3: Test with search filter
  console.log("\n🔍 Test 3: Testing with search filter");
  const searchQuery = {
    ...testQuery,
    filter: JSON.stringify([
      {
        key: "tutor.fullname",
        operator: "like",
        value: "test",
      },
    ]),
  };

  try {
    const response3 = await fetch(
      `${API_CONFIG.baseURL}/${
        API_CONFIG.endpoints.generalPayment
      }?${new URLSearchParams(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      }
    );

    if (response3.ok) {
      const data3 = await response3.json();
      console.log("✅ Search Filter Test Response:");
      console.log(JSON.stringify(data3, null, 2));
    } else {
      console.log("❌ Search Filter Test Failed:", response3.statusText);
    }
  } catch (error) {
    console.log("❌ Search Filter Test Error:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 API Testing Complete");
}

/**
 * Analyze data structure from API response
 */
function analyzeDataStructure(response, source) {
  console.log(`\n📊 ${source} - Data Structure Analysis:`);

  if (!response) {
    console.log("❌ No response data");
    return;
  }

  console.log("🔍 Response Properties:");
  Object.keys(response).forEach((key) => {
    console.log(`  - ${key}: ${typeof response[key]}`);
  });

  if (response.success !== undefined) {
    console.log(`✅ Success: ${response.success}`);
  }

  if (response.data) {
    console.log("📦 Data Object Analysis:");
    Object.keys(response.data).forEach((key) => {
      const value = response.data[key];
      console.log(
        `  - ${key}: ${typeof value} ${
          Array.isArray(value) ? `(array, length: ${value.length})` : ""
        }`
      );
    });

    if (response.data.items && Array.isArray(response.data.items)) {
      console.log(`📋 Items Array (${response.data.items.length} items):`);

      if (response.data.items.length > 0) {
        console.log("🔍 First Item Structure:");
        const firstItem = response.data.items[0];
        Object.keys(firstItem).forEach((key) => {
          const value = firstItem[key];
          console.log(
            `    - ${key}: ${typeof value} ${
              typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : value
            }`
          );
        });

        // Check for nested tutor object
        if (firstItem.tutor) {
          console.log("👨‍🏫 Tutor Object Found:");
          Object.keys(firstItem.tutor).forEach((key) => {
            console.log(`      - tutor.${key}: ${firstItem.tutor[key]}`);
          });
        }

        // Check for revenue-related fields
        const revenueFields = [
          "coinOfTutorReceive",
          "totalRevenueWithTime",
          "tutorRevenue",
          "revenue",
        ];
        console.log("💰 Revenue Fields Found:");
        revenueFields.forEach((field) => {
          if (firstItem[field] !== undefined) {
            console.log(`    ✅ ${field}: ${firstItem[field]}`);
          }
        });

        // Check for hire count fields
        const hireFields = ["totalHire", "hireCount", "bookingCount", "count"];
        console.log("📊 Hire Count Fields Found:");
        hireFields.forEach((field) => {
          if (firstItem[field] !== undefined) {
            console.log(`    ✅ ${field}: ${firstItem[field]}`);
          }
        });
      }
    }

    if (response.data.total !== undefined) {
      console.log(`📊 Total Items: ${response.data.total}`);
    }

    if (response.data.totalRevenue !== undefined) {
      console.log(`💰 Total Revenue: ${response.data.totalRevenue}`);
    }
  }
}

/**
 * Test current page functionality
 */
function testCurrentPageFunctionality() {
  console.log("\n🧪 TESTING CURRENT PAGE FUNCTIONALITY");
  console.log("=".repeat(60));

  // Check if we're on the right page
  const currentPath = window.location.pathname;
  console.log("📍 Current Path:", currentPath);

  if (!currentPath.includes("doanh-thu-gia-su")) {
    console.log("⚠️  Not on TutorRevenueStatistics page");
    console.log("🔗 Navigate to: /admin/doanh-thu-gia-su");
    return false;
  }

  // Check for SearchBar component
  const searchBar = document.querySelector(
    ".admin-search-container, .search-bar-filter-container"
  );
  if (searchBar) {
    console.log("✅ SearchBar component found");
  } else {
    console.log("❌ SearchBar component not found");
  }

  // Check for search elements
  const searchSelect = document.querySelector("select");
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button[type="submit"]');

  console.log("🔍 Search Elements:");
  console.log(
    `  - Search Select: ${searchSelect ? "✅ Found" : "❌ Not found"}`
  );
  console.log(`  - Search Input: ${searchInput ? "✅ Found" : "❌ Not found"}`);
  console.log(
    `  - Search Button: ${searchButton ? "✅ Found" : "❌ Not found"}`
  );

  // Check for table
  const table = document.querySelector("table");
  if (table) {
    console.log("✅ Table found");
    const rows = table.querySelectorAll("tbody tr");
    console.log(`📊 Table rows: ${rows.length}`);
  } else {
    console.log("❌ Table not found");
  }

  // Check for loading state
  const loadingElement = document.querySelector(
    '[class*="loading"], .spinner, .skeleton'
  );
  if (loadingElement) {
    console.log("⏳ Loading state detected");
  }

  // Check for error state
  const errorElement = document.querySelector(
    '[class*="error"], .alert-error, [role="alert"]'
  );
  if (errorElement) {
    console.log("❌ Error state detected:", errorElement.textContent);
  }

  return true;
}

/**
 * Generate test data for UI validation
 */
function generateTestData() {
  return {
    success: true,
    data: {
      items: [
        {
          tutor: {
            userId: "TU001",
            fullname: "Nguyễn Văn A",
          },
          coinOfTutorReceive: 5000000,
          totalHire: 15,
          createdAt: "2024-06-01T00:00:00Z",
        },
        {
          tutor: {
            userId: "TU002",
            fullname: "Trần Thị B",
          },
          coinOfTutorReceive: 3500000,
          totalHire: 12,
          createdAt: "2024-06-02T00:00:00Z",
        },
        {
          tutor: {
            userId: "TU003",
            fullname: "Lê Văn C",
          },
          coinOfTutorReceive: 2800000,
          totalHire: 8,
          createdAt: "2024-06-03T00:00:00Z",
        },
      ],
      total: 25,
      totalRevenue: 11300000,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 3,
      },
    },
  };
}

// Auto-run tests if on the correct page
if (window.location.pathname.includes("doanh-thu-gia-su")) {
  console.log("🎯 Auto-running TutorRevenueStatistics API tests...");

  // Wait for page to load
  setTimeout(() => {
    testCurrentPageFunctionality();
    setTimeout(() => {
      testTutorRevenueAPI();
    }, 1000);
  }, 2000);
}

// Expose functions globally
window.testTutorRevenueAPI = testTutorRevenueAPI;
window.testCurrentPageFunctionality = testCurrentPageFunctionality;
window.analyzeDataStructure = analyzeDataStructure;
window.generateTestData = generateTestData;

console.log("🧪 TutorRevenueStatistics API Testing Script Loaded!");
console.log("📋 Available Commands:");
console.log("  - testTutorRevenueAPI() - Test API endpoints");
console.log("  - testCurrentPageFunctionality() - Test current page elements");
console.log("  - generateTestData() - Generate mock data for testing");
console.log(
  "  - analyzeDataStructure(data, source) - Analyze API response structure"
);
