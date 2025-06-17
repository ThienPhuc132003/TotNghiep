// Debug script for Student Meeting View Issue - Comprehensive Analysis
console.log("🔍 STUDENT MEETING DEBUG - Comprehensive Analysis");

// Function to debug student meeting data and compare with tutor logic
function debugStudentMeetingData() {
  console.log("=== STUDENT MEETING DEBUG ANALYSIS ===");

  // 1. Check if we're in student classroom page
  const currentPath = window.location.pathname;
  console.log("📍 Current path:", currentPath);

  if (!currentPath.includes("/student-classroom")) {
    console.log("❌ Not on student classroom page, navigate to it first");
    return;
  }

  // 2. Check React component state (if available)
  const reactFiberKey = Object.keys(
    document.querySelector('[data-testid="student-classroom"]') || document.body
  ).find(
    (key) =>
      key.startsWith("__reactFiber") ||
      key.startsWith("__reactInternalInstance")
  );
  let reactComponent = null;

  if (reactFiberKey) {
    const fiber =
      document.querySelector('[data-testid="student-classroom"]')?.[
        reactFiberKey
      ] || document.body[reactFiberKey];
    reactComponent = fiber?.return?.memoizedProps || fiber?.memoizedProps;
  }

  // 3. Debug localStorage/sessionStorage
  console.log("🔍 Storage Debug:");
  console.log(
    "- accessToken exists:",
    !!(
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    )
  );
  console.log(
    "- user data:",
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );

  // 4. Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log("🔍 URL Parameters:");
  console.log("- classroomId:", urlParams.get("classroomId"));
  console.log("- classroomName:", urlParams.get("classroomName"));
  console.log("- tab:", urlParams.get("tab"));
  console.log("- page:", urlParams.get("page"));

  // 5. Check if meeting view is visible
  const meetingView = document.querySelector(".scp-meeting-view");
  const meetingList = document.querySelector(".scp-meeting-list");
  const meetingContent = document.querySelector(".scp-meeting-content");
  const loadingSpinner = document.querySelector(".scp-loading");

  console.log("🔍 UI Elements Debug:");
  console.log("- meetingView exists:", !!meetingView);
  console.log("- meetingList exists:", !!meetingList);
  console.log("- meetingContent exists:", !!meetingContent);
  console.log("- loadingSpinner exists:", !!loadingSpinner);
  console.log(
    "- meetingView visible:",
    meetingView ? getComputedStyle(meetingView).display !== "none" : false
  );

  // 6. Check meeting items
  const meetingItems = document.querySelectorAll(".scp-meeting-item");
  console.log("🔍 Meeting Items:");
  console.log("- meeting items count:", meetingItems.length);

  if (meetingItems.length > 0) {
    meetingItems.forEach((item, index) => {
      const topic =
        item.querySelector('strong:contains("Chủ đề:")') ||
        item.querySelector("p").textContent;
      const status = item.querySelector(".scp-meeting-status")?.textContent;
      console.log(`  Meeting ${index + 1}:`, { topic: topic, status: status });
    });
  }

  // 7. Check tab states
  const tabs = document.querySelectorAll(".scp-tab");
  console.log("🔍 Tab States:");
  tabs.forEach((tab, index) => {
    const isActive = tab.classList.contains("active");
    const tabText = tab.textContent.trim();
    const count = tab.querySelector(".scp-tab-count")?.textContent;
    console.log(
      `  Tab ${index + 1}: ${tabText} - Active: ${isActive} - Count: ${count}`
    );
  });

  // 8. Check for debug divs (hidden)
  const debugDiv = document.querySelector('div[style*="display: none"]');
  if (debugDiv) {
    console.log("🔍 Hidden Debug Info:", debugDiv.textContent);
  }

  // 9. Check console for recent API calls
  console.log("🔍 Recent Console Logs (check for API calls and debug info):");
  console.log("- Look for logs starting with 'STUDENT DEBUG'");
  console.log("- Look for API responses and filtered results");

  // 10. Manual API test
  console.log("🔍 Manual API Test - Simulating meeting fetch:");

  // Get classroomId from URL or prompt
  let classroomId = urlParams.get("classroomId");
  if (!classroomId) {
    // Try to find classroom ID from UI
    const viewButtons = document.querySelectorAll("button");
    viewButtons.forEach((btn) => {
      if (btn.textContent.includes("Xem phòng học")) {
        const parentItem = btn.closest(".scp-classroom-item");
        if (parentItem) {
          const idElement = parentItem.querySelector("[data-classroom-id]");
          if (idElement) {
            classroomId = idElement.getAttribute("data-classroom-id");
          }
        }
      }
    });
  }

  if (classroomId) {
    console.log("📞 Testing API call with classroomId:", classroomId);

    // Simulate the API call that should happen
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      fetch("/api/meeting/get-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classroomId: classroomId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("🔍 Direct API Response:", data);
          if (
            data.success &&
            data.data &&
            data.data.result &&
            data.data.result.items
          ) {
            const meetings = data.data.result.items;
            console.log("✅ Meetings found:", meetings.length);
            meetings.forEach((meeting, index) => {
              console.log(`  Meeting ${index + 1}:`, {
                meetingId: meeting.meetingId,
                topic: meeting.topic,
                status: meeting.status,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
              });
            });

            // Test filtering logic
            console.log("🔍 Testing Filter Logic:");

            // ENDED filter (same as tutor)
            const endedMeetings = meetings.filter(
              (m) =>
                m.status === "COMPLETED" ||
                m.status === "CANCELLED" ||
                m.status === "ENDED"
            );
            console.log("- ENDED meetings count:", endedMeetings.length);

            // IN_SESSION filter (student has extra STARTED)
            const inSessionMeetings = meetings.filter(
              (m) =>
                m.status === "IN_SESSION" ||
                m.status === "PENDING" ||
                m.status === "STARTED" ||
                !m.status
            );
            console.log(
              "- IN_SESSION meetings count:",
              inSessionMeetings.length
            );

            if (endedMeetings.length > 0) {
              console.log("✅ ENDED meetings should be visible!");
              console.log("- First ended meeting:", endedMeetings[0]);
            } else {
              console.log(
                "❌ No ENDED meetings found - this explains why nothing shows!"
              );
            }
          } else {
            console.log("❌ API response structure invalid:", data);
          }
        })
        .catch((error) => {
          console.error("❌ API call failed:", error);
        });
    } else {
      console.log("❌ No authentication token found");
    }
  } else {
    console.log("❌ No classroomId found - please provide one manually");
  }
}

