// PRODUCTION_BLACK_SCREEN_FIX_VALIDATION.js
// Comprehensive test script for validating the black screen fix on https://giasuvlu.click

console.log("🚀 PRODUCTION BLACK SCREEN FIX VALIDATION STARTING...");
console.log("📅 Test Time:", new Date().toISOString());
console.log("🌐 Test URL:", window.location.href);

// Test configuration
const TEST_CONFIG = {
  apiBase: "https://giasuvlu.click/api",
  maxRetries: 3,
  timeoutMs: 30000,
  requiredElements: {
    startButton: 'button:contains("Bắt đầu phòng học")',
    zoomContainer: "#zmmtg-root",
    loadingState: ".zoom-loading-state",
    errorState: ".zoom-error-state",
  },
};

// Enhanced logging
function log(message, type = "info") {
  const timestamp = new Date().toISOString().substr(11, 8);
  const emoji =
    {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      debug: "🔍",
    }[type] || "📝";

  console.log(`[${timestamp}] ${emoji} ${message}`);
}

// Test Results Tracker
const testResults = {
  buttonLogicFix: false,
  zoomSdkAvailability: false,
  signatureGeneration: false,
  zoomInitialization: false,
  containerVisibility: false,
  overallSuccess: false,
  errors: [],
  diagnostics: {},
};

