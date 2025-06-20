// Test API Get Profile Response
// Chạy script này để test API và xem response

console.log("🔍 Testing API Get Profile...");

// Giả lập API call để test response
async function testGetProfile() {
  try {
    console.log("📡 Making API call to get profile...");

    // Lấy token từ localStorage hoặc cookies
    const token =
      localStorage.getItem("token") ||
      document.cookie
        .split(";")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      console.error("❌ Không tìm thấy token! User chưa đăng nhập?");
      return;
    }

    console.log("🔑 Token found:", token.substring(0, 20) + "...");

    // API call
    const response = await fetch("/api/user/get-profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log("📥 API Response Status:", response.status);
    console.log("📄 API Response Data:", data);

    if (data.success && data.data) {
      console.log("✅ API call thành công!");
      console.log("👤 User Info:");
      console.log("   - User ID:", data.data.userId);
      console.log("   - Role ID:", data.data.roleId);
      console.log("   - Email:", data.data.email);

      if (data.data.userProfile) {
        console.log("📋 User Profile:");
        console.log("   - Fullname:", data.data.userProfile.fullname);
        console.log("   - Avatar:", data.data.userProfile.avatar);
        console.log("   - Gender:", data.data.userProfile.gender);
      }

      if (data.data.tutorProfile) {
        console.log("🎓 Tutor Profile:");
        console.log("   - Fullname:", data.data.tutorProfile.fullname);
        console.log("   - Avatar:", data.data.tutorProfile.avatar);
        console.log("   - Rating:", data.data.tutorProfile.rating);
      }

      // Test avatar logic
      console.log("\n🖼️ Testing Avatar Logic:");

      let selectedAvatar = "";
      if (data.data.roleId === "TUTOR" && data.data.tutorProfile?.avatar) {
        selectedAvatar = data.data.tutorProfile.avatar;
        console.log("✅ Should use tutorProfile.avatar:", selectedAvatar);
      } else if (data.data.userProfile?.avatar) {
        selectedAvatar = data.data.userProfile.avatar;
        console.log("✅ Should use userProfile.avatar:", selectedAvatar);
      } else {
        const gender = data.data.userProfile?.gender || "MALE";
        selectedAvatar =
          gender === "FEMALE"
            ? "/assets/images/df-female.png"
            : "/assets/images/df-male.png";
        console.log("✅ Should use default avatar:", selectedAvatar);
      }
    } else {
      console.error("❌ API call failed:", data.message);
    }
  } catch (error) {
    console.error("💥 Error during API call:", error);
    console.log("📝 Gợi ý debug:");
    console.log("1. Kiểm tra network tab trong DevTools");
    console.log("2. Xem có lỗi CORS không");
    console.log("3. Kiểm tra endpoint API có đúng không");
    console.log("4. Verify token có hết hạn không");
  }
}

// Auto run test
testGetProfile();

// Export để có thể gọi từ console
if (typeof window !== "undefined") {
  window.testGetProfile = testGetProfile;
}
