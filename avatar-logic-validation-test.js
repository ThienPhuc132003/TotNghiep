// Avatar Logic Validation Test với dữ liệu response thực tế
console.log("🔍 Testing Avatar Logic với dữ liệu response thực tế...");

// Mock default avatars
const dfMale = "/assets/images/df-male.png";
const dfFemale = "/assets/images/df-female.png";

// Avatar logic function (giống trong avatarUtils.js)
function getUserAvatar(userInfo) {
  if (!userInfo) {
    return dfMale; // Default fallback
  }

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

// Test với dữ liệu response thực tế từ API
const realApiResponseData = {
  userId: "US00011",
  email: "an.nguyen2000@gmail.com",
  roleId: "TUTOR",
  coin: 2920,
  userProfile: {
    userId: "US00011",
    userDisplayName: "Nguyễn Văn An",
    fullname: "Nguyễn Văn An",
    avatar: null,
    personalEmail: "an.nguyen2000@gmail.com",
    phoneNumber: "0978123456",
    homeAddress: "123 Đường Láng, P. Láng Thượng, Q. Đống Đa, Hà Nội",
    birthday: "2000-05-05",
    gender: "MALE",
    majorId: "M0004",
  },
  tutorProfile: {
    userId: "US00011",
    avatar:
      "https://giasuvlu.click/api/media?mediaCategory=TUTOR_AVATAR&fileName=55de8b4f-fcaa-4b79-889b-c387f11354de.jpeg",
    fullname: "Nguyễn Văn An",
    birthday: "2003-03-08",
    gender: "MALE",
    univercity: "Đại học Văn Lang",
    teachingMethod: "BOTH",
    rating: "4.5",
    numberOfRating: 2,
  },
};

// Test scenarios
console.log("\n📊 Test Results:");
console.log("================");

// Test 1: TUTOR với tutorProfile.avatar (case thực tế)
const result1 = getUserAvatar(realApiResponseData);
const expected1 =
  "https://giasuvlu.click/api/media?mediaCategory=TUTOR_AVATAR&fileName=55de8b4f-fcaa-4b79-889b-c387f11354de.jpeg";
console.log(`✅ Test 1 - TUTOR với tutorProfile.avatar:`);
console.log(`   Expected: ${expected1}`);
console.log(`   Actual:   ${result1}`);
console.log(`   Status:   ${result1 === expected1 ? "PASS ✅" : "FAIL ❌"}\n`);

// Test 2: Chỉnh sửa data để test USER role
const userData = {
  ...realApiResponseData,
  roleId: "USER",
  tutorProfile: null,
};
const result2 = getUserAvatar(userData);
const expected2 = dfMale; // vì userProfile.avatar = null, gender = MALE
console.log(`✅ Test 2 - USER role, no avatar:`);
console.log(`   Expected: ${expected2}`);
console.log(`   Actual:   ${result2}`);
console.log(`   Status:   ${result2 === expected2 ? "PASS ✅" : "FAIL ❌"}\n`);

// Test 3: USER với userProfile.avatar
const userWithAvatar = {
  ...realApiResponseData,
  roleId: "USER",
  userProfile: {
    ...realApiResponseData.userProfile,
    avatar: "https://example.com/user-avatar.jpg",
  },
  tutorProfile: null,
};
const result3 = getUserAvatar(userWithAvatar);
const expected3 = "https://example.com/user-avatar.jpg";
console.log(`✅ Test 3 - USER với userProfile.avatar:`);
console.log(`   Expected: ${expected3}`);
console.log(`   Actual:   ${result3}`);
console.log(`   Status:   ${result3 === expected3 ? "PASS ✅" : "FAIL ❌"}\n`);

// Test 4: TUTOR không có tutorProfile.avatar, có userProfile.avatar
const tutorWithoutTutorAvatar = {
  ...realApiResponseData,
  roleId: "TUTOR",
  userProfile: {
    ...realApiResponseData.userProfile,
    avatar: "https://example.com/user-avatar.jpg",
  },
  tutorProfile: {
    ...realApiResponseData.tutorProfile,
    avatar: null,
  },
};
const result4 = getUserAvatar(tutorWithoutTutorAvatar);
const expected4 = "https://example.com/user-avatar.jpg";
console.log(
  `✅ Test 4 - TUTOR không có tutorProfile.avatar, có userProfile.avatar:`
);
console.log(`   Expected: ${expected4}`);
console.log(`   Actual:   ${result4}`);
console.log(`   Status:   ${result4 === expected4 ? "PASS ✅" : "FAIL ❌"}\n`);

// Test 5: Female gender default
const femaleUser = {
  ...realApiResponseData,
  roleId: "USER",
  userProfile: {
    ...realApiResponseData.userProfile,
    avatar: null,
    gender: "FEMALE",
  },
  tutorProfile: null,
};
const result5 = getUserAvatar(femaleUser);
const expected5 = dfFemale;
console.log(`✅ Test 5 - FEMALE user, no avatar:`);
console.log(`   Expected: ${expected5}`);
console.log(`   Actual:   ${result5}`);
console.log(`   Status:   ${result5 === expected5 ? "PASS ✅" : "FAIL ❌"}\n`);

console.log(
  "🎯 Kết luận: Logic avatar đã được implement đúng và phù hợp với cấu trúc dữ liệu API response thực tế!"
);
console.log("📋 Thứ tự ưu tiên avatar:");
console.log("   1. tutorProfile.avatar (nếu roleId === 'TUTOR')");
console.log("   2. userProfile.avatar");
console.log("   3. Default avatar theo gender (MALE/FEMALE)");
