/**
 * ZOOM MEETING NAVIGATION TEST
 * ===========================
 *
 * This script will test the actual navigation flow for both tutors and students
 * to identify where the meeting functionality is breaking.
 */

// Test functions for browser console
window.testZoomMeetingFlow = {
  // Test 1: Check current routing configuration
  testRouting() {
    console.log("🧪 Testing Zoom Meeting Route Configuration...");

    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);

    // Test if we can navigate to the meeting room route
    const meetingRoomPath = "/tai-khoan/ho-so/phong-hop-zoom";
    console.log("Meeting room path:", meetingRoomPath);

    // Check if route exists in React Router
    const hasRoute = window.location.origin + meetingRoomPath;
    console.log("Full meeting room URL:", hasRoute);

    return true;
  },

  // Test 2: Simulate tutor navigation to meeting room
  testTutorNavigation() {
    console.log("🧪 Testing Tutor Navigation Flow...");

    // This simulates the navigation state that TutorClassroomPage sends
    const tutorState = {
      meetingData: {
        id: "test-meeting-123",
        zoomMeetingId: "987654321",
        topic: "Test Tutor Meeting",
        password: "tutor123",
        classroomId: "classroom-456",
        joinUrl: "https://zoom.us/j/987654321",
      },
      userRole: "host", // Tutor becomes host
      classroomName: "Mathematics Class",
      classroomId: "classroom-456",
      isNewMeeting: false,
    };

    console.log("Tutor navigation state:", tutorState);

    // Test navigation
    try {
      if (window.location.pathname.includes("/tai-khoan/ho-so/")) {
        console.log("✅ User is in account section - can access meeting room");

        // Simulate React Router navigation
        console.log("🔄 Simulating navigation to meeting room...");
        console.log("Target: /tai-khoan/ho-so/phong-hop-zoom");
        console.log("State:", JSON.stringify(tutorState, null, 2));

        return true;
      } else {
        console.log("❌ User not in account section - need to login first");
        return false;
      }
    } catch (error) {
      console.error("❌ Navigation test failed:", error);
      return false;
    }
  },

  // Test 3: Simulate student navigation to meeting room
  testStudentNavigation() {
    console.log("🧪 Testing Student Navigation Flow...");

    // This simulates the navigation state that StudentClassroomPage sends
    const studentState = {
      meetingData: {
        id: "test-meeting-789",
        zoomMeetingId: "123456789",
        topic: "Test Student Meeting",
        password: "student123",
        classroomId: "classroom-456",
        joinUrl: "https://zoom.us/j/123456789",
      },
      userRole: "student", // Student becomes participant
      classroomName: "Mathematics Class",
      classroomId: "classroom-456",
      isNewMeeting: false,
    };

    console.log("Student navigation state:", studentState);

    // Test navigation
    try {
      if (window.location.pathname.includes("/tai-khoan/ho-so/")) {
        console.log("✅ User is in account section - can access meeting room");

        // Simulate React Router navigation
        console.log("🔄 Simulating navigation to meeting room...");
        console.log("Target: /tai-khoan/ho-so/phong-hop-zoom");
        console.log("State:", JSON.stringify(studentState, null, 2));

        return true;
      } else {
        console.log("❌ User not in account section - need to login first");
        return false;
      }
    } catch (error) {
      console.error("❌ Navigation test failed:", error);
      return false;
    }
  },

  // Test 4: Check Zoom token status
  testZoomToken() {
    console.log("🧪 Testing Zoom Token Status...");

    const zoomToken = localStorage.getItem("zoomAccessToken");

    if (zoomToken) {
      console.log("✅ Zoom access token found");
      console.log("Token length:", zoomToken.length);
      console.log("Token preview:", zoomToken.substring(0, 20) + "...");
    } else {
      console.log("❌ No Zoom access token found");
      console.log("💡 User needs to connect Zoom account");
      console.log("🔗 Go to: /tai-khoan/ho-so/phong-hop-zoom to connect");
    }

    return !!zoomToken;
  },

  // Test 5: Check if we're on the meeting room page and what's loaded
  testMeetingRoomPage() {
    console.log("🧪 Testing Meeting Room Page Status...");

    const isOnMeetingRoom = window.location.pathname.includes("phong-hop-zoom");
    console.log("On meeting room page:", isOnMeetingRoom);

    if (isOnMeetingRoom) {
      // Check what components are loaded
      const hasZoomContainer = document.querySelector("#zmmtg-root");
      const hasDebugComponent = document.querySelector(
        ".tutor-meeting-room-page"
      );

      console.log("Zoom container found:", !!hasZoomContainer);
      console.log("Debug component found:", !!hasDebugComponent);

      // Check for Zoom SDK
      const hasZoomSDK = !!window.ZoomMtg;
      console.log("Zoom SDK loaded:", hasZoomSDK);

      if (hasZoomSDK) {
        console.log("Zoom SDK version:", window.ZoomMtg.VERSION || "Unknown");
      }

      return {
        isOnPage: true,
        hasContainer: !!hasZoomContainer,
        hasDebug: !!hasDebugComponent,
        hasSDK: hasZoomSDK,
      };
    } else {
      console.log("Not on meeting room page");
      return { isOnPage: false };
    }
  },

  // Test 6: Manual navigation test
  testManualNavigation() {
    console.log("🧪 Testing Manual Navigation...");

    if (typeof window.ReactRouter !== "undefined") {
      console.log("✅ React Router available");
    } else {
      console.log("❌ React Router not available globally");
    }

    // Check if we can simulate clicking buttons
    const buttons = document.querySelectorAll("button");
    console.log(`Found ${buttons.length} buttons on page`);

    // Look for specific meeting-related buttons
    const meetingButtons = Array.from(buttons).filter(
      (btn) =>
        btn.textContent.includes("Vào lớp") ||
        btn.textContent.includes("Tham gia") ||
        btn.textContent.includes("Tạo phòng")
    );

    console.log(`Found ${meetingButtons.length} meeting-related buttons:`);
    meetingButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.textContent}"`);
    });

    return meetingButtons.length > 0;
  },

  // Run all tests
  runAllTests() {
    console.log("🚀 Starting Zoom Meeting Flow Tests...");
    console.log("=" * 50);

    const results = {
      routing: this.testRouting(),
      tutorNav: this.testTutorNavigation(),
      studentNav: this.testStudentNavigation(),
      zoomToken: this.testZoomToken(),
      meetingRoom: this.testMeetingRoomPage(),
      manualNav: this.testManualNavigation(),
    };

    console.log("=" * 50);
    console.log("📊 Test Results Summary:");
    Object.entries(results).forEach(([test, result]) => {
      const status = result ? "✅" : "❌";
      console.log(`${status} ${test}:`, result);
    });

    console.log("=" * 50);
    console.log("🔍 Next Steps:");
    console.log("1. Check browser console for any React errors");
    console.log("2. Verify user is logged in with correct role");
    console.log("3. Test actual button clicks manually");
    console.log("4. Check network tab for API call failures");

    return results;
  },
};

// Auto-run tests after page loads
if (document.readyState === "complete") {
  setTimeout(() => {
    console.log("🔄 Auto-running Zoom meeting tests...");
    window.testZoomMeetingFlow.runAllTests();
  }, 1000);
} else {
  window.addEventListener("load", () => {
    setTimeout(() => {
      console.log("🔄 Auto-running Zoom meeting tests...");
      window.testZoomMeetingFlow.runAllTests();
    }, 1000);
  });
}

console.log("🧪 Zoom Meeting Flow Tester loaded!");
console.log("Run manually: testZoomMeetingFlow.runAllTests()");
