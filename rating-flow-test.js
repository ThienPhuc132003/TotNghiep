// Rating Data Flow - Test Script
// Paste this in browser console when on Student Classroom Meeting View

console.log("🔍 TESTING RATING DATA FLOW...");

// 1. Check allClassrooms data
const testAllClassrooms = () => {
  console.log("\n1. ✅ ALL CLASSROOMS DATA:");
  if (window.allClassrooms) {
    console.log("allClassrooms found:", window.allClassrooms.length);
    const sample = window.allClassrooms[0];
    console.log("Sample classroom:", {
      classroomId: sample?.classroomId,
      nameOfRoom: sample?.nameOfRoom,
      isRating: sample?.isRating,
      classroomEvaluation: sample?.classroomEvaluation,
      hasTutor: !!sample?.tutor,
      tutorId: sample?.tutor?.userId,
      tutorName: sample?.tutor?.fullname,
    });
  } else {
    console.log("❌ allClassrooms not accessible globally");
    console.log(
      "💡 Check React DevTools → StudentClassroomPage → allClassrooms state"
    );
  }
};

// 2. Check currentClassroomForMeetings
const testCurrentClassroom = () => {
  console.log("\n2. ✅ CURRENT CLASSROOM FOR MEETINGS:");

  // Try to find via React DevTools or DOM inspection
  const urlParams = new URLSearchParams(window.location.search);
  const classroomId = urlParams.get("id");

  console.log("URL classroom ID:", classroomId);

  // Check if currentClassroomForMeetings has the required data now
  if (window.currentClassroomForMeetings) {
    console.log(
      "currentClassroomForMeetings:",
      window.currentClassroomForMeetings
    );
  } else {
    console.log("❌ currentClassroomForMeetings not accessible globally");
    console.log("💡 Will check via component state in React DevTools");
  }
};

// 3. Check rating button visibility
const testRatingButton = () => {
  console.log("\n3. ✅ RATING BUTTON VISIBILITY:");

  const ratingButtons = document.querySelectorAll(".scp-rating-btn");
  const ratingDisplays = document.querySelectorAll(".scp-rating-display");

  console.log("Rating buttons found:", ratingButtons.length);
  console.log("Rating displays found:", ratingDisplays.length);

  if (ratingButtons.length > 0) {
    console.log("✅ Rating buttons visible - classroom not yet rated");
    ratingButtons.forEach((btn, index) => {
      console.log(`Button ${index}:`, {
        text: btn.textContent,
        onclick: !!btn.onclick,
        className: btn.className,
      });
    });
  } else if (ratingDisplays.length > 0) {
    console.log("✅ Rating displays visible - classroom already rated");
    ratingDisplays.forEach((display, index) => {
      console.log(`Display ${index}:`, display.textContent);
    });
  } else {
    console.log("❌ Neither rating buttons nor displays found");
    console.log("Possible reasons:");
    console.log("  - Not in meeting view mode");
    console.log("  - No meetings loaded");
    console.log("  - Component render issue");
  }
};

// 4. Test rating button click
const testRatingClick = () => {
  console.log("\n4. ✅ RATING BUTTON CLICK TEST:");

  const ratingBtn = document.querySelector(".scp-rating-btn");
  if (ratingBtn) {
    console.log("Found rating button, adding click listener...");

    // Add event listener to capture logs
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };

    // Click button
    ratingBtn.click();

    // Restore console and check logs
    setTimeout(() => {
      console.log = originalLog;

      const relevantLogs = logs.filter(
        (log) =>
          log.includes("RATING") ||
          log.includes("MODAL") ||
          log.includes("BUTTON CLICKED")
      );

      console.log("Captured rating-related logs:");
      relevantLogs.forEach((log) => console.log("  " + log));

      // Check modal state
      const modal = document.querySelector(".scp-modal-overlay");
      console.log("Modal after click:", {
        exists: !!modal,
        visible: modal ? getComputedStyle(modal).display !== "none" : false,
        zIndex: modal ? getComputedStyle(modal).zIndex : "N/A",
      });
    }, 200);
  } else {
    console.log("❌ No rating button found to test");
  }
};

// 5. Manual data injection test
const testDataInjection = () => {
  console.log("\n5. ✅ MANUAL DATA INJECTION TEST:");

  // Try to inject test data to verify flow
  const mockClassroomData = {
    classroomId: "test-123",
    nameOfRoom: "Test Classroom",
    isRating: false,
    classroomEvaluation: null,
    tutor: {
      userId: "tutor-456",
      fullname: "Test Tutor",
      avatar: null,
    },
    status: "COMPLETED",
  };

  const mockMeeting = {
    meetingId: "meeting-789",
    topic: "Test Meeting",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: "COMPLETED",
  };

  console.log("Mock classroom data:", mockClassroomData);
  console.log("Mock meeting data:", mockMeeting);

  // Make available globally for manual testing
  window.mockClassroomData = mockClassroomData;
  window.mockMeeting = mockMeeting;

  console.log(
    "✅ Mock data available at window.mockClassroomData and window.mockMeeting"
  );
};

// Run all tests
testAllClassrooms();
testCurrentClassroom();
testRatingButton();

console.log("\n🎯 NEXT MANUAL TESTS:");
console.log("1. Run: testRatingClick() to test button click");
console.log("2. Run: testDataInjection() for mock data");
console.log("3. Check React DevTools for component state");
console.log('4. Navigate: Student Classroom → Click "Xem danh sách phòng học"');

// Make functions available globally
window.ratingFlowTest = {
  testAllClassrooms,
  testCurrentClassroom,
  testRatingButton,
  testRatingClick,
  testDataInjection,
};

console.log("\n🛠️ Test functions available at window.ratingFlowTest");
console.log("Example: window.ratingFlowTest.testRatingClick()");
