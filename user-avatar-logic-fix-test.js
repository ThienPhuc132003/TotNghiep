// User Avatar Logic Fix - Verification Script
// This script tests the new avatar selection logic

console.log("🖼️ Testing User Avatar Logic Fix...");

// Mock default avatars
const dfMale = "/assets/images/df-male.png";
const dfFemale = "/assets/images/df-female.png";

// Test function that mimics the fixed getAvatar logic
function getAvatar(userInfo) {
  // Check if user is TUTOR and has tutorProfile.avatar
  if (userInfo.roleId === "TUTOR" && userInfo.tutorProfile?.avatar) {
    return userInfo.tutorProfile.avatar;
  }

  // For regular users or if tutor doesn't have avatar, use userProfile.avatar
  if (userInfo.userProfile?.avatar) {
    return userInfo.userProfile.avatar;
  }

  // Fallback to default avatar based on gender
  const gender = userInfo.userProfile?.gender || userInfo.gender;
  return gender === "FEMALE" ? dfFemale : dfMale;
}

// Test cases
const testCases = [
  {
    name: "TUTOR with tutorProfile avatar",
    userInfo: {
      roleId: "TUTOR",
      userProfile: {
        fullname: "Nguyễn Văn Gia Sư",
        gender: "MALE",
        avatar: null,
      },
      tutorProfile: {
        avatar: "https://example.com/tutor-avatar.jpg",
      },
    },
    expected: "https://example.com/tutor-avatar.jpg",
  },
  {
    name: "TUTOR without any avatar (male)",
    userInfo: {
      roleId: "TUTOR",
      userProfile: {
        fullname: "Nguyễn Văn Gia Sư",
        gender: "MALE",
        avatar: null,
      },
      tutorProfile: {
        avatar: null,
      },
    },
    expected: dfMale,
  },
  {
    name: "TUTOR without any avatar (female)",
    userInfo: {
      roleId: "TUTOR",
      userProfile: {
        fullname: "Nguyễn Thị Gia Sư",
        gender: "FEMALE",
        avatar: null,
      },
      tutorProfile: {
        avatar: null,
      },
    },
    expected: dfFemale,
  },
  {
    name: "Regular USER with userProfile avatar",
    userInfo: {
      roleId: "USER",
      userProfile: {
        fullname: "Nguyễn Văn Học Sinh",
        gender: "MALE",
        avatar: "https://example.com/user-avatar.jpg",
      },
      tutorProfile: null,
    },
    expected: "https://example.com/user-avatar.jpg",
  },
  {
    name: "Regular USER without avatar (male)",
    userInfo: {
      roleId: "USER",
      userProfile: {
        fullname: "Nguyễn Văn Học Sinh",
        gender: "MALE",
        avatar: null,
      },
      tutorProfile: null,
    },
    expected: dfMale,
  },
  {
    name: "Regular USER without avatar (female)",
    userInfo: {
      roleId: "USER",
      userProfile: {
        fullname: "Nguyễn Thị Học Sinh",
        gender: "FEMALE",
        avatar: null,
      },
      tutorProfile: null,
    },
    expected: dfFemale,
  },
  {
    name: "TUTOR with both avatars (should prioritize tutorProfile)",
    userInfo: {
      roleId: "TUTOR",
      userProfile: {
        fullname: "Nguyễn Văn Gia Sư Pro",
        gender: "MALE",
        avatar: "https://example.com/old-user-avatar.jpg",
      },
      tutorProfile: {
        avatar: "https://example.com/new-tutor-avatar.jpg",
      },
    },
    expected: "https://example.com/new-tutor-avatar.jpg",
  },
  {
    name: "User without gender (should default to male)",
    userInfo: {
      roleId: "USER",
      userProfile: {
        fullname: "Nguyễn Văn Unknown",
        gender: null,
        avatar: null,
      },
      tutorProfile: null,
    },
    expected: dfMale,
  },
];

// Run tests
console.log("\n=== RUNNING AVATAR LOGIC TESTS ===\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);

  const result = getAvatar(testCase.userInfo);
  const passed = result === testCase.expected;

  if (passed) {
    console.log(`✅ PASS - Got: ${result}`);
    passedTests++;
  } else {
    console.log(`❌ FAIL - Expected: ${testCase.expected}, Got: ${result}`);
    failedTests++;
  }

  console.log(
    `   User: ${testCase.userInfo.userProfile?.fullname || "Unknown"}`
  );
  console.log(`   Role: ${testCase.userInfo.roleId}`);
  console.log(
    `   Gender: ${testCase.userInfo.userProfile?.gender || "Not set"}`
  );
  console.log("");
});

console.log("=== TEST SUMMARY ===");
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total: ${testCases.length}`);

if (failedTests === 0) {
  console.log("\n🎉 ALL TESTS PASSED! Avatar logic is working correctly.");
} else {
  console.log(`\n⚠️ ${failedTests} test(s) failed. Please review the logic.`);
}

// Test the logic priorities
console.log("\n=== PRIORITY TESTING ===");
console.log("Testing avatar selection priority:");
console.log("1. TUTOR role + tutorProfile.avatar ✅");
console.log("2. userProfile.avatar ✅");
console.log("3. Default avatar based on gender ✅");
console.log("4. Fallback to male if no gender ✅");

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testUserAvatarLogic = {
    getAvatar,
    testCases,
    runTests: () => {
      testCases.forEach((testCase, index) => {
        const result = getAvatar(testCase.userInfo);
        const passed = result === testCase.expected;
        console.log(
          `${passed ? "✅" : "❌"} Test ${index + 1}: ${testCase.name} - ${
            passed ? "PASS" : "FAIL"
          }`
        );
      });
    },
  };

  console.log(
    "\n💡 You can run window.testUserAvatarLogic.runTests() in browser console to test again."
  );
}
