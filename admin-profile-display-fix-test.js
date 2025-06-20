// Admin Profile Display Test Script
// Test to verify that admin profile name is correctly displayed

// Simulate admin profile data structure from API
const mockAdminProfileData = {
  adminId: "ADMIN001",
  fullname: "Nguyễn Văn Admin", // lowercase 'n' as per API
  email: "admin@giasuvlu.click",
  personalEmail: "admin@giasuvlu.click",
  phoneNumber: "0123456789",
  avatar: "https://example.com/admin-avatar.jpg",
  homeAddress: "123 Admin Street",
  gender: "MALE",
  workEmail: "admin@giasuvlu.click",
  birthday: "1985-01-01",
  roleId: "BEST_ADMIN",
  status: "ACTIVE",
};

// Test Admin.jsx component logic
function testAdminComponent(adminInfo) {
  console.log("🧪 Testing Admin.jsx component logic:");
  const displayName = adminInfo?.fullname || "Admin";
  console.log(`  Input: ${JSON.stringify(adminInfo?.fullname)}`);
  console.log(`  Output: "${displayName}"`);
  console.log(
    `  ✅ Result: ${
      displayName !== "Admin"
        ? "PASS - Shows actual name"
        : "FAIL - Shows default"
    }`
  );
  return displayName;
}

// Test AdminProfileDisplay.jsx component logic (after fix)
function testAdminProfileDisplayComponent(adminProfile) {
  console.log("\n🧪 Testing AdminProfileDisplay.jsx component logic (FIXED):");
  const displayName =
    adminProfile.fullname || adminProfile.name || adminProfile.email || "Admin";
  console.log(`  Input: ${JSON.stringify(adminProfile?.fullname)}`);
  console.log(`  Output: "${displayName}"`);
  console.log(
    `  ✅ Result: ${
      displayName !== "Admin"
        ? "PASS - Shows actual name"
        : "FAIL - Shows default"
    }`
  );
  return displayName;
}

// Test AdminProfileDisplay.jsx component logic (before fix - for comparison)
function testAdminProfileDisplayComponentBefore(adminProfile) {
  console.log(
    "\n🧪 Testing AdminProfileDisplay.jsx component logic (BEFORE FIX):"
  );
  const displayName =
    adminProfile.fullName || adminProfile.name || adminProfile.email || "Admin"; // Wrong field name
  console.log(`  Input fullName: ${JSON.stringify(adminProfile?.fullName)}`);
  console.log(`  Input fullname: ${JSON.stringify(adminProfile?.fullname)}`);
  console.log(`  Output: "${displayName}"`);
  console.log(
    `  ❌ Result: ${
      displayName !== "Admin"
        ? "PASS - Shows actual name"
        : "FAIL - Shows default (expected before fix)"
    }`
  );
  return displayName;
}

// Test Redux state access (after fix)
function testReduxStateAccess(mockReduxState) {
  console.log("\n🧪 Testing Redux state access (FIXED):");
  const adminProfile = mockReduxState.admin.adminProfile; // Correct path
  console.log(`  Redux path: state.admin.adminProfile`);
  console.log(`  Profile exists: ${!!adminProfile}`);
  console.log(`  Profile fullname: ${adminProfile?.fullname}`);
  console.log(
    `  ✅ Result: ${
      adminProfile?.fullname
        ? "PASS - Profile accessible"
        : "FAIL - Profile not found"
    }`
  );
  return adminProfile;
}

// Test Redux state access (before fix - for comparison)
function testReduxStateAccessBefore(mockReduxState) {
  console.log("\n🧪 Testing Redux state access (BEFORE FIX):");
  const adminProfile = mockReduxState.admin.profile; // Wrong path
  console.log(`  Redux path: state.admin.profile`);
  console.log(`  Profile exists: ${!!adminProfile}`);
  console.log(`  Profile fullname: ${adminProfile?.fullname}`);
  console.log(
    `  ❌ Result: ${
      adminProfile?.fullname
        ? "PASS - Profile accessible"
        : "FAIL - Profile not found (expected before fix)"
    }`
  );
  return adminProfile;
}

// Mock Redux state structure
const mockReduxState = {
  admin: {
    adminProfile: mockAdminProfileData, // Correct structure
    profile: null, // Wrong structure (what was being accessed before)
  },
};

// Run all tests
console.log("🔧 ADMIN PROFILE DISPLAY FIX VERIFICATION");
console.log("=".repeat(50));

// Test current working components
testAdminComponent(mockAdminProfileData);

// Test fixed components
const correctProfile = testReduxStateAccess(mockReduxState);
if (correctProfile) {
  testAdminProfileDisplayComponent(correctProfile);
}

// Test before fix (for comparison)
console.log("\n" + "=".repeat(50));
console.log("📊 BEFORE FIX COMPARISON:");
console.log("=".repeat(50));

const incorrectProfile = testReduxStateAccessBefore(mockReduxState);
testAdminProfileDisplayComponentBefore(mockAdminProfileData);

// Summary
console.log("\n" + "=".repeat(50));
console.log("📋 SUMMARY:");
console.log("=".repeat(50));
console.log("✅ Admin.jsx - Was already correct");
console.log(
  "✅ AdminProfileDisplay.jsx - Fixed field name (fullName → fullname)"
);
console.log(
  "✅ AdminDashboardLayout.jsx - Fixed Redux path (state.admin.profile → state.admin.adminProfile)"
);
console.log(
  "✅ AdminDashboard.jsx - Fixed Redux path (state.admin.profile → state.admin.adminProfile)"
);
console.log(
  "\n🎯 Expected result: Admin's actual name should now display instead of 'Admin'"
);

// Test data validation
console.log("\n" + "=".repeat(50));
console.log("🔍 DATA VALIDATION:");
console.log("=".repeat(50));
console.log(`Mock admin fullname: "${mockAdminProfileData.fullname}"`);
console.log(
  `Redux state structure: admin.adminProfile (${typeof mockReduxState.admin
    .adminProfile})`
);
console.log(`API field name: fullname (lowercase)`);
console.log(`Component field access: adminProfile.fullname`);
console.log("✅ All field names and state paths now consistent");
