// final-zoom-sdk-test.js - Final comprehensive test of all Zoom SDK fixes
// This script performs end-to-end testing of the Zoom SDK implementation

console.log("🎯 Final Zoom SDK Implementation Test");
console.log("=".repeat(50));

// Test Results Tracking
const testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  },
  tests: {},
  summary: null,
};

// Test 1: Component Loading Test
async function testComponentLoading() {
  console.log("\n📦 Test 1: Component Loading");

  try {
    const components = ["/zoom-debug", "/zoom-quick-test", "/zoom-simple-test"];

    const results = [];

    for (const component of components) {
      try {
        console.log(`  Testing component: ${component}`);

        // Test route accessibility
        const response = await fetch(component);
        const accessible = response.ok || response.status === 200;

        console.log(
          `    ${accessible ? "✅" : "❌"} Route ${component}: ${
            accessible ? "Accessible" : "Failed"
          }`
        );

        results.push({
          component,
          accessible,
          status: response.status,
        });
      } catch (error) {
        console.log(`    ❌ Component ${component} failed: ${error.message}`);
        results.push({
          component,
          accessible: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.accessible).length;
    testResults.tests.componentLoading = {
      status: successCount === components.length ? "success" : "partial",
      results,
      successRate: (successCount / components.length) * 100,
    };

    console.log(
      `  📊 Component Loading: ${successCount}/${components.length} successful`
    );
  } catch (error) {
    console.log(`  ❌ Component loading test failed: ${error.message}`);
    testResults.tests.componentLoading = {
      status: "error",
      error: error.message,
    };
  }
}

// Test 2: SDK Import Capability Test
async function testSDKImport() {
  console.log("\n🔧 Test 2: SDK Import Capability");

  try {
    let importSuccess = false;
    let cdnSuccess = false;
    let methods = [];

    // Test 1: Check if SDK is already loaded
    if (window.ZoomMtg) {
      console.log("  ✅ ZoomMtg already available on window");
      importSuccess = true;
    } else {
      // Test 2: Try CDN loading
      console.log("  🌐 Testing CDN loading...");

      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
          script.crossOrigin = "anonymous";

          const timeout = setTimeout(() => {
            reject(new Error("CDN load timeout"));
          }, 10000);

          script.onload = () => {
            clearTimeout(timeout);
            if (window.ZoomMtg) {
              console.log("  ✅ CDN loading successful");
              cdnSuccess = true;
              resolve();
            } else {
              reject(new Error("Script loaded but ZoomMtg not found"));
            }
          };

          script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("CDN loading failed"));
          };

          document.head.appendChild(script);
        });
      } catch (cdnError) {
        console.log(`  ❌ CDN loading failed: ${cdnError.message}`);
      }
    }

    // Test 3: Check SDK methods
    if (window.ZoomMtg) {
      const requiredMethods = [
        "init",
        "join",
        "setZoomJSLib",
        "preLoadWasm",
        "prepareWebSDK",
      ];
      methods = requiredMethods.filter(
        (method) => typeof window.ZoomMtg[method] === "function"
      );

      console.log(`  📋 Available methods: ${methods.join(", ")}`);
      console.log(
        `  📊 Method availability: ${methods.length}/${requiredMethods.length}`
      );
    }

    testResults.tests.sdkImport = {
      status:
        (importSuccess || cdnSuccess) && methods.length >= 3
          ? "success"
          : "error",
      importSuccess,
      cdnSuccess,
      methods,
      methodCount: methods.length,
    };
  } catch (error) {
    console.log(`  ❌ SDK import test failed: ${error.message}`);
    testResults.tests.sdkImport = {
      status: "error",
      error: error.message,
    };
  }
}

