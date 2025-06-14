// Debug Script: Test Rating Modal Functionality
// Paste this in browser console when on Student Classroom page

console.log("🔍 RATING DEBUG - Starting tests...");

// 1. Test if rating functions exist
const testFunctions = () => {
  console.log("\n1. FUNCTION EXISTENCE TEST:");

  // Check if we can access component state via React DevTools
  const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (reactDevTools) {
    console.log("✅ React DevTools available");
  } else {
    console.log(
      "❌ React DevTools not available - install React DevTools extension"
    );
  }

  // Test CSS classes
  console.log("\n2. CSS CLASS TEST:");
  const modalOverlay = document.querySelector(".scp-modal-overlay");
  const ratingBtn = document.querySelector(".scp-rating-btn");

  console.log("Modal overlay exists:", !!modalOverlay);
  console.log("Rating button exists:", !!ratingBtn);

  if (ratingBtn) {
    console.log("✅ Rating button found:", ratingBtn);
    console.log("Button text:", ratingBtn.textContent);
    console.log("Button onclick:", ratingBtn.onclick);
  } else {
    console.log("❌ No rating button found. Possible reasons:");
    console.log("  - Not on meeting view page");
    console.log("  - Classroom already rated (isRating = true)");
    console.log("  - Component not rendered");
  }
};

// 2. Test manual rating modal trigger
const testModalManually = () => {
  console.log("\n3. MANUAL MODAL TEST:");

  // Try to trigger modal manually via window object
  if (window.triggerRatingModal) {
    console.log("Found manual trigger function");
    window.triggerRatingModal();
  } else {
    console.log("Manual trigger not available");
  }

  // Check for modal in DOM
  const modal = document.querySelector(".scp-modal-overlay");
  if (modal) {
    console.log("✅ Modal found in DOM");
    console.log("Modal display:", getComputedStyle(modal).display);
    console.log("Modal visibility:", getComputedStyle(modal).visibility);
  } else {
    console.log("❌ No modal found in DOM");
  }
};

// 3. Check page state
const checkPageState = () => {
  console.log("\n4. PAGE STATE CHECK:");

  const url = window.location.href;
  console.log("Current URL:", url);

  if (url.includes("student-classroom")) {
    console.log("✅ On student classroom page");
  } else {
    console.log("❌ Not on student classroom page");
  }

  // Check if we're in meeting view
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get("view");
  const classroomId = urlParams.get("id");

  console.log("URL view parameter:", view);
  console.log("URL classroom ID:", classroomId);

  if (view === "meetings") {
    console.log("✅ In meeting view mode");
  } else {
    console.log(
      '❌ Not in meeting view mode - need to click "Xem danh sách phòng học"'
    );
  }
};

// 4. Test click simulation
const simulateRatingClick = () => {
  console.log("\n5. CLICK SIMULATION TEST:");

  const ratingBtn = document.querySelector(".scp-rating-btn");
  if (ratingBtn) {
    console.log("Found rating button, simulating click...");

    // Add event listener to capture the click
    ratingBtn.addEventListener("click", (e) => {
      console.log("🎯 RATING BUTTON CLICKED!");
      console.log("Event:", e);
      console.log("Target:", e.target);
    });

    // Simulate click
    ratingBtn.click();

    // Check modal after click
    setTimeout(() => {
      const modal = document.querySelector(".scp-modal-overlay");
      if (modal) {
        console.log("✅ Modal appeared after click");
        console.log("Modal style:", modal.style.cssText);
        console.log("Modal computed style:", {
          display: getComputedStyle(modal).display,
          visibility: getComputedStyle(modal).visibility,
          opacity: getComputedStyle(modal).opacity,
          zIndex: getComputedStyle(modal).zIndex,
        });
      } else {
        console.log("❌ Modal still not visible after click");
      }
    }, 100);
  } else {
    console.log("❌ No rating button to click");
  }
};

// Run all tests
testFunctions();
testModalManually();
checkPageState();

console.log("\n💡 NEXT STEPS:");
console.log("1. Make sure you are on: http://localhost:5175/student-classroom");
console.log("2. Login as a student user");
console.log('3. Click "Xem danh sách phòng học" on any classroom');
console.log("4. Look for rating button with console messages");
console.log("5. Run: simulateRatingClick() to test button click");

// Make function available globally
window.ratingDebug = {
  testFunctions,
  testModalManually,
  checkPageState,
  simulateRatingClick,
};

console.log("\n🛠️ Debug functions available:");
console.log("window.ratingDebug.simulateRatingClick()");
console.log("window.ratingDebug.checkPageState()");
console.log("window.ratingDebug.testFunctions()");
