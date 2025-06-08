/**
 * ZOOM TOKEN CONFIGURATION FIX - VERIFICATION TEST
 * =================================================
 *
 * This test verifies that changing requireToken from false to true
 * in the new Zoom flow matches the working old flow configuration.
 */

console.log("🔍 ZOOM TOKEN CONFIGURATION FIX - VERIFICATION");
console.log("=============================================");

const fs = require("fs");

// Function to extract requireToken value for a specific endpoint
function extractRequireToken(content, endpoint) {
  const regex = new RegExp(
    `endpoint:\\s*["']${endpoint}["'][\\s\\S]*?requireToken:\\s*(true|false)`,
    "g"
  );
  const matches = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

// Test files
const files = {
  oldFlow: "./src/pages/User/CreateMeetingPage.jsx",
  tutorClassroom: "./src/pages/User/TutorClassroomPage.jsx",
  tutorMeetingRoom: "./src/pages/User/TutorMeetingRoomPage.jsx",
  studentClassroom: "./src/pages/User/StudentClassroomPage.jsx",
};

// Read file contents
const contents = {};
for (const [key, path] of Object.entries(files)) {
  try {
    contents[key] = fs.readFileSync(path, "utf8");
  } catch (error) {
    console.error(`❌ Error reading ${path}:`, error.message);
    process.exit(1);
  }
}

console.log("\n📋 TOKEN CONFIGURATION ANALYSIS");
console.log("================================");

// Check old working flow
console.log("\n🟢 OLD WORKING FLOW (CreateMeetingPage):");
const oldCreate = extractRequireToken(contents.oldFlow, "meeting/create");
const oldSignature = extractRequireToken(contents.oldFlow, "meeting/signature");
console.log(`  meeting/create: ${oldCreate.join(", ") || "NOT FOUND"}`);
console.log(`  meeting/signature: ${oldSignature.join(", ") || "NOT FOUND"}`);

// Check new flow after fix
console.log("\n🔧 NEW FLOW AFTER TOKEN FIX:");

console.log("\n  TutorClassroomPage:");
const tutorCreate = extractRequireToken(
  contents.tutorClassroom,
  "meeting/create"
);
console.log(`    meeting/create: ${tutorCreate.join(", ") || "NOT FOUND"}`);

console.log("\n  TutorMeetingRoomPage:");
const tutorSignature = extractRequireToken(
  contents.tutorMeetingRoom,
  "meeting/signature"
);
console.log(
  `    meeting/signature: ${tutorSignature.join(", ") || "NOT FOUND"}`
);

console.log("\n  StudentClassroomPage:");
const studentSearch = extractRequireToken(
  contents.studentClassroom,
  "meeting/search"
);
console.log(`    meeting/search: ${studentSearch.join(", ") || "NOT FOUND"}`);

// Validation
console.log("\n✅ VALIDATION RESULTS");
console.log("=====================");

let allGood = true;

// Check if new flow matches old flow
if (oldCreate.includes("true") && tutorCreate.includes("true")) {
  console.log("✅ meeting/create: Token config matches (both use true)");
} else {
  console.log("❌ meeting/create: Token config mismatch!");
  console.log(
    `   Old: ${oldCreate.join(", ")}, New: ${tutorCreate.join(", ")}`
  );
  allGood = false;
}

if (oldSignature.includes("true") && tutorSignature.includes("true")) {
  console.log("✅ meeting/signature: Token config matches (both use true)");
} else {
  console.log("❌ meeting/signature: Token config mismatch!");
  console.log(
    `   Old: ${oldSignature.join(", ")}, New: ${tutorSignature.join(", ")}`
  );
  allGood = false;
}

if (studentSearch.includes("true")) {
  console.log("✅ meeting/search: Uses proper token config (true)");
} else {
  console.log("❌ meeting/search: Token config issue!");
  console.log(`   Student: ${studentSearch.join(", ")}`);
  allGood = false;
}

console.log("\n🎯 OVERALL RESULT");
console.log("=================");

if (allGood) {
  console.log("✅ ALL TOKEN CONFIGURATIONS ARE NOW CONSISTENT!");
  console.log("✅ New flow should work the same as old working flow");
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Start the development server");
  console.log("2. Test the tutor meeting creation flow");
  console.log("3. Test the student meeting join flow");
  console.log("4. Verify no more white screen issues");
} else {
  console.log("❌ TOKEN CONFIGURATION ISSUES REMAIN");
  console.log("❌ Additional fixes needed");
}

console.log("\n🔧 FILES MODIFIED:");
console.log("- TutorClassroomPage.jsx (meeting/create: false → true)");
console.log("- TutorMeetingRoomPage.jsx (meeting/signature: false → true)");
console.log("- StudentClassroomPage.jsx (meeting/search: false → true)");
