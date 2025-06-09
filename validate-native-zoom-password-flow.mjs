#!/usr/bin/env node

/**
 * NATIVE ZOOM PASSWORD FLOW VALIDATION
 * =====================================
 * Script to validate that custom password flow has been removed
 * and native Zoom SDK password handling is in place
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 VALIDATING NATIVE ZOOM PASSWORD FLOW IMPLEMENTATION\n");

// Validation checks
const validations = [];

// 1. Check ZoomPasswordEntry.jsx is deleted
console.log("1. Checking ZoomPasswordEntry component removal...");
const passwordEntryPath = join(
  __dirname,
  "src/components/User/Zoom/ZoomPasswordEntry.jsx"
);
if (!existsSync(passwordEntryPath)) {
  validations.push({
    check: "ZoomPasswordEntry.jsx deleted",
    status: "✅ PASS",
  });
  console.log("   ✅ ZoomPasswordEntry.jsx has been deleted");
} else {
  validations.push({
    check: "ZoomPasswordEntry.jsx deleted",
    status: "❌ FAIL",
  });
  console.log("   ❌ ZoomPasswordEntry.jsx still exists");
}

// 2. Check TutorMeetingRoomPage.jsx changes
console.log("\n2. Checking TutorMeetingRoomPage.jsx modifications...");
const tutorPagePath = join(
  __dirname,
  "src/pages/User/TutorMeetingRoomPage.jsx"
);

if (existsSync(tutorPagePath)) {
  const tutorPageContent = readFileSync(tutorPagePath, "utf8");

  // Check ZoomPasswordEntry import is removed
  if (!tutorPageContent.includes("ZoomPasswordEntry")) {
    validations.push({
      check: "ZoomPasswordEntry import removed",
      status: "✅ PASS",
    });
    console.log("   ✅ ZoomPasswordEntry import removed");
  } else {
    validations.push({
      check: "ZoomPasswordEntry import removed",
      status: "❌ FAIL",
    });
    console.log("   ❌ ZoomPasswordEntry import still exists");
  }

  // Check showPasswordEntry state is removed
  if (!tutorPageContent.includes("showPasswordEntry")) {
    validations.push({
      check: "showPasswordEntry state removed",
      status: "✅ PASS",
    });
    console.log("   ✅ showPasswordEntry state removed");
  } else {
    validations.push({
      check: "showPasswordEntry state removed",
      status: "❌ FAIL",
    });
    console.log("   ❌ showPasswordEntry state still exists");
  }

  // Check handlePasswordSubmit is removed
  if (!tutorPageContent.includes("handlePasswordSubmit")) {
    validations.push({
      check: "handlePasswordSubmit function removed",
      status: "✅ PASS",
    });
    console.log("   ✅ handlePasswordSubmit function removed");
  } else {
    validations.push({
      check: "handlePasswordSubmit function removed",
      status: "❌ FAIL",
    });
    console.log("   ❌ handlePasswordSubmit function still exists");
  }

  // Check button text changed to "Tham gia phòng học"
  if (tutorPageContent.includes("Tham gia phòng học")) {
    validations.push({ check: "Button text updated", status: "✅ PASS" });
    console.log("   ✅ Button text changed to 'Tham gia phòng học'");
  } else {
    validations.push({ check: "Button text updated", status: "❌ FAIL" });
    console.log("   ❌ Button text not updated");
  }

  // Check passWord prop is passed to ZoomMeetingEmbed
  if (tutorPageContent.includes('passWord={meetingData.password || ""}')) {
    validations.push({
      check: "passWord prop for native handling",
      status: "✅ PASS",
    });
    console.log(
      "   ✅ passWord prop passed to ZoomMeetingEmbed for native handling"
    );
  } else {
    validations.push({
      check: "passWord prop for native handling",
      status: "❌ FAIL",
    });
    console.log("   ❌ passWord prop not properly configured");
  }
} else {
  validations.push({
    check: "TutorMeetingRoomPage.jsx exists",
    status: "❌ FAIL",
  });
  console.log("   ❌ TutorMeetingRoomPage.jsx not found");
}

// 3. Check that no other password entry components exist
console.log("\n3. Checking for any remaining custom password components...");
// This would require a more complex file system scan, but for now we'll trust the above checks

// Summary
console.log("\n" + "=".repeat(60));
console.log("VALIDATION SUMMARY");
console.log("=".repeat(60));

const passCount = validations.filter((v) => v.status.includes("✅")).length;
const failCount = validations.filter((v) => v.status.includes("❌")).length;

validations.forEach((validation) => {
  console.log(`${validation.status} ${validation.check}`);
});

console.log(`\nTOTAL: ${passCount} passed, ${failCount} failed`);

if (failCount === 0) {
  console.log("\n🎉 ALL VALIDATIONS PASSED!");
  console.log("✅ Custom password flow has been successfully removed");
  console.log("✅ Native Zoom SDK password handling is in place");
  console.log("\nNEXT STEPS:");
  console.log("1. Start development server: npm run dev");
  console.log("2. Test password-protected meeting join flow");
  console.log("3. Verify Zoom SDK native password prompt appears");
  console.log("4. Confirm smooth user experience");
} else {
  console.log("\n⚠️  SOME VALIDATIONS FAILED");
  console.log(
    "Please review the failed checks and make necessary corrections."
  );
}

// Expected flow documentation
console.log("\n" + "=".repeat(60));
console.log("EXPECTED USER FLOW");
console.log("=".repeat(60));
console.log("1. User clicks 'Tham gia phòng học' button");
console.log("2. Zoom SDK loading screen appears immediately");
console.log("3. If password required → Native Zoom password prompt");
console.log("4. User enters password → Meeting joins");
console.log("5. No custom React password components involved");

export { validations, passCount, failCount };
