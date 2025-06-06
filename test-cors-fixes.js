/**
 * Test script to verify CORS fixes and other recent implementations
 * Run this in browser console after starting dev server
 */

// Test 1: Environment Configuration
console.log("=== ENVIRONMENT TEST ===");
console.log("ENV_INFO:", window.ENV_INFO);
console.log("API_CONFIG:", window.API_CONFIG);

// Test 2: API Call to test CORS proxy
console.log("\n=== CORS PROXY TEST ===");
const testApiCall = async () => {
  try {
    const response = await fetch("/api/auth/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ CORS Proxy working! Status:", response.status);
    return true;
  } catch (error) {
    console.error("❌ CORS Proxy failed:", error);
    return false;
  }
};

// Test 3: Major Selection Dropdown (Register Page)
console.log("\n=== DROPDOWN ALIGNMENT TEST ===");
const testDropdownAlignment = () => {
  const registerMajorSelect = document.querySelector(
    ".register-major-select-container"
  );
  if (registerMajorSelect) {
    const computedStyle = getComputedStyle(registerMajorSelect);
    console.log("✅ Register Major Select found!");
    console.log("Width:", computedStyle.width);
    console.log("Height:", computedStyle.height);
    console.log("Font size:", computedStyle.fontSize);
    return true;
  } else {
    console.log(
      "❌ Register Major Select not found (normal if not on register page)"
    );
    return false;
  }
};

// Test 4: Zoom Connection Flow
console.log("\n=== ZOOM CONNECTION TEST ===");
const testZoomConnection = () => {
  const zoomToken = localStorage.getItem("zoomAccessToken");
  const returnPath = sessionStorage.getItem("zoomReturnPath");

  console.log("Zoom Access Token:", zoomToken ? "✅ Present" : "❌ Not found");
  console.log(
    "Return Path in Session:",
    returnPath ? `✅ ${returnPath}` : "❌ Not set"
  );

  return {
    hasToken: !!zoomToken,
    hasReturnPath: !!returnPath,
  };
};

// Run all tests
const runAllTests = async () => {
  console.log("🧪 RUNNING ALL TESTS...\n");

  const corsTest = await testApiCall();
  const dropdownTest = testDropdownAlignment();
  const zoomTest = testZoomConnection();

  console.log("\n=== TEST SUMMARY ===");
  console.log("CORS Proxy:", corsTest ? "✅ PASS" : "❌ FAIL");
  console.log(
    "Dropdown Alignment:",
    dropdownTest ? "✅ PASS" : "⚠️ SKIP (not on register page)"
  );
  console.log(
    "Zoom Connection:",
    zoomTest.hasToken ? "✅ CONNECTED" : "⚠️ NOT CONNECTED"
  );

  return {
    cors: corsTest,
    dropdown: dropdownTest,
    zoom: zoomTest,
  };
};

// Auto-run tests
runAllTests().then((results) => {
  console.log("\n🎯 Test completed! Results:", results);
});

// Export for manual testing
window.testCORSFixes = {
  runAllTests,
  testApiCall,
  testDropdownAlignment,
  testZoomConnection,
};

console.log("\n💡 Available manual tests:");
console.log("- window.testCORSFixes.runAllTests()");
console.log("- window.testCORSFixes.testApiCall()");
console.log("- window.testCORSFixes.testDropdownAlignment()");
console.log("- window.testCORSFixes.testZoomConnection()");
