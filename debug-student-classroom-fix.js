// Debug StudentClassroomPage Issues
// Run this in browser console to debug StudentClassroomPage

console.log("🔍 StudentClassroomPage Debug Script Started");

// Check if StudentClassroomPage is properly loaded
const checkPageLoad = () => {
  console.log("📋 Checking page load status...");

  // Check if page exists
  const page = document.querySelector(".student-classroom-page");
  console.log("Page element found:", !!page);

  // Check tab system
  const tabs = document.querySelectorAll(".scp-tab");
  console.log("Tabs found:", tabs.length);
  tabs.forEach((tab, index) => {
    console.log(`Tab ${index}:`, tab.textContent.trim());
    console.log(`Tab ${index} active:`, tab.classList.contains("active"));
  });

  // Check classroom cards
  const cards = document.querySelectorAll(".scp-classroom-card");
  console.log("Classroom cards found:", cards.length);

  // Check if loading
  const loading = document.querySelector(".scp-skeleton-container");
  console.log("Loading state:", !!loading);

  // Check for errors
  const errorMsg = document.querySelector(".scp-error-message");
  console.log("Error message:", errorMsg?.textContent || "None");

  // Check pagination
  const pagination = document.querySelector(".scp-pagination");
  console.log("Pagination found:", !!pagination);

  return {
    pageExists: !!page,
    tabCount: tabs.length,
    cardCount: cards.length,
    isLoading: !!loading,
    hasError: !!errorMsg,
    hasPagination: !!pagination,
  };
};

// Check React component state
const checkReactState = () => {
  console.log("📋 Checking React state...");

  // Try to find React fiber
  const page = document.querySelector(".student-classroom-page");
  if (page && page._reactInternalFiber) {
    console.log("React fiber found");
  } else if (page && page._reactInternals) {
    console.log("React internals found");
  } else {
    console.log("React instance not found directly");
  }
};

// Check API calls
const checkAPIActivity = () => {
  console.log("📋 Checking API activity...");

  // Monitor network requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    console.log("🔗 API Call:", args[0]);
    return originalFetch
      .apply(this, args)
      .then((response) => {
        console.log("✅ API Response:", response.status, args[0]);
        return response;
      })
      .catch((error) => {
        console.log("❌ API Error:", error, args[0]);
        throw error;
      });
  };

  console.log("API monitoring enabled");
};

// Check local storage and user state
const checkUserState = () => {
  console.log("📋 Checking user state...");

  const token = localStorage.getItem("authToken");
  console.log("Auth token exists:", !!token);

  const userProfile = localStorage.getItem("userProfile");
  console.log("User profile exists:", !!userProfile);

  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      console.log("User role:", profile.role);
      console.log("User ID:", profile.userId);
    } catch (e) {
      console.log("Error parsing user profile:", e);
    }
  }
};

// Check for JavaScript errors
const checkConsoleErrors = () => {
  console.log("📋 Checking for console errors...");

  // Override console.error to catch errors
  const originalError = console.error;
  console.error = function (...args) {
    console.log("🚨 Console Error Detected:", ...args);
    return originalError.apply(this, args);
  };

  console.log("Error monitoring enabled");
};

// Main debug function
const debugStudentClassroom = () => {
  console.log("🔧 Starting comprehensive StudentClassroomPage debug...");

  // Enable monitoring
  checkAPIActivity();
  checkConsoleErrors();

  // Check current state
  const pageStatus = checkPageLoad();
  checkReactState();
  checkUserState();

  console.log("📊 Page Status Summary:", pageStatus);

  // Test tab switching
  setTimeout(() => {
    console.log("🔄 Testing tab switching...");
    const tabs = document.querySelectorAll(".scp-tab");
    tabs.forEach((tab, index) => {
      setTimeout(() => {
        console.log(`Clicking tab ${index}:`, tab.textContent.trim());
        tab.click();
      }, index * 2000);
    });
  }, 3000);

  return pageStatus;
};

// Auto-run if on StudentClassroomPage
if (window.location.pathname.includes("/lop-hoc-cua-toi")) {
  console.log("📍 On StudentClassroomPage - running auto-debug");
  debugStudentClassroom();
} else {
  console.log(
    "📍 Not on StudentClassroomPage. Navigate to /lop-hoc-cua-toi and run debugStudentClassroom()"
  );
}

// Export for manual use
window.debugStudentClassroom = debugStudentClassroom;
window.checkPageLoad = checkPageLoad;

console.log(
  "🔍 Debug script loaded. Use debugStudentClassroom() to run manually."
);
