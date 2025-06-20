// Test API response structure for major and tutor level data
console.log("=== TESTING MAJOR AND TUTOR LEVEL API STRUCTURE ===\n");

// Mock API responses based on typical backend structure
const mockMajorResponse = {
  status: "OK",
  code: 200,
  success: true,
  message: "Major data fetched successfully",
  data: {
    total: 3,
    items: [
      {
        createdAt: "2025-03-04T07:56:18.484Z",
        updatedAt: "2025-03-18T00:43:08.379Z",
        majorId: "M0001",
        sumName: "KT",
        majorName: "Kỹ thuật",
      },
      {
        createdAt: "2025-03-04T07:56:18.484Z",
        updatedAt: "2025-03-18T00:43:08.379Z",
        majorId: "M0002",
        sumName: "CNTT",
        majorName: "Công nghệ thông tin",
      },
      {
        createdAt: "2025-03-04T07:56:18.484Z",
        updatedAt: "2025-03-18T00:43:08.379Z",
        majorId: "M0003",
        sumName: "QT",
        majorName: "Quản trị kinh doanh",
      },
    ],
  },
};

const mockTutorLevelResponse = {
  status: "OK",
  code: 200,
  success: true,
  message: "Tutor level data fetched successfully",
  data: {
    total: 4,
    items: [
      {
        createdAt: "2025-03-11T23:26:05.349Z",
        updatedAt: "2025-03-18T01:16:41.425Z",
        tutorLevelId: "TL0001",
        levelName: "Đồng",
        salary: 80000,
        description: "Người dạy có kinh nghiệm cơ bản",
      },
      {
        createdAt: "2025-03-11T23:25:22.020Z",
        updatedAt: "2025-04-03T06:13:30.659Z",
        tutorLevelId: "TL0002",
        levelName: "Bạch kim",
        salary: 180000,
        description: "Người dạy phải có bằng cấp tiến sĩ",
      },
      {
        createdAt: "2025-03-11T23:26:05.349Z",
        updatedAt: "2025-03-18T01:16:41.425Z",
        tutorLevelId: "TL0003",
        levelName: "Vàng",
        salary: 150000,
        description: "Người dạy có kinh nghiệm cao",
      },
      {
        createdAt: "2025-03-11T23:26:05.349Z",
        updatedAt: "2025-03-18T01:16:41.425Z",
        tutorLevelId: "TL0004",
        levelName: "Bạc",
        salary: 120000,
        description:
          "Người dạy phải có bằng cấp đại học hoặc là người có kinh nghiệm đi làm",
      },
    ],
  },
};

console.log("MAJOR API RESPONSE STRUCTURE:");
console.log(JSON.stringify(mockMajorResponse.data.items[0], null, 2));
console.log("\nExpected fields for major:");
console.log("- majorId:", mockMajorResponse.data.items[0].majorId);
console.log("- majorName:", mockMajorResponse.data.items[0].majorName);

console.log("\n" + "=".repeat(50));
console.log("\nTUTOR LEVEL API RESPONSE STRUCTURE:");
console.log(JSON.stringify(mockTutorLevelResponse.data.items[0], null, 2));
console.log("\nExpected fields for tutor level:");
console.log(
  "- tutorLevelId:",
  mockTutorLevelResponse.data.items[0].tutorLevelId
);
console.log("- levelName:", mockTutorLevelResponse.data.items[0].levelName);

console.log("\n" + "=".repeat(50));
console.log("\nTEST HELPER FUNCTIONS:");

// Test the helper functions
const majorOptions = mockMajorResponse.data.items;
const tutorLevelOptions = mockTutorLevelResponse.data.items;

const getMajorName = (id) => {
  console.log("getMajorName called with:", id);
  console.log("majorOptions:", majorOptions.length, "items");
  const major = majorOptions.find((m) => m.majorId === id);
  console.log("Found major:", major);
  return major ? major.majorName : id;
};

const getLevelName = (id) => {
  console.log("getLevelName called with:", id);
  console.log("tutorLevelOptions:", tutorLevelOptions.length, "items");
  const level = tutorLevelOptions.find((l) => l.tutorLevelId === id);
  console.log("Found level:", level);
  return level ? level.levelName : id;
};

// Test cases
console.log('\nTesting getMajorName("M0002"):', getMajorName("M0002"));
console.log('\nTesting getLevelName("TL0002"):', getLevelName("TL0002"));
console.log(
  '\nTesting with invalid ID - getMajorName("INVALID"):',
  getMajorName("INVALID")
);
console.log(
  '\nTesting with invalid ID - getLevelName("INVALID"):',
  getLevelName("INVALID")
);
