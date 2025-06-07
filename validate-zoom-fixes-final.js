/**
 * ZOOM FIXES VALIDATION SCRIPT
 * ===========================
 *
 * This script validates that the key fixes for Zoom meeting issues are in place:
 * 1. Route protection fix (App.jsx)
 * 2. Import fix (TutorMeetingRoomPage.jsx)
 * 3. Navigation state fixes (classroom pages)
 */

const fs = require("fs");
const path = require("path");

class ZoomFixesValidator {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: "\x1b[36m", // cyan
      success: "\x1b[32m", // green
      error: "\x1b[31m", // red
      warning: "\x1b[33m", // yellow
      reset: "\x1b[0m", // reset
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    this.results.push({ timestamp, message, type });
  }

  async validateRouteProtectionFix() {
    this.log("=== VALIDATING ROUTE PROTECTION FIX ===", "info");

    try {
      const appJsPath = path.join(__dirname, "src", "App.jsx");
      const content = fs.readFileSync(appJsPath, "utf8");

      // Check if phong-hop-zoom route is in shared section
      const sharedRoutePattern =
        /\/\*\*[\s\S]*?Shared routes for both USER and TUTOR[\s\S]*?\*\/[\s\S]*?phong-hop-zoom/;
      const tutorOnlyPattern =
        /\/\*\*[\s\S]*?TUTOR-only routes[\s\S]*?\*\/[\s\S]*?phong-hop-zoom/;

      if (sharedRoutePattern.test(content)) {
        this.log(
          "✅ Route protection fix VERIFIED - phong-hop-zoom is in shared section",
          "success"
        );
        return true;
      } else if (tutorOnlyPattern.test(content)) {
        this.log(
          "❌ Route protection fix MISSING - phong-hop-zoom still in TUTOR-only section",
          "error"
        );
        return false;
      } else {
        this.log(
          "⚠️ Route protection status UNCLEAR - manual verification needed",
          "warning"
        );
        return false;
      }
    } catch (error) {
      this.log(
        `❌ Failed to validate route protection fix: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async validateImportFix() {
    this.log("=== VALIDATING IMPORT FIX ===", "info");

    try {
      const meetingRoomPath = path.join(
        __dirname,
        "src",
        "pages",
        "User",
        "TutorMeetingRoomPage.jsx"
      );
      const content = fs.readFileSync(meetingRoomPath, "utf8");

      // Check for ZoomDebugComponent import
      const importPattern =
        /import\s+ZoomDebugComponent\s+from\s+["'].*?ZoomDebugComponent["']/;

      if (importPattern.test(content)) {
        this.log(
          "✅ Import fix VERIFIED - ZoomDebugComponent import found",
          "success"
        );

        // Also check if component is used
        if (content.includes("<ZoomDebugComponent")) {
          this.log(
            "✅ Component usage VERIFIED - ZoomDebugComponent is used in JSX",
            "success"
          );
        } else {
          this.log("⚠️ Component imported but not used in JSX", "warning");
        }

        return true;
      } else {
        this.log(
          "❌ Import fix MISSING - ZoomDebugComponent import not found",
          "error"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Failed to validate import fix: ${error.message}`, "error");
      return false;
    }
  }

  async validateNavigationFixes() {
    this.log("=== VALIDATING NAVIGATION FIXES ===", "info");

    const filesToCheck = [
      {
        path: path.join(
          __dirname,
          "src",
          "pages",
          "User",
          "TutorClassroomPage.jsx"
        ),
        name: "TutorClassroomPage",
        expectedRole: "host",
      },
      {
        path: path.join(
          __dirname,
          "src",
          "pages",
          "User",
          "StudentClassroomPage.jsx"
        ),
        name: "StudentClassroomPage",
        expectedRole: "student",
      },
    ];

    let allValid = true;

    for (const file of filesToCheck) {
      try {
        const content = fs.readFileSync(file.path, "utf8");

        // Check for userRole navigation state
        const navigationPattern = new RegExp(
          `userRole:\\s*["']${file.expectedRole}["']`
        );

        if (navigationPattern.test(content)) {
          this.log(
            `✅ ${file.name} navigation fix VERIFIED - userRole: "${file.expectedRole}" found`,
            "success"
          );
        } else {
          this.log(
            `❌ ${file.name} navigation fix MISSING - userRole: "${file.expectedRole}" not found`,
            "error"
          );
          allValid = false;
        }

        // Check for navigate function call to phong-hop-zoom
        if (content.includes("phong-hop-zoom")) {
          this.log(
            `✅ ${file.name} route navigation VERIFIED - phong-hop-zoom route found`,
            "success"
          );
        } else {
          this.log(
            `⚠️ ${file.name} route navigation UNCLEAR - manual check needed`,
            "warning"
          );
        }
      } catch (error) {
        this.log(
          `❌ Failed to validate ${file.name}: ${error.message}`,
          "error"
        );
        allValid = false;
      }
    }

    return allValid;
  }

  async validatePackageJson() {
    this.log("=== VALIDATING PACKAGE DEPENDENCIES ===", "info");

    try {
      const packagePath = path.join(__dirname, "package.json");
      const content = fs.readFileSync(packagePath, "utf8");
      const packageJson = JSON.parse(content);

      const requiredDeps = ["@zoom/meetingsdk", "react-router-dom", "axios"];

      let allPresent = true;

      for (const dep of requiredDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log(
            `✅ Dependency ${dep} found: ${packageJson.dependencies[dep]}`,
            "success"
          );
        } else {
          this.log(`❌ Missing dependency: ${dep}`, "error");
          allPresent = false;
        }
      }

      return allPresent;
    } catch (error) {
      this.log(`❌ Failed to validate package.json: ${error.message}`, "error");
      return false;
    }
  }

  async runAllValidations() {
    this.log("🔍 STARTING ZOOM FIXES VALIDATION", "info");
    this.log("=" * 50, "info");

    const validations = [
      {
        name: "Route Protection Fix",
        fn: () => this.validateRouteProtectionFix(),
      },
      { name: "Import Fix", fn: () => this.validateImportFix() },
      { name: "Navigation Fixes", fn: () => this.validateNavigationFixes() },
      { name: "Package Dependencies", fn: () => this.validatePackageJson() },
    ];

    const results = {};

    for (const validation of validations) {
      this.log(`\n🧪 Running ${validation.name}...`, "info");
      results[validation.name] = await validation.fn();
    }

    // Summary
    this.log("\n" + "=" * 50, "info");
    this.log("📊 VALIDATION SUMMARY", "info");
    this.log("=" * 50, "info");

    const passed = Object.values(results).filter((r) => r === true).length;
    const total = Object.keys(results).length;

    for (const [name, result] of Object.entries(results)) {
      const status = result ? "✅ PASS" : "❌ FAIL";
      this.log(`${status} - ${name}`, result ? "success" : "error");
    }

    this.log(
      `\n📈 Overall: ${passed}/${total} validations passed`,
      passed === total ? "success" : "warning"
    );

    if (passed === total) {
      this.log(
        "🎉 All fixes are in place! Ready for manual testing.",
        "success"
      );
    } else {
      this.log(
        "⚠️ Some fixes may be missing. Check the details above.",
        "warning"
      );
    }

    return { passed, total, results };
  }
}

// Run validation
const validator = new ZoomFixesValidator();
validator
  .runAllValidations()
  .then((summary) => {
    console.log("\n🏁 Validation complete!");

    if (summary.passed === summary.total) {
      console.log("✅ Ready to proceed with manual testing!");
    } else {
      console.log("❌ Please fix the issues above before manual testing.");
    }
  })
  .catch((error) => {
    console.error("❌ Validation failed:", error);
  });
