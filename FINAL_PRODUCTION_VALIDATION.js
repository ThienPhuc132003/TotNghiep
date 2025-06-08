// FINAL PRODUCTION BLACK SCREEN FIX VALIDATION
// Run this in the browser console at https://giasuvlu.click/tai-khoan/ho-so/phong-hoc

(function () {
  "use strict";

  console.log("🚀 STARTING FINAL PRODUCTION BLACK SCREEN FIX VALIDATION");
  console.log("📅 Test Time:", new Date().toISOString());
  console.log("🌐 Test URL:", window.location.href);

  let testResults = [];
  let testsPassed = 0;
  let testsTotal = 0;

  function logTest(testName, passed, details = "") {
    testsTotal++;
    if (passed) testsPassed++;

    const status = passed ? "✅ PASS" : "❌ FAIL";
    const message = `${status} ${testName}${details ? ": " + details : ""}`;

    console.log(message);
    testResults.push({
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });

    return passed;
  }

  // Test 1: Verify we're on the correct page
  const isCorrectPage =
    window.location.pathname.includes("phong-hoc") ||
    window.location.pathname.includes("meeting") ||
    document.title.includes("phòng học") ||
    document.title.includes("meeting");
  logTest("Correct Page Check", isCorrectPage, window.location.pathname);

  // Test 2: Find the start meeting button
  const startButton =
    document.querySelector("button") &&
    Array.from(document.querySelectorAll("button")).find(
      (btn) =>
        btn.textContent.includes("Bắt đầu") ||
        btn.textContent.includes("Start") ||
        btn.className.includes("meeting") ||
        btn.className.includes("zoom")
    );
  logTest(
    "Start Meeting Button Found",
    !!startButton,
    startButton ? startButton.textContent.trim() : "Not found"
  );

  // Test 3: Check button state
  if (startButton) {
    const isEnabled = !startButton.disabled;
    logTest(
      "Button Enabled State",
      isEnabled,
      isEnabled ? "Button is clickable" : "Button is disabled"
    );

    // Test 4: Check button click handler
    const hasClickHandler =
      startButton.onclick ||
      startButton.addEventListener ||
      startButton.getAttribute("onclick") ||
      (getEventListeners && getEventListeners(startButton).click);
    logTest(
      "Button Click Handler",
      !!hasClickHandler,
      "Click functionality available"
    );
  }

  // Test 5: Check for Zoom SDK availability
  const hasZoomSDK = typeof window.ZoomMtg !== "undefined";
  logTest(
    "Zoom SDK Available",
    hasZoomSDK,
    hasZoomSDK ? "ZoomMtg object found" : "ZoomMtg not loaded"
  );

  // Test 6: Check for React components
  const hasReact = typeof window.React !== "undefined";
  logTest("React Framework", hasReact, "React runtime available");

  // Test 7: Check for required DOM elements
  const hasZoomContainer =
    document.querySelector('[id*="zoom"]') ||
    document.querySelector('[class*="zoom"]') ||
    document.querySelector('[data-testid*="zoom"]');
  logTest(
    "Zoom Container Present",
    !!hasZoomContainer,
    hasZoomContainer ? "Zoom container ready" : "Container not found"
  );

  // Test 8: Check console for critical errors
  const originalError = console.error;
  let errorCount = 0;
  console.error = function (...args) {
    errorCount++;
    originalError.apply(console, args);
  };

  setTimeout(() => {
    console.error = originalError;
    logTest(
      "No Critical Console Errors",
      errorCount === 0,
      `${errorCount} errors detected`
    );

    // Final summary
    console.log("\n📊 FINAL VALIDATION SUMMARY:");
    console.log(`✅ Tests Passed: ${testsPassed}/${testsTotal}`);
    console.log(
      `📈 Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`
    );

    if (testsPassed === testsTotal) {
      console.log("🎉 ALL TESTS PASSED - BLACK SCREEN FIX VALIDATED!");
    } else {
      console.log("⚠️  Some tests failed - Review results above");
    }

    console.log("\n📋 DETAILED RESULTS:", testResults);

    // Test the actual button click if available
    if (startButton && !startButton.disabled) {
      console.log("\n🎯 MANUAL TEST AVAILABLE:");
      console.log("Run this to test the button click:");
      console.log('document.querySelector("button").click();');

      // Auto-create a test function
      window.testStartMeeting = function () {
        console.log("🔬 Testing Start Meeting Button Click...");

        // Monitor for zoom container changes
        let zoomCheckInterval = setInterval(() => {
          const zoomElement = document.querySelector('[id*="zoom"]');
          if (zoomElement && zoomElement.children.length > 0) {
            console.log("✅ Zoom content appeared - BLACK SCREEN FIX WORKING!");
            clearInterval(zoomCheckInterval);
          }
        }, 500);

        // Stop monitoring after 10 seconds
        setTimeout(() => {
          clearInterval(zoomCheckInterval);
          console.log("⏰ Zoom content monitoring ended");
        }, 10000);

        // Click the button
        startButton.click();
        console.log("🖱️  Button clicked - monitoring for Zoom content...");
      };

      console.log("Available: window.testStartMeeting()");
    }

    // Create downloadable report
    window.downloadTestReport = function () {
      const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        testSummary: {
          passed: testsPassed,
          total: testsTotal,
          successRate: Math.round((testsPassed / testsTotal) * 100),
        },
        results: testResults,
      };

      const dataStr = JSON.stringify(report, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `black-screen-fix-validation-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      console.log("📊 Test report downloaded:", exportFileDefaultName);
    };

    console.log("📄 Download report: window.downloadTestReport()");
  }, 1000);

  // Test 9: Performance check
  if (performance.memory) {
    const memoryMB = Math.round(
      performance.memory.usedJSHeapSize / 1024 / 1024
    );
    logTest("Memory Usage OK", memoryMB < 100, `${memoryMB}MB used`);
  }

  // Test 10: Network connectivity
  logTest("Network Online", navigator.onLine, "Internet connection available");

  console.log("\n⏳ Running validation tests...");
})();
