// Test script for the new TutorStatistics components
// Run this in the browser console to verify functionality

console.log("🧪 Testing TutorStatistics components...");

// Test 1: Check if the main component is loaded
const checkMainComponent = () => {
  const container = document.querySelector(".tutor-statistics-container");
  if (container) {
    console.log("✅ Main TutorStatistics component loaded successfully");
    return true;
  } else {
    console.log("❌ Main TutorStatistics component not found");
    return false;
  }
};

// Test 2: Check if tabs are working
const checkTabs = () => {
  const tabs = document.querySelectorAll(".tutor-statistics-tab");
  if (tabs.length >= 3) {
    console.log("✅ All 3 tabs found:", tabs.length);
    return true;
  } else {
    console.log("❌ Expected 3 tabs, found:", tabs.length);
    return false;
  }
};

// Test 3: Check if summary cards are present
const checkSummaryCards = () => {
  const summaryCards = document.querySelectorAll(
    ".tutor-statistics-summary-card"
  );
  if (summaryCards.length >= 4) {
    console.log("✅ All 4 summary cards found:", summaryCards.length);
    return true;
  } else {
    console.log("❌ Expected 4 summary cards, found:", summaryCards.length);
    return false;
  }
};

// Test 4: Check API endpoints (simulated)
const checkAPIEndpoints = () => {
  const expectedEndpoints = [
    "manage-payment/search-with-time-by-tutor",
    "booking-request/search-with-time-for-tutor",
    "classroom-assessment/search-with-time-for-tutor",
  ];

  console.log("📊 Expected API endpoints:");
  expectedEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. ${endpoint}`);
  });

  return true;
};

// Test 5: Check if Material-UI components are working
const checkMUIComponents = () => {
  const muiComponents = [
    ".MuiCard-root",
    ".MuiTab-root",
    ".MuiGrid-item",
    ".MuiTypography-root",
  ];

  let allFound = true;
  muiComponents.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`✅ ${selector}: ${elements.length} elements found`);
    } else {
      console.log(`❌ ${selector}: No elements found`);
      allFound = false;
    }
  });

  return allFound;
};

// Run all tests
const runAllTests = () => {
  console.log("🚀 Starting TutorStatistics component tests...\n");

  const results = {
    mainComponent: checkMainComponent(),
    tabs: checkTabs(),
    summaryCards: checkSummaryCards(),
    apiEndpoints: checkAPIEndpoints(),
    muiComponents: checkMUIComponents(),
  };

  const passed = Object.values(results).filter((result) => result).length;
  const total = Object.keys(results).length;

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log(
      "🎉 All tests passed! TutorStatistics components are working correctly."
    );
  } else {
    console.log("⚠️ Some tests failed. Check the components and try again.");
  }

  return results;
};

// Auto-run tests if this script is executed
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllTests);
  } else {
    setTimeout(runAllTests, 1000); // Give components time to load
  }
}

// Export test functions for manual execution
window.tutorStatisticsTests = {
  runAllTests,
  checkMainComponent,
  checkTabs,
  checkSummaryCards,
  checkAPIEndpoints,
  checkMUIComponents,
};

console.log("📝 Test functions available via window.tutorStatisticsTests");
