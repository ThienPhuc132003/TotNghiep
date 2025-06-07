// ZOOM SDK BROWSER TEST
// Copy và paste script này vào Console của browser để test

console.log("🧪 ZOOM SDK BROWSER TEST - Bắt đầu kiểm tra...");

// Test 1: Kiểm tra navigation flow
function testZoomNavigation() {
  console.log("\n=== TEST 1: ZOOM NAVIGATION FLOW ===");

  const currentUrl = window.location.href;
  console.log("Current URL:", currentUrl);

  // Kiểm tra xem có thể navigate đến meeting room không
  const meetingRoomPath = "/tai-khoan/ho-so/phong-hop-zoom";
  console.log("Testing navigation to:", meetingRoomPath);

  // Test tutor state
  const tutorState = {
    meetingData: {
      id: "test-123",
      zoomMeetingId: "987654321",
      topic: "Test Meeting",
      password: "test123",
    },
    userRole: "host",
    classroomName: "Test Classroom",
  };

  console.log("✅ Tutor navigation state:", tutorState);

  // Test student state
  const studentState = {
    meetingData: {
      id: "test-456",
      zoomMeetingId: "123456789",
      topic: "Student Meeting",
      password: "student123",
    },
    userRole: "student",
    classroomName: "Student Classroom",
  };

  console.log("✅ Student navigation state:", studentState);

  return true;
}

// Test 2: Kiểm tra Zoom SDK loading
function testZoomSDKLoading() {
  console.log("\n=== TEST 2: ZOOM SDK LOADING ===");

  // Kiểm tra xem Zoom SDK đã được load chưa
  if (window.ZoomMtg) {
    console.log("✅ Zoom SDK đã được load:", typeof window.ZoomMtg);
    console.log("✅ Available methods:", Object.keys(window.ZoomMtg));
  } else {
    console.log("⚠️ Zoom SDK chưa được load");
    console.log("🔄 Đang thử load Zoom SDK...");

    // Thử load Zoom SDK
    const script = document.createElement("script");
    script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
    script.onload = () => {
      console.log("✅ Zoom SDK đã được load thành công!");
      console.log("✅ ZoomMtg available:", typeof window.ZoomMtg);
    };
    script.onerror = () => {
      console.log("❌ Không thể load Zoom SDK");
    };
    document.head.appendChild(script);
  }
}

// Test 3: Kiểm tra React Router state
function testReactRouterState() {
  console.log("\n=== TEST 3: REACT ROUTER STATE ===");

  // Kiểm tra xem có React Router không
  const hasReactRouter = window.location.pathname.includes("/tai-khoan/ho-so");
  console.log("Is in account section:", hasReactRouter);

  if (hasReactRouter) {
    console.log("✅ Đang ở trong phần tài khoản - có thể access meeting room");
  } else {
    console.log("⚠️ Không ở trong phần tài khoản - cần login trước");
  }

  // Test navigation simulation
  const testNavigation = (path, state) => {
    console.log(`🔄 Simulating navigation to: ${path}`);
    console.log(`📝 With state:`, state);

    // Trong thực tế, React Router sẽ handle việc này
    return true;
  };

  // Test tutor navigation
  testNavigation("/tai-khoan/ho-so/phong-hop-zoom", {
    meetingData: { id: "test-123" },
    userRole: "host",
  });

  // Test student navigation
  testNavigation("/tai-khoan/ho-so/phong-hop-zoom", {
    meetingData: { id: "test-456" },
    userRole: "student",
  });
}

// Test 4: Kiểm tra localStorage và session
function testLocalStorage() {
  console.log("\n=== TEST 4: LOCAL STORAGE & SESSION ===");

  // Kiểm tra các key quan trọng
  const zoomToken = localStorage.getItem("zoomAccessToken");
  const userInfo = localStorage.getItem("userInfo");

  console.log("Zoom Access Token:", zoomToken ? "✅ Có" : "❌ Không có");
  console.log("User Info:", userInfo ? "✅ Có" : "❌ Không có");

  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      console.log("User role:", parsed.role);
    } catch (e) {
      console.log("⚠️ Không thể parse user info");
    }
  }
}

// Chạy tất cả tests
function runAllTests() {
  console.log("🚀 CHẠY TẤT CẢ ZOOM SDK TESTS");
  console.log("=" * 50);

  try {
    testZoomNavigation();
    testZoomSDKLoading();
    testReactRouterState();
    testLocalStorage();

    console.log("\n🎉 TẤT CẢ TESTS ĐÃ HOÀN THÀNH!");
    console.log("📋 Kiểm tra kết quả ở trên để xem chi tiết");
  } catch (error) {
    console.log("❌ Có lỗi xảy ra:", error);
  }
}

// Export functions để có thể gọi riêng lẻ
window.zoomSDKTest = {
  runAll: runAllTests,
  testNavigation: testZoomNavigation,
  testSDKLoading: testZoomSDKLoading,
  testRouterState: testReactRouterState,
  testStorage: testLocalStorage,
};

// Tự động chạy tất cả tests
runAllTests();
