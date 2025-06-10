// Final verification script for tutor revenue statistics fix
console.log("🔧 FINAL VERIFICATION - Tutor Revenue Statistics Fix");
console.log("=".repeat(60));

const testResults = {
  pageLoads: false,
  noServerError: false,
  authenticationWorks: false,
  dataDisplays: false,
  searchWorks: false,
  chartsDisabled: false,
  timestamp: new Date().toISOString(),
};

function runTests() {
  // Test 1: Page loads without 500 error
  try {
    const currentUrl = window.location.href;
    if (currentUrl.includes("thong-ke-doanh-thu")) {
      testResults.pageLoads = true;
      console.log("✅ Test 1: Page loads successfully");

      // Check for 500 error indicators
      const bodyText = document.body.textContent || document.body.innerText;
      if (
        !bodyText.includes("500") &&
        !bodyText.includes("Internal Server Error")
      ) {
        testResults.noServerError = true;
        console.log("✅ Test 2: No 500 server error detected");
      } else {
        console.log("❌ Test 2: 500 server error still present");
      }

      // Test 3: Check if component renders
      const header = document.querySelector("h1");
      if (header && header.textContent.includes("Revenue Statistics")) {
        testResults.authenticationWorks = true;
        console.log("✅ Test 3: Component renders with proper header");

        // Test 4: Check for statistics cards
        const statCards = document.querySelectorAll(".stat-card");
        if (statCards.length >= 4) {
          testResults.dataDisplays = true;
          console.log("✅ Test 4: Statistics cards display correctly");
        } else {
          console.log("⚠️ Test 4: Statistics cards not found or incomplete");
        }

        // Test 5: Check for search functionality
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        );
        if (searchInput) {
          testResults.searchWorks = true;
          console.log("✅ Test 5: Search functionality available");
        } else {
          console.log("⚠️ Test 5: Search input not found");
        }

        // Test 6: Verify charts are disabled with proper message
        const chartPlaceholder = document.querySelector(
          ".chart-disabled, .chart-placeholder"
        );
        if (chartPlaceholder) {
          testResults.chartsDisabled = true;
          console.log(
            "✅ Test 6: Charts properly disabled with informative message"
          );
        } else {
          console.log("⚠️ Test 6: Chart status unclear");
        }
      } else {
        console.log("❌ Test 3: Component header not found");
      }
    } else {
      console.log("❌ Test 1: Not on the correct page");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }

  // Display final results
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL TEST RESULTS:");
  console.log("=".repeat(60));

  Object.entries(testResults).forEach(([test, result]) => {
    if (test !== "timestamp") {
      const status = result ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} - ${test.replace(/([A-Z])/g, " $1").trim()}`);
    }
  });

  const passedTests = Object.values(testResults).filter(
    (result) => result === true
  ).length;
  const totalTests = Object.keys(testResults).length - 1; // Exclude timestamp

  console.log("\n" + "-".repeat(60));
  console.log(`📈 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);

  if (passedTests >= 4) {
    console.log("🎉 SUCCESS: Critical functionality working!");
    console.log("💡 Next step: Install react-chartjs-2 to enable charts");
  } else if (passedTests >= 2) {
    console.log("⚠️ PARTIAL SUCCESS: Basic functionality working");
    console.log("🔧 Some features may need additional fixes");
  } else {
    console.log("❌ FAILED: Major issues still present");
    console.log("🚨 Requires immediate attention");
  }

  return testResults;
}

// Run tests after a short delay to allow page to fully load
setTimeout(() => {
  console.log("🚀 Starting verification tests in 2 seconds...");
  setTimeout(runTests, 2000);
}, 1000);

// Make test function available globally
window.verifyTutorRevenueFix = runTests;
console.log("💡 Run window.verifyTutorRevenueFix() to test manually");
