#!/usr/bin/env node

/**
 * ZOOM MEETING INTEGRATION VALIDATOR
 *
 * This script checks for common issues that prevent Zoom meetings from working:
 * 1. API endpoint configuration
 * 2. Authentication setup
 * 3. Component integration
 * 4. Token management
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for terminal output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

function log(message, color = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

// File path configurations
const PROJECT_ROOT = process.cwd();
const PATHS = {
  axiosClient: path.join(PROJECT_ROOT, "src", "network", "axiosClient.js"),
  tutorClassroom: path.join(
    PROJECT_ROOT,
    "src",
    "pages",
    "User",
    "TutorClassroomPage.jsx"
  ),
  tutorMeetingRoom: path.join(
    PROJECT_ROOT,
    "src",
    "pages",
    "User",
    "TutorMeetingRoomPage.jsx"
  ),
  studentClassroom: path.join(
    PROJECT_ROOT,
    "src",
    "pages",
    "User",
    "StudentClassroomPage.jsx"
  ),
  zoomComponent: path.join(
    PROJECT_ROOT,
    "src",
    "components",
    "User",
    "Zoom",
    "ZoomMeetingEmbed.jsx"
  ),
  packageJson: path.join(PROJECT_ROOT, "package.json"),
};

/**
 * Check if a file exists and return its content
 */
function checkFile(filePath, fileName) {
  try {
    if (fs.existsSync(filePath)) {
      logSuccess(`${fileName} exists`);
      return fs.readFileSync(filePath, "utf8");
    } else {
      logError(`${fileName} not found at ${filePath}`);
      return null;
    }
  } catch (error) {
    logError(`Error reading ${fileName}: ${error.message}`);
    return null;
  }
}

/**
 * Validate axiosClient configuration
 */
function validateAxiosClient() {
  logInfo("Checking axiosClient configuration...");

  const content = checkFile(PATHS.axiosClient, "axiosClient.js");
  if (!content) return false;

  let isValid = true;

  // Check for Zoom token endpoints
  if (
    content.includes("zoomTokenEndpoints") &&
    content.includes("meeting/create") &&
    content.includes("meeting/search")
  ) {
    logSuccess("Zoom token endpoints are configured");
  } else {
    logError("Missing zoomTokenEndpoints configuration");
    isValid = false;
  }

  // Check for Bearer token handling
  if (content.includes("Bearer ${zoomAccessToken}")) {
    logSuccess("Bearer token handling is implemented");
  } else {
    logError("Missing Bearer token handling");
    isValid = false;
  }

  // Check for authentication logic
  if (content.includes("needsZoomToken")) {
    logSuccess("Zoom token authentication logic exists");
  } else {
    logError("Missing Zoom token authentication logic");
    isValid = false;
  }

  return isValid;
}

/**
 * Validate TutorClassroomPage
 */
function validateTutorClassroomPage() {
  logInfo("Checking TutorClassroomPage...");

  const content = checkFile(PATHS.tutorClassroom, "TutorClassroomPage.jsx");
  if (!content) return false;

  let isValid = true;

  // Check for meeting creation function
  if (content.includes("handleCreateMeetingSubmit")) {
    logSuccess("Meeting creation function exists");
  } else {
    logError("Missing meeting creation function");
    isValid = false;
  }

  // Check for meeting search (Enter classroom)
  if (
    content.includes("handleEnterClassroom") &&
    content.includes("meeting/search")
  ) {
    logSuccess("Meeting search functionality exists");
  } else {
    logError("Missing meeting search functionality");
    isValid = false;
  }

  // Check for proper API calls
  if (content.includes("requireToken: false")) {
    logSuccess("API calls use correct token configuration");
  } else {
    logError("API calls may have incorrect token configuration");
    isValid = false;
  }

  // Check for sort parameter
  if (content.includes('"key":"startTime","type":"DESC"')) {
    logSuccess("Meeting search uses correct sorting");
  } else {
    logError("Missing or incorrect sort parameter in meeting search");
    isValid = false;
  }

  return isValid;
}

/**
 * Validate TutorMeetingRoomPage
 */
