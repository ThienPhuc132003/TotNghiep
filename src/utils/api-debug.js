// API Debug Script for testing classroom API calls - ENHANCED VERSION

// === TOKEN MANAGEMENT ===
const checkUserToken = () => {
  const userToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  console.log(
    "🍪 User Token from Cookie:",
    userToken ? "EXISTS ✅" : "NOT FOUND ❌"
  );
  if (userToken) {
    console.log("🔑 Token Preview:", userToken.substring(0, 30) + "...");
  }
  return userToken;
};

const checkZoomToken = () => {
  const zoomToken = localStorage.getItem("zoomAccessToken");
  const refreshToken = localStorage.getItem("zoomRefreshToken");

  console.log(
    "🎯 Zoom Access Token from localStorage:",
    zoomToken ? "EXISTS ✅" : "NOT FOUND ❌"
  );

  console.log(
    "🔄 Zoom Refresh Token from localStorage:",
    refreshToken ? "EXISTS ✅" : "NOT FOUND ❌"
  );

  if (zoomToken) {
    console.log("🔑 Zoom Token Preview:", zoomToken.substring(0, 30) + "...");

    // Check if token is expired (basic check)
    try {
      const tokenData = JSON.parse(atob(zoomToken.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = tokenData.exp && tokenData.exp < now;
      console.log(
        "⏰ Token Expiry Status:",
        isExpired ? "EXPIRED ❌" : "VALID ✅"
      );
      if (tokenData.exp) {
        console.log(
          "📅 Token Expires At:",
          new Date(tokenData.exp * 1000).toLocaleString()
        );
      }
    } catch (e) {
      console.warn("⚠️ Could not parse token expiry:", e.message);
    }
  } else {
    console.log("💡 To get Zoom token, user needs to:");
    console.log("   1. Go to Zoom meeting page");
    console.log("   2. Click 'Login with Zoom'");
    console.log("   3. Complete OAuth flow");
  }

  return { zoomToken, refreshToken };
};

// === ENHANCED API TESTING ===
const testMeetingAPI = async (classroomId) => {
  console.group("🧪 [TEST] Meeting Get API");
  try {
    const token = checkUserToken();
    const { zoomToken, refreshToken } = checkZoomToken();

    if (!token) {
      console.error("❌ No user token found in cookies");
      console.groupEnd();
      return;
    }

    console.log("📋 Testing with classroomId:", classroomId);
    console.log("🌐 API Base URL:", window.location.origin);

    // Check if this is a Zoom-related endpoint
    const needsZoomAuth =
      classroomId && classroomId.toString().includes("zoom");

    if (needsZoomAuth && !zoomToken) {
      console.warn(
        "⚠️ This appears to be a Zoom meeting but no Zoom token found"
      );
      console.log("💡 To authenticate with Zoom:");
      console.log("   1. Navigate to a meeting page");
      console.log("   2. Click 'Join with Zoom' or 'Create Meeting'");
      console.log("   3. Complete Zoom OAuth flow");

      if (!refreshToken) {
        console.log("   4. No refresh token available - full re-auth needed");
      }
    }

    const url = `${window.location.origin}/api/meeting/get-meeting`;
    const payload = { classroomId: classroomId };

    console.log("📤 Request URL:", url);
    console.log("📦 Request Payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
      body: JSON.stringify(payload),
    });

    console.log("📊 Response Status:", response.status);
    console.log("📋 Response Headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("📥 Response Data:", data);

    if (data.success) {
      console.log("✅ API Call Successful!");
      if (data.data && data.data.items) {
        console.log("📋 Found", data.data.items.length, "meetings");
      }
    } else {
      console.log("⚠️ API returned success: false");
    }

    console.groupEnd();
    return data;
  } catch (error) {
    console.error("❌ API Test Error:", error);
    console.groupEnd();
  }
};

// === MEETING CREATE API TEST ===
const testMeetingCreateAPI = async (
  topic = "Test Meeting",
  password = "test123",
  classroomId = "test-id"
) => {
  console.group("🧪 [TEST] Meeting Create API");
  try {
    const zoomToken = checkZoomToken();
    if (!zoomToken) {
      console.error("❌ No Zoom token found in localStorage");
      console.groupEnd();
      return;
    }

    console.log("📋 Testing Meeting Creation");
    const payload = { topic, password, classroomId };

    const url = `${window.location.origin}/api/meeting/create`;
    console.log("📤 Request URL:", url);
    console.log("📦 Request Payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📊 Response Status:", response.status);
    const data = await response.json();
    console.log("📥 Response Data:", data);

    console.groupEnd();
    return data;
  } catch (error) {
    console.error("❌ Meeting Create Test Error:", error);
    console.groupEnd();
  }
};

// === CLASSROOM API TEST ===
const testClassroomsAPI = async () => {
  console.group("🧪 [TEST] Classrooms Search API");
  try {
    const token = checkUserToken();
    if (!token) {
      console.error("❌ No user token found in cookies");
      console.groupEnd();
      return;
    }

    console.log("📋 Testing get classrooms API...");

    const url = `${window.location.origin}/api/classroom/search-for-tutor?page=1&rpp=10`;
    console.log("📤 Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    console.log("📊 Response Status:", response.status);
    const data = await response.json();
    console.log("📥 Response Data:", data);

    // If successful, try to get first classroom's meeting
    if (data.success && data.data?.items?.length > 0) {
      const firstClassroom = data.data.items[0];
      console.log(
        "🎯 Found classroom, testing meeting API with ID:",
        firstClassroom.classroomId
      );
      await testMeetingAPI(firstClassroom.classroomId);
    }

    console.groupEnd();
    return data;
  } catch (error) {
    console.error("❌ Classrooms API Test Error:", error);
    console.groupEnd();
  }
};

// === COMPREHENSIVE TOKEN INSPECTION ===
const inspectAllTokens = () => {
  console.group("🔍 [INSPECTION] All Tokens & Auth");

  checkUserToken();
  checkZoomToken();

  // Check all cookies
  console.log("🍪 All Cookies:", document.cookie);

  // Check localStorage
  const localStorageKeys = Object.keys(localStorage);
  console.log("💾 LocalStorage Keys:", localStorageKeys);

  // Check auth-related localStorage items
  const authKeys = localStorageKeys.filter(
    (key) =>
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("auth") ||
      key.toLowerCase().includes("zoom")
  );

  console.log("🔐 Auth-related localStorage items:");
  authKeys.forEach((key) => {
    const value = localStorage.getItem(key);
    console.log(
      `  - ${key}: ${value ? value.substring(0, 30) + "..." : "null"}`
    );
  });

  console.groupEnd();
};

// === QUICK TEST SUITE ===
const runQuickTests = async () => {
  console.group("🚀 [QUICK TEST SUITE]");

  console.log("🔍 Step 1: Inspect tokens...");
  inspectAllTokens();

  console.log("📚 Step 2: Test classrooms API...");
  await testClassroomsAPI();

  console.log("✅ Quick test suite completed!");
  console.groupEnd();
};

// === API LOGGING CONTROLS ===
const enableAPILogging = () => {
  localStorage.setItem("API_LOGGING_ENABLED", "true");
  console.log("🔊 API Logging ENABLED - Refresh page to see detailed API logs");
};

const disableAPILogging = () => {
  localStorage.setItem("API_LOGGING_ENABLED", "false");
  console.log(
    "🔇 API Logging DISABLED - API calls will not show detailed logs"
  );
};

const toggleAPILogging = () => {
  const current = localStorage.getItem("API_LOGGING_ENABLED");
  if (current === "false") {
    enableAPILogging();
  } else {
    disableAPILogging();
  }
};

// === EXPORT TO WINDOW ===
window.checkUserToken = checkUserToken;
window.checkZoomToken = checkZoomToken;
window.testMeetingAPI = testMeetingAPI;
window.testMeetingCreateAPI = testMeetingCreateAPI;
window.testClassroomsAPI = testClassroomsAPI;
window.inspectAllTokens = inspectAllTokens;
window.runQuickTests = runQuickTests;
window.enableAPILogging = enableAPILogging;
window.disableAPILogging = disableAPILogging;
window.toggleAPILogging = toggleAPILogging;

// === STARTUP MESSAGE ===
console.log(`
🔧 API Debug Script Loaded Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Available Functions:
  🔍 inspectAllTokens()        - Kiểm tra tất cả tokens
  🚀 runQuickTests()           - Chạy test suite nhanh
  
  📚 testClassroomsAPI()       - Test API lấy danh sách lớp học
  📝 testMeetingAPI(id)        - Test API lấy meeting của lớp học
  🎯 testMeetingCreateAPI()    - Test API tạo meeting Zoom
  
  🔐 checkUserToken()          - Kiểm tra user token
  🔑 checkZoomToken()          - Kiểm tra Zoom token
  
  🔊 enableAPILogging()        - Bật chi tiết API logging
  🔇 disableAPILogging()       - Tắt API logging
  🔄 toggleAPILogging()        - Chuyển đổi API logging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Tip: Chạy runQuickTests() để test toàn bộ hệ thống!
`);

// Auto-check tokens on load
inspectAllTokens();
