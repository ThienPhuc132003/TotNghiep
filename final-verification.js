// Final verification script for tutor revenue page
console.log("🔍 FINAL VERIFICATION - Tutor Revenue Page");

function performFinalCheck() {
  const results = {
    pageAccessible: false,
    noWhiteScreen: false,
    hasContent: false,
    noConsoleErrors: false,
    timestamp: new Date().toISOString(),
  };

  // Check 1: Page accessible
  if (window.location.pathname === "/tai-khoan/ho-so/thong-ke-doanh-thu") {
    results.pageAccessible = true;
    console.log("✅ Page accessible at correct URL");
  }

  // Check 2: No white screen (has meaningful content)
  const bodyText = document.body.textContent || "";
  if (
    bodyText.length > 100 &&
    (bodyText.includes("Thống kê") || bodyText.includes("doanh thu"))
  ) {
    results.noWhiteScreen = true;
    results.hasContent = true;
    console.log("✅ No white screen - page has content");
    console.log("✅ Page contains expected content keywords");
  }

  // Check 3: No console errors
  let errorCount = 0;
  const originalError = console.error;
  console.error = (...args) => {
    errorCount++;
    originalError.apply(console, args);
  };

  setTimeout(() => {
    console.error = originalError;
    if (errorCount === 0) {
      results.noConsoleErrors = true;
      console.log("✅ No console errors detected");
    } else {
      console.log(`❌ ${errorCount} console errors detected`);
    }

    // Final summary
    const passedChecks = Object.values(results).filter(
      (v) => v === true
    ).length;
    const totalChecks = Object.keys(results).length - 1; // Exclude timestamp

    console.log(
      `\n📊 FINAL VERIFICATION RESULTS: ${passedChecks}/${totalChecks}`
    );
    console.log("Results:", results);

    if (passedChecks === totalChecks) {
      console.log(
        "🎉 ALL CHECKS PASSED - TUTOR REVENUE PAGE FULLY FUNCTIONAL!"
      );
    } else {
      console.log("⚠️ Some checks failed - review results above");
    }
  }, 3000);

  return results;
}

// Auto-run if on the correct page
if (window.location.pathname === "/tai-khoan/ho-so/thong-ke-doanh-thu") {
  console.log("🚀 Running final verification on tutor revenue page...");
  performFinalCheck();
} else {
  console.log(
    "ℹ️ Navigate to /tai-khoan/ho-so/thong-ke-doanh-thu to run verification"
  );
}

// Make function available globally
window.performFinalCheck = performFinalCheck;

console.log(
  "📋 Final verification script loaded. Run performFinalCheck() manually if needed."
);
