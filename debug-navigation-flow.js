// Debug Navigation Flow - Test both Tutor and Student flows
console.log("🧪 Navigation Flow Debug Tool");

// Helper function to log navigation states
function logNavigationState(userType, action, state) {
  console.log(`\n📍 [${userType.toUpperCase()}] ${action}`);
  console.log("State passed:", state);
  console.log("Current URL:", window.location.href);
  console.log("---");
}

// Test Navigation Helper
async function testNavigation() {
  console.log("\n🎯 TESTING NAVIGATION FLOWS\n");

  // Check if we're on the right page
  const currentPath = window.location.pathname;
  console.log("Current path:", currentPath);

  if (currentPath.includes("/quan-ly-lop-hoc")) {
    console.log("✅ On Tutor Classroom Page");
    testTutorFlow();
  } else if (currentPath.includes("/lop-hoc-cua-toi")) {
    console.log("✅ On Student Classroom Page");
    testStudentFlow();
  } else if (currentPath.includes("/phong-hop-zoom")) {
    console.log("✅ On Meeting Room Page");
    testMeetingRoomPage();
  } else {
    console.log("ℹ️ Navigate to classroom page first");
  }
}

function testTutorFlow() {
  console.log("\n👨‍🏫 TUTOR FLOW TEST");

  // Find "Vào lớp học" buttons
  const enterButtons = document.querySelectorAll(
    'button:contains("Vào lớp học"), button:contains("Chuẩn bị lớp học")'
  );
  console.log(`Found ${enterButtons.length} enter classroom buttons`);

  // Find "Tạo phòng học" buttons
  const createButtons = document.querySelectorAll(
    'button:contains("Tạo phòng học")'
  );
  console.log(`Found ${createButtons.length} create meeting buttons`);

  if (createButtons.length > 0) {
    console.log(
      "💡 To test: Click 'Tạo phòng học' → Create meeting → Then 'Vào lớp học'"
    );
  }

  if (enterButtons.length > 0) {
    console.log(
      "💡 To test: Click 'Vào lớp học' → Should show meeting list modal"
    );
  }
}

function testStudentFlow() {
  console.log("\n👨‍🎓 STUDENT FLOW TEST");

  // Find "Vào lớp học" buttons
  const enterButtons = document.querySelectorAll(
    'button:contains("Vào lớp học")'
  );
  console.log(`Found ${enterButtons.length} enter classroom buttons`);

  if (enterButtons.length > 0) {
    console.log(
      "💡 To test: Click 'Vào lớp học' → Should show meeting list → Click 'Tham gia (Embedded)'"
    );

    // Add click listener to test
    enterButtons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        logNavigationState("STUDENT", `Clicked Vào lớp học #${index + 1}`, {
          action: "enter_classroom_clicked",
        });
      });
    });
  }
}

function testMeetingRoomPage() {
  console.log("\n🏫 MEETING ROOM PAGE TEST");

  // Check for ZoomDebugComponent
  const zoomDebug = document.querySelector(
    '[class*="zoom-debug"], [class*="ZoomDebug"]'
  );
  console.log("ZoomDebugComponent found:", !!zoomDebug);

  // Check for meeting data in page
  const meetingInfo = document.querySelector(
    '[class*="meeting-header"], [class*="loading-container"]'
  );
  console.log("Meeting info container found:", !!meetingInfo);

  // Check for error messages
  const errorElements = document.querySelectorAll(
    '[style*="color: red"], .error-message, [class*="error"]'
  );
  console.log(`Error elements found: ${errorElements.length}`);

  if (errorElements.length > 0) {
    errorElements.forEach((el, i) => {
      console.log(`Error ${i + 1}:`, el.textContent.trim());
    });
  }

  // Check for loading states
  const loadingElements = document.querySelectorAll(
    '[class*="loading"], [style*="loading"]'
  );
  console.log(`Loading elements found: ${loadingElements.length}`);

  // Check current page state from React DevTools if available
  if (window.React) {
    console.log("React DevTools available - can inspect component state");
  }
}

// Override console.error to catch React errors
const originalError = console.error;
console.error = function (...args) {
  if (
    args[0] &&
    args[0].includes &&
    (args[0].includes("Warning") ||
      args[0].includes("Error") ||
      args[0].includes("Failed"))
  ) {
    console.log("🚨 REACT ERROR DETECTED:");
    console.log(...args);
  }
  originalError.apply(console, args);
};

// Monitor navigation changes
let lastPath = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== lastPath) {
    console.log(
      `🔄 Navigation changed: ${lastPath} → ${window.location.pathname}`
    );
    lastPath = window.location.pathname;
    setTimeout(testNavigation, 1000); // Test after navigation settles
  }
}, 500);

// Start testing
testNavigation();

// Export functions for manual testing
window.debugNav = {
  testNavigation,
  testTutorFlow,
  testStudentFlow,
  testMeetingRoomPage,
  logNavigationState,
};

console.log("\n💡 Available functions:");
console.log("- debugNav.testNavigation() - Test current page");
console.log("- debugNav.testTutorFlow() - Test tutor specific elements");
console.log("- debugNav.testStudentFlow() - Test student specific elements");
console.log("- debugNav.testMeetingRoomPage() - Test meeting room page");
