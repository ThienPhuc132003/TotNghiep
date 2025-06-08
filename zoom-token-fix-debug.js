/**
 * QUICK ZOOM TOKEN FIX VERIFICATION
 * =================================
 * Open browser console and run: debugZoomTokenFix.runTest()
 */

window.debugZoomTokenFix = {
  async runTest() {
    console.log("🔍 ZOOM TOKEN FIX VERIFICATION");
    console.log("==============================");

    // Test 1: Check if we're on the right page
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl);

    // Test 2: Check for authentication tokens
    const userToken = localStorage.getItem("token");
    const zoomToken = localStorage.getItem("zoomAccessToken");

    console.log("\n🔑 AUTHENTICATION STATUS:");
    console.log("User JWT Token:", userToken ? "✅ Present" : "❌ Missing");
    console.log("Zoom Access Token:", zoomToken ? "✅ Present" : "❌ Missing");

    // Test 3: Simulate API call pattern
    console.log("\n📡 TESTING API CALL PATTERN:");
    console.log("With requireToken: true, the API should:");
    console.log("1. Include Authorization header with JWT token");
    console.log("2. Backend validates user authentication");
    console.log("3. Backend handles Zoom authentication separately");

    // Test 4: Check if on meeting room page
    if (window.location.pathname.includes("phong-hop-zoom")) {
      console.log("\n🏫 MEETING ROOM PAGE DETECTED");

      // Check for Zoom components
      const zoomContainer = document.querySelector("#zmmtg-root");
      const debugComponent = document.querySelector('[class*="zoom"]');

      console.log("Zoom container:", zoomContainer ? "✅ Found" : "❌ Missing");
      console.log(
        "Debug component:",
        debugComponent ? "✅ Found" : "❌ Missing"
      );

      // Check for error messages
      const errorElements = document.querySelectorAll(
        '[style*="color: red"], .error'
      );
      if (errorElements.length > 0) {
        console.log("❌ Errors found on page:");
        errorElements.forEach((el, i) => {
          console.log(`  ${i + 1}. ${el.textContent.trim()}`);
        });
      } else {
        console.log("✅ No error messages visible");
      }
    }

    // Test 5: Check for console errors
    console.log("\n🚨 IMPORTANT NOTES:");
    console.log(
      "- If you see authentication errors, the fix may not be complete"
    );
    console.log("- If Zoom loads properly, the token fix is working");
    console.log("- Check network tab for API response status codes");

    return {
      hasUserToken: !!userToken,
      hasZoomToken: !!zoomToken,
      onMeetingPage: window.location.pathname.includes("phong-hop-zoom"),
      timestamp: new Date().toISOString(),
    };
  },

  checkNetworkRequests() {
    console.log("\n🌐 NETWORK REQUEST MONITORING");
    console.log("============================");
    console.log("Open Network tab and look for:");
    console.log("1. meeting/create - Should include Authorization header");
    console.log("2. meeting/signature - Should include Authorization header");
    console.log("3. meeting/search - Should include Authorization header");
    console.log("4. All should return 200 status code");
    console.log("\nIf any return 401/403, the token fix needs more work.");
  },

  simulateFlowTest() {
    console.log("\n🎯 FLOW SIMULATION TEST");
    console.log("=======================");
    console.log("To test the complete flow:");
    console.log("1. Login as tutor/student");
    console.log("2. Navigate to classroom management");
    console.log("3. Create or join a meeting");
    console.log("4. Check for smooth navigation without white screens");
    console.log("5. Verify role assignment (host vs participant)");
  },
};

// Auto-run basic test
console.log("🚀 Zoom Token Fix Debug Tool Loaded");
console.log("Run debugZoomTokenFix.runTest() to verify the fix");
console.log(
  "Run debugZoomTokenFix.checkNetworkRequests() for network monitoring"
);
console.log("Run debugZoomTokenFix.simulateFlowTest() for flow testing guide");
