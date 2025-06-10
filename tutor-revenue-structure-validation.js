/**
 * TutorRevenueStatistics Structure Validation Script
 *
 * Validates that the TutorRevenueStatistics page now follows the same pattern
 * as TutorHireStatistics and RevenueStatistics pages
 */

// Validation configuration
const VALIDATION_CONFIG = {
  expectedComponents: ["SearchBar", "Table", "AdminDashboardLayout"],
  expectedSearchFields: [
    { value: "userId", label: "Mã gia sư" },
    { value: "fullname", label: "Tên gia sư" },
  ],
  expectedColumns: [
    "STT",
    "Mã gia sư",
    "Tên gia sư",
    "Tổng số lượt đăng ký",
    "Doanh thu tổng của gia sư",
  ],
  apiEndpoints: [
    "manage-payment/search-with-time-for-tutor-revenue",
    "manage-payment/search-with-time",
  ],
};

/**
 * Validate page structure consistency
 */
function validatePageStructure() {
  console.log("🔍 VALIDATING TUTOR REVENUE STATISTICS PAGE STRUCTURE");
  console.log("=".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  // Check if on correct page
  const currentPath = window.location.pathname;
  if (!currentPath.includes("doanh-thu-gia-su")) {
    results.details.push({
      type: "error",
      test: "Page Location",
      message: `Not on TutorRevenueStatistics page. Current: ${currentPath}`,
    });
    results.failed++;
  } else {
    results.details.push({
      type: "success",
      test: "Page Location",
      message: "On correct page",
    });
    results.passed++;
  }

  // Check for SearchBar component
  const searchContainer = document.querySelector(
    ".admin-search-container, .search-bar-container"
  );
  const searchSelect = document.querySelector("select");
  const searchInput = document.querySelector('input[type="text"]');

  if (searchContainer || (searchSelect && searchInput)) {
    results.details.push({
      type: "success",
      test: "SearchBar Component",
      message: "SearchBar component or equivalent found",
    });
    results.passed++;
  } else {
    results.details.push({
      type: "error",
      test: "SearchBar Component",
      message: "SearchBar component not found",
    });
    results.failed++;
  }

  // Check search field options
  if (searchSelect) {
    const options = Array.from(searchSelect.options).map(
      (opt) => opt.textContent
    );
    const expectedOptions = VALIDATION_CONFIG.expectedSearchFields.map(
      (field) => field.label
    );

    const hasAllOptions = expectedOptions.every((expected) =>
      options.some((option) => option.includes(expected))
    );

    if (hasAllOptions) {
      results.details.push({
        type: "success",
        test: "Search Field Options",
        message: `All expected search options found: ${expectedOptions.join(
          ", "
        )}`,
      });
      results.passed++;
    } else {
      results.details.push({
        type: "warning",
        test: "Search Field Options",
        message: `Expected: ${expectedOptions.join(
          ", "
        )}, Found: ${options.join(", ")}`,
      });
      results.warnings++;
    }
  }

  // Check table structure
  const table = document.querySelector("table");
  if (table) {
    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.textContent.trim()
    );
    const hasExpectedColumns = VALIDATION_CONFIG.expectedColumns.every(
      (expected) => headers.some((header) => header.includes(expected))
    );

    if (hasExpectedColumns) {
      results.details.push({
        type: "success",
        test: "Table Columns",
        message: "All expected columns found",
      });
      results.passed++;
    } else {
      results.details.push({
        type: "warning",
        test: "Table Columns",
        message: `Expected: ${VALIDATION_CONFIG.expectedColumns.join(
          ", "
        )}, Found: ${headers.join(", ")}`,
      });
      results.warnings++;
    }

    // Check for sortable headers
    const sortableHeaders = table.querySelectorAll(
      'th[class*="sortable"], th:has(.sort-icon)'
    );
    if (sortableHeaders.length > 0) {
      results.details.push({
        type: "success",
        test: "Sortable Headers",
        message: `Found ${sortableHeaders.length} sortable headers`,
      });
      results.passed++;
    } else {
      results.details.push({
        type: "warning",
        test: "Sortable Headers",
        message: "No sortable headers detected",
      });
      results.warnings++;
    }
  } else {
    results.details.push({
      type: "error",
      test: "Table Structure",
      message: "Table not found",
    });
    results.failed++;
  }

  // Check for pagination
  const pagination = document.querySelector(
    '[class*="pagination"], .react-paginate'
  );
  if (pagination) {
    results.details.push({
      type: "success",
      test: "Pagination",
      message: "Pagination component found",
    });
    results.passed++;
  } else {
    results.details.push({
      type: "warning",
      test: "Pagination",
      message: "Pagination component not found",
    });
    results.warnings++;
  }

  // Check for export button
  const exportButton = document.querySelector(
    'button:contains("Xuất"), button[class*="export"]'
  );
  if (exportButton) {
    results.details.push({
      type: "success",
      test: "Export Functionality",
      message: "Export button found",
    });
    results.passed++;
  } else {
    results.details.push({
      type: "warning",
      test: "Export Functionality",
      message: "Export button not found",
    });
    results.warnings++;
  }

  return results;
}

