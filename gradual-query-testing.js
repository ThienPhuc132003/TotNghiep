// Gradual Query Parameter Testing for TutorRevenueStatistics
// This helps identify which specific query parameter is causing issues

// Test 1: Minimal query (only required parameters)
function testMinimalQuery() {
  console.log("🧪 Test 1: Minimal Query");

  // Update the fetchData function to use minimal query
  const minimalQuery = {
    rpp: 10,
    page: 1,
  };

  console.log("Query to test:", minimalQuery);
  console.log("✅ If this works, the basic API call is fine");
  console.log("❌ If this fails, there's a fundamental API/auth issue");
}

// Test 2: Add period parameters
function testWithPeriodParams() {
  console.log("🧪 Test 2: With Period Parameters");

  const queryWithPeriod = {
    rpp: 10,
    page: 1,
    periodType: "MONTH",
    periodValue: 1,
  };

  console.log("Query to test:", queryWithPeriod);
  console.log("✅ If this works, period params are fine");
  console.log("❌ If this fails, period params are the issue");
}

// Test 3: Add sort parameter
function testWithSortParam() {
  console.log("🧪 Test 3: With Sort Parameter");

  const queryWithSort = {
    rpp: 10,
    page: 1,
    sort: JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),
  };

  console.log("Query to test:", queryWithSort);
  console.log("✅ If this works, sort param is fine");
  console.log("❌ If this fails, sort param format is the issue");
}

// Test 4: Different sort formats
function testDifferentSortFormats() {
  console.log("🧪 Test 4: Different Sort Formats");

  const sortFormats = [
    // Format 1: Current format
    JSON.stringify([{ key: "totalRevenueWithTime", type: "DESC" }]),

    // Format 2: Simple format
    "totalRevenueWithTime,DESC",

    // Format 3: Different structure
    JSON.stringify({ key: "totalRevenueWithTime", type: "DESC" }),

    // Format 4: Alternative field names
    JSON.stringify([{ field: "totalRevenueWithTime", order: "DESC" }]),
  ];

  sortFormats.forEach((format, index) => {
    console.log(`Format ${index + 1}:`, format);
  });
}

// Code snippets to replace in the component for testing

const testSnippets = {
  minimal: `
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
      };`,

  withPeriod: `
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        periodType: periodType,
        periodValue: periodValue,
      };`,

  withSort: `
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };`,

  alternativeSort: `
      const query = {
        rpp: itemsPerPage,
        page: currentPage + 1,
        sort: sortConfig.key + "," + sortConfig.direction.toUpperCase(),
      };`,
};

console.log("🔍 Query Testing Guide for TutorRevenueStatistics");
console.log("==================================================");
console.log("");
console.log("📝 Steps to identify the problematic query parameter:");
console.log("");
console.log("1. First test with minimal query (only rpp + page)");
console.log("2. If minimal works, add period parameters");
console.log("3. If period works, add sort parameter");
console.log("4. Try different sort formats if needed");
console.log("");
console.log("💡 Code snippets to use in component:");
Object.entries(testSnippets).forEach(([name, snippet]) => {
  console.log(`\n--- ${name.toUpperCase()} ---`);
  console.log(snippet);
});

// Make functions available globally
window.queryDebug = {
  testMinimalQuery,
  testWithPeriodParams,
  testWithSortParam,
  testDifferentSortFormats,
  testSnippets,
};
