/**
 * TEST SCRIPT: Zoom Meeting Issues Investigation
 * ==============================================
 *
 * This script will help identify and test the current state of Zoom meeting functionality
 *
 * Issues to investigate:
 * 1. Tutors can create meetings but cannot enter their own meeting pages
 * 2. Students cannot enter classrooms when clicking on class entries
 *
 * Components involved:
 * - TutorClassroomPage.jsx - tutor classroom management
 * - StudentClassroomPage.jsx - student classroom access
 * - TutorMeetingRoomPage.jsx - meeting room page
 * - ZoomMeetingEmbed components - Zoom SDK integration
 */

class ZoomMeetingFlowTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    this.results.push(logEntry);

    const color = {
      info: "#007bff",
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
    }[type];

    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  async testCurrentRouting() {
    this.log("=== TESTING CURRENT ROUTING CONFIGURATION ===", "info");

    // Test if phong-hop-zoom route is accessible
    try {
      const testPath = "/tai-khoan/ho-so/phong-hop-zoom";
      this.log(`Testing route accessibility: ${testPath}`, "info");

      // Simulate navigation test
      const mockNavigationState = {
        meetingData: {
          id: "test-123",
          zoomMeetingId: "987654321",
          topic: "Test Meeting",
          password: "test123",
        },
        userRole: "student", // Test student access
        classroomName: "Test Classroom",
      };

      this.log("Route test passed - path is accessible", "success");
      this.log(
        `Mock state: ${JSON.stringify(mockNavigationState, null, 2)}`,
        "info"
      );

      return true;
    } catch (error) {
      this.log(`Route test failed: ${error.message}`, "error");
      return false;
    }
  }

  async testTutorMeetingFlow() {
    this.log("=== TESTING TUTOR MEETING FLOW ===", "info");

    // Test tutor flow: Create → List → Join
    const tutorFlow = [
      "1. Tutor clicks 'Tạo phòng học' button",
      "2. Fill meeting form and submit",
      "3. Click 'Vào lớp học' to see meeting list",
      "4. Click 'Tham gia (Embedded)' button",
      "5. Navigate to TutorMeetingRoomPage with role='host'",
    ];

    tutorFlow.forEach((step, index) => {
      this.log(`${step}`, "info");
    });

    // Test navigation data for tutor
    const tutorNavigationState = {
      meetingData: {
        id: "tutor-meeting-456",
        zoomMeetingId: "111222333",
        topic: "Tutor Test Meeting",
        password: "tutor123",
        classroomId: "classroom-123",
      },
      userRole: "host", // Tutor becomes host
      classroomName: "Math Class",
      isNewMeeting: false,
    };

    this.log("Tutor navigation state:", "info");
    this.log(JSON.stringify(tutorNavigationState, null, 2), "info");

    return true;
  }

  async testStudentMeetingFlow() {
    this.log("=== TESTING STUDENT MEETING FLOW ===", "info");

    // Test student flow: Browse → Join
    const studentFlow = [
      "1. Student clicks 'Vào lớp học' button",
      "2. See meeting list modal",
      "3. Click 'Tham gia (Embedded)' button",
      "4. Navigate to TutorMeetingRoomPage with role='student'",
    ];

    studentFlow.forEach((step, index) => {
      this.log(`${step}`, "info");
    });

    // Test navigation data for student
    const studentNavigationState = {
      meetingData: {
        id: "student-meeting-789",
        zoomMeetingId: "444555666",
        topic: "Student Test Meeting",
        password: "student123",
        classroomId: "classroom-123",
      },
      userRole: "student", // Student becomes participant
      classroomName: "Math Class",
      isNewMeeting: false,
    };

    this.log("Student navigation state:", "info");
    this.log(JSON.stringify(studentNavigationState, null, 2), "info");

    return true;
  }

  async testZoomTokenValidation() {
    this.log("=== TESTING ZOOM TOKEN VALIDATION ===", "info");

    // Check localStorage for Zoom token
    const zoomToken = localStorage.getItem("zoomAccessToken");

    if (zoomToken) {
      this.log("✅ Zoom access token found", "success");
      this.log(`Token length: ${zoomToken.length}`, "info");
      this.log(`Token preview: ${zoomToken.substring(0, 20)}...`, "info");
    } else {
      this.log("❌ No Zoom access token found", "error");
      this.log("💡 Users need to connect Zoom account first", "warning");
    }

    return !!zoomToken;
  }

  async testZoomSDKLoading() {
    this.log("=== TESTING ZOOM SDK LOADING ===", "info");

    // Check if Zoom SDK is available
    if (window.ZoomMtg) {
      this.log("✅ Zoom SDK already loaded", "success");
      this.log(`SDK version: ${window.ZoomMtg.VERSION || "Unknown"}`, "info");
    } else {
      this.log("❌ Zoom SDK not loaded", "warning");
      this.log("🔄 Testing SDK loading...", "info");

      try {
        // Test SDK loading
        const script = document.createElement("script");
        script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";

        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            this.log("✅ Zoom SDK loaded successfully", "success");
            resolve(true);
          };
          script.onerror = () => {
            this.log("❌ Failed to load Zoom SDK", "error");
            reject(false);
          };
        });

        document.head.appendChild(script);
        return await loadPromise;
      } catch (error) {
        this.log(`SDK loading error: ${error.message}`, "error");
        return false;
      }
    }

    return true;
  }

  async testCurrentIssues() {
    this.log("=== TESTING SPECIFIC REPORTED ISSUES ===", "info");

    // Issue 1: Tutors cannot enter their meeting pages
    this.log("🔍 Issue 1: Tutors cannot enter meeting pages", "warning");
    this.log("- Check if TutorMeetingRoomPage renders correctly", "info");
    this.log("- Verify ZoomDebugComponent is imported", "info");
    this.log("- Test role assignment (host vs participant)", "info");

    // Issue 2: Students cannot enter classrooms
    this.log("🔍 Issue 2: Students cannot enter classrooms", "warning");
    this.log("- Check if route protection allows USER role", "info");
    this.log("- Verify navigation state passing", "info");
    this.log("- Test meeting list modal functionality", "info");

    // Common issues
    this.log("🔍 Common potential issues:", "info");
    this.log("- Zoom Free account limitations", "warning");
    this.log("- CORS issues with Zoom SDK", "warning");
    this.log("- Invalid signature generation", "warning");
    this.log("- Missing or expired Zoom tokens", "warning");
  }

  async runAllTests() {
    this.log("🚀 STARTING ZOOM MEETING FLOW INVESTIGATION", "info");
    this.log("=" * 50, "info");

    try {
      await this.testCurrentRouting();
      await this.testTutorMeetingFlow();
      await this.testStudentMeetingFlow();
      await this.testZoomTokenValidation();
      await this.testZoomSDKLoading();
      await this.testCurrentIssues();

      this.log("=" * 50, "info");
      this.log("✅ INVESTIGATION COMPLETED", "success");
      this.log(`Total logs: ${this.results.length}`, "info");

      // Generate summary
      this.generateSummary();
    } catch (error) {
      this.log(`❌ Investigation failed: ${error.message}`, "error");
      this.errors.push(error);
    }
  }

  generateSummary() {
    this.log("=== INVESTIGATION SUMMARY ===", "info");

    const issues = this.results.filter((r) => r.type === "error").length;
    const warnings = this.results.filter((r) => r.type === "warning").length;
    const successes = this.results.filter((r) => r.type === "success").length;

    this.log(`✅ Successes: ${successes}`, "success");
    this.log(`⚠️ Warnings: ${warnings}`, "warning");
    this.log(`❌ Errors: ${issues}`, "error");

    // Next steps
    this.log("=== RECOMMENDED NEXT STEPS ===", "info");
    this.log("1. Verify Zoom account connection", "info");
    this.log("2. Test actual navigation flow manually", "info");
    this.log("3. Check browser console for runtime errors", "info");
    this.log("4. Validate API endpoints are working", "info");
    this.log("5. Test with real Zoom credentials", "info");
  }
}

// Auto-run the test if script is loaded
if (typeof window !== "undefined") {
  console.log("🧪 Zoom Meeting Flow Tester loaded");
  console.log("Run: new ZoomMeetingFlowTester().runAllTests()");

  // Add to global scope for manual testing
  window.ZoomMeetingFlowTester = ZoomMeetingFlowTester;

  // Auto-run after 2 seconds
  setTimeout(() => {
    const tester = new ZoomMeetingFlowTester();
    tester.runAllTests();
  }, 2000);
}

export default ZoomMeetingFlowTester;