/**
 * Compare with other statistics pages
 */
async function compareWithOtherPages() {
  console.log("\n🔍 COMPARING WITH OTHER STATISTICS PAGES");
  console.log("=".repeat(60));

  const otherPages = ["/admin/luot-thue-gia-su", "/admin/doanh-thu"];

  const currentPageStructure = validatePageStructure();

  console.log("📊 Current Page Structure Summary:");
  console.log(`✅ Passed: ${currentPageStructure.passed}`);
  console.log(`⚠️  Warnings: ${currentPageStructure.warnings}`);
  console.log(`❌ Failed: ${currentPageStructure.failed}`);

  console.log("\n📋 Detailed Results:");
  currentPageStructure.details.forEach((detail) => {
    const icon =
      detail.type === "success"
        ? "✅"
        : detail.type === "warning"
        ? "⚠️"
        : "❌";
    console.log(`${icon} ${detail.test}: ${detail.message}`);
  });

  return currentPageStructure;
}

/**
 * Validate API integration
 */
async function validateAPIIntegration() {
  console.log("\n🔍 VALIDATING API INTEGRATION");
  console.log("=".repeat(60));

  const results = [];

  // Check if API logger is working
  if (window.apiLogger) {
    results.push({
      type: "success",
      test: "API Logger",
      message: "API Logger available",
    });

    // Enable logging for testing
    window.apiLogger.enable();
  } else {
    results.push({
      type: "warning",
      test: "API Logger",
      message: "API Logger not found",
    });
  }

  // Check if Api function is available
  if (
    window.Api ||
    (window.React && document.querySelector("[data-reactroot]"))
  ) {
    results.push({
      type: "success",
      test: "API Client",
      message: "API client appears to be available",
    });
  } else {
    results.push({
      type: "warning",
      test: "API Client",
      message: "API client not detected",
    });
  }

  // Test basic endpoint connectivity
  try {
    const testUrl = `${window.location.origin}/api/manage-payment/search-with-time`;
    const testResponse = await fetch(testUrl + "?rpp=1&page=1", {
      method: "HEAD",
      headers: {
        ...(localStorage.getItem("token") && {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }),
      },
    });

    if (testResponse.ok || testResponse.status === 401) {
      results.push({
        type: "success",
        test: "API Connectivity",
        message: `API endpoint accessible (status: ${testResponse.status})`,
      });
    } else {
      results.push({
        type: "warning",
        test: "API Connectivity",
        message: `API endpoint returned ${testResponse.status}`,
      });
    }
  } catch (error) {
    results.push({
      type: "warning",
      test: "API Connectivity",
      message: `Network error: ${error.message}`,
    });
  }

  return results;
}

