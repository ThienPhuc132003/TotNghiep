// 🎯 Tab Filtering Fix Verification Script
// Test for both TutorClassroomPage and StudentClassroomPage tab switching issues

console.log("🔧 Starting Tab Filtering Fix Verification...");

// Main verification function
const verifyTabFiltering = () => {
  console.log("📋 Verifying tab filtering fixes...");

  // Check if we're on classroom pages
  const isTutorPage = window.location.pathname.includes("/quan-ly-lop-hoc");
  const isStudentPage = window.location.pathname.includes("/lop-hoc-cua-toi");

  if (!isTutorPage && !isStudentPage) {
    console.log("❌ Not on classroom page. Navigate to classroom page first.");
    return;
  }

  const pageType = isTutorPage ? "Tutor" : "Student";
  console.log(`📍 On ${pageType}ClassroomPage`);

  // Check for tabs
  const tabSelector = isTutorPage ? ".tcp-tab" : ".scp-tab";
  const tabs = document.querySelectorAll(tabSelector);

  console.log(`Found ${tabs.length} tabs`);
  tabs.forEach((tab, index) => {
    console.log(`Tab ${index + 1}:`, tab.textContent.trim());
    console.log(`Active:`, tab.classList.contains("active"));
  });

  // Check current data
  const cardSelector = isTutorPage
    ? ".tcp-classroom-card"
    : ".scp-classroom-card";
  const cards = document.querySelectorAll(cardSelector);
  console.log(`Current cards displayed: ${cards.length}`);

  // Monitor API calls
  monitorAPIFiltering();

  // Test tab switching
  if (tabs.length >= 2) {
    testTabSwitching(tabs, pageType);
  }
};

// Monitor API calls for filtering
const monitorAPIFiltering = () => {
  console.log("🔍 Monitoring API calls for filtering...");

  // Override fetch to monitor API calls
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];

    if (typeof url === "string" && url.includes("classroom/search-for-")) {
      console.log("🌐 API Call detected:", url);

      // Parse query parameters if they exist
      if (url.includes("?")) {
        const urlObj = new URL(url, window.location.origin);
        const params = urlObj.searchParams;

        console.log("Query parameters:");
        for (const [key, value] of params.entries()) {
          console.log(`  ${key}:`, value);

          if (key === "filter") {
            try {
              const filterObj = JSON.parse(value);
              console.log("  Parsed filter:", filterObj);
            } catch (e) {
              console.log("  Filter parse error:", e);
            }
          }
        }
      }
    }

    return originalFetch.apply(this, args).then((response) => {
      if (typeof url === "string" && url.includes("classroom/search-for-")) {
        console.log("📦 API Response status:", response.status);

        // Clone response to read data without consuming it
        const clonedResponse = response.clone();
        clonedResponse
          .json()
          .then((data) => {
            console.log("📊 Response data:");
            console.log("  Success:", data.success);
            console.log("  Total items:", data.data?.total);
            console.log("  Items count:", data.data?.items?.length);

            if (data.data?.items) {
              console.log(
                "  Item statuses:",
                data.data.items.map((item) => ({
                  name: item.nameOfRoom,
                  status: item.status,
                }))
              );
            }
          })
          .catch((e) => console.log("Response parsing error:", e));
      }

      return response;
    });
  };

  console.log("✅ API monitoring enabled");
};

// Test tab switching functionality
const testTabSwitching = (tabs, pageType) => {
  console.log("🔄 Testing tab switching...");

  let currentTabIndex = 0;
  const testNextTab = () => {
    if (currentTabIndex >= tabs.length) {
      console.log("✅ Tab switching test completed");
      return;
    }

    const tab = tabs[currentTabIndex];
    const tabName = tab.textContent.trim();

    console.log(`🎯 Testing tab: ${tabName}`);

    // Record state before click
    const cardSelector =
      pageType === "Tutor" ? ".tcp-classroom-card" : ".scp-classroom-card";
    const beforeCards = document.querySelectorAll(cardSelector).length;

    // Click the tab
    tab.click();

    // Wait and check results
    setTimeout(() => {
      const afterCards = document.querySelectorAll(cardSelector).length;
      const isActive = tab.classList.contains("active");

      console.log(`📊 Tab "${tabName}" results:`);
      console.log(`  Active: ${isActive}`);
      console.log(`  Cards before: ${beforeCards}`);
      console.log(`  Cards after: ${afterCards}`);

      if (isActive) {
        console.log(`✅ Tab "${tabName}" activated successfully`);
      } else {
        console.log(`❌ Tab "${tabName}" failed to activate`);
      }

      currentTabIndex++;

      // Test next tab after delay
      setTimeout(testNextTab, 2000);
    }, 1500);
  };

  testNextTab();
};

// Check for specific filtering issues
const checkFilteringIssues = () => {
  console.log("🕵️ Checking for common filtering issues...");

  // Check console for filter-related logs
  const originalConsoleLog = console.log;
  let filterLogs = [];

  console.log = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("filter") ||
      message.includes("status") ||
      message.includes("tab")
    ) {
      filterLogs.push(message);
    }
    return originalConsoleLog.apply(this, args);
  };

  // Check after some time
  setTimeout(() => {
    console.log("📝 Filter-related logs captured:");
    filterLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });

    // Restore original console.log
    console.log = originalConsoleLog;
  }, 5000);
};

// Debug specific tab filtering issues
const debugTabIssues = () => {
  console.log("🐛 Debugging tab filtering issues...");

  // Check for common problems
  const issues = [];

  // Check if classrooms array is empty
  const isTutorPage = window.location.pathname.includes("/quan-ly-lop-hoc");

  // Try to access React component state (if available)
  try {
    const pageElement = document.querySelector(
      isTutorPage ? ".tutor-classroom-page" : ".student-classroom-page"
    );

    if (pageElement) {
      // Check for React fiber
      const reactFiber =
        pageElement._reactInternalFiber || pageElement._reactInternals;
      if (reactFiber) {
        console.log("🔍 React component found");
        // Could potentially access component state here
      }
    }
  } catch (e) {
    console.log("⚠️ Could not access React state:", e.message);
  }

  // Check local storage
  const authToken = localStorage.getItem("authToken");
  const userProfile = localStorage.getItem("userProfile");

  console.log("🔐 Auth state:");
  console.log("  Token exists:", !!authToken);
  console.log("  Profile exists:", !!userProfile);

  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      console.log("  User role:", profile.role);
      console.log("  User ID:", profile.userId);
    } catch (e) {
      console.log("  Profile parse error:", e);
    }
  }

  return issues;
};

// Main execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", verifyTabFiltering);
} else {
  verifyTabFiltering();
}

// Additional debugging
checkFilteringIssues();
const issues = debugTabIssues();

// Export for manual use
window.verifyTabFiltering = verifyTabFiltering;
window.monitorAPIFiltering = monitorAPIFiltering;
window.debugTabIssues = debugTabIssues;

console.log("🎯 Tab Filtering Verification Script loaded");
console.log("📌 Available functions:");
console.log("  - verifyTabFiltering()");
console.log("  - monitorAPIFiltering()");
console.log("  - debugTabIssues()");

// Auto-run verification if on classroom page
setTimeout(() => {
  const onClassroomPage =
    window.location.pathname.includes("/quan-ly-lop-hoc") ||
    window.location.pathname.includes("/lop-hoc-cua-toi");

  if (onClassroomPage) {
    console.log("🚀 Auto-running verification on classroom page...");
    verifyTabFiltering();
  }
}, 1000);
