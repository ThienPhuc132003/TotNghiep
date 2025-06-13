/**
 * 🧪 CLASSROOM PAGES FIX VERIFICATION SCRIPT
 *
 * This script helps verify that both TutorClassroomPage and StudentClassroomPage
 * are displaying classrooms correctly after the server-side filtering fix
 *
 * Run this in browser console after navigating to each page
 */

console.log("🎯 CLASSROOM PAGES FIX VERIFICATION");
console.log("===================================");

// Test configuration
const TEST_CONFIG = {
  pages: [
    {
      name: "TutorClassroomPage",
      url: "/tai-khoan/ho-so/quan-ly-lop-hoc",
      apiEndpoint: "/api/classroom/search-for-tutor",
    },
    {
      name: "StudentClassroomPage",
      url: "/tai-khoan/ho-so/lop-hoc-cua-toi",
      apiEndpoint: "/api/classroom/search-for-user",
    },
  ],
};

// Utility functions
function getUserToken() {
  const tokenCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error = null) {
  console.error(`❌ ${message}`);
  if (error) console.error(error);
}

function logInfo(message) {
  console.log(`ℹ️ ${message}`);
}

// Check if we're on a classroom page
function detectCurrentPage() {
  const path = window.location.pathname;
  if (path.includes("/quan-ly-lop-hoc")) {
    return "TutorClassroomPage";
  } else if (path.includes("/lop-hoc-cua-toi")) {
    return "StudentClassroomPage";
  }
  return "Unknown";
}

// Test API directly
async function testClassroomAPI(endpoint) {
  try {
    const token = getUserToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Test without filter first (should show all classrooms)
    const allParams = new URLSearchParams({
      page: "1",
      rpp: "2",
    });

    const allUrl = `${window.location.origin}${endpoint}?${allParams}`;
    logInfo(`Testing API: ${allUrl}`);

    const response = await fetch(allUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`API Error: ${data.message || "Unknown error"}`);
    }

    const items = data.data?.items || [];
    const total = data.data?.total || 0;

    logSuccess(`API working: ${items.length} items returned (total: ${total})`);

    if (items.length > 0) {
      const statusCounts = {};
      items.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });
      logInfo("Status distribution:", statusCounts);

      // Show sample classroom data
      const sampleClassroom = items[0];
      logInfo("Sample classroom:", {
        id: sampleClassroom.classroomId,
        name: sampleClassroom.nameOfRoom || sampleClassroom.name,
        status: sampleClassroom.status,
      });
    } else {
      logInfo("No classrooms found in API response");
    }

    return { success: true, total, items: items.length, statusCounts };
  } catch (error) {
    logError("API test failed", error);
    return { success: false, error: error.message };
  }
}

// Check UI elements
function checkUIElements() {
  console.group("🖼️ Checking UI Elements");

  try {
    // Check if classroom list exists
    const classroomList = document.querySelector(
      ".tcp-classroom-list, .scp-classroom-list"
    );
    if (classroomList) {
      const classroomCards = classroomList.querySelectorAll(
        ".tcp-classroom-card, .scp-classroom-card"
      );
      logSuccess(`Found ${classroomCards.length} classroom cards in UI`);

      // Check tab buttons
      const tabs = document.querySelectorAll(".tcp-tab, .scp-tab");
      logSuccess(`Found ${tabs.length} tab buttons`);

      // Check tab counts
      const tabCounts = document.querySelectorAll(
        ".tcp-tab-count, .scp-tab-count"
      );
      if (tabCounts.length > 0) {
        logInfo(
          "Tab counts:",
          Array.from(tabCounts).map((el) => el.textContent)
        );
      }

      // Check if any empty state is shown
      const emptyState = document.querySelector(
        ".tcp-empty-state, .scp-empty-state"
      );
      if (emptyState) {
        logInfo("Empty state detected:", emptyState.textContent.trim());
      }
    } else {
      const loadingElements = document.querySelectorAll(
        ".tcp-skeleton, .scp-skeleton"
      );
      const errorElements = document.querySelectorAll(
        ".tcp-error-message, .scp-error-message"
      );

      if (loadingElements.length > 0) {
        logInfo("Page is still loading...");
      } else if (errorElements.length > 0) {
        logError("Error message found:", errorElements[0].textContent);
      } else {
        logError("No classroom list found in UI");
      }
    }
  } catch (error) {
    logError("UI check failed", error);
  }

  console.groupEnd();
}