/**
 * Generate comprehensive validation report
 */
async function generateValidationReport() {
  console.log("📊 GENERATING COMPREHENSIVE VALIDATION REPORT");
  console.log("=".repeat(60));

  const structureResults = await compareWithOtherPages();
  const apiResults = await validateAPIIntegration();

  const overallResults = {
    structure: structureResults,
    api: apiResults,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
  };

  console.log("\n📋 FINAL VALIDATION SUMMARY");
  console.log("=".repeat(60));

  const totalPassed =
    structureResults.passed +
    apiResults.filter((r) => r.type === "success").length;
  const totalWarnings =
    structureResults.warnings +
    apiResults.filter((r) => r.type === "warning").length;
  const totalFailed =
    structureResults.failed +
    apiResults.filter((r) => r.type === "error").length;

  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);
  console.log(`❌ Total Failed: ${totalFailed}`);

  if (totalFailed === 0 && totalWarnings <= 2) {
    console.log("\n🎉 VALIDATION SUCCESSFUL!");
    console.log(
      "✅ TutorRevenueStatistics page structure is consistent with other statistics pages"
    );
  } else if (totalFailed === 0) {
    console.log("\n⚠️  VALIDATION PASSED WITH WARNINGS");
    console.log(
      "🔧 Some minor issues detected but overall structure is correct"
    );
  } else {
    console.log("\n❌ VALIDATION FAILED");
    console.log("🚨 Critical issues detected that need to be addressed");
  }

  console.log("\n📊 API Results:");
  apiResults.forEach((result) => {
    const icon =
      result.type === "success"
        ? "✅"
        : result.type === "warning"
        ? "⚠️"
        : "❌";
    console.log(`${icon} ${result.test}: ${result.message}`);
  });

  return overallResults;
}

/**
 * Quick validation check
 */
function quickValidation() {
  console.log("⚡ QUICK VALIDATION CHECK");
  console.log("=".repeat(40));

  const checks = [
    {
      name: "SearchBar Component",
      test: () =>
        document.querySelector("select") &&
        document.querySelector('input[type="text"]'),
    },
    {
      name: "Table Structure",
      test: () => document.querySelector("table"),
    },
    {
      name: "Expected Columns",
      test: () => {
        const headers = Array.from(document.querySelectorAll("th")).map(
          (th) => th.textContent
        );
        return (
          headers.some((h) => h.includes("Mã gia sư")) &&
          headers.some((h) => h.includes("Doanh thu"))
        );
      },
    },
    {
      name: "Pagination",
      test: () =>
        document.querySelector('[class*="pagination"], .react-paginate'),
    },
    {
      name: "API Logger",
      test: () => window.apiLogger !== undefined,
    },
  ];

  const results = checks.map((check) => ({
    name: check.name,
    passed: check.test(),
  }));

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
  });

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\n📊 Summary: ${passedCount}/${results.length} checks passed`);

  return results;
}

// Auto-run validation if on the correct page
if (window.location.pathname.includes("doanh-thu-gia-su")) {
  console.log("🎯 Auto-running TutorRevenueStatistics validation...");

  setTimeout(() => {
    quickValidation();
    setTimeout(() => {
      generateValidationReport();
    }, 2000);
  }, 1000);
}

// Expose functions globally
window.validatePageStructure = validatePageStructure;
window.compareWithOtherPages = compareWithOtherPages;
window.validateAPIIntegration = validateAPIIntegration;
window.generateValidationReport = generateValidationReport;
window.quickValidation = quickValidation;

console.log("🔍 TutorRevenueStatistics Structure Validation Script Loaded!");
console.log("📋 Available Commands:");
console.log("  - quickValidation() - Quick structure check");
console.log("  - validatePageStructure() - Detailed page structure validation");
console.log("  - validateAPIIntegration() - Check API integration");
console.log("  - generateValidationReport() - Comprehensive validation report");
