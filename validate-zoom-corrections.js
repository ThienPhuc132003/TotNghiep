/**
 * VALIDATION SCRIPT: Zoom API Corrections
 * Validates the corrected Zoom meeting API implementation
 */

const fs = require("fs");
const path = require("path");

// File paths to validate
const filesToCheck = [
  "src/network/axiosClient.js",
  "src/pages/User/TutorClassroomPage.jsx",
  "src/pages/User/StudentClassroomPage.jsx",
];

console.log("🔍 Validating Zoom API Corrections...\n");

// Check each file exists and validate key changes
filesToCheck.forEach((filePath) => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  console.log(`✅ Checking ${filePath}:`);

  // Validate specific changes based on file
  if (filePath.includes("axiosClient.js")) {
    validateAxiosClient(content);
  } else if (filePath.includes("TutorClassroomPage.jsx")) {
    validateTutorPage(content);
  } else if (filePath.includes("StudentClassroomPage.jsx")) {
    validateStudentPage(content);
  }

  console.log("");
});

function validateAxiosClient(content) {
  const checks = [
    {
      name: "meeting/search in zoomTokenEndpoints",
      pattern: /zoomTokenEndpoints.*meeting\/search/s,
      expected: true,
    },
    {
      name: "Zoom-only authentication logic",
      pattern: /needsZoomToken.*Authorization.*Bearer.*zoomAccessToken/s,
      expected: true,
    },
    {
      name: "No dual token authentication",
      pattern: /X-Zoom-Token/,
      expected: false,
    },
  ];

  runChecks(checks, content);
}

function validateTutorPage(content) {
  const checks = [
    {
      name: "meeting/create with requireToken: false",
      pattern: /meeting\/create.*requireToken:\s*false/s,
      expected: true,
    },
    {
      name: "meeting/search API usage",
      pattern: /meeting\/search/,
      expected: true,
    },
    {
      name: "Search with sort parameters",
      pattern: /sort.*startTime.*DESC/s,
      expected: true,
    },
  ];

  runChecks(checks, content);
}

function validateStudentPage(content) {
  const checks = [
    {
      name: "meeting/search API usage",
      pattern: /meeting\/search/,
      expected: true,
    },
    {
      name: "No meeting/get-meeting calls",
      pattern: /meeting\/get-meeting/,
      expected: false,
    },
  ];

  runChecks(checks, content);
}

function runChecks(checks, content) {
  checks.forEach((check) => {
    const found = check.pattern.test(content);
    const passed = found === check.expected;

    console.log(
      `  ${passed ? "✅" : "❌"} ${check.name}: ${passed ? "PASS" : "FAIL"}`
    );

    if (!passed && check.expected) {
      console.log(`    Expected to find pattern but didn't`);
    } else if (!passed && !check.expected) {
      console.log(`    Found pattern that should have been removed`);
    }
  });
}

console.log("\n🎯 Validation Complete!");
