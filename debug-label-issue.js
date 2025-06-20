// Debug script để test label ngành học
console.log("=== DEBUG LABEL ISSUE ===\n");

// Mô phỏng kịch bản có thể xảy ra
console.log("SCENARIO 1: Data loaded successfully");
const majorOptions = [
  { majorId: "M0001", majorName: "Kỹ thuật" },
  { majorId: "M0002", majorName: "Công nghệ thông tin" },
  { majorId: "M0003", majorName: "Quản trị kinh doanh" },
];

const tutorLevelOptions = [
  { tutorLevelId: "TL0001", levelName: "Đồng" },
  { tutorLevelId: "TL0002", levelName: "Bạch kim" },
  { tutorLevelId: "TL0003", levelName: "Vàng" },
  { tutorLevelId: "TL0004", levelName: "Bạc" },
];

const isFilterDataLoading = false;

const getMajorName = (id) => {
  console.log("getMajorName called with:", id);
  const major = majorOptions.find((m) => m.majorId === id);
  if (major) {
    return major.majorName;
  }
  return isFilterDataLoading ? "Đang tải..." : id;
};

const getLevelName = (id) => {
  console.log("getLevelName called with:", id);
  const level = tutorLevelOptions.find((l) => l.tutorLevelId === id);
  if (level) {
    return level.levelName;
  }
  return isFilterDataLoading ? "Đang tải..." : id;
};

console.log("Test 1 - Valid major ID:", getMajorName("M0002"));
console.log("Test 2 - Valid level ID:", getLevelName("TL0002"));

console.log("\n" + "=".repeat(50));
console.log("\nSCENARIO 2: Data still loading");
const isFilterDataLoading2 = true;
const majorOptions2 = [];
const tutorLevelOptions2 = [];

const getMajorName2 = (id) => {
  const major = majorOptions2.find((m) => m.majorId === id);
  if (major) {
    return major.majorName;
  }
  return isFilterDataLoading2 ? "Đang tải..." : id;
};

console.log("Test 3 - During loading:", getMajorName2("M0002"));

console.log("\n" + "=".repeat(50));
console.log("\nSCENARIO 3: API response structure issue");
// Giả sử API trả về structure khác
const wrongStructureMajorOptions = [
  { id: "M0001", name: "Kỹ thuật" }, // Sai field names
  { id: "M0002", name: "Công nghệ thông tin" },
];

const getMajorNameWrong = (id) => {
  // Code expect majorId và majorName nhưng API trả về id và name
  const major = wrongStructureMajorOptions.find((m) => m.majorId === id); // Sẽ không tìm thấy
  return major ? major.majorName : id;
};

console.log(
  "Test 4 - Wrong structure (should return ID):",
  getMajorNameWrong("M0002")
);

console.log("\n" + "=".repeat(50));
console.log("\nCOMMON ISSUES & SOLUTIONS:");
console.log('1. Data not loaded yet -> Show "Đang tải..." (FIXED)');
console.log("2. Wrong API field names -> Check actual API response");
console.log("3. Network error -> Check browser network tab");
console.log("4. Component mount timing -> Added debug logs");

console.log("\nDEBUG STEPS:");
console.log("1. Open browser console");
console.log("2. Select major/level filter");
console.log("3. Check debug logs for:");
console.log('   - "Major data loaded:" or "Tutor level data loaded:"');
console.log('   - "getMajorName called with:" + ID');
console.log('   - "Found major:" + object data');
console.log("4. If object is undefined -> Check API field names");
console.log("5. If API call failed -> Check network tab");