// Run the debug
debugStudentMeetingData();

// Function to compare with tutor logic
function compareTutorStudentLogic() {
  console.log("\n=== TUTOR vs STUDENT LOGIC COMPARISON ===");

  console.log("🔍 Filter Differences:");
  console.log("TUTOR IN_SESSION filter: IN_SESSION, PENDING, !status");
  console.log(
    "STUDENT IN_SESSION filter: IN_SESSION, PENDING, STARTED, !status"
  );
  console.log("❓ Extra STARTED status in student filter could cause issues");

  console.log("\n🔍 API Call:");
  console.log("Both use: POST /api/meeting/get-meeting with { classroomId }");
  console.log("Both parse: response.data.result.items");

  console.log("\n🔍 Auto-tab switching:");
  console.log(
    "Both use same logic to switch tabs if current tab has no meetings"
  );

  console.log("\n❗ Possible Issues:");
  console.log("1. Different filter logic for IN_SESSION (STARTED status)");
  console.log("2. Tab auto-switching might not work correctly");
  console.log("3. Meeting data might have different status values");
  console.log("4. React state updates might not trigger re-render");
}

compareTutorStudentLogic();

// Helper function to click meeting view button for testing
function clickMeetingViewButton() {
  const viewButtons = Array.from(document.querySelectorAll("button")).filter(
    (btn) => btn.textContent.includes("Xem phòng học")
  );

  if (viewButtons.length > 0) {
    console.log("🔍 Found", viewButtons.length, "meeting view buttons");
    console.log("💡 Click one to test: viewButtons[0].click()");
    return viewButtons;
  } else {
    console.log("❌ No 'Xem phòng học' buttons found");
    return [];
  }
}

// Make functions available globally for manual testing
window.debugStudentMeeting = debugStudentMeetingData;
window.clickMeetingView = clickMeetingViewButton;
window.compareTutorStudent = compareTutorStudentLogic;

console.log("\n🔧 Available debug functions:");
console.log("- debugStudentMeeting() - Full debug analysis");
console.log("- clickMeetingView() - Find meeting view buttons");
console.log("- compareTutorStudent() - Compare logic differences");
