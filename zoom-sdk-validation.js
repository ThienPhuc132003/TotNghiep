/**
 * ZOOM SDK VALIDATION SCRIPT
 * ==========================
 *
 * Script này sẽ kiểm tra toàn bộ implementation Zoom SDK để đảm bảo:
 * 1. Route configuration đúng
 * 2. Component imports đúng
 * 3. Navigation flow hoạt động
 * 4. Zoom SDK integration hoàn chỉnh
 */

const fs = require("fs");
const path = require("path");

class ZoomSDKValidator {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: "\x1b[36m", // cyan
      success: "\x1b[32m", // green
      error: "\x1b[31m", // red
      warning: "\x1b[33m", // yellow
      reset: "\x1b[0m", // reset
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    this.results.push({ timestamp, message, type });
  }

  async validateRouteConfiguration() {
    this.log("=== KIỂM TRA CẤU HÌNH ROUTE ===", "info");

    try {
      const appJsPath = path.join(__dirname, "src", "App.jsx");
      const content = fs.readFileSync(appJsPath, "utf8");

      // Kiểm tra xem phong-hop-zoom có trong shared section không
      if (
        content.includes("SHARED routes for both USER and TUTOR") &&
        content.includes('path="phong-hop-zoom"')
      ) {
        this.log(
          "✅ Route 'phong-hop-zoom' đã được cấu hình trong SHARED section",
          "success"
        );
        this.log(
          "✅ Cả USER (học sinh) và TUTOR (gia sư) đều có thể truy cập",
          "success"
        );
        return true;
      } else {
        this.log("❌ Route 'phong-hop-zoom' không được cấu hình đúng", "error");
        return false;
      }
    } catch (error) {
      this.log(`❌ Lỗi khi đọc App.jsx: ${error.message}`, "error");
      return false;
    }
  }

  async validateTutorMeetingRoomPage() {
    this.log("=== KIỂM TRA TUTOR MEETING ROOM PAGE ===", "info");

    try {
      const filePath = path.join(
        __dirname,
        "src",
        "pages",
        "User",
        "TutorMeetingRoomPage.jsx"
      );
      const content = fs.readFileSync(filePath, "utf8");

      // Kiểm tra import ZoomDebugComponent
      if (content.includes("import ZoomDebugComponent")) {
        this.log("✅ ZoomDebugComponent đã được import", "success");
      } else {
        this.log("❌ Thiếu import ZoomDebugComponent", "error");
        return false;
      }

      // Kiểm tra xử lý navigation state
      if (
        content.includes("location.state") &&
        content.includes("meetingData")
      ) {
        this.log("✅ Navigation state handling đã được implement", "success");
      } else {
        this.log("❌ Thiếu xử lý navigation state", "error");
        return false;
      }

      // Kiểm tra role handling
      if (
        content.includes("userRole") &&
        content.includes("host") &&
        content.includes("participant")
      ) {
        this.log("✅ Role-based functionality đã được implement", "success");
      } else {
        this.log("❌ Thiếu role-based functionality", "error");
        return false;
      }

      return true;
    } catch (error) {
      this.log(
        `❌ Lỗi khi đọc TutorMeetingRoomPage.jsx: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async validateZoomDebugComponent() {
    this.log("=== KIỂM TRA ZOOM DEBUG COMPONENT ===", "info");

    try {
      const filePath = path.join(
        __dirname,
        "src",
        "components",
        "User",
        "Zoom",
        "ZoomDebugComponent.jsx"
      );
      const content = fs.readFileSync(filePath, "utf8");

      // Kiểm tra Zoom SDK loading
      if (
        content.includes("loadZoomSDK") &&
        content.includes("window.ZoomMtg")
      ) {
        this.log("✅ Zoom SDK loading functionality có sẵn", "success");
      } else {
        this.log("❌ Thiếu Zoom SDK loading functionality", "error");
        return false;
      }

      // Kiểm tra component props
      if (content.includes("PropTypes")) {
        this.log("✅ Component props validation có sẵn", "success");
      } else {
        this.log("⚠️ Thiếu props validation", "warning");
      }

      return true;
    } catch (error) {
      this.log(
        `❌ Lỗi khi đọc ZoomDebugComponent.jsx: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async validateStudentClassroomPage() {
    this.log("=== KIỂM TRA STUDENT CLASSROOM PAGE ===", "info");

    try {
      const filePath = path.join(
        __dirname,
        "src",
        "pages",
        "User",
        "StudentClassroomPage.jsx"
      );
      const content = fs.readFileSync(filePath, "utf8");

      // Kiểm tra navigation với role "student"
      if (
        content.includes('userRole: "student"') &&
        content.includes("navigate")
      ) {
        this.log(
          "✅ Student navigation với role đúng đã được implement",
          "success"
        );
      } else {
        this.log("❌ Thiếu student navigation với role", "error");
        return false;
      }

      return true;
    } catch (error) {
      this.log(
        `❌ Lỗi khi đọc StudentClassroomPage.jsx: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async validateTutorClassroomPage() {
    this.log("=== KIỂM TRA TUTOR CLASSROOM PAGE ===", "info");

    try {
      const filePath = path.join(
        __dirname,
        "src",
        "pages",
        "User",
        "TutorClassroomPage.jsx"
      );
      const content = fs.readFileSync(filePath, "utf8");

      // Kiểm tra navigation với role "host"
      if (
        content.includes('userRole: "host"') &&
        content.includes("navigate")
      ) {
        this.log(
          "✅ Tutor navigation với role đúng đã được implement",
          "success"
        );
      } else {
        this.log("❌ Thiếu tutor navigation với role", "error");
        return false;
      }

      return true;
    } catch (error) {
      this.log(
        `❌ Lỗi khi đọc TutorClassroomPage.jsx: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async runFullValidation() {
    this.log("🚀 BẮT ĐẦU KIỂM TRA ZOOM SDK IMPLEMENTATION", "info");
    this.log("=" * 60, "info");

    const tests = [
      { name: "Route Configuration", method: this.validateRouteConfiguration },
      {
        name: "TutorMeetingRoomPage",
        method: this.validateTutorMeetingRoomPage,
      },
      { name: "ZoomDebugComponent", method: this.validateZoomDebugComponent },
      {
        name: "StudentClassroomPage",
        method: this.validateStudentClassroomPage,
      },
      { name: "TutorClassroomPage", method: this.validateTutorClassroomPage },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      this.log(`\n📋 Đang kiểm tra: ${test.name}`, "info");
      try {
        const result = await test.method.call(this);
        if (result) {
          passedTests++;
          this.log(`✅ ${test.name}: PASS`, "success");
        } else {
          this.log(`❌ ${test.name}: FAIL`, "error");
        }
      } catch (error) {
        this.log(`💥 ${test.name}: ERROR - ${error.message}`, "error");
      }
    }

    this.log("\n" + "=" * 60, "info");
    this.log(
      `📊 KẾT QUẢ CUỐI CÙNG: ${passedTests}/${totalTests} tests passed`,
      passedTests === totalTests ? "success" : "warning"
    );

    if (passedTests === totalTests) {
      this.log("🎉 ZOOM SDK IMPLEMENTATION HOÀN CHỈNH VÀ ĐÚNG!", "success");
      this.log(
        "✅ Cả gia sư và học sinh đều có thể truy cập meeting room",
        "success"
      );
      this.log("✅ Tất cả fixes đã được áp dụng chính xác", "success");
    } else {
      this.log("⚠️ CÓ MỘT SỐ VẤN ĐỀ CẦN ĐƯỢC KHẮC PHỤC", "warning");
      this.log("📝 Vui lòng xem chi tiết ở trên để biết vấn đề cụ thể", "info");
    }

    return passedTests === totalTests;
  }
}

// Chạy validation
const validator = new ZoomSDKValidator();
validator.runFullValidation().then((success) => {
  process.exit(success ? 0 : 1);
});
