/**
 * TutorRevenueStatistics Enhanced Logging Validation
 *
 * Complete validation script for the enhanced API logging system
 * Run this in the browser console on the TutorRevenueStatistics page
 */

// Enhanced Logging Validation for TutorRevenueStatistics
window.validateTutorRevenueLogging = function () {
  console.log("🎓 TUTOR REVENUE STATISTICS - Enhanced Logging Validation");
  console.log("=".repeat(60));

  // Step 1: Verify API Logger is Enhanced
  console.log("🔍 Step 1: Verifying Enhanced API Logger");

  if (typeof window.apiLogger === "undefined") {
    console.error("❌ API Logger not found globally");
    return false;
  }

  // Check for enhanced methods
  const enhancedMethods = [
    "generateRequestId",
    "logTutorRevenueRequest",
    "clearRequestTimes",
  ];

  const missingMethods = enhancedMethods.filter(
    (method) => typeof window.apiLogger[method] !== "function"
  );

  if (missingMethods.length > 0) {
    console.error("❌ Missing enhanced methods:", missingMethods);
    return false;
  }

  console.log("✅ Enhanced API Logger methods verified");

  // Step 2: Test Request ID Generation
  console.log("\n🔍 Step 2: Testing Request ID Generation");

  try {
    const requestId = window.apiLogger.generateRequestId();
    if (
      requestId &&
      typeof requestId === "string" &&
      requestId.startsWith("req_")
    ) {
      console.log(
        "✅ Request ID generation working:",
        requestId.substring(0, 30) + "..."
      );
    } else {
      console.error("❌ Invalid request ID:", requestId);
      return false;
    }
  } catch (error) {
    console.error("❌ Request ID generation failed:", error);
    return false;
  }

  // Step 3: Test Enhanced Logging Output
  console.log("\n🔍 Step 3: Testing Enhanced Logging Output");

  window.apiLogger.enable();

  // Test tutor revenue specific logging
  try {
    const testQuery = {
      rpp: 10,
      page: 1,
      periodType: "MONTH",
      periodValue: 1,
      searchField: "fullname",
      searchKeyword: "test search",
      sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
    };

    const searchParams = {
      searchField: "fullname",
      searchKeyword: "test search",
      hasSearch: true,
    };

    const sortParams = {
      sortKey: "totalRevenueWithTime",
      sortDirection: "desc",
      sortJSON: testQuery.sort,
    };

    window.apiLogger.logTutorRevenueRequest(
      testQuery,
      searchParams,
      sortParams
    );
    console.log("✅ Tutor revenue specific logging working");
  } catch (error) {
    console.error("❌ Tutor revenue logging failed:", error);
    return false;
  }

  // Step 4: Test Timing Functionality
  console.log("\n🔍 Step 4: Testing Request Timing");

  try {
    const testRequestId = "test_timing_" + Date.now();

    // Simulate request start
    window.apiLogger.requestStartTimes.set(testRequestId, performance.now());

    // Check if timing is stored
    if (window.apiLogger.requestStartTimes.has(testRequestId)) {
      console.log("✅ Request timing storage working");

      // Test cleanup
      window.apiLogger.clearRequestTimes();
      if (window.apiLogger.requestStartTimes.size === 0) {
        console.log("✅ Request timing cleanup working");
      } else {
        console.error("❌ Request timing cleanup failed");
        return false;
      }
    } else {
      console.error("❌ Request timing storage failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Request timing test failed:", error);
    return false;
  }

  // Step 5: Test Enhanced Response Logging
  console.log("\n🔍 Step 5: Testing Enhanced Response Logging");

  try {
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            userId: "TU001",
            fullname: "Test Tutor 1",
            totalHire: 5,
            totalRevenueWithTime: 2500000,
          },
          {
            userId: "TU002",
            fullname: "Test Tutor 2",
            totalHire: 8,
            totalRevenueWithTime: 4000000,
          },
        ],
        total: 50,
        pagination: { page: 1, pageSize: 10, totalPages: 5 },
      },
    };

    const testRequestId = window.apiLogger.generateRequestId();
    window.apiLogger.logResponse(mockResponse, testRequestId);
    console.log("✅ Enhanced response logging working");
  } catch (error) {
    console.error("❌ Enhanced response logging failed:", error);
    return false;
  }

  // Step 6: Test Enhanced Error Logging
  console.log("\n🔍 Step 6: Testing Enhanced Error Logging");

  try {
    const mockError = {
      response: {
        status: 401,
        statusText: "Unauthorized",
        data: { message: "Invalid token", code: "AUTH_ERROR" },
        headers: { "content-type": "application/json" },
      },
      config: { url: "test-url", method: "GET" },
    };

    const testRequestId = window.apiLogger.generateRequestId();
    window.apiLogger.logError(mockError, "test-url", testRequestId);
    console.log("✅ Enhanced error logging working");
  } catch (error) {
    console.error("❌ Enhanced error logging failed:", error);
    return false;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL ENHANCED LOGGING VALIDATION TESTS PASSED!");
  console.log("✅ Enhanced API logging system is fully functional");
  console.log("\n📝 Next Steps:");
  console.log(
    "1. Navigate to TutorRevenueStatistics page (/admin/doanh-thu-gia-su)"
  );
  console.log("2. Perform search operations to see enhanced logging");
  console.log("3. Use sort functionality to see sort parameter logging");
  console.log("4. Check browser console for comprehensive API logs");

  return true;
};

