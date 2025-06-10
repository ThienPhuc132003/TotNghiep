// Comprehensive test for the tutor revenue white screen fix
console.log("🔍 Starting comprehensive tutor revenue fix test...");

class TutorRevenueFixTester {
  constructor() {
    this.results = [];
    this.testStartTime = Date.now();
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString("vi-VN");
    const prefix =
      {
        error: "❌",
        success: "✅",
        warning: "⚠️",
        info: "ℹ️",
      }[type] || "ℹ️";

    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    console.log(logEntry);
    this.results.push({ timestamp, type, message });
  }

  async testRouteAccessibility() {
    this.log("=== TESTING ROUTE ACCESSIBILITY ===", "info");

    try {
      // Test if the route is accessible
      const response = await fetch("/tai-khoan/ho-so/thong-ke-doanh-thu");
      this.log(
        `Route response status: ${response.status}`,
        response.status === 200 ? "success" : "error"
      );

      if (response.status === 200) {
        const html = await response.text();
        this.log(`Response HTML length: ${html.length} characters`);

        // Check for key indicators
        const hasReactRoot = html.includes('id="root"');
        const hasTitle = html.includes("title");
        const hasScripts = html.includes("<script");

        this.log(
          `Has React root: ${hasReactRoot}`,
          hasReactRoot ? "success" : "warning"
        );
        this.log(
          `Has title tag: ${hasTitle}`,
          hasTitle ? "success" : "warning"
        );
        this.log(
          `Has scripts: ${hasScripts}`,
          hasScripts ? "success" : "warning"
        );

        return true;
      }
      return false;
    } catch (error) {
      this.log(`Route test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testComponentRendering() {
    this.log("=== TESTING COMPONENT RENDERING ===", "info");

    // Navigate to the route
    if (window.location.pathname !== "/tai-khoan/ho-so/thong-ke-doanh-thu") {
      this.log("Navigating to tutor revenue page...");
      window.history.pushState({}, "", "/tai-khoan/ho-so/thong-ke-doanh-thu");

      // Trigger a navigation event
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // Wait for component to potentially render
    await this.waitFor(3000);

    // Check DOM content
    const bodyText = document.body.textContent || "";
    const bodyHTML = document.body.innerHTML || "";

    this.log(`Body text length: ${bodyText.length} characters`);
    this.log(`Body HTML length: ${bodyHTML.length} characters`);

    // Check for specific content
    const indicators = {
      "Tutor revenue content":
        bodyText.includes("Thống kê") || bodyText.includes("doanh thu"),
      "Access denied message": bodyText.includes("Truy cập bị từ chối"),
      "Loading state":
        bodyText.includes("loading") || bodyText.includes("Đang tải"),
      "Error message": bodyText.includes("error") || bodyText.includes("lỗi"),
      "Empty/minimal content": bodyText.trim().length < 50,
    };

    Object.entries(indicators).forEach(([key, value]) => {
      this.log(
        `${key}: ${value}`,
        value && key !== "Empty/minimal content" && key !== "Error message"
          ? "success"
          : "info"
      );
    });

    return !indicators["Empty/minimal content"];
  }

  async testProtectRouteBypass() {
    this.log("=== TESTING PROTECTROUTE BYPASS ===", "info");

    // Check if we can access the route without authentication
    try {
      // Check localStorage for auth tokens
      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const userProfile = localStorage.getItem("userProfile");

      this.log(`Auth token present: ${!!authToken}`);
      this.log(`User profile present: ${!!userProfile}`);

      if (userProfile) {
        try {
          const profile = JSON.parse(userProfile);
          this.log(`User role: ${profile.roleId || "unknown"}`);
          this.log(`User roles array: ${JSON.stringify(profile.roles || [])}`);
        } catch (e) {
          this.log("Failed to parse user profile", "warning");
        }
      }

      // Check if Redux store is accessible
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        this.log("Redux DevTools available", "success");
      }

      return true;
    } catch (error) {
      this.log(`ProtectRoute test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testConsoleErrors() {
    this.log("=== CHECKING CONSOLE ERRORS ===", "info");

    // Override console.error to capture errors
    const originalError = console.error;
    const errors = [];

    console.error = (...args) => {
      errors.push(args.join(" "));
      originalError.apply(console, args);
    };

    // Wait a bit to capture any errors
    await this.waitFor(2000);

    // Restore original console.error
    console.error = originalError;

    this.log(`Console errors captured: ${errors.length}`);

    if (errors.length > 0) {
      errors.forEach((error, index) => {
        this.log(`Error ${index + 1}: ${error}`, "error");
      });
    } else {
      this.log("No console errors detected", "success");
    }

    return errors.length === 0;
  }

  async waitFor(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runAllTests() {
    this.log("🚀 Starting comprehensive test suite...", "info");

    const tests = [
      { name: "Route Accessibility", fn: () => this.testRouteAccessibility() },
      { name: "ProtectRoute Bypass", fn: () => this.testProtectRouteBypass() },
      { name: "Component Rendering", fn: () => this.testComponentRendering() },
      { name: "Console Errors", fn: () => this.testConsoleErrors() },
    ];

    const results = {};

    for (const test of tests) {
      this.log(`\n--- Running ${test.name} Test ---`, "info");
      try {
        const result = await test.fn();
        results[test.name] = result;
        this.log(
          `${test.name}: ${result ? "PASSED" : "FAILED"}`,
          result ? "success" : "error"
        );
      } catch (error) {
        results[test.name] = false;
        this.log(`${test.name}: ERROR - ${error.message}`, "error");
      }
    }

    // Summary
    this.log("\n=== TEST SUMMARY ===", "info");
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    this.log(`Tests passed: ${passedTests}/${totalTests}`);
    this.log(
      `Overall result: ${
        passedTests === totalTests ? "SUCCESS" : "PARTIAL/FAILURE"
      }`,
      passedTests === totalTests ? "success" : "warning"
    );

    const testDuration = Date.now() - this.testStartTime;
    this.log(`Test duration: ${testDuration}ms`);

    // Detailed results
    Object.entries(results).forEach(([testName, passed]) => {
      this.log(`  ${testName}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
    });

    return results;
  }
}

// Auto-run the tests
const tester = new TutorRevenueFixTester();

// Wait for page to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => tester.runAllTests(), 1000);
  });
} else {
  setTimeout(() => tester.runAllTests(), 1000);
}

// Make tester available globally for manual testing
window.tutorRevenueFixTester = tester;

console.log(
  "📋 Comprehensive test script loaded. Tests will run automatically, or call window.tutorRevenueFixTester.runAllTests() manually."
);