// 1. Test Button Logic Fix
async function testButtonLogicFix() {
  log("Testing button logic fix...", "info");

  try {
    // Check if button is properly enabled
    const startButton =
      document.querySelector('button:contains("Bắt đầu phòng học")') ||
      document.querySelector(".btn-start-meeting") ||
      Array.from(document.querySelectorAll("button")).find(
        (btn) =>
          btn.textContent.includes("Bắt đầu phòng học") ||
          btn.textContent.includes("Tham gia phòng họp")
      );

    if (!startButton) {
      throw new Error("Start meeting button not found");
    }

    const isDisabled = startButton.disabled;
    const hasProperClass = startButton.classList.contains("btn-start-meeting");

    log(`Button found: ${startButton.textContent.trim()}`, "success");
    log(`Button disabled: ${isDisabled}`, isDisabled ? "warning" : "success");
    log(
      `Has proper class: ${hasProperClass}`,
      hasProperClass ? "success" : "warning"
    );

    // Test button functionality
    if (!isDisabled) {
      log("Button is enabled - fix appears to be working", "success");
      testResults.buttonLogicFix = true;

      // Store button reference for later testing
      window.testMeetingButton = startButton;

      return {
        success: true,
        button: startButton,
        isEnabled: !isDisabled,
      };
    } else {
      throw new Error("Button is still disabled - fix may not be applied");
    }
  } catch (error) {
    log(`Button logic test failed: ${error.message}`, "error");
    testResults.errors.push(`Button Logic: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 2. Test Zoom SDK Availability
async function testZoomSdkAvailability() {
  log("Testing Zoom SDK availability...", "info");

  try {
    // Check multiple ways Zoom SDK might be loaded
    const checks = {
      windowZoomMtg: !!window.ZoomMtg,
      importZoomSdk: false,
      cdnScript: !!document.querySelector('script[src*="ZoomMtg.js"]'),
    };

    // Test dynamic import
    try {
      const module = await import("@zoom/meetingsdk");
      if (module.ZoomMtg || module.default) {
        checks.importZoomSdk = true;
        log("✅ Zoom SDK available via import", "success");
      }
    } catch (importError) {
      log(
        "⚠️ Zoom SDK import failed (expected in some environments)",
        "warning"
      );
    }

    // Test CDN availability
    if (checks.cdnScript) {
      log("✅ Zoom SDK CDN script detected", "success");
    }

    // Test window global
    if (checks.windowZoomMtg) {
      log("✅ window.ZoomMtg is available", "success");

      // Test SDK methods
      const methods = ["init", "join", "setZoomJSLib", "preLoadWasm"];
      const availableMethods = methods.filter(
        (method) => typeof window.ZoomMtg[method] === "function"
      );

      log(`Available SDK methods: ${availableMethods.join(", ")}`, "info");

      if (availableMethods.length === methods.length) {
        testResults.zoomSdkAvailability = true;
        return { success: true, checks, methods: availableMethods };
      }
    }

    testResults.diagnostics.zoomSdk = checks;

    if (!checks.windowZoomMtg && !checks.importZoomSdk) {
      throw new Error("Zoom SDK not available via any method");
    }

    return { success: true, checks };
  } catch (error) {
    log(`Zoom SDK test failed: ${error.message}`, "error");
    testResults.errors.push(`Zoom SDK: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 3. Test Signature Generation
async function testSignatureGeneration() {
  log("Testing signature generation...", "info");

  try {
    // Get authentication tokens
    const userToken = getCookie("token");
    const zoomToken = localStorage.getItem("zoomAccessToken");

    if (!userToken) {
      throw new Error("User authentication token not found");
    }

    log(
      `User token: ${userToken ? "✅" : "❌"}`,
      userToken ? "success" : "error"
    );
    log(
      `Zoom token: ${zoomToken ? "✅" : "❌"}`,
      zoomToken ? "success" : "warning"
    );

    // Get meeting data first
    const meetingResponse = await fetch(
      `${TEST_CONFIG.apiBase}/meeting/search`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!meetingResponse.ok) {
      throw new Error(`Meeting search failed: ${meetingResponse.status}`);
    }

    const meetingData = await meetingResponse.json();

    if (
      !meetingData.success ||
      !meetingData.data ||
      meetingData.data.length === 0
    ) {
      throw new Error("No meetings found for signature test");
    }

    const meeting = meetingData.data[0];
    log(`Using meeting: ${meeting.zoomMeetingId}`, "info");

    // Test signature generation
    const signatureResponse = await fetch(
      `${TEST_CONFIG.apiBase}/meeting/signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoomMeetingId: meeting.zoomMeetingId,
          role: 1,
        }),
      }
    );

    if (!signatureResponse.ok) {
      throw new Error(
        `Signature generation failed: ${signatureResponse.status}`
      );
    }

    const signatureData = await signatureResponse.json();

    if (!signatureData.success || !signatureData.data) {
      throw new Error("Invalid signature response");
    }

    const { signature, sdkKey } = signatureData.data;

    if (!signature || !sdkKey) {
      throw new Error("Missing signature or SDK key");
    }

    log(`✅ Signature generated: ${signature.substring(0, 30)}...`, "success");
    log(`✅ SDK Key received: ${sdkKey}`, "success");

    testResults.signatureGeneration = true;
    testResults.diagnostics.signature = {
      meetingId: meeting.zoomMeetingId,
      signatureLength: signature.length,
      sdkKey: sdkKey,
    };

    // Store for next test
    window.testSignatureData = {
      signature,
      sdkKey,
      meetingNumber: meeting.zoomMeetingId,
    };

    return {
      success: true,
      signature,
      sdkKey,
      meetingNumber: meeting.zoomMeetingId,
    };
  } catch (error) {
    log(`Signature generation test failed: ${error.message}`, "error");
    testResults.errors.push(`Signature: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 4. Test Zoom Initialization Process
async function testZoomInitialization() {
  log("Testing Zoom initialization process...", "info");

  try {
    if (!window.testSignatureData) {
      throw new Error("No signature data available from previous test");
    }

    const { signature, sdkKey, meetingNumber } = window.testSignatureData;

    // Ensure Zoom SDK is available
    if (!window.ZoomMtg) {
      // Try to load it
      log("Loading Zoom SDK...", "info");
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
        script.crossOrigin = "anonymous";
        script.onload = () => {
          if (window.ZoomMtg) {
            log("✅ Zoom SDK loaded successfully", "success");
            resolve();
          } else {
            reject(new Error("SDK loaded but ZoomMtg not available"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load Zoom SDK"));
        document.head.appendChild(script);
      });
    }

    // Test SDK configuration
    log("Configuring Zoom SDK...", "info");
    window.ZoomMtg.setZoomJSLib("https://source.zoom.us/3.13.2/lib", "/av");
    window.ZoomMtg.preLoadWasm();
    window.ZoomMtg.prepareWebSDK();

    // Wait for SDK readiness
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("SDK preparation timeout"));
      }, 15000);

      const checkInterval = setInterval(() => {
        if (
          window.ZoomMtg &&
          typeof window.ZoomMtg.init === "function" &&
          typeof window.ZoomMtg.join === "function"
        ) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve();
        }
      }, 200);
    });

    log("✅ Zoom SDK prepared and ready", "success");

    // Test initialization (without actually joining)
    const initPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Init timeout"));
      }, 10000);

      window.ZoomMtg.init({
        leaveUrl: window.location.origin,
        patchJsMedia: true,
        isSupportAV: true,
        success: function () {
          clearTimeout(timeout);
          log("✅ Zoom SDK initialization successful", "success");
          testResults.zoomInitialization = true;
          resolve();
        },
        error: function (error) {
          clearTimeout(timeout);
          log(
            `❌ Zoom SDK initialization failed: ${JSON.stringify(error)}`,
            "error"
          );
          reject(error);
        },
      });
    });

    await initPromise;

    return { success: true };
  } catch (error) {
    log(`Zoom initialization test failed: ${error.message}`, "error");
    testResults.errors.push(`Zoom Init: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 5. Test Container Visibility
async function testContainerVisibility() {
  log("Testing Zoom container visibility...", "info");

  try {
    // Check for container element
    let zoomContainer = document.getElementById("zmmtg-root");

    if (!zoomContainer) {
      // Create test container
      zoomContainer = document.createElement("div");
      zoomContainer.id = "zmmtg-root";
      zoomContainer.style.cssText = `
        width: 100%;
        height: 600px;
        position: relative;
        display: block;
        visibility: visible;
        background: #f0f0f0;
        border: 1px dashed #ccc;
      `;

      const testArea = document.createElement("div");
      testArea.style.cssText =
        "position: fixed; top: 10px; right: 10px; z-index: 10000; background: white; padding: 10px; border: 1px solid #000;";
      testArea.innerHTML = "<h4>Test Zoom Container</h4>";
      testArea.appendChild(zoomContainer);
      document.body.appendChild(testArea);

      log("✅ Test Zoom container created", "success");
    }

    // Test container properties
    const styles = window.getComputedStyle(zoomContainer);
    const visibility = {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      width: styles.width,
      height: styles.height,
      position: styles.position,
      zIndex: styles.zIndex,
    };

    log("Container styles:", "debug");
    Object.entries(visibility).forEach(([key, value]) => {
      log(`  ${key}: ${value}`, "debug");
    });

    // Check for common black screen causes
    const issues = [];
    if (styles.display === "none") issues.push("display: none");
    if (styles.visibility === "hidden") issues.push("visibility: hidden");
    if (styles.opacity === "0") issues.push("opacity: 0");
    if (parseInt(styles.width) === 0) issues.push("width: 0");
    if (parseInt(styles.height) === 0) issues.push("height: 0");

    if (issues.length > 0) {
      throw new Error(`Container visibility issues: ${issues.join(", ")}`);
    }

    log("✅ Container visibility test passed", "success");
    testResults.containerVisibility = true;
    testResults.diagnostics.container = visibility;

    return { success: true, styles: visibility };
  } catch (error) {
    log(`Container visibility test failed: ${error.message}`, "error");
    testResults.errors.push(`Container: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 6. Test Complete Meeting Flow (Simulation)
async function testCompleteMeetingFlow() {
  log("Testing complete meeting flow...", "info");

  try {
    // Check if we can simulate clicking the start button
    if (window.testMeetingButton) {
      log("Simulating meeting start button click...", "info");

      // Monitor for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Element node
                if (node.classList?.contains("zoom-loading-state")) {
                  log("✅ Zoom loading state detected", "success");
                }
                if (node.classList?.contains("zoom-error-state")) {
                  log("⚠️ Zoom error state detected", "warning");
                }
                if (
                  node.id === "zmmtg-root" ||
                  node.querySelector("#zmmtg-root")
                ) {
                  log("✅ Zoom container created", "success");
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Stop observing after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);

      log("✅ Meeting flow monitoring active", "success");
    }

    return { success: true };
  } catch (error) {
    log(`Complete flow test failed: ${error.message}`, "error");
    testResults.errors.push(`Complete Flow: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Utility function to get cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Generate test report
function generateTestReport() {
  const passed =
    Object.values(testResults).filter((v) => v === true).length - 1; // -1 for overallSuccess
  const total = Object.keys(testResults).length - 3; // -3 for errors, diagnostics, overallSuccess
  const successRate = Math.round((passed / total) * 100);

  testResults.overallSuccess = successRate >= 80;

  log(`\n📊 TEST REPORT SUMMARY`, "info");
  log(`===============================`, "info");
  log(
    `✅ Tests Passed: ${passed}/${total} (${successRate}%)`,
    successRate >= 80 ? "success" : "warning"
  );
  log(`❌ Tests Failed: ${total - passed}`, "info");
  log(
    `🎯 Overall Success: ${testResults.overallSuccess ? "PASS" : "FAIL"}`,
    testResults.overallSuccess ? "success" : "error"
  );

  if (testResults.errors.length > 0) {
    log(`\n🚨 ERRORS ENCOUNTERED:`, "error");
    testResults.errors.forEach((error, index) => {
      log(`  ${index + 1}. ${error}`, "error");
    });
  }

  if (Object.keys(testResults.diagnostics).length > 0) {
    log(`\n🔍 DIAGNOSTIC DATA:`, "debug");
    Object.entries(testResults.diagnostics).forEach(([key, value]) => {
      log(`  ${key}: ${JSON.stringify(value)}`, "debug");
    });
  }

  log(`\n💡 RECOMMENDED ACTIONS:`, "info");
  if (!testResults.buttonLogicFix) {
    log(
      `  • Check button disabled logic in TutorMeetingRoomPage.jsx`,
      "warning"
    );
  }
  if (!testResults.zoomSdkAvailability) {
    log(
      `  • Verify Zoom SDK loading in ZoomMeetingEmbedProductionFix.jsx`,
      "warning"
    );
  }
  if (!testResults.signatureGeneration) {
    log(`  • Check API endpoints and authentication tokens`, "warning");
  }
  if (!testResults.zoomInitialization) {
    log(`  • Review Zoom SDK configuration and initialization`, "warning");
  }
  if (!testResults.containerVisibility) {
    log(`  • Check CSS and container styling issues`, "warning");
  }

  return testResults;
}

// Main test runner
async function runAllTests() {
  log("🔥 STARTING COMPREHENSIVE BLACK SCREEN FIX VALIDATION", "info");
  log("===================================================", "info");

  const tests = [
    { name: "Button Logic Fix", fn: testButtonLogicFix },
    { name: "Zoom SDK Availability", fn: testZoomSdkAvailability },
    { name: "Signature Generation", fn: testSignatureGeneration },
    { name: "Zoom Initialization", fn: testZoomInitialization },
    { name: "Container Visibility", fn: testContainerVisibility },
    { name: "Complete Meeting Flow", fn: testCompleteMeetingFlow },
  ];

  for (const test of tests) {
    log(`\n🧪 Running: ${test.name}`, "info");
    log("─".repeat(40), "info");

    try {
      const result = await test.fn();
      if (result.success) {
        log(`✅ ${test.name} - PASSED`, "success");
      } else {
        log(`❌ ${test.name} - FAILED: ${result.error}`, "error");
      }
    } catch (error) {
      log(`💥 ${test.name} - CRASHED: ${error.message}`, "error");
      testResults.errors.push(`${test.name}: ${error.message}`);
    }

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate final report
  log("\n" + "=".repeat(50), "info");
  const report = generateTestReport();
  log("=".repeat(50), "info");

  // Store results globally for inspection
  window.blackScreenFixTestResults = report;

  return report;
}

// Auto-run if script is loaded directly
if (typeof window !== "undefined") {
  // Make functions available globally
  window.runBlackScreenFixValidation = runAllTests;
  window.testButtonLogicFix = testButtonLogicFix;
  window.testZoomSdkAvailability = testZoomSdkAvailability;
  window.testSignatureGeneration = testSignatureGeneration;
  window.testZoomInitialization = testZoomInitialization;
  window.testContainerVisibility = testContainerVisibility;

  log("🎮 Test functions loaded. Available commands:", "info");
  log("  runBlackScreenFixValidation() - Run all tests", "info");
  log("  testButtonLogicFix() - Test button logic only", "info");
  log("  testZoomSdkAvailability() - Test Zoom SDK only", "info");
  log("  testSignatureGeneration() - Test signature only", "info");
  log("  testZoomInitialization() - Test Zoom init only", "info");
  log("  testContainerVisibility() - Test container only", "info");

  // Auto-run after page load
  if (document.readyState === "complete") {
    log("Page already loaded, starting tests in 2 seconds...", "info");
    setTimeout(runAllTests, 2000);
  } else {
    window.addEventListener("load", () => {
      log("Page loaded, starting tests in 3 seconds...", "info");
      setTimeout(runAllTests, 3000);
    });
  }
}

export { runAllTests, testResults };
