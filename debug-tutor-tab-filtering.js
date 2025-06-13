// Debug script for TutorClassroomPage tab filtering issue
// Open browser console and run this script

console.log("🐛 DEBUG: TutorClassroomPage Tab Filtering");

// Check if we're on the right page
const currentPath = window.location.pathname;
console.log("Current path:", currentPath);

if (!currentPath.includes("quan-ly-lop-hoc")) {
  console.log(
    "❌ Not on TutorClassroomPage. Navigate to: /tai-khoan/ho-so/quan-ly-lop-hoc"
  );
} else {
  console.log("✅ On TutorClassroomPage");
}

// Check for React component state
setTimeout(() => {
  console.log("\n=== CLASSROOM DATA DEBUG ===");

  // Look for classroom cards
  const classroomCards = document.querySelectorAll(".tcp-classroom-card");
  console.log(`Found ${classroomCards.length} classroom cards`);

  classroomCards.forEach((card, index) => {
    const nameElement = card.querySelector(".tcp-classroom-name");
    const statusElement = card.querySelector(".tcp-status-badge");

    const name = nameElement ? nameElement.textContent.trim() : "Unknown";
    const status = statusElement ? statusElement.textContent.trim() : "Unknown";

    console.log(`Card ${index + 1}:`, { name, status });
  });

  // Check active tab
  const activeTab = document.querySelector(".tcp-tab.active");
  if (activeTab) {
    console.log("Active tab:", activeTab.textContent.trim());
  }

  // Check tab counts
  const tabCounts = document.querySelectorAll(".tcp-tab-count");
  tabCounts.forEach((count, index) => {
    console.log(`Tab ${index + 1} count:`, count.textContent.trim());
  });
}, 2000);

// Function to manually check filtering logic
window.debugClassroomFiltering = function () {
  console.log("\n=== MANUAL FILTERING CHECK ===");

  // This would need access to React state, so it's more for manual testing
  console.log(
    "Please check the console logs from the React component for detailed filtering info"
  );
  console.log(
    "Look for logs starting with 'All classrooms data:', 'Active tab:', 'Filtering classroom'"
  );
};

console.log("\n💡 Usage:");
console.log("1. Wait 2 seconds for automatic analysis");
console.log("2. Click between tabs and watch console logs");
console.log("3. Run debugClassroomFiltering() for manual check");
console.log("4. Look for status mismatches in the logs");

// Auto-run check
window.debugClassroomFiltering();
