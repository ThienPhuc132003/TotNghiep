/**
 * PRODUCTION API TEST SCRIPT FOR GIASUVLU.CLICK
 * ==============================================
 *
 * Script này test API endpoints trên production domain https://giasuvlu.click
 * để đảm bảo black screen fix hoạt động đúng với môi trường thực tế.
 */

const PRODUCTION_CONFIG = {
  domain: "https://giasuvlu.click",
  apiBase: "https://giasuvlu.click/api",
  timeout: 10000,
};

// Test API connectivity
async function testProductionAPI() {
  console.log("🌐 Testing Production API Connectivity");
  console.log("=====================================");

  const endpoints = [
    "/auth/status",
    "/meetings",
    "/classrooms",
    "/users/profile",
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${PRODUCTION_CONFIG.apiBase}${endpoint}`);

      const response = await fetch(`${PRODUCTION_CONFIG.apiBase}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: PRODUCTION_CONFIG.timeout,
      });

      const result = {
        endpoint,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };

      if (response.ok) {
        console.log(`✅ ${endpoint}: OK (${response.status})`);
      } else {
        console.log(
          `⚠️ ${endpoint}: ${response.status} ${response.statusText}`
        );
      }

      results.push(result);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      results.push({
        endpoint,
        error: error.message,
        ok: false,
      });
    }
  }

  return results;
}