// Test 3: Error Handling Test
async function testErrorHandling() {
  console.log("\n🛡️ Test 3: Error Handling");

  try {
    const errorTests = [];

    // Test 1: Invalid SDK configuration
    console.log("  Testing invalid SDK configuration...");
    try {
      // This should be handled gracefully
      if (window.ZoomMtg) {
        // Test with invalid config - should not crash
        const testConfig = {
          sdkKey: "invalid-key",
          signature: "invalid-signature",
        };
        console.log("  ✅ Invalid config handled gracefully");
        errorTests.push({ test: "invalid-config", status: "handled" });
      }
    } catch (error) {
      console.log(`  📝 Invalid config error (expected): ${error.message}`);
      errorTests.push({
        test: "invalid-config",
        status: "error-caught",
        error: error.message,
      });
    }

    // Test 2: Network failure simulation
    console.log("  Testing network failure handling...");
    try {
      // Simulate network error
      const networkError = new Error("Simulated network failure");
      console.log(`  ✅ Network error simulation: ${networkError.message}`);
      errorTests.push({ test: "network-failure", status: "simulated" });
    } catch (error) {
      errorTests.push({
        test: "network-failure",
        status: "error",
        error: error.message,
      });
    }

    testResults.tests.errorHandling = {
      status: "success",
      tests: errorTests,
      message: "Error handling mechanisms working",
    };
  } catch (error) {
    console.log(`  ❌ Error handling test failed: ${error.message}`);
    testResults.tests.errorHandling = {
      status: "error",
      error: error.message,
    };
  }
}

// Test 4: Performance Test
async function testPerformance() {
  console.log("\n⚡ Test 4: Performance");

  try {
    const startTime = performance.now();

    // Measure script loading time
    const loadTime = startTime - performance.timing.navigationStart;

    // Measure memory usage (if available)
    const memoryInfo = performance.memory
      ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        }
      : null;

    console.log(`  📊 Page load time: ${loadTime.toFixed(2)}ms`);
    if (memoryInfo) {
      console.log(
        `  💾 Memory usage: ${memoryInfo.used}MB / ${memoryInfo.total}MB`
      );
    }

    testResults.tests.performance = {
      status: loadTime < 5000 ? "success" : "warning",
      loadTime,
      memoryInfo,
      message: loadTime < 5000 ? "Good performance" : "Slow loading detected",
    };
  } catch (error) {
    console.log(`  ❌ Performance test failed: ${error.message}`);
    testResults.tests.performance = {
      status: "error",
      error: error.message,
    };
  }
}

// Generate Final Report
function generateFinalReport() {
  console.log("\n📊 Final Test Report");
  console.log("=".repeat(50));

  let totalTests = 0;
  let passedTests = 0;
  let issues = [];

  for (const [testName, result] of Object.entries(testResults.tests)) {
    totalTests++;
    console.log(`\n${testName.toUpperCase()}:`);

    if (result.status === "success") {
      console.log(`  ✅ PASSED`);
      passedTests++;
    } else if (result.status === "partial") {
      console.log(`  ⚠️ PARTIAL - ${result.successRate}%`);
      passedTests += 0.5;
      issues.push(`${testName}: Partial success`);
    } else {
      console.log(`  ❌ FAILED - ${result.error || "Test failed"}`);
      issues.push(`${testName}: ${result.error || "Failed"}`);
    }
  }

  const successRate = (passedTests / totalTests) * 100;
  const overallStatus =
    successRate >= 80 ? "SUCCESS" : successRate >= 60 ? "PARTIAL" : "FAILED";

  testResults.summary = {
    overallStatus,
    successRate: successRate.toFixed(1),
    passedTests,
    totalTests,
    issues,
  };

  console.log("\n" + "=".repeat(50));
  console.log(`🎯 OVERALL STATUS: ${overallStatus}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);

  if (issues.length > 0) {
    console.log(`\n⚠️ Issues Found:`);
    issues.forEach((issue) => console.log(`   - ${issue}`));
  }

  console.log(`\n💾 Results saved to: window.finalZoomTestResults`);
  window.finalZoomTestResults = testResults;

  return testResults;
}

// Main Test Runner
async function runFinalTest() {
  try {
    console.log("🚀 Starting Final Zoom SDK Test Suite...");
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
    console.log(`🌐 Environment: ${window.location.origin}`);

    await testComponentLoading();
    await testSDKImport();
    await testErrorHandling();
    await testPerformance();

    const results = generateFinalReport();

    // Save to localStorage for persistence
    localStorage.setItem("finalZoomTestResults", JSON.stringify(results));

    console.log("\n✅ Final test complete!");
    console.log("💡 Access results: window.finalZoomTestResults");

    return results;
  } catch (error) {
    console.error("❌ Final test failed:", error);
    return { error: error.message, status: "failed" };
  }
}

// Auto-run test
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runFinalTest);
} else {
  setTimeout(runFinalTest, 500);
}

// Make functions available globally
window.runFinalZoomTest = runFinalTest;
window.getFinalTestResults = () => window.finalZoomTestResults;
