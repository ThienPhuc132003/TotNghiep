/**
 * TutorRevenueStatistics New Implementation Test
 *
 * Test script cho trang Thống kê doanh thu gia sư mới được tạo lại
 * Sử dụng endpoint duy nhất: manage-payment/search-with-time-for-tutor-revenue
 */

// Test Configuration
const TEST_CONFIG = {
  pageUrl: "/admin/doanh-thu-gia-su",
  apiEndpoint: "manage-payment/search-with-time-for-tutor-revenue",
  expectedColumns: [
    "STT",
    "Mã gia sư",
    "Tên gia sư",
    "Tổng số lượt được thuê",
    "Tổng doanh thu của gia sư",
  ],
  expectedDataKeys: ["userId", "fullname", "totalHire", "totalRevenueWithTime"],
  searchFields: [
    { value: "userId", label: "Mã gia sư" },
    { value: "fullname", label: "Tên gia sư" },
  ],
};

/**
 * Test basic page structure
 */
function testPageStructure() {
  console.log("🧪 TESTING TUTOR REVENUE STATISTICS PAGE STRUCTURE");
  console.log("=".repeat(60));

  const results = [];

  // Check if on correct page
  const currentPath = window.location.pathname;
  if (currentPath.includes("doanh-thu-gia-su")) {
    results.push({
      test: "Page URL",
      status: "✅",
      message: "On correct page",
    });
  } else {
    results.push({
      test: "Page URL",
      status: "❌",
      message: `Expected admin/doanh-thu-gia-su, got ${currentPath}`,
    });
  }

  // Check page title
  const pageTitle = document.querySelector("h2")?.textContent;
  if (pageTitle && pageTitle.includes("Thống kê doanh thu gia sư")) {
    results.push({
      test: "Page Title",
      status: "✅",
      message: "Correct title found",
    });
  } else {
    results.push({
      test: "Page Title",
      status: "❌",
      message: `Title not found or incorrect: ${pageTitle}`,
    });
  }

  // Check SearchBar component
  const searchSelect = document.querySelector("select");
  const searchInput = document.querySelector('input[type="text"]');
  if (searchSelect && searchInput) {
    results.push({
      test: "SearchBar Component",
      status: "✅",
      message: "SearchBar elements found",
    });

    // Check search options
    const options = Array.from(searchSelect.options).map(
      (opt) => opt.textContent
    );
    const hasCorrectOptions = TEST_CONFIG.searchFields.every((field) =>
      options.some((opt) => opt.includes(field.label))
    );

    if (hasCorrectOptions) {
      results.push({
        test: "Search Options",
        status: "✅",
        message: "All search options present",
      });
    } else {
      results.push({
        test: "Search Options",
        status: "⚠️",
        message: `Expected: ${TEST_CONFIG.searchFields
          .map((f) => f.label)
          .join(", ")}, Found: ${options.join(", ")}`,
      });
    }
  } else {
    results.push({
      test: "SearchBar Component",
      status: "❌",
      message: "SearchBar elements not found",
    });
  }

  // Check table structure
  const table = document.querySelector("table");
  if (table) {
    results.push({
      test: "Table Element",
      status: "✅",
      message: "Table found",
    });

    // Check table headers
    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.textContent.trim()
    );
    const hasAllColumns = TEST_CONFIG.expectedColumns.every((col) =>
      headers.some((header) => header.includes(col))
    );

    if (hasAllColumns) {
      results.push({
        test: "Table Columns",
        status: "✅",
        message: "All expected columns present",
      });
    } else {
      results.push({
        test: "Table Columns",
        status: "⚠️",
        message: `Expected: ${TEST_CONFIG.expectedColumns.join(
          ", "
        )}, Found: ${headers.join(", ")}`,
      });
    }

    // Check sortable headers
    const sortableHeaders = table.querySelectorAll(
      'th[class*="sortable"], th:has(.sort-icon)'
    );
    if (sortableHeaders.length >= 4) {
      // Should have 4 sortable columns (excluding STT)
      results.push({
        test: "Sortable Columns",
        status: "✅",
        message: `${sortableHeaders.length} sortable columns found`,
      });
    } else {
      results.push({
        test: "Sortable Columns",
        status: "⚠️",
        message: `Expected 4+ sortable columns, found ${sortableHeaders.length}`,
      });
    }
  } else {
    results.push({
      test: "Table Element",
      status: "❌",
      message: "Table not found",
    });
  }

  // Check period filters
  const periodTypeSelect = document.querySelector("#periodTypeSelect");
  const periodValueInput = document.querySelector("#periodValueInput");
  if (periodTypeSelect && periodValueInput) {
    results.push({
      test: "Period Filters",
      status: "✅",
      message: "Period filters found",
    });
  } else {
    results.push({
      test: "Period Filters",
      status: "❌",
      message: "Period filters not found",
    });
  }

  // Check total revenue display
  const totalRevenueDisplay = document.querySelector(
    'div[style*="font-weight: bold"]'
  );
  if (
    totalRevenueDisplay &&
    totalRevenueDisplay.textContent.includes("Tổng doanh thu gia sư")
  ) {
    results.push({
      test: "Total Revenue Display",
      status: "✅",
      message: "Total revenue display found",
    });
  } else {
    results.push({
      test: "Total Revenue Display",
      status: "⚠️",
      message: "Total revenue display not found",
    });
  }

  // Check export functionality
  const exportButton = document.querySelector(
    'button:contains("Xuất"), button[class*="export"]'
  );
  if (exportButton) {
    results.push({
      test: "Export Button",
      status: "✅",
      message: "Export button found",
    });
  } else {
    results.push({
      test: "Export Button",
      status: "⚠️",
      message: "Export button not found",
    });
  }

  // Display results
  console.log("\n📊 TEST RESULTS:");
  results.forEach((result) => {
    console.log(`${result.status} ${result.test}: ${result.message}`);
  });

  const passed = results.filter((r) => r.status === "✅").length;
  const warnings = results.filter((r) => r.status === "⚠️").length;
  const failed = results.filter((r) => r.status === "❌").length;

  console.log(
    `\n📈 SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`
  );

  return results;
}