function validateTutorMeetingRoomPage() {
  logInfo("Checking TutorMeetingRoomPage...");

  const content = checkFile(PATHS.tutorMeetingRoom, "TutorMeetingRoomPage.jsx");
  if (!content) return false;

  let isValid = true;

  // Check for signature fetching
  if (content.includes("meeting/signature") && content.includes("role: 1")) {
    logSuccess("Signature fetching is implemented");
  } else {
    logError("Missing signature fetching functionality");
    isValid = false;
  }

  // Check for ZoomMeetingEmbed usage
  if (
    content.includes("ZoomMeetingEmbed") &&
    content.includes("sdkKey") &&
    content.includes("signature")
  ) {
    logSuccess("ZoomMeetingEmbed component is properly used");
  } else {
    logError("ZoomMeetingEmbed component is not properly configured");
    isValid = false;
  }

  // Check for proper props
  if (content.includes("meetingNumber={meetingData.zoomMeetingId}")) {
    logSuccess("Meeting number prop is correctly set");
  } else {
    logError("Missing or incorrect meeting number prop");
    isValid = false;
  }

  return isValid;
}

/**
 * Validate StudentClassroomPage
 */
function validateStudentClassroomPage() {
  logInfo("Checking StudentClassroomPage...");

  const content = checkFile(PATHS.studentClassroom, "StudentClassroomPage.jsx");
  if (!content) return false;

  let isValid = true;

  // Check for enter classroom function
  if (content.includes("handleEnterClassroom")) {
    logSuccess("Enter classroom function exists");
  } else {
    logError("Missing enter classroom function");
    isValid = false;
  }

  // Check for meeting search API call
  if (content.includes("meeting/search")) {
    logSuccess("Student page uses meeting search API");
  } else {
    logError("Student page missing meeting search API");
    isValid = false;
  }

  return isValid;
}

/**
 * Validate ZoomMeetingEmbed component
 */
function validateZoomComponent() {
  logInfo("Checking ZoomMeetingEmbed component...");

  const content = checkFile(PATHS.zoomComponent, "ZoomMeetingEmbed.jsx");
  if (!content) return false;

  let isValid = true;

  // Check for Zoom SDK import
  if (content.includes("@zoom/meetingsdk") || content.includes("ZoomMtg")) {
    logSuccess("Zoom SDK is imported");
  } else {
    logError("Missing Zoom SDK import");
    isValid = false;
  }

  // Check for required props
  const requiredProps = ["sdkKey", "signature", "meetingNumber", "userName"];
  const missingProps = requiredProps.filter((prop) => !content.includes(prop));

  if (missingProps.length === 0) {
    logSuccess("All required props are handled");
  } else {
    logError(`Missing props: ${missingProps.join(", ")}`);
    isValid = false;
  }

  // Check for SDK initialization
  if (content.includes("ZoomMtg.init") && content.includes("ZoomMtg.join")) {
    logSuccess("SDK initialization and join methods are implemented");
  } else {
    logError("Missing SDK initialization or join methods");
    isValid = false;
  }

  return isValid;
}

/**
 * Check package.json dependencies
 */
