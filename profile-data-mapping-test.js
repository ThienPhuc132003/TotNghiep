// Test Profile Data Mapping
console.log("🔍 Testing Profile Data Mapping...");

// Simulate API response data structure
const mockUserProfileData = {
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
    workEmail: null, // This should show "Chưa có Email liên hệ"
    phoneNumber: "0978123456",
    homeAddress: "123 Đường Láng, P. Láng Thượng, Q. Đống Đa, Hà Nội",
    birthday: "2000-05-05",
    gender: "MALE",
  },
  tutorProfile: {
    userId: "US00011",
    avatar:
      "https://giasuvlu.click/api/media?mediaCategory=TUTOR_AVATAR&fileName=55de8b4f-fcaa-4b79-889b-c387f11354de.jpeg",
    fullname: "Nguyễn Văn An",
    birthday: "2003-03-08",
    gender: "MALE",
  },
};

// Test avatar selection logic (same as in avatarUtils.js)
function testGetUserAvatar(userInfo) {
  if (!userInfo) {
    return "/assets/images/df-male.png";
  }

  if (userInfo.roleId === "TUTOR" && userInfo.tutorProfile?.avatar) {
    return userInfo.tutorProfile.avatar;
  }

  if (userInfo.userProfile?.avatar) {
    return userInfo.userProfile.avatar;
  }

  const gender = userInfo.userProfile?.gender || userInfo.gender;
  return gender === "FEMALE"
    ? "/assets/images/df-female.png"
    : "/assets/images/df-male.png";
}

// Test profile data mapping (same as in Profile.jsx)
function testProfileDataMapping(userProfileFromRedux) {
  console.log("📥 Input data:", userProfileFromRedux);

  if (!userProfileFromRedux || !userProfileFromRedux.userProfile) {
    console.log("❌ No userProfile data");
    return null;
  }

  const avatar = testGetUserAvatar(userProfileFromRedux);

  const profileData = {
    avatar: avatar,
    fullName: userProfileFromRedux.userProfile.fullname || "",
    birthday: userProfileFromRedux.userProfile.birthday
      ? userProfileFromRedux.userProfile.birthday.split("T")[0]
      : "",
    email:
      userProfileFromRedux.userProfile.personalEmail ||
      userProfileFromRedux.email ||
      "",
    phoneNumber:
      userProfileFromRedux.userProfile.phoneNumber ||
      userProfileFromRedux.phoneNumber ||
      "",
    homeAddress: userProfileFromRedux.userProfile.homeAddress || "",
    gender: userProfileFromRedux.userProfile.gender || "",
    workEmail: userProfileFromRedux.userProfile.workEmail || "",
  };

  console.log("📤 Mapped profile data:", profileData);
  return profileData;
}

// Run tests
console.log("🧪 Test Results:");
console.log("================");

const result = testProfileDataMapping(mockUserProfileData);

console.log("\n✅ Expected Results:");
console.log("📸 Avatar:", result?.avatar);
console.log("👤 Full Name:", result?.fullName);
console.log("📧 Email:", result?.email);
console.log("📱 Phone:", result?.phoneNumber);
console.log("🏠 Home Address:", result?.homeAddress);
console.log("🎂 Birthday:", result?.birthday);
console.log("👫 Gender:", result?.gender);
console.log("💼 Work Email:", result?.workEmail || "Chưa có Email liên hệ");

console.log("\n🎯 Key Points:");
console.log("- Avatar should use tutorProfile.avatar since roleId = TUTOR");
console.log(
  "- Work email is null, should show placeholder 'Chưa có Email liên hệ'"
);
console.log("- Birthday should be formatted as YYYY-MM-DD");
console.log("- All other fields should map correctly from userProfile");

// Test edge cases
console.log("\n🔄 Testing Edge Cases:");

// Case 1: USER role with userProfile.avatar
const userCase = {
  ...mockUserProfileData,
  roleId: "USER",
  userProfile: {
    ...mockUserProfileData.userProfile,
    avatar: "https://example.com/user-avatar.jpg",
  },
  tutorProfile: null,
};

const userResult = testProfileDataMapping(userCase);
console.log("👨‍🎓 USER with userProfile.avatar:", userResult?.avatar);

// Case 2: No avatar at all
const noAvatarCase = {
  ...mockUserProfileData,
  userProfile: {
    ...mockUserProfileData.userProfile,
    avatar: null,
    gender: "FEMALE",
  },
  tutorProfile: {
    ...mockUserProfileData.tutorProfile,
    avatar: null,
  },
};

const noAvatarResult = testProfileDataMapping(noAvatarCase);
console.log("👩 Female with no avatar:", noAvatarResult?.avatar);
