/**
 * Enhanced API Logging Testing Script
 *
 * This script provides comprehensive testing for the enhanced API logging system
 * in the TutorRevenueStatistics page. Use this in the browser console to validate
 * all logging functionality.
 */

class EnhancedLoggingTester {
  constructor() {
    this.testResults = [];
    this.originalFetch = window.fetch;
    this.originalConsoleLog = console.log;
    this.originalConsoleGroup = console.group;
    this.originalConsoleGroupEnd = console.groupEnd;
    this.originalConsoleTable = console.table;
  }

  /**
   * Initialize the testing environment
   */
  init() {
    console.log("🧪 Enhanced API Logging Tester Initialized");
    console.log("📋 Available Commands:");
    console.log(
      "- tester.testApiLogger() - Test basic API logger functionality"
    );
    console.log(
      "- tester.testTutorRevenueLogging() - Test tutor revenue specific logging"
    );
    console.log(
      "- tester.testRequestTiming() - Test request timing functionality"
    );
    console.log("- tester.testErrorLogging() - Test error logging");
    console.log(
      "- tester.testSearchSortLogging() - Test search and sort logging"
    );
    console.log("- tester.runAllTests() - Run all tests");
    console.log("- tester.getResults() - Get test results");
    console.log("- tester.clearResults() - Clear test results");
  }

  /**
   * Log test result
   */
  logResult(testName, passed, details = "") {
    const result = {
      test: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString(),
    };
    this.testResults.push(result);

    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} - ${testName}${details ? `: ${details}` : ""}`);
  }

  /**
   * Test basic API logger functionality
   */
  testApiLogger() {
    console.group("🧪 Testing Basic API Logger Functionality");

    try {
      // Test 1: Check if apiLogger exists
      if (typeof window.apiLogger !== "undefined") {
        this.logResult(
          "API Logger Global Access",
          true,
          "apiLogger is accessible globally"
        );
      } else {
        this.logResult(
          "API Logger Global Access",
          false,
          "apiLogger not found in global scope"
        );
        return;
      }

      // Test 2: Check enable/disable functionality
      const initialState = window.apiLogger.isEnabled;
      window.apiLogger.enable();
      const enabledState = window.apiLogger.isEnabled;
      window.apiLogger.disable();
      const disabledState = window.apiLogger.isEnabled;
      window.apiLogger.isEnabled = initialState; // Restore

      if (enabledState === true && disabledState === false) {
        this.logResult(
          "Enable/Disable Functionality",
          true,
          "Enable and disable methods work correctly"
        );
      } else {
        this.logResult(
          "Enable/Disable Functionality",
          false,
          `Enable: ${enabledState}, Disable: ${disabledState}`
        );
      }

      // Test 3: Check toggle functionality
      window.apiLogger.enable();
      const beforeToggle = window.apiLogger.isEnabled;
      window.apiLogger.toggle();
      const afterToggle = window.apiLogger.isEnabled;
      window.apiLogger.isEnabled = initialState; // Restore

      if (beforeToggle !== afterToggle) {
        this.logResult(
          "Toggle Functionality",
          true,
          "Toggle method works correctly"
        );
      } else {
        this.logResult(
          "Toggle Functionality",
          false,
          "Toggle method not working"
        );
      }

      // Test 4: Check localStorage persistence
      window.apiLogger.enable();
      const storageValue = localStorage.getItem("API_LOGGING_ENABLED");
      window.apiLogger.isEnabled = initialState; // Restore

      if (storageValue === "true") {
        this.logResult(
          "LocalStorage Persistence",
          true,
          "Settings persist in localStorage"
        );
      } else {
        this.logResult(
          "LocalStorage Persistence",
          false,
          `Storage value: ${storageValue}`
        );
      }

      // Test 5: Check method existence
      const requiredMethods = [
        "logRequest",
        "logResponse",
        "logError",
        "logTutorRevenueRequest",
        "clearRequestTimes",
      ];
      const missingMethods = requiredMethods.filter(
        (method) => typeof window.apiLogger[method] !== "function"
      );

      if (missingMethods.length === 0) {
        this.logResult("Required Methods", true, "All required methods exist");
      } else {
        this.logResult(
          "Required Methods",
          false,
          `Missing methods: ${missingMethods.join(", ")}`
        );
      }
    } catch (error) {
      this.logResult("API Logger Basic Test", false, `Error: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * Test tutor revenue specific logging
   */
  testTutorRevenueLogging() {
    console.group("🧪 Testing Tutor Revenue Specific Logging");

    try {
      window.apiLogger.enable();

      // Test logTutorRevenueRequest method
      const testQuery = {
        rpp: 10,
        page: 1,
        periodType: "MONTH",
        periodValue: 1,
        searchField: "fullname",
        searchKeyword: "test",
        sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
      };

      const testSearchParams = {
        searchField: "fullname",
        searchKeyword: "test",
        hasSearch: true,
      };

      const testSortParams = {
        sortKey: "totalRevenueWithTime",
        sortDirection: "desc",
        sortJSON: testQuery.sort,
      };

      // Capture console output
      let consoleCalled = false;
      const originalGroup = console.group;
      console.group = function (...args) {
        if (args[0] && args[0].includes("TUTOR REVENUE STATISTICS")) {
          consoleCalled = true;
        }
        originalGroup.apply(console, args);
      };

      window.apiLogger.logTutorRevenueRequest(
        testQuery,
        testSearchParams,
        testSortParams
      );

      console.group = originalGroup; // Restore

      if (consoleCalled) {
        this.logResult(
          "Tutor Revenue Request Logging",
          true,
          "logTutorRevenueRequest produces output"
        );
      } else {
        this.logResult(
          "Tutor Revenue Request Logging",
          false,
          "No console output detected"
        );
      }
    } catch (error) {
      this.logResult(
        "Tutor Revenue Logging Test",
        false,
        `Error: ${error.message}`
      );
    }

    console.groupEnd();
  }

