// ================================
// RATING MODAL DEBUG SCRIPT
// ================================

console.log("🔍 RATING MODAL DEBUG SCRIPT LOADED");

// Function để test modal manually
window.testRatingModal = function () {
  console.log("🧪 TESTING RATING MODAL...");

  // Check if elements exist
  const ratingButtons = document.querySelectorAll(".scp-rating-btn");
  const modals = document.querySelectorAll(".scp-modal-overlay");

  console.log("📊 DEBUG RESULTS:", {
    ratingButtonsFound: ratingButtons.length,
    modalsFound: modals.length,
    ratingButtons: Array.from(ratingButtons).map((btn) => ({
      text: btn.textContent.trim(),
      visible: btn.offsetParent !== null,
      disabled: btn.disabled,
    })),
  });

  if (ratingButtons.length === 0) {
    console.log("❌ NO RATING BUTTONS FOUND!");
    console.log("💡 Possible reasons:");
    console.log("   1. Not in meeting view");
    console.log("   2. All meetings already rated (isRating = true)");
    console.log("   3. CSS classes wrong");
  } else {
    console.log("✅ Rating buttons found! Clicking first one...");
    ratingButtons[0].click();

    // Check if modal appeared after click
    setTimeout(() => {
      const modalsAfterClick = document.querySelectorAll(".scp-modal-overlay");
      console.log("📊 AFTER CLICK:", {
        modalsFound: modalsAfterClick.length,
        modalVisible:
          modalsAfterClick.length > 0 &&
          modalsAfterClick[0].offsetParent !== null,
      });

      if (modalsAfterClick.length === 0) {
        console.log("❌ MODAL DID NOT APPEAR!");
        console.log("💡 Check browser console for errors");
      } else {
        console.log("✅ MODAL APPEARED SUCCESSFULLY!");
      }
    }, 100);
  }
};

// Function để check state
window.checkRatingState = function () {
  console.log("🔍 CHECKING RATING STATE...");

  // These would only work if we could access React state
  console.log("💡 To check React state, open React DevTools and look for:");
  console.log("   - showRatingModal");
  console.log("   - selectedMeetingForRating");
  console.log("   - currentClassroomForRating");
  console.log("   - ratingValue");
  console.log("   - ratingDescription");
};

// Function để check data
window.checkClassroomData = function () {
  console.log("🔍 CHECKING CLASSROOM DATA...");

  // Check if currentClassroomForMeetings has correct structure
  console.log("💡 Look for these in React DevTools:");
  console.log("   - currentClassroomForMeetings.isRating");
  console.log("   - currentClassroomForMeetings.tutor");
  console.log("   - currentClassroomForMeetings.classroomId");
};

// Auto-run basic checks
console.log("🔍 AUTO-RUNNING BASIC CHECKS...");

// Check if we're on the right page
const isStudentPage = window.location.pathname.includes("student");
const hasClassroomInURL =
  window.location.search.includes("classroom") ||
  window.location.search.includes("meetings");

console.log("📊 PAGE CHECK:", {
  isStudentPage,
  hasClassroomInURL,
  currentURL: window.location.href,
  pathname: window.location.pathname,
  search: window.location.search,
});

// Check CSS
const cssLink = document.querySelector('link[href*="RatingModal.style.css"]');
const hasCSSInHead = !!cssLink;
const cssInline = document.querySelector("style");

console.log("📊 CSS CHECK:", {
  hasRatingModalCSS: hasCSSInHead,
  cssLinkFound: !!cssLink,
  hasInlineStyles: !!cssInline,
});

// Check if classes exist in DOM
setTimeout(() => {
  const elements = {
    meetingItems: document.querySelectorAll(".scp-meeting-item"),
    ratingSections: document.querySelectorAll(".scp-meeting-rating"),
    ratingButtons: document.querySelectorAll(".scp-rating-btn"),
    ratingDisplays: document.querySelectorAll(".scp-rating-display"),
  };

  console.log("📊 DOM ELEMENT CHECK:", {
    meetingItems: elements.meetingItems.length,
    ratingSections: elements.ratingSections.length,
    ratingButtons: elements.ratingButtons.length,
    ratingDisplays: elements.ratingDisplays.length,
    totalRatingElements:
      elements.ratingButtons.length + elements.ratingDisplays.length,
  });

  if (elements.meetingItems.length === 0) {
    console.log("❌ NO MEETING ITEMS FOUND!");
    console.log("💡 Make sure you're in the meeting view:");
    console.log("   1. Go to Student Classrooms");
    console.log("   2. Click 'Xem phòng học' for any classroom");
    console.log("   3. Look for rating buttons in meeting list");
  }

  if (
    elements.ratingButtons.length === 0 &&
    elements.ratingDisplays.length === 0
  ) {
    console.log("❌ NO RATING ELEMENTS FOUND!");
    console.log("💡 Possible issues:");
    console.log("   1. All meetings already rated");
    console.log("   2. Conditional rendering logic issue");
    console.log("   3. currentClassroomForMeetings data missing");
  }
}, 1000);

// Instructions
console.log("=".repeat(50));
console.log("🎯 HOW TO DEBUG RATING MODAL:");
console.log("1. Open this page in Student Classroom view");
console.log("2. Navigate to a classroom meeting view");
console.log("3. Run: window.testRatingModal()");
console.log("4. Check React DevTools for state");
console.log("5. Look for console errors");
console.log("=".repeat(50));