/**
 * Test API integration
 */
async function testAPIIntegration() {
  console.log("\n🔌 TESTING API INTEGRATION");
  console.log("=".repeat(40));

  const testQuery = {
    rpp: 10,
    page: 1,
    periodType: "MONTH",
    periodValue: 1,
  };

  const baseURL = "http://localhost:8080/api";
  const fullURL = `${baseURL}/${TEST_CONFIG.apiEndpoint}`;

  console.log(`🔗 Testing endpoint: ${fullURL}`);
  console.log(`📋 Query parameters:`, testQuery);

  try {
    const response = await fetch(
      `${fullURL}?${new URLSearchParams(testQuery)}`,
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

    console.log(`📊 Response Status: ${response.status}`);
    console.log(
      `📋 Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", data);

      // Validate response structure
      if (data.success && data.data) {
        console.log("✅ Response has correct structure");

        if (Array.isArray(data.data.items)) {
          console.log(
            `✅ Items array found with ${data.data.items.length} items`
          );

          if (data.data.items.length > 0) {
            const firstItem = data.data.items[0];
            console.log("📄 First item structure:", firstItem);

            // Check for expected keys
            const hasRequiredKeys = TEST_CONFIG.expectedDataKeys.every((key) =>
              firstItem.hasOwnProperty(key)
            );

            if (hasRequiredKeys) {
              console.log("✅ All required data keys present");
            } else {
              console.log("⚠️ Some required keys missing");
              console.log("Expected keys:", TEST_CONFIG.expectedDataKeys);
              console.log("Available keys:", Object.keys(firstItem));
            }
          }
        }

        if (typeof data.data.total === "number") {
          console.log(`✅ Total count: ${data.data.total}`);
        }

        if (data.data.totalRevenue !== undefined) {
          console.log(`💰 Total revenue: ${data.data.totalRevenue}`);
        }
      } else {
        console.log("⚠️ Response structure may be incorrect");
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ API Error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Network Error:`, error);
  }
}

/**
 * Test search functionality
 */
function testSearchFunctionality() {
  console.log("\n🔍 TESTING SEARCH FUNCTIONALITY");
  console.log("=".repeat(40));

  const searchSelect = document.querySelector("select");
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button[type="submit"]');

  if (!searchSelect || !searchInput || !searchButton) {
    console.log("❌ Search elements not found");
    return;
  }

  console.log("✅ Search elements found");

  // Test search field options
  const options = Array.from(searchSelect.options);
  console.log("📋 Search field options:");
  options.forEach((option) => {
    console.log(`  - ${option.value}: ${option.textContent}`);
  });

  // Test placeholder functionality
  if (window.getSearchPlaceholder) {
    TEST_CONFIG.searchFields.forEach((field) => {
      const placeholder = window.getSearchPlaceholder(field.value);
      console.log(`📝 Placeholder for ${field.label}: ${placeholder}`);
    });
  }

  console.log("✅ Search functionality structure validated");
}

/**
 * Test period filter functionality
 */
function testPeriodFilters() {
  console.log("\n📅 TESTING PERIOD FILTERS");
  console.log("=".repeat(40));

  const periodTypeSelect = document.querySelector("#periodTypeSelect");
  const periodValueInput = document.querySelector("#periodValueInput");

  if (!periodTypeSelect || !periodValueInput) {
    console.log("❌ Period filter elements not found");
    return;
  }

  console.log("✅ Period filter elements found");

  // Check period type options
  const periodOptions = Array.from(periodTypeSelect.options);
  const expectedPeriods = ["DAY", "WEEK", "MONTH", "YEAR"];

  console.log("📋 Period type options:");
  periodOptions.forEach((option) => {
    console.log(`  - ${option.value}: ${option.textContent}`);
  });

  const hasAllPeriods = expectedPeriods.every((period) =>
    periodOptions.some((opt) => opt.value === period)
  );

  if (hasAllPeriods) {
    console.log("✅ All expected period types present");
  } else {
    console.log("⚠️ Some period types missing");
  }

  // Check period value input
  console.log(`📊 Period value: ${periodValueInput.value}`);
  console.log("✅ Period filters validated");
}

/**
 * Run comprehensive test
 */
async function runComprehensiveTest() {
  console.log("🚀 RUNNING COMPREHENSIVE TUTOR REVENUE STATISTICS TEST");
  console.log("=".repeat(60));
  console.log(`📅 Test Time: ${new Date().toISOString()}`);
  console.log(`🔗 Page URL: ${window.location.href}`);

  // Test 1: Page Structure
  const structureResults = testPageStructure();

  // Test 2: Search Functionality
  testSearchFunctionality();

  // Test 3: Period Filters
  testPeriodFilters();

  // Test 4: API Integration
  await testAPIIntegration();

  console.log("\n" + "=".repeat(60));
  console.log("🎯 COMPREHENSIVE TEST COMPLETE");

  const passed = structureResults.filter((r) => r.status === "✅").length;
  const total = structureResults.length;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`📊 Overall Success Rate: ${successRate}% (${passed}/${total})`);

  if (successRate >= 80) {
    console.log("🎉 TEST PASSED - Page implementation looks good!");
  } else if (successRate >= 60) {
    console.log("⚠️ TEST PARTIAL - Some issues detected but mostly working");
  } else {
    console.log("❌ TEST FAILED - Significant issues detected");
  }

  return structureResults;
}

// Auto-run if on correct page
if (window.location.pathname.includes("doanh-thu-gia-su")) {
  console.log("🎯 Auto-running TutorRevenueStatistics tests...");
  setTimeout(runComprehensiveTest, 1000);
}

// Expose functions globally
window.testTutorRevenueStats = {
  testPageStructure,
  testAPIIntegration,
  testSearchFunctionality,
  testPeriodFilters,
  runComprehensiveTest,
};

console.log("🧪 TutorRevenueStatistics Test Script Loaded!");
console.log("📋 Available Commands:");
console.log("  - testTutorRevenueStats.runComprehensiveTest() - Run all tests");
console.log(
  "  - testTutorRevenueStats.testPageStructure() - Test page structure only"
);
console.log("  - testTutorRevenueStats.testAPIIntegration() - Test API only");
console.log(
  "  - testTutorRevenueStats.testSearchFunctionality() - Test search only"
);