  /**
   * Test request timing functionality
   */
  testRequestTiming() {
    console.group("🧪 Testing Request Timing Functionality");

    try {
      window.apiLogger.enable();

      // Test request ID generation
      const requestId = window.apiLogger.generateRequestId();

      if (
        requestId &&
        typeof requestId === "string" &&
        requestId.startsWith("req_")
      ) {
        this.logResult(
          "Request ID Generation",
          true,
          `Generated ID: ${requestId.substring(0, 20)}...`
        );
      } else {
        this.logResult(
          "Request ID Generation",
          false,
          `Invalid ID: ${requestId}`
        );
      }

      // Test timing storage
      const testId = "test_request_123";
      window.apiLogger.requestStartTimes.set(testId, performance.now());

      if (window.apiLogger.requestStartTimes.has(testId)) {
        this.logResult(
          "Timing Storage",
          true,
          "Request times are stored correctly"
        );
      } else {
        this.logResult("Timing Storage", false, "Request times not stored");
      }

      // Test cleanup
      window.apiLogger.clearRequestTimes();

      if (window.apiLogger.requestStartTimes.size === 0) {
        this.logResult(
          "Timing Cleanup",
          true,
          "Request times cleared successfully"
        );
      } else {
        this.logResult(
          "Timing Cleanup",
          false,
          `${window.apiLogger.requestStartTimes.size} items remaining`
        );
      }
    } catch (error) {
      this.logResult("Request Timing Test", false, `Error: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * Test error logging functionality
   */
  testErrorLogging() {
    console.group("🧪 Testing Error Logging Functionality");

    try {
      window.apiLogger.enable();

      // Test different error types
      const testErrors = [
        {
          name: "Network Error",
          error: { request: {}, message: "Network Error" },
          expectedType: "Network",
        },
        {
          name: "HTTP Error",
          error: {
            response: {
              status: 404,
              statusText: "Not Found",
              data: { message: "Resource not found" },
              headers: {},
            },
          },
          expectedType: "HTTP",
        },
        {
          name: "Request Setup Error",
          error: { message: "Request configuration error" },
          expectedType: "Setup",
        },
      ];

      let errorTestsPassed = 0;

      // Capture console output for error logging
      let errorLogCalls = 0;
      const originalGroup = console.group;
      console.group = function (...args) {
        if (args[0] && args[0].includes("API Error")) {
          errorLogCalls++;
        }
        originalGroup.apply(console, args);
      };

      testErrors.forEach((testCase) => {
        try {
          window.apiLogger.logError(
            testCase.error,
            "test-url",
            "test-request-id"
          );
          errorTestsPassed++;
        } catch (err) {
          console.error(`Error testing ${testCase.name}:`, err);
        }
      });

      console.group = originalGroup; // Restore

      if (errorTestsPassed === testErrors.length) {
        this.logResult(
          "Error Logging Types",
          true,
          `All ${testErrors.length} error types handled`
        );
      } else {
        this.logResult(
          "Error Logging Types",
          false,
          `Only ${errorTestsPassed}/${testErrors.length} passed`
        );
      }

      if (errorLogCalls === testErrors.length) {
        this.logResult(
          "Error Console Output",
          true,
          "All errors produced console output"
        );
      } else {
        this.logResult(
          "Error Console Output",
          false,
          `Expected ${testErrors.length}, got ${errorLogCalls}`
        );
      }
    } catch (error) {
      this.logResult("Error Logging Test", false, `Error: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * Test search and sort logging integration
   */
  testSearchSortLogging() {
    console.group("🧪 Testing Search and Sort Logging Integration");

    try {
      // Check if we're on the TutorRevenueStatistics page
      const currentPath = window.location.pathname;
      if (!currentPath.includes("doanh-thu-gia-su")) {
        this.logResult(
          "Page Context",
          false,
          "Not on TutorRevenueStatistics page"
        );
        console.log(
          "💡 Navigate to /admin/doanh-thu-gia-su to test page-specific functionality"
        );
        console.groupEnd();
        return;
      }

      this.logResult("Page Context", true, "On TutorRevenueStatistics page");

      // Test search form elements
      const searchFieldSelect = document.querySelector(
        'select[value*="searchField"], select:has(option[value="fullname"])'
      );
      const searchInput = document.querySelector(
        'input[placeholder*="tìm kiếm"], input[type="text"]'
      );
      const searchButton = document.querySelector(
        'button:has(span:contains("Tìm kiếm")), button[type="submit"]'
      );

      if (searchFieldSelect && searchInput && searchButton) {
        this.logResult(
          "Search Form Elements",
          true,
          "All search form elements found"
        );
      } else {
        this.logResult(
          "Search Form Elements",
          false,
          `Missing: ${!searchFieldSelect ? "field select" : ""} ${
            !searchInput ? "input" : ""
          } ${!searchButton ? "button" : ""}`
        );
      }

      // Test sortable column headers
      const sortableHeaders = document.querySelectorAll(
        'th[class*="sortable"], th:has(.sort-icon)'
      );

      if (sortableHeaders.length > 0) {
        this.logResult(
          "Sortable Headers",
          true,
          `Found ${sortableHeaders.length} sortable headers`
        );
      } else {
        this.logResult("Sortable Headers", false, "No sortable headers found");
      }

      // Test table structure
      const tableRows = document.querySelectorAll("tbody tr");

      if (tableRows.length > 0) {
        this.logResult(
          "Table Data",
          true,
          `Found ${tableRows.length} data rows`
        );
      } else {
        this.logResult("Table Data", false, "No table data found");
      }
    } catch (error) {
      this.logResult(
        "Search Sort Integration Test",
        false,
        `Error: ${error.message}`
      );
    }

    console.groupEnd();
  }

  /**
   * Test API integration
   */
  testApiIntegration() {
    console.group("🧪 Testing API Integration");

    try {
      // Check if Api is available
      if (
        typeof window.Api !== "undefined" ||
        (window.React &&
          window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED)
      ) {
        this.logResult("API Integration", true, "API client is available");
      } else {
        this.logResult("API Integration", false, "API client not found");
      }

      // Check axios client
      if (window.axios || document.querySelector('script[src*="axios"]')) {
        this.logResult("Axios Client", true, "Axios is available");
      } else {
        this.logResult("Axios Client", false, "Axios not found");
      }

      // Check environment configuration
      const baseURL =
        localStorage.getItem("API_BASE_URL") || "http://localhost:8080";
      this.logResult("Environment Config", true, `Base URL: ${baseURL}`);
    } catch (error) {
      this.logResult("API Integration Test", false, `Error: ${error.message}`);
    }

    console.groupEnd();
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Running All Enhanced Logging Tests");
    console.log("=".repeat(50));

    this.clearResults();

    this.testApiLogger();
    this.testTutorRevenueLogging();
    this.testRequestTiming();
    this.testErrorLogging();
    this.testSearchSortLogging();
    this.testApiIntegration();

    console.log("=".repeat(50));
    this.showSummary();
  }

  /**
   * Show test summary
   */
  showSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.group("📊 Test Summary");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    if (failedTests > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((result) => {
          console.log(`  - ${result.test}: ${result.details}`);
        });
    }

    console.groupEnd();

    if (passedTests === totalTests) {
      console.log(
        "🎉 All tests passed! Enhanced logging system is working correctly."
      );
    } else {
      console.log(
        "⚠️  Some tests failed. Check the failed tests above for details."
      );
    }
  }

  /**
   * Get test results
   */
  getResults() {
    return this.testResults;
  }

  /**
   * Clear test results
   */
  clearResults() {
    this.testResults = [];
    console.log("🧹 Test results cleared");
  }

  /**
   * Create demo API requests for testing
   */
  createDemoRequests() {
    console.group("🎭 Creating Demo API Requests");

    // Enable logging for demo
    window.apiLogger.enable();

    // Demo successful request
    setTimeout(() => {
      const demoRequestId = window.apiLogger.logRequest(
        "GET",
        "http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue?rpp=10&page=1",
        null,
        {
          rpp: 10,
          page: 1,
          periodType: "MONTH",
          periodValue: 1,
          searchField: "fullname",
          searchKeyword: "demo",
        }
      );

      setTimeout(() => {
        window.apiLogger.logResponse(
          {
            success: true,
            data: {
              items: [
                {
                  userId: "TU001",
                  fullname: "Demo Tutor 1",
                  totalHire: 10,
                  totalRevenueWithTime: 5000000,
                },
                {
                  userId: "TU002",
                  fullname: "Demo Tutor 2",
                  totalHire: 8,
                  totalRevenueWithTime: 4000000,
                },
              ],
              total: 25,
              pagination: { page: 1, pageSize: 10, totalPages: 3 },
            },
          },
          demoRequestId
        );
      }, 500);
    }, 100);

    // Demo error request
    setTimeout(() => {
      const errorRequestId = window.apiLogger.logRequest(
        "GET",
        "http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue",
        null,
        { rpp: 10, page: 1 }
      );

      setTimeout(() => {
        window.apiLogger.logError(
          {
            response: {
              status: 401,
              statusText: "Unauthorized",
              data: { message: "Token expired", code: "TOKEN_EXPIRED" },
              headers: { "content-type": "application/json" },
            },
          },
          "http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue",
          errorRequestId
        );
      }, 800);
    }, 1500);

    console.log(
      "✅ Demo requests created. Check console for enhanced logging output."
    );
    console.groupEnd();
  }
}

// Initialize the tester
const tester = new EnhancedLoggingTester();
tester.init();

// Export to global scope for easy access
window.enhancedLoggingTester = tester;
window.tester = tester;

console.log("🎯 Enhanced Logging Tester Ready!");
console.log("📝 Run 'tester.runAllTests()' to start comprehensive testing");
console.log("🎭 Run 'tester.createDemoRequests()' to see demo logging output");
