// Test script to verify TutorRevenueStatistics page fixes
// Run this in browser console after navigating to /admin/doanh-thu-gia-su

console.log("🔍 Testing TutorRevenueStatistics Page Fix...");

// Test 1: Check if the page loaded correctly
function testPageLoad() {
  const pageTitle = document.querySelector("h1, h2, h3");
  console.log("✅ Page title:", pageTitle?.textContent || "Not found");

  const tableHeaders = document.querySelectorAll("th");
  console.log("✅ Table headers found:", tableHeaders.length);

  const expectedHeaders = [
    "STT",
    "Mã gia sư",
    "Tên gia sư",
    "Tổng số lượt đăng ký",
    "Doanh thu tổng của gia sư",
  ];
  expectedHeaders.forEach((header) => {
    const found = Array.from(tableHeaders).some((th) =>
      th.textContent.includes(header)
    );
    console.log(
      `${found ? "✅" : "❌"} Header "${header}":`,
      found ? "Found" : "Missing"
    );
  });
}

// Test 2: Check API calls
function testAPICall() {
  // Monitor network requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    if (
      typeof url === "string" &&
      url.includes("manage-payment/search-with-time-for-tutor-revenue")
    ) {
      console.log("✅ API call detected:", url);
    }
    return originalFetch.apply(this, args);
  };
}

// Test 3: Check for error messages
function testErrorHandling() {
  const errorAlerts = document.querySelectorAll(
    '[role="alert"], .alert, .error'
  );
  console.log("🔍 Error alerts found:", errorAlerts.length);

  errorAlerts.forEach((alert, index) => {
    console.log(`Error ${index + 1}:`, alert.textContent);
  });
}

// Test 4: Check data structure
function testDataStructure() {
  // Look for table rows with data
  const dataRows = document.querySelectorAll("tbody tr");
  console.log("✅ Data rows found:", dataRows.length);

  if (dataRows.length > 0) {
    const firstRow = dataRows[0];
    const cells = firstRow.querySelectorAll("td");
    console.log("✅ Columns in first row:", cells.length);

    cells.forEach((cell, index) => {
      console.log(`Column ${index + 1}:`, cell.textContent.trim());
    });
  }
}

// Test 5: Check total revenue display
function testTotalRevenue() {
  const totalRevenueElement = document.querySelector("*");
  const totalRevenueText = Array.from(document.querySelectorAll("*")).find(
    (el) => el.textContent.includes("Tổng doanh thu nhận được")
  );

  if (totalRevenueText) {
    console.log(
      "✅ Total revenue display found:",
      totalRevenueText.textContent
    );
  } else {
    console.log("❌ Total revenue display not found");
  }
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting TutorRevenueStatistics Fix Tests...\n");

  setTimeout(() => {
    testPageLoad();
    console.log("\n");
  }, 1000);

  setTimeout(() => {
    testAPICall();
    console.log("\n");
  }, 2000);

  setTimeout(() => {
    testErrorHandling();
    console.log("\n");
  }, 3000);

  setTimeout(() => {
    testDataStructure();
    console.log("\n");
  }, 4000);

  setTimeout(() => {
    testTotalRevenue();
    console.log("\n✨ Tests completed!");
  }, 5000);
}

// Auto-run tests if page is already loaded
if (document.readyState === "complete") {
  runAllTests();
} else {
  window.addEventListener("load", runAllTests);
}

// Export for manual testing
window.tutorRevenueTests = {
  testPageLoad,
  testAPICall,
  testErrorHandling,
  testDataStructure,
  testTotalRevenue,
  runAllTests,
};

console.log(
  "📋 Available test functions:",
  Object.keys(window.tutorRevenueTests)
);