// Comprehensive page validation for TutorRevenueStatistics
window.validateTutorRevenuePage = function () {
  console.log("📊 TUTOR REVENUE PAGE - Complete Validation");
  console.log("=".repeat(60));

  const currentPath = window.location.pathname;
  if (!currentPath.includes("doanh-thu-gia-su")) {
    console.warn("⚠️  Not on TutorRevenueStatistics page");
    console.log("🔗 Navigate to: /admin/doanh-thu-gia-su");
    return false;
  }

  console.log("✅ On TutorRevenueStatistics page");

  // Check React component state (if accessible)
  const reactRoot = document.querySelector("#root");
  if (
    (reactRoot && reactRoot._reactInternalFiber) ||
    reactRoot._reactInternalInstance
  ) {
    console.log("✅ React component detected");
  }

  // Check for search form elements
  console.log("\n🔍 Checking Search Form Elements:");

  const searchElements = {
    searchFieldSelect: document.querySelector("select"),
    searchInput: document.querySelector('input[type="text"]'),
    searchButton: document.querySelector(
      'button[type="submit"], button:contains("Tìm kiếm")'
    ),
    clearButton: document.querySelector(
      'button:contains("Xóa"), button[type="button"]'
    ),
  };

  Object.entries(searchElements).forEach(([name, element]) => {
    if (element) {
      console.log(`  ✅ ${name} found`);
    } else {
      console.log(`  ❌ ${name} not found`);
    }
  });

  // Check for table elements
  console.log("\n📊 Checking Table Elements:");

  const tableElements = {
    table: document.querySelector("table"),
    tableHeaders: document.querySelectorAll("th"),
    tableRows: document.querySelectorAll("tbody tr"),
    sortableHeaders: document.querySelectorAll(
      'th[class*="sortable"], th:has(.sort-icon)'
    ),
  };

  Object.entries(tableElements).forEach(([name, elements]) => {
    if (elements.length > 0) {
      console.log(`  ✅ ${name}: ${elements.length} found`);
    } else {
      console.log(`  ❌ ${name}: none found`);
    }
  });

  // Check for pagination
  console.log("\n📄 Checking Pagination Elements:");

  const paginationElements = {
    pagination: document.querySelector('[class*="pagination"], .pagination'),
    pageButtons: document.querySelectorAll(
      'button[class*="page"], .page-button'
    ),
    itemsPerPageSelect: document.querySelector(
      'select[class*="items-per-page"]'
    ),
  };

  Object.entries(paginationElements).forEach(([name, elements]) => {
    const count = elements?.length || (elements ? 1 : 0);
    if (count > 0) {
      console.log(`  ✅ ${name}: ${count} found`);
    } else {
      console.log(`  ❌ ${name}: none found`);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("📊 Page validation complete");

  return true;
};

// Test API call with enhanced logging
window.testTutorRevenueApiCall = function () {
  console.log("🚀 TESTING API CALL WITH ENHANCED LOGGING");
  console.log("=".repeat(60));

  // Enable logging
  window.apiLogger.enable();

  // Simulate the API call that would be made by TutorRevenueStatistics
  const testQuery = {
    rpp: 10,
    page: 1,
    periodType: "MONTH",
    periodValue: 1,
    searchField: "fullname",
    searchKeyword: "test",
    sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
  };

  // Log the request (simulated)
  console.log("📤 Simulating API Request:");
  const requestId = window.apiLogger.logRequest(
    "GET",
    `${window.location.origin}/api/manage-payment/search-with-time-for-tutor-revenue`,
    null,
    testQuery
  );

  // Log tutor revenue specific data
  window.apiLogger.logTutorRevenueRequest(
    testQuery,
    {
      searchField: "fullname",
      searchKeyword: "test",
      hasSearch: true,
    },
    {
      sortKey: "totalRevenueWithTime",
      sortDirection: "desc",
      sortJSON: testQuery.sort,
    }
  );

  // Simulate successful response after delay
  setTimeout(() => {
    console.log("📥 Simulating API Response:");
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            userId: "TU001",
            fullname: "Nguyễn Văn A",
            totalHire: 15,
            totalRevenueWithTime: 7500000,
          },
          {
            userId: "TU002",
            fullname: "Trần Thị B",
            totalHire: 12,
            totalRevenueWithTime: 6000000,
          },
          {
            userId: "TU003",
            fullname: "Lê Văn C",
            totalHire: 8,
            totalRevenueWithTime: 4000000,
          },
        ],
        total: 25,
        pagination: { page: 1, pageSize: 10, totalPages: 3 },
      },
    };

    window.apiLogger.logResponse(mockResponse, requestId);

    console.log("✅ Simulated API call with enhanced logging complete!");
    console.log(
      "🔍 Check the console output above to see the enhanced logging in action"
    );
  }, 1000);

  return requestId;
};

// Auto-run validation if on the correct page
if (window.location.pathname.includes("doanh-thu-gia-su")) {
  console.log("🎯 Auto-running TutorRevenueStatistics page validation...");
  setTimeout(() => {
    window.validateTutorRevenuePage();
  }, 1000);
}

// Instructions
console.log("🎓 TutorRevenueStatistics Enhanced Logging Validation Loaded!");
console.log("📋 Available Commands:");
console.log(
  "  - validateTutorRevenueLogging() - Validate enhanced logging system"
);
console.log("  - validateTutorRevenuePage() - Validate page elements");
console.log(
  "  - testTutorRevenueApiCall() - Test API call with enhanced logging"
);
console.log("");
console.log(
  "🚀 Run validateTutorRevenueLogging() to start comprehensive validation"
);