// Main verification function
async function verifyClassroomPage() {
  console.log("\n🚀 Starting Classroom Page Verification\n");

  const currentPage = detectCurrentPage();
  logInfo(`Current page: ${currentPage}`);

  if (currentPage === "Unknown") {
    logError("Not on a recognized classroom page. Please navigate to:");
    logInfo("- Tutor: /tai-khoan/ho-so/quan-ly-lop-hoc");
    logInfo("- Student: /tai-khoan/ho-so/lop-hoc-cua-toi");
    return;
  }

  // Check UI first
  checkUIElements();

  // Test API
  const pageConfig = TEST_CONFIG.pages.find((p) => p.name === currentPage);
  if (pageConfig) {
    console.log(`\n📡 Testing ${currentPage} API...`);
    const apiResult = await testClassroomAPI(pageConfig.apiEndpoint);

    if (apiResult.success) {
      logSuccess(`${currentPage} API is working correctly`);

      if (apiResult.items > 0) {
        logSuccess("✅ CLASSROOMS ARE BEING RETURNED FROM API");
        logInfo("If UI shows empty, there might be a rendering issue");
      } else {
        logInfo("⚠️ No classrooms in database for this user");
      }
    } else {
      logError(`${currentPage} API failed:`, apiResult.error);
    }
  }

  // Final summary
  console.log("\n📊 VERIFICATION SUMMARY");
  console.log("========================");

  const hasClassroomCards =
    document.querySelectorAll(".tcp-classroom-card, .scp-classroom-card")
      .length > 0;
  const hasError =
    document.querySelectorAll(".tcp-error-message, .scp-error-message").length >
    0;
  const isLoading =
    document.querySelectorAll(".tcp-skeleton, .scp-skeleton").length > 0;

  if (hasClassroomCards) {
    logSuccess("✅ CLASSROOM DISPLAY IS WORKING");
  } else if (isLoading) {
    logInfo("⏳ Page is still loading");
  } else if (hasError) {
    logError("❌ Error state detected");
  } else {
    logError("❌ No classrooms displayed (but no error shown)");
    logInfo("💡 Possible causes:");
    logInfo("   - Client-side filtering too strict");
    logInfo("   - React state management issue");
    logInfo("   - Empty database for user");
  }
}

// Test tab switching
function testTabSwitching() {
  console.log("\n🔄 Testing Tab Switching");

  const tabs = document.querySelectorAll(".tcp-tab, .scp-tab");
  if (tabs.length >= 2) {
    logInfo("Found tabs, testing click functionality...");

    tabs.forEach((tab, index) => {
      const tabText = tab.textContent.trim();
      logInfo(`Tab ${index + 1}: ${tabText}`);

      // Add click listener to monitor tab changes
      tab.addEventListener("click", () => {
        logInfo(`🖱️ Tab clicked: ${tabText}`);

        // Check after a short delay for UI updates
        setTimeout(() => {
          const classroomCards = document.querySelectorAll(
            ".tcp-classroom-card, .scp-classroom-card"
          );
          logInfo(`After tab switch: ${classroomCards.length} cards visible`);
        }, 1000);
      });
    });

    logSuccess("Tab click monitoring enabled");
  } else {
    logError("Not enough tabs found for testing");
  }
}

// Export functions
window.verifyClassroomPage = verifyClassroomPage;
window.testClassroomAPI = testClassroomAPI;
window.checkUIElements = checkUIElements;
window.testTabSwitching = testTabSwitching;

// Auto-run verification
console.log("\n🎯 Verification functions available:");
console.log("- window.verifyClassroomPage() - Run full verification");
console.log("- window.testClassroomAPI(endpoint) - Test API directly");
console.log("- window.checkUIElements() - Check UI state");
console.log("- window.testTabSwitching() - Enable tab monitoring");
console.log("\n🚀 Running automatic verification...");

// Auto-run after page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", verifyClassroomPage);
} else {
  verifyClassroomPage();
}

// Enable tab testing
testTabSwitching();