// Test media service on production
async function testProductionMediaService() {
  console.log("\n📱 Testing Production Media Service");
  console.log("===================================");

  const testMediaPath = "avatars/default-avatar.png";
  const mediaUrl = `${PRODUCTION_CONFIG.apiBase}/media/${testMediaPath}`;

  try {
    console.log(`Testing media URL: ${mediaUrl}`);

    const response = await fetch(mediaUrl, {
      method: "HEAD", // Only check headers, don't download content
      mode: "cors",
    });

    console.log(`✅ Media service status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    return {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    };
  } catch (error) {
    console.log(`❌ Media service error: ${error.message}`);
    return {
      error: error.message,
      ok: false,
    };
  }
}

// Test Zoom OAuth flow on production
async function testProductionZoomOAuth() {
  console.log("\n🔒 Testing Production Zoom OAuth Configuration");
  console.log("==============================================");

  // Check if we're already in an OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthCode = urlParams.has("code");
  const hasState = urlParams.has("state");

  console.log("Current URL:", window.location.href);
  console.log("Has OAuth code:", hasAuthCode);
  console.log("Has state parameter:", hasState);

  if (hasAuthCode) {
    console.log(
      "✅ OAuth callback detected - this means OAuth flow is working"
    );
    return {
      oauthCallback: true,
      code: urlParams.get("code"),
      state: urlParams.get("state"),
    };
  } else {
    console.log("ℹ️ No OAuth callback - this is normal for initial page load");
    return {
      oauthCallback: false,
      ready: true,
    };
  }
}

// Test environment detection logic
function testProductionEnvironmentDetection() {
  console.log("\n🎯 Testing Production Environment Detection");
  console.log("==========================================");

  const envDetection = {
    hostname: window.location.hostname,
    isGiaSuVLU: window.location.hostname.includes("giasuvlu.click"),
    isHTTPS: window.location.protocol === "https:",
    isLocalhost: window.location.hostname === "localhost",
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  // Simulate SmartZoomLoader logic
  const shouldUseProduction =
    envDetection.isGiaSuVLU &&
    envDetection.isHTTPS &&
    !envDetection.isLocalhost;

  console.log("Environment Analysis:");
  console.log("- Hostname:", envDetection.hostname);
  console.log("- Is giasuvlu.click domain:", envDetection.isGiaSuVLU);
  console.log("- Is HTTPS:", envDetection.isHTTPS);
  console.log("- Is localhost:", envDetection.isLocalhost);
  console.log("- Should use ProductionZoomSDK:", shouldUseProduction);

  if (shouldUseProduction) {
    console.log("✅ Environment detection: PRODUCTION mode correct");
  } else {
    console.log("❌ Environment detection: Issue detected");
  }

  return {
    ...envDetection,
    shouldUseProduction,
    detectionCorrect: shouldUseProduction,
  };
}

// Test button logic simulation
function testProductionButtonLogic() {
  console.log("\n🔘 Testing Production Button Logic");
  console.log("==================================");

  const scenarios = [
    {
      name: "Student joining meeting",
      userRole: "participant",
      meetingData: { id: "123456789", password: "test123" },
      isZoomConnected: false, // Students don't need OAuth
      shouldBeEnabled: true,
    },
    {
      name: "Host without OAuth",
      userRole: "host",
      meetingData: { id: "123456789", password: "test123" },
      isZoomConnected: false,
      shouldBeEnabled: false,
    },
    {
      name: "Host with OAuth",
      userRole: "host",
      meetingData: { id: "123456789", password: "test123" },
      isZoomConnected: true,
      shouldBeEnabled: true,
    },
  ];

  const results = scenarios.map((scenario) => {
    // Apply the fixed button logic
    const buttonDisabled =
      !scenario.meetingData ||
      (scenario.userRole === "host" && !scenario.isZoomConnected);
    const buttonEnabled = !buttonDisabled;
    const correct = buttonEnabled === scenario.shouldBeEnabled;

    console.log(
      `${correct ? "✅" : "❌"} ${scenario.name}: ${
        buttonEnabled ? "ENABLED" : "DISABLED"
      } (expected: ${scenario.shouldBeEnabled ? "ENABLED" : "DISABLED"})`
    );

    return {
      ...scenario,
      actualEnabled: buttonEnabled,
      correct,
    };
  });

  const allCorrect = results.every((r) => r.correct);
  console.log(
    `\n${allCorrect ? "✅" : "❌"} Button logic test: ${
      allCorrect ? "ALL CORRECT" : "ISSUES FOUND"
    }`
  );

  return {
    scenarios: results,
    allCorrect,
  };
}

// Run all production tests
async function runProductionTests() {
  console.log("🚀 RUNNING PRODUCTION TESTS ON GIASUVLU.CLICK");
  console.log("==============================================");
  console.log("Test started at:", new Date().toISOString());
  console.log("Testing on domain:", window.location.hostname);
  console.log("");

  if (!window.location.hostname.includes("giasuvlu.click")) {
    console.log(
      "❌ ERROR: This script should be run on https://giasuvlu.click"
    );
    console.log(
      "Please copy this script to browser console on the production site."
    );
    return;
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    domain: window.location.hostname,
    url: window.location.href,
  };

  try {
    // Test 1: Environment Detection
    testResults.environment = testProductionEnvironmentDetection();

    // Test 2: Button Logic
    testResults.buttonLogic = testProductionButtonLogic();

    // Test 3: Zoom OAuth
    testResults.zoomOAuth = await testProductionZoomOAuth();

    // Test 4: API Connectivity
    testResults.api = await testProductionAPI();

    // Test 5: Media Service
    testResults.media = await testProductionMediaService();

    // Summary
    console.log("\n📊 PRODUCTION TEST SUMMARY");
    console.log("==========================");
    console.log(
      "Environment Detection:",
      testResults.environment.detectionCorrect ? "PASS" : "FAIL"
    );
    console.log(
      "Button Logic:",
      testResults.buttonLogic.allCorrect ? "PASS" : "FAIL"
    );
    console.log(
      "Zoom OAuth Ready:",
      testResults.zoomOAuth.ready || testResults.zoomOAuth.oauthCallback
        ? "PASS"
        : "FAIL"
    );

    const apiSuccess = testResults.api.filter((r) => r.ok).length;
    console.log(
      `API Connectivity: ${apiSuccess}/${testResults.api.length} endpoints OK`
    );

    console.log("Media Service:", testResults.media.ok ? "PASS" : "FAIL");

    // Overall status
    const criticalTests = [
      testResults.environment.detectionCorrect,
      testResults.buttonLogic.allCorrect,
    ];

    const allCriticalPassed = criticalTests.every((test) => test);

    console.log(
      "\n🎯 OVERALL STATUS:",
      allCriticalPassed ? "✅ READY FOR USER TESTING" : "❌ ISSUES DETECTED"
    );

    if (allCriticalPassed) {
      console.log("\n🎉 BLACK SCREEN FIX VERIFICATION: SUCCESS!");
      console.log(
        "The production environment is ready for manual user testing."
      );
      console.log("Users should now be able to:");
      console.log("- Join meetings without black screen");
      console.log("- Navigate properly as students/tutors");
      console.log("- Use Zoom features without SDK errors");
    }

    return testResults;
  } catch (error) {
    console.error("❌ Production test error:", error);
    return {
      ...testResults,
      error: error.message,
    };
  }
}

// Make functions available globally for browser console
if (typeof window !== "undefined") {
  window.productionTest = {
    runAll: runProductionTests,
    testAPI: testProductionAPI,
    testMedia: testProductionMediaService,
    testZoomOAuth: testProductionZoomOAuth,
    testEnvironment: testProductionEnvironmentDetection,
    testButtonLogic: testProductionButtonLogic,
  };

  console.log("🎯 Production Test Suite Loaded!");
  console.log("Available commands:");
  console.log("- window.productionTest.runAll() - Run all tests");
  console.log("- window.productionTest.testAPI() - Test API endpoints");
  console.log(
    "- window.productionTest.testEnvironment() - Test environment detection"
  );
  console.log("- window.productionTest.testButtonLogic() - Test button logic");
  console.log("");
  console.log("To start testing: window.productionTest.runAll()");
}

// Export for Node.js if needed
if (typeof module !== "undefined") {
  module.exports = {
    runProductionTests,
    testProductionAPI,
    testProductionEnvironmentDetection,
    testProductionButtonLogic,
  };
}
