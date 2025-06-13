// 🚀 Quick Tab Filtering Test
// Paste this into browser console when on classroom page

console.log("🎯 Quick Tab Filtering Test Started");

const quickTest = () => {
  // Detect page type
  const isTutor = window.location.pathname.includes("/quan-ly-lop-hoc");
  const isStudent = window.location.pathname.includes("/lop-hoc-cua-toi");

  if (!isTutor && !isStudent) {
    console.log("❌ Please navigate to classroom page first");
    return;
  }

  const pageType = isTutor ? "Tutor" : "Student";
  console.log(`📍 Testing ${pageType}ClassroomPage`);

  // Find tabs
  const tabSelector = isTutor ? ".tcp-tab" : ".scp-tab";
  const tabs = document.querySelectorAll(tabSelector);

  if (tabs.length < 2) {
    console.log("❌ Not enough tabs found");
    return;
  }

  console.log(`✅ Found ${tabs.length} tabs`);

  // Test sequence
  let step = 0;
  const steps = [
    () => {
      console.log("🔄 Step 1: Click 'Lớp học đang hoạt động' tab");
      tabs[0].click();
    },
    () => {
      console.log("🔄 Step 2: Click 'Lớp học đã kết thúc' tab");
      tabs[1].click();
    },
    () => {
      console.log("🔄 Step 3: Click 'Lớp học đang hoạt động' tab again");
      tabs[0].click();
    },
    () => {
      console.log("✅ Test sequence completed!");

      // Check final state
      const cardSelector = isTutor
        ? ".tcp-classroom-card"
        : ".scp-classroom-card";
      const cards = document.querySelectorAll(cardSelector);
      const activeTab = document.querySelector(`${tabSelector}.active`);

      console.log(`📊 Final Results:`);
      console.log(
        `  Active tab: ${activeTab ? activeTab.textContent.trim() : "None"}`
      );
      console.log(`  Cards displayed: ${cards.length}`);

      if (cards.length > 0) {
        console.log("🎉 SUCCESS: Classrooms are displaying correctly!");
      } else {
        console.log(
          "❌ ISSUE: No classrooms showing - check console for errors"
        );
      }
    },
  ];

  const runNextStep = () => {
    if (step < steps.length) {
      steps[step]();
      step++;
      setTimeout(runNextStep, 2000);
    }
  };

  runNextStep();
};

// Monitor API calls during test
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const url = args[0];
  if (typeof url === "string" && url.includes("classroom/search-for-")) {
    console.log("📡 API Call:", url);
  }
  return originalFetch.apply(this, args);
};

console.log("🚀 Starting quick test in 2 seconds...");
setTimeout(quickTest, 2000);
