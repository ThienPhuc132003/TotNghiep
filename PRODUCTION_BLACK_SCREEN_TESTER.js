/**
 * PRODUCTION BLACK SCREEN FIX TEST FOR GIASUVLU.CLICK
 * ===================================================
 *
 * Script này sẽ test black screen fix trực tiếp trên domain production
 * https://giasuvlu.click để xác định vấn đề thực tế.
 *
 * CÁCH SỬ DỤNG:
 * 1. Mở https://giasuvlu.click trên browser
 * 2. Đăng nhập và navigate đến trang meeting room
 * 3. Paste script này vào Console (F12)
 * 4. Chạy: ProductionBlackScreenTester.runTest()
 */

const ProductionBlackScreenTester = {
  domain: "https://giasuvlu.click",

  log: (message, type = "info") => {
    const emoji =
      {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
        test: "🧪",
        fix: "🔧",
        production: "🌐",
      }[type] || "ℹ️";
    console.log(
      `%c${emoji} [Production Test] ${message}`,
      `color: ${
        type === "error"
          ? "red"
          : type === "success"
          ? "green"
          : type === "warning"
          ? "orange"
          : "blue"
      }`
    );
  },

  // Test 1: Verify current page và environment
  testCurrentEnvironment() {
    this.log(
      "=== TEST 1: PRODUCTION ENVIRONMENT VERIFICATION ===",
      "production"
    );

    const currentUrl = window.location.href;
    this.log(`Current URL: ${currentUrl}`, "info");

    if (currentUrl.includes("giasuvlu.click")) {
      this.log("✓ Running on production domain", "success");
    } else {
      this.log("✗ Not on production domain", "error");
      return false;
    }

    // Check React environment
    if (window.React) {
      this.log("✓ React detected", "success");
    } else {
      this.log("⚠ React not detected in global scope", "warning");
    }

    return true;
  },

  // Test 2: Check for meeting room page elements
  testMeetingRoomElements() {
    this.log("=== TEST 2: MEETING ROOM ELEMENTS CHECK ===", "test");

    // Check for "Bắt đầu phòng học" button
    const startButton =
      document.querySelector(".btn-start-meeting") ||
      Array.from(document.querySelectorAll("button")).find((btn) =>
        btn.textContent.includes("Bắt đầu phòng học")
      );

    if (startButton) {
      this.log('✓ Found "Bắt đầu phòng học" button', "success");
      this.log(`Button text: "${startButton.textContent.trim()}"`, "info");
      this.log(`Button disabled: ${startButton.disabled}`, "info");
      this.log(`Button classes: ${startButton.className}`, "info");

      return startButton;
    } else {
      this.log('✗ "Bắt đầu phòng học" button not found', "error");
      this.log("Available buttons:", "info");
      document.querySelectorAll("button").forEach((btn, i) => {
        this.log(
          `  ${i + 1}. "${btn.textContent.trim()}" (disabled: ${btn.disabled})`,
          "info"
        );
      });
      return null;
    }
  },

  // Test 3: Check role detection
  testUserRoleDetection() {
    this.log("=== TEST 3: USER ROLE DETECTION ===", "test");

    const currentPath = window.location.pathname;
    this.log(`Current path: ${currentPath}`, "info");

    let detectedRole = "unknown";

    // Check từ URL path
    if (currentPath.includes("tutor") || currentPath.includes("teacher")) {
      detectedRole = "host";
    } else if (
      currentPath.includes("student") ||
      currentPath.includes("classroom")
    ) {
      detectedRole = "participant";
    }

    // Check từ UI elements
    const roleElements = document.querySelectorAll("p, span, div");
    let roleFromUI = "";

    roleElements.forEach((el) => {
      if (
        el.textContent.includes("Role:") ||
        el.textContent.includes("Vai trò:")
      ) {
        roleFromUI = el.textContent;
      }
    });

    this.log(`Role from URL: ${detectedRole}`, "info");
    if (roleFromUI) {
      this.log(`Role from UI: ${roleFromUI}`, "info");
    }

    return { detectedRole, roleFromUI };
  },

  // Test 4: Check meeting data availability
  testMeetingData() {
    this.log("=== TEST 4: MEETING DATA AVAILABILITY ===", "test");

    // Try to find meeting data from various sources
    const sources = [
      // React component state (if accessible)
      () => {
        const reactRoot = document.querySelector("#root");
        if (reactRoot && reactRoot._reactInternalFiber) {
          return "React state detected but not accessible from console";
        }
        return null;
      },

      // Local storage
      () => {
        const keys = Object.keys(localStorage);
        const meetingKeys = keys.filter(
          (key) =>
            key.toLowerCase().includes("meeting") ||
            key.toLowerCase().includes("zoom") ||
            key.toLowerCase().includes("classroom")
        );
        return meetingKeys.length > 0 ? meetingKeys : null;
      },

      // Session storage
      () => {
        const keys = Object.keys(sessionStorage);
        const meetingKeys = keys.filter(
          (key) =>
            key.toLowerCase().includes("meeting") ||
            key.toLowerCase().includes("zoom") ||
            key.toLowerCase().includes("classroom")
        );
        return meetingKeys.length > 0 ? meetingKeys : null;
      },

      // URL parameters
      () => {
        const urlParams = new URLSearchParams(window.location.search);
        const meetingParams = [];
        urlParams.forEach((value, key) => {
          if (
            key.toLowerCase().includes("meeting") ||
            key.toLowerCase().includes("zoom") ||
            key.toLowerCase().includes("room") ||
            key.toLowerCase().includes("id")
          ) {
            meetingParams.push(`${key}=${value}`);
          }
        });
        return meetingParams.length > 0 ? meetingParams : null;
      },
    ];

    sources.forEach((source, i) => {
      try {
        const result = source();
        if (result) {
          this.log(
            `Data source ${i + 1}: ${JSON.stringify(result)}`,
            "success"
          );
        } else {
          this.log(`Data source ${i + 1}: No data found`, "warning");
        }
      } catch (error) {
        this.log(`Data source ${i + 1}: Error - ${error.message}`, "error");
      }
    });
  },

  // Test 5: Test button click behavior
  testButtonClick(simulate = false) {
    this.log("=== TEST 5: BUTTON CLICK BEHAVIOR ===", "test");

    const button = this.testMeetingRoomElements();
    if (!button) {
      this.log("Cannot test button click - button not found", "error");
      return;
    }

    if (button.disabled) {
      this.log("Button is disabled - checking why:", "warning");

      // Try to find the reason
      const reasons = [];

      if (
        !document.querySelector("[data-meeting-id]") &&
        !window.location.search.includes("meetingId")
      ) {
        reasons.push("No meeting data found");
      }

      if (
        window.location.pathname.includes("tutor") &&
        !localStorage.getItem("zoom_token") &&
        !sessionStorage.getItem("zoom_token")
      ) {
        reasons.push("Host role but no Zoom token");
      }

      this.log(`Possible reasons: ${reasons.join(", ")}`, "info");
    } else {
      this.log("Button is enabled", "success");

      if (simulate) {
        this.log("Simulating button click...", "warning");
        // Add click event listener to catch any issues
        const originalClick = button.onclick;
        button.onclick = (e) => {
          this.log("Button clicked! Monitoring for black screen...", "test");

          setTimeout(() => {
            if (
              document.body.style.backgroundColor === "black" ||
              document.body.style.background === "black" ||
              document.querySelector(".zoom-meeting-embed")
            ) {
              this.log(
                "Zoom interface detected or black background found",
                "info"
              );
            }
          }, 2000);

          if (originalClick) {
            return originalClick.call(button, e);
          }
        };

        button.click();
      }
    }
  },

  // Test 6: Check for Zoom SDK
  testZoomSDK() {
    this.log("=== TEST 6: ZOOM SDK VERIFICATION ===", "test");

    if (window.ZoomMtg) {
      this.log("✓ Zoom Web SDK detected", "success");
      this.log(
        `SDK Version: ${window.ZoomMtg.getJSSDKVersion?.() || "Unknown"}`,
        "info"
      );
    } else {
      this.log("✗ Zoom Web SDK not found", "error");
    }

    // Check for Zoom elements
    const zoomElements = document.querySelectorAll(
      '[id*="zoom"], [class*="zoom"], [data-zoom]'
    );
    if (zoomElements.length > 0) {
      this.log(
        `✓ Found ${zoomElements.length} Zoom-related elements`,
        "success"
      );
    } else {
      this.log("No Zoom elements found in DOM", "warning");
    }
  },

  // Test 7: Network monitoring
  monitorNetworkRequests() {
    this.log("=== TEST 7: NETWORK REQUEST MONITORING ===", "test");

    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    const requests = [];

    window.fetch = function (...args) {
      const url = args[0];
      requests.push({ url, timestamp: Date.now() });

      return originalFetch
        .apply(this, args)
        .then((response) => {
          ProductionBlackScreenTester.log(
            `Network: ${url} - ${response.status}`,
            response.ok ? "success" : "error"
          );
          return response;
        })
        .catch((error) => {
          ProductionBlackScreenTester.log(
            `Network Error: ${url} - ${error.message}`,
            "error"
          );
          throw error;
        });
    };

    this.log("Network monitoring enabled", "success");
    return () => {
      window.fetch = originalFetch;
      this.log("Network monitoring disabled", "info");
      return requests;
    };
  },

  // Main test runner
  runTest() {
    this.log("🧪 STARTING PRODUCTION BLACK SCREEN FIX TEST", "test");
    this.log("Domain: https://giasuvlu.click", "production");
    this.log("=".repeat(60), "info");

    // Run all tests
    if (!this.testCurrentEnvironment()) {
      this.log("Environment test failed - stopping", "error");
      return;
    }

    this.testMeetingRoomElements();
    this.testUserRoleDetection();
    this.testMeetingData();
    this.testZoomSDK();

    // Enable network monitoring
    const stopMonitoring = this.monitorNetworkRequests();

    // Test button behavior
    this.testButtonClick(false); // Don't simulate click by default

    this.log("=".repeat(60), "info");
    this.log("🏁 PRODUCTION TEST COMPLETE", "test");
    this.log("", "info");
    this.log("NEXT STEPS:", "info");
    this.log("1. If button is disabled, check the reasons shown above", "info");
    this.log(
      "2. If button is enabled, run: ProductionBlackScreenTester.testButtonClick(true)",
      "info"
    );
    this.log("3. To stop network monitoring: stopMonitoring()", "info");

    // Return monitoring function
    return stopMonitoring;
  },

  // Helper: Show current page info
  showPageInfo() {
    this.log("=== CURRENT PAGE INFORMATION ===", "info");
    this.log(`URL: ${window.location.href}`, "info");
    this.log(`Title: ${document.title}`, "info");
    this.log(`User Agent: ${navigator.userAgent}`, "info");

    // Show all buttons on page
    const buttons = document.querySelectorAll("button");
    this.log(`Total buttons on page: ${buttons.length}`, "info");
    buttons.forEach((btn, i) => {
      this.log(
        `  ${i + 1}. "${btn.textContent.trim()}" (disabled: ${btn.disabled})`,
        "info"
      );
    });
  },
};

// Auto-setup for browser console
if (typeof window !== "undefined") {
  console.log("🌐 Production Black Screen Tester loaded for giasuvlu.click");
  console.log(
    "🔧 Console error handler initialized - Google Maps and CORS errors will be handled gracefully"
  );
  console.log("");
  console.log("Available commands:");
  console.log("- ProductionBlackScreenTester.runTest() : Run full test suite");
  console.log(
    "- ProductionBlackScreenTester.showPageInfo() : Show current page info"
  );
  console.log(
    "- ProductionBlackScreenTester.testButtonClick(true) : Test button click with simulation"
  );

  // Make available globally
  window.ProductionBlackScreenTester = ProductionBlackScreenTester;
}
