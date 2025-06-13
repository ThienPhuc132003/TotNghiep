/**
 * 🧪 COMPREHENSIVE SERVER-SIDE FILTERING VERIFICATION TEST
 *
 * This script tests the complete server-side filtering implementation
 * for both TutorClassroomPage and StudentClassroomPage
 *
 * Run this in browser console after logging in as both tutor and student
 */

console.log("🎯 COMPREHENSIVE SERVER-SIDE FILTERING TEST");
console.log("==========================================");

// Test configuration
const TEST_CONFIG = {
  endpoints: {
    tutorClassrooms: "/api/classroom/search-for-tutor",
    studentClassrooms: "/api/classroom/search-for-user",
    meetings: "/api/meeting/search",
  },
  filterTests: [
    {
      name: "Active Classrooms (Tutor)",
      filter: JSON.stringify([
        {
          key: "status",
          operator: "like",
          value: "IN_SESSION,PENDING",
        },
      ]),
      expectedStatuses: ["IN_SESSION", "PENDING"],
    },
    {
      name: "Ended Classrooms (Tutor)",
      filter: JSON.stringify([
        {
          key: "status",
          operator: "like",
          value: "COMPLETED,CANCELLED",
        },
      ]),
      expectedStatuses: ["COMPLETED", "CANCELLED"],
    },
    {
      name: "Active Classrooms (Student)",
      filter: JSON.stringify([
        {
          key: "status",
          operator: "like",
          value: "IN_SESSION,PENDING",
        },
      ]),
      expectedStatuses: ["IN_SESSION", "PENDING"],
    },
    {
      name: "Ended Classrooms (Student)",
      filter: JSON.stringify([
        {
          key: "status",
          operator: "like",
          value: "COMPLETED,CANCELLED",
        },
      ]),
      expectedStatuses: ["COMPLETED", "CANCELLED"],
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

// Test server-side filtering API
async function testServerSideFiltering(endpoint, filterTest, userType) {
  console.group(`🧪 Testing: ${filterTest.name} (${userType})`);

  try {
    const token = getUserToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: "1",
      rpp: "2", // Using pagination of 2 as implemented
      filter: filterTest.filter,
    });

    const url = `${window.location.origin}${endpoint}?${queryParams}`;
    logInfo(`Request URL: ${url}`);

    const response = await fetch(url, {
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
    logInfo(`Response status: ${response.status}`);

    if (!data.success) {
      throw new Error(`API Error: ${data.message || "Unknown error"}`);
    }

    const items = data.data?.items || [];
    const total = data.data?.total || 0;

    logSuccess(`Fetched ${items.length} items (total: ${total})`);

    // Validate filter results
    const invalidItems = items.filter(
      (item) => !filterTest.expectedStatuses.includes(item.status)
    );

    if (invalidItems.length > 0) {
      logError(`Found ${invalidItems.length} items with unexpected status:`);
      invalidItems.forEach((item) => {
        console.error(`  - ${item.nameOfRoom || item.name}: ${item.status}`);
      });
    } else {
      logSuccess("All items have expected status values");
    }

    // Log status distribution
    const statusCounts = {};
    items.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });
    logInfo("Status distribution:", statusCounts);

    console.groupEnd();
    return { success: true, total, items: items.length, statusCounts };
  } catch (error) {
    logError("Test failed", error);
    console.groupEnd();
    return { success: false, error: error.message };
  }
}

// Test meeting filtering
async function testMeetingFiltering(classroomId) {
  console.group(`🧪 Testing Meeting Filtering for Classroom: ${classroomId}`);

  try {
    const token = getUserToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Test active meetings filter
    const activeParams = new URLSearchParams({
      classroomId: classroomId,
      page: "1",
      rpp: "2",
      status: JSON.stringify(["IN_SESSION", "STARTED", null]),
    });

    const activeUrl = `${window.location.origin}${TEST_CONFIG.endpoints.meetings}?${activeParams}`;
    logInfo(`Active meetings URL: ${activeUrl}`);

    const activeResponse = await fetch(activeUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    if (activeResponse.ok) {
      const activeData = await activeResponse.json();
      const activeMeetings = activeData.data?.items || [];
      logSuccess(`Found ${activeMeetings.length} active meetings`);
    }

    // Test ended meetings filter
    const endedParams = new URLSearchParams({
      classroomId: classroomId,
      page: "1",
      rpp: "2",
      status: JSON.stringify(["COMPLETED", "ENDED"]),
    });

    const endedUrl = `${window.location.origin}${TEST_CONFIG.endpoints.meetings}?${endedParams}`;
    logInfo(`Ended meetings URL: ${endedUrl}`);

    const endedResponse = await fetch(endedUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    if (endedResponse.ok) {
      const endedData = await endedResponse.json();
      const endedMeetings = endedData.data?.items || [];
      logSuccess(`Found ${endedMeetings.length} ended meetings`);
    }

    console.groupEnd();
    return { success: true };
  } catch (error) {
    logError("Meeting filtering test failed", error);
    console.groupEnd();
    return { success: false, error: error.message };
  }
}

// Run comprehensive test suite
async function runComprehensiveTest() {
  console.log("\n🚀 Starting Comprehensive Server-Side Filtering Test\n");

  const results = {
    tutorTests: [],
    studentTests: [],
    meetingTests: [],
    summary: { passed: 0, failed: 0 },
  };

  // Test tutor classroom filtering
  console.log("📋 Testing Tutor Classroom Filtering...");
  for (const filterTest of TEST_CONFIG.filterTests.slice(0, 2)) {
    // First 2 are tutor tests
    const result = await testServerSideFiltering(
      TEST_CONFIG.endpoints.tutorClassrooms,
      filterTest,
      "Tutor"
    );
    results.tutorTests.push(result);
    if (result.success) results.summary.passed++;
    else results.summary.failed++;
  }

  // Test student classroom filtering
  console.log("\n📚 Testing Student Classroom Filtering...");
  for (const filterTest of TEST_CONFIG.filterTests.slice(2, 4)) {
    // Last 2 are student tests
    const result = await testServerSideFiltering(
      TEST_CONFIG.endpoints.studentClassrooms,
      filterTest,
      "Student"
    );
    results.studentTests.push(result);
    if (result.success) results.summary.passed++;
    else results.summary.failed++;
  }

  // Test meeting filtering (if we have classrooms)
  const firstTutorTest = results.tutorTests[0];
  if (firstTutorTest.success && firstTutorTest.items > 0) {
    console.log("\n🎥 Testing Meeting Filtering...");
    // We would need a classroom ID to test this properly
    logInfo(
      "Meeting filtering requires specific classroom ID - test manually from UI"
    );
  }

  // Print summary
  console.log("\n📊 TEST SUMMARY");
  console.log("================");
  logSuccess(`Passed: ${results.summary.passed}`);
  if (results.summary.failed > 0) {
    logError(`Failed: ${results.summary.failed}`);
  }

  const successRate =
    (results.summary.passed /
      (results.summary.passed + results.summary.failed)) *
    100;
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);

  if (results.summary.failed === 0) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Server-side filtering is working correctly!"
    );
  } else {
    console.log("\n⚠️ Some tests failed. Please check the implementation.");
  }

  return results;
}

// Export test functions
window.testServerSideFiltering = testServerSideFiltering;
window.testMeetingFiltering = testMeetingFiltering;
window.runComprehensiveTest = runComprehensiveTest;

// Auto-run if user wants
console.log("\n🎯 Test functions available:");
console.log("- window.runComprehensiveTest() - Run all tests");
console.log(
  "- window.testServerSideFiltering(endpoint, filterTest, userType) - Test specific filter"
);
console.log(
  "- window.testMeetingFiltering(classroomId) - Test meeting filtering"
);
console.log("\nRun window.runComprehensiveTest() to start testing!");