function validateDependencies() {
  logInfo("Checking package.json dependencies...");

  const content = checkFile(PATHS.packageJson, "package.json");
  if (!content) return false;

  let isValid = true;

  try {
    const packageData = JSON.parse(content);
    const dependencies = {
      ...packageData.dependencies,
      ...packageData.devDependencies,
    };

    // Check for Zoom SDK
    if (dependencies["@zoom/meetingsdk"]) {
      logSuccess(
        `Zoom SDK dependency found: ${dependencies["@zoom/meetingsdk"]}`
      );
    } else {
      logError("Missing @zoom/meetingsdk dependency");
      isValid = false;
    }

    // Check for other required dependencies
    const requiredDeps = ["react", "react-dom", "react-router-dom"];
    const missingDeps = requiredDeps.filter((dep) => !dependencies[dep]);

    if (missingDeps.length === 0) {
      logSuccess("All required React dependencies are present");
    } else {
      logError(`Missing dependencies: ${missingDeps.join(", ")}`);
      isValid = false;
    }
  } catch (error) {
    logError(`Error parsing package.json: ${error.message}`);
    isValid = false;
  }

  return isValid;
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(results) {
  logInfo("Generating recommendations...");

  const failedChecks = Object.entries(results).filter(([_, passed]) => !passed);

  if (failedChecks.length === 0) {
    logSuccess(
      "All validations passed! Your Zoom integration should be working."
    );
    return;
  }

  log("\n📋 RECOMMENDATIONS TO FIX ISSUES:", "cyan");

  failedChecks.forEach(([checkName, _]) => {
    switch (checkName) {
      case "axiosClient":
        log("\n🔧 axiosClient.js issues:", "yellow");
        log("   1. Add zoomTokenEndpoints array with meeting endpoints");
        log("   2. Implement Bearer token authentication for Zoom APIs");
        log("   3. Add needsZoomToken logic for endpoint checking");
        break;

      case "tutorClassroom":
        log("\n🔧 TutorClassroomPage.jsx issues:", "yellow");
        log("   1. Implement handleCreateMeetingSubmit function");
        log("   2. Add meeting/search API call in handleEnterClassroom");
        log("   3. Use requireToken: false for Zoom API calls");
        log("   4. Add correct sort parameter for meeting search");
        break;

      case "tutorMeetingRoom":
        log("\n🔧 TutorMeetingRoomPage.jsx issues:", "yellow");
        log("   1. Add meeting/signature API call to fetch SDK credentials");
        log("   2. Configure ZoomMeetingEmbed with proper props");
        log("   3. Set role: 1 for tutor host permissions");
        break;

      case "studentClassroom":
        log("\n🔧 StudentClassroomPage.jsx issues:", "yellow");
        log("   1. Implement handleEnterClassroom function");
        log("   2. Add meeting/search API call for students");
        break;

      case "zoomComponent":
        log("\n🔧 ZoomMeetingEmbed.jsx issues:", "yellow");
        log("   1. Import @zoom/meetingsdk package");
        log("   2. Add all required props handling");
        log("   3. Implement ZoomMtg.init and ZoomMtg.join methods");
        break;

      case "dependencies":
        log("\n🔧 Package dependencies issues:", "yellow");
        log("   1. Install missing dependencies: npm install @zoom/meetingsdk");
        log("   2. Verify React and React Router versions");
        break;
    }
  });

  log("\n🚀 NEXT STEPS:", "cyan");
  log("1. Fix the issues listed above");
  log("2. Test meeting creation in browser");
  log("3. Verify Zoom token exists in localStorage");
  log("4. Check browser console for any errors");
  log("5. Use the debug tool at /zoom-debug.html for troubleshooting");
}

/**
 * Main validation function
 */
function runValidation() {
  log("🔍 ZOOM MEETING INTEGRATION VALIDATOR", "cyan");
  log("=" * 50, "cyan");

  const results = {
    axiosClient: validateAxiosClient(),
    tutorClassroom: validateTutorClassroomPage(),
    tutorMeetingRoom: validateTutorMeetingRoomPage(),
    studentClassroom: validateStudentClassroomPage(),
    zoomComponent: validateZoomComponent(),
    dependencies: validateDependencies(),
  };

  log("\n📊 VALIDATION SUMMARY:", "cyan");
  Object.entries(results).forEach(([checkName, passed]) => {
    if (passed) {
      logSuccess(`${checkName}: PASSED`);
    } else {
      logError(`${checkName}: FAILED`);
    }
  });

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const passRate = Math.round((passedChecks / totalChecks) * 100);

  log(
    `\n📈 Overall Pass Rate: ${passedChecks}/${totalChecks} (${passRate}%)`,
    "cyan"
  );

  generateRecommendations(results);

  return results;
}

// Run validation if called directly
if (require.main === module) {
  runValidation();
}

module.exports = {
  runValidation,
  validateAxiosClient,
  validateTutorClassroomPage,
  validateTutorMeetingRoomPage,
  validateStudentClassroomPage,
  validateZoomComponent,
  validateDependencies,
};
