// Test script để kiểm tra vấn đề lọc lớp học theo tab
// Run này trong browser console để debug

console.log("🔍 CLASSROOM TAB FILTERING VERIFICATION TEST");
console.log("=".repeat(60));

// Mô phỏng dữ liệu lớp học để test
const mockClassrooms = [
  { classroomId: 1, nameOfRoom: "Lớp A", status: "IN_SESSION" },
  { classroomId: 2, nameOfRoom: "Lớp B", status: "PENDING" },
  { classroomId: 3, nameOfRoom: "Lớp C", status: "COMPLETED" },
  { classroomId: 4, nameOfRoom: "Lớp D", status: "CANCELLED" },
  { classroomId: 5, nameOfRoom: "Lớp E", status: "IN_SESSION" },
  { classroomId: 6, nameOfRoom: "Lớp F", status: "COMPLETED" },
];

console.log("📊 Mock classroom data:");
console.table(mockClassrooms);

// Test filtering logic giống như trong code
function testTabFiltering(classrooms, activeTab) {
  console.log(`\n🎯 Testing filter for tab: ${activeTab}`);

  const filteredClassrooms = classrooms.filter((classroom) => {
    if (activeTab === "IN_SESSION") {
      return (
        classroom.status === "IN_SESSION" || classroom.status === "PENDING"
      );
    } else if (activeTab === "ENDED") {
      return (
        classroom.status === "COMPLETED" || classroom.status === "CANCELLED"
      );
    }
    return true; // Show all for other tabs
  });

  console.log(`📋 Filtered results (${filteredClassrooms.length} items):`);
  console.table(filteredClassrooms);

  return filteredClassrooms;
}

// Test IN_SESSION tab
const inSessionResults = testTabFiltering(mockClassrooms, "IN_SESSION");
console.log("✅ IN_SESSION tab should show:", ["IN_SESSION", "PENDING"]);
console.log(
  "📊 Actual statuses:",
  inSessionResults.map((c) => c.status)
);

// Test ENDED tab
const endedResults = testTabFiltering(mockClassrooms, "ENDED");
console.log("✅ ENDED tab should show:", ["COMPLETED", "CANCELLED"]);
console.log(
  "📊 Actual statuses:",
  endedResults.map((c) => c.status)
);

// Verification
console.log("\n🔍 VERIFICATION:");
console.log("=".repeat(40));

const inSessionExpected = ["IN_SESSION", "PENDING"];
const endedExpected = ["COMPLETED", "CANCELLED"];

const inSessionActual = inSessionResults.map((c) => c.status);
const endedActual = endedResults.map((c) => c.status);

const inSessionCorrect = inSessionActual.every((status) =>
  inSessionExpected.includes(status)
);
const endedCorrect = endedActual.every((status) =>
  endedExpected.includes(status)
);

console.log(
  `✅ IN_SESSION tab filtering: ${inSessionCorrect ? "PASS" : "FAIL"}`
);
console.log(`✅ ENDED tab filtering: ${endedCorrect ? "PASS" : "FAIL"}`);

// Check for overlap (đây có thể là vấn đề)
const overlap = inSessionActual.filter((status) =>
  endedExpected.includes(status)
);
const reverseOverlap = endedActual.filter((status) =>
  inSessionExpected.includes(status)
);

if (overlap.length > 0) {
  console.log(`❌ ISSUE: IN_SESSION tab shows ENDED statuses: ${overlap}`);
}

if (reverseOverlap.length > 0) {
  console.log(
    `❌ ISSUE: ENDED tab shows IN_SESSION statuses: ${reverseOverlap}`
  );
}

if (overlap.length === 0 && reverseOverlap.length === 0) {
  console.log("✅ No overlap between tabs - filtering is working correctly");
}

console.log("\n🎯 TO DEBUG REAL ISSUE:");
console.log(
  "1. Check trong TutorClassroomPage console để xem actual classroom data"
);
console.log("2. Verify status values từ API response");
console.log("3. Check xem có classroom nào có status khác với expected không");
console.log("4. Look for console.log messages in actual page");

// Code để copy paste vào browser console trong actual page
console.log("\n📋 DEBUG CODE FOR ACTUAL PAGE:");
console.log("Copy đoạn code này vào browser console trong TutorClassroomPage:");
console.log(`
// Debug actual classroom data
if (window.classrooms) {
  console.log("🔍 Actual classrooms:", window.classrooms);
  console.table(window.classrooms.map(c => ({
    id: c.classroomId,
    name: c.nameOfRoom,
    status: c.status,
    tab: (c.status === "IN_SESSION" || c.status === "PENDING") ? "IN_SESSION" : "ENDED"
  })));
}
`);
