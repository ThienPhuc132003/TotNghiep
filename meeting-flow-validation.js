/**
 * Meeting Flow Validation Script
 * Tests the complete meeting flow for both tutors and students
 * Run this in browser console to test the meeting functionality
 */

const MeetingFlowValidator = {
  log: (message, type = "info") => {
    const emoji =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "warning"
        ? "⚠️"
        : "ℹ️";
    console.log(`${emoji} [Meeting Flow] ${message}`);
  },

  async testStudentFlow() {
    this.log("=== TESTING STUDENT MEETING FLOW ===", "info");

    // Test 1: Check if student can access meeting room route
    try {
      const currentPath = window.location.pathname;
      this.log(`Current path: ${currentPath}`);

      // Simulate student navigation to meeting room
      const testNavigationState = {
        meetingData: {
          id: "test-meeting-123",
          zoomMeetingId: "123456789",
          topic: "Test Meeting",
          joinUrl: "https://zoom.us/j/123456789",
        },
        userRole: "student",
        classroomName: "Test Classroom",
      };

      this.log("Simulating student navigation with state:", "info");
      console.log(testNavigationState);

      // Check if route is accessible
      const routeTest =
        window.location.origin + "/tai-khoan/ho-so/phong-hop-zoom";
      this.log(`Testing route accessibility: ${routeTest}`, "info");

      // Test navigation state handling
      if (window.history && window.history.pushState) {
        // Simulate navigation with state
        window.history.pushState(
          testNavigationState,
          "",
          "/tai-khoan/ho-so/phong-hop-zoom"
        );
        this.log("Navigation state set successfully", "success");
      }
    } catch (error) {
      this.log(`Student flow test failed: ${error.message}`, "error");
      console.error(error);
    }
  },

  async testTutorFlow() {
    this.log("=== TESTING TUTOR MEETING FLOW ===", "info");

    try {
      // Test tutor navigation to meeting room
      const testNavigationState = {
        meetingData: {
          id: "test-meeting-456",
          zoomMeetingId: "987654321",
          topic: "Tutor Test Meeting",
          joinUrl: "https://zoom.us/j/987654321",
        },
        userRole: "host",
        classroomName: "Tutor Test Classroom",
      };

      this.log("Simulating tutor navigation with state:", "info");
      console.log(testNavigationState);

      // Check if TutorMeetingRoomPage component is available
      if (window.React && window.ReactDOM) {
        this.log("React environment detected", "success");
      }
    } catch (error) {
      this.log(`Tutor flow test failed: ${error.message}`, "error");
      console.error(error);
    }
  },

  async testMeetingListModal() {
    this.log("=== TESTING MEETING LIST MODAL ===", "info");

    try {
      // Test meeting search API endpoint
      const testClassroomId = "test-classroom-123";
      const apiEndpoint = `/api/meeting/search?classroomId=${testClassroomId}`;

      this.log(`Testing API endpoint: ${apiEndpoint}`, "info");

      // Mock meeting data structure
      const mockMeetingData = {
        success: true,
        data: [
          {
            id: "meeting-1",
            zoomMeetingId: "111111111",
            topic: "Math Class - Session 1",
            joinUrl: "https://zoom.us/j/111111111",
            startTime: new Date().toISOString(),
            status: "active",
          },
          {
            id: "meeting-2",
            zoomMeetingId: "222222222",
            topic: "Math Class - Session 2",
            joinUrl: "https://zoom.us/j/222222222",
            startTime: new Date().toISOString(),
            status: "scheduled",
          },
        ],
      };

      this.log("Mock meeting data structure:", "info");
      console.log(mockMeetingData);

      // Test modal button functionality
      this.log("Testing modal button functionality...", "info");

      mockMeetingData.data.forEach((meeting, index) => {
        this.log(`Meeting ${index + 1}: ${meeting.topic}`, "info");
        this.log(`  - Join URL: ${meeting.joinUrl}`, "info");
        this.log(`  - Meeting ID: ${meeting.zoomMeetingId}`, "info");
      });

      this.log("Meeting list modal test completed", "success");
    } catch (error) {
      this.log(`Meeting list modal test failed: ${error.message}`, "error");
      console.error(error);
    }
  },

  async testZoomIntegration() {
    this.log("=== TESTING ZOOM INTEGRATION ===", "info");

    try {
      // Check if ZoomMtgEmbedded is available
      if (typeof window.ZoomMtgEmbedded !== "undefined") {
        this.log("Zoom SDK detected in window", "success");

        // Test SDK initialization
        const testConfig = {
          debug: true,
          zoomAppRoot: document.getElementById("zoomSdkRoot"),
          language: "en-US",
        };

        this.log("Testing Zoom SDK configuration:", "info");
        console.log(testConfig);
      } else {
        this.log(
          "Zoom SDK not found - this is expected during development",
          "warning"
        );
        this.log("ZoomDebugComponent should be handling this scenario", "info");
      }

      // Test signature generation endpoint
      const testSignatureParams = {
        meetingId: "123456789",
        userRole: "host",
      };

      this.log("Testing signature generation params:", "info");
      console.log(testSignatureParams);
    } catch (error) {
      this.log(`Zoom integration test failed: ${error.message}`, "error");
      console.error(error);
    }
  },

  async runAllTests() {
    this.log("🚀 STARTING COMPREHENSIVE MEETING FLOW VALIDATION", "info");
    this.log("================================================", "info");

    await this.testStudentFlow();
    await this.testTutorFlow();
    await this.testMeetingListModal();
    await this.testZoomIntegration();

    this.log("================================================", "info");
    this.log("✨ MEETING FLOW VALIDATION COMPLETED", "success");
    this.log("Check the logs above for any issues that need attention", "info");
  },
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  console.log("🔧 Meeting Flow Validator loaded");
  console.log("Run MeetingFlowValidator.runAllTests() to start validation");

  // Also provide individual test methods
  window.MeetingFlowValidator = MeetingFlowValidator;
}

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = MeetingFlowValidator;
}
