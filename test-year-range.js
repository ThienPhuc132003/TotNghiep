/**
 * KIỂM TRA ADMIN DASHBOARD YEAR TIME RANGE
 * ========================================
 */

// Mock API response cho year range
const mockYearResponse = {
  information: {
    revenue: 15000000,
    revenuePercentage: 25.3,
    newUsers: 150,
    newUserPercentage: 18.7,
    newTutors: 35,
    newTutorPercentage: 22.1,
    newTutorRequest: 80,
    newTutorRequestPercentage: 15.4,
    newClassActive: 120,
    newClassActivePercentage: 28.9,
  },
  monthRevenue: {
    revenue: [
      { month: "2024-01", revenue: 1200000 },
      { month: "2024-02", revenue: 1350000 },
      { month: "2024-03", revenue: 1180000 },
      { month: "2024-04", revenue: 1420000 },
      { month: "2024-05", revenue: 1380000 },
      { month: "2024-06", revenue: 1250000 },
      { month: "2024-07", revenue: 1480000 },
      { month: "2024-08", revenue: 1320000 },
      { month: "2024-09", revenue: 1510000 },
      { month: "2024-10", revenue: 1290000 },
      { month: "2024-11", revenue: 1400000 },
      { month: "2024-12", revenue: 1560000 },
    ],
  },
};

// Mock API response với giá trị zero
const mockYearResponseZeros = {
  information: {
    revenue: 8500000,
    revenuePercentage: 12.1,
    newUsers: 0,
    newUserPercentage: 0,
    newTutors: 0,
    newTutorPercentage: 0,
    newTutorRequest: 0,
    newTutorRequestPercentage: 0,
    newClassActive: 45,
    newClassActivePercentage: 18.2,
  },
  monthRevenue: {
    revenue: [
      { month: "2024-01", revenue: 700000 },
      { month: "2024-02", revenue: 750000 },
      { month: "2024-03", revenue: 680000 },
      { month: "2024-04", revenue: 820000 },
      { month: "2024-05", revenue: 780000 },
      { month: "2024-06", revenue: 650000 },
      { month: "2024-07", revenue: 880000 },
      { month: "2024-08", revenue: 720000 },
      { month: "2024-09", revenue: 910000 },
      { month: "2024-10", revenue: 690000 },
      { month: "2024-11", revenue: 800000 },
      { month: "2024-12", revenue: 960000 },
    ],
  },
};

// Replicate exact functions from AdminDashboard.jsx
function processChartData(timeSeriesData, dataKey, labelMappingFunc, valueKey) {
  if (!timeSeriesData || !Array.isArray(timeSeriesData[dataKey])) {
    console.warn(
      `Dữ liệu ${dataKey} không hợp lệ hoặc thiếu trong API response.`
    );
    return { labels: [], values: [] };
  }
  const labels = timeSeriesData[dataKey].map(labelMappingFunc);
  const values = timeSeriesData[dataKey].map((item) => item[valueKey] || 0);
  return { labels, values };
}

function createMockTimeSeriesData(labels, baseValue, variance = 0.3) {
  console.log(
    `🔍 Creating mock data - baseValue: ${baseValue}, variance: ${variance}`
  );

  // Nếu baseValue = 0, trả về array toàn 0 để reflect đúng thực tế
  if (baseValue === 0) {
    console.log(`✅ baseValue = 0, returning all zeros`);
    return labels.map(() => 0);
  }

  // Với baseValue rất nhỏ (1-2), giảm variance để tránh over-inflate
  if (baseValue <= 2) {
    variance = Math.min(variance, 0.3);
    console.log(
      `⚠️ Small baseValue (${baseValue}), adjusted variance: ${variance}`
    );
  }

  // Với baseValue > 0, tạo distribution realistic
  const result = labels.map((label, index) => {
    const multiplier = 0.3 + Math.random() * variance;
    const value = Math.round(baseValue * multiplier);
    const finalValue = Math.max(0, value);
    console.log(
      `   Month ${
        index + 1
      } (${label}): base(${baseValue}) × ${multiplier.toFixed(
        3
      )} = ${finalValue}`
    );
    return finalValue;
  });

  return result;
}

function testYearRange(mockData, testName) {
  console.log(`\n🗓️ TESTING YEAR RANGE: ${testName}`);
  console.log("=" * 60);

  const { information } = mockData;

  // Test mapMonthLabel function
  const mapMonthLabel = (item) => {
    const [year, month] = item.month.split("-");
    return `T${month}/${year.slice(-2)}`;
  };

  console.log("\n📅 Month Label Mapping Test:");
  mockData.monthRevenue.revenue.forEach((item, index) => {
    const label = mapMonthLabel(item);
    console.log(`   ${item.month} → ${label}`);
  });

  // Process revenue data
  const rev = processChartData(
    mockData.monthRevenue,
    "revenue",
    mapMonthLabel,
    "revenue"
  );

  console.log(`\n💰 Revenue Chart Data:`);
  console.log(`   Labels: [${rev.labels.join(", ")}]`);
  console.log(
    `   Values: [${rev.values
      .map((v) => v.toLocaleString("vi-VN"))
      .join(", ")}]`
  );

  // Generate mock data for other charts
  console.log(`\n📊 Base Values from API:`, {
    newUsers: information.newUsers,
    newTutors: information.newTutors,
    newTutorRequest: information.newTutorRequest,
  });

  const newUserValues = createMockTimeSeriesData(
    rev.labels,
    information.newUsers,
    0.4
  );
  const newTutorValues = createMockTimeSeriesData(
    rev.labels,
    information.newTutors,
    0.6
  );
  const newRequestValues = createMockTimeSeriesData(
    rev.labels,
    information.newTutorRequest,
    0.5
  );

  console.log(`\n📈 Generated Chart Data:`);
  console.log(`   Users Chart: [${newUserValues.join(", ")}]`);
  console.log(`   Tutors Chart: [${newTutorValues.join(", ")}]`);
  console.log(`   Requests Chart: [${newRequestValues.join(", ")}]`);

  // Validation
  console.log(`\n✅ Validation Results:`);

  // Check labels format
  const validLabels = rev.labels.every((label) =>
    /^T\d{2}\/\d{2}$/.test(label)
  );
  console.log(
    `   Label format (TXX/YY): ${validLabels ? "✅ Correct" : "❌ Invalid"}`
  );

  // Check if we have 12 months
  const has12Months = rev.labels.length === 12;
  console.log(
    `   Month count (12): ${
      has12Months ? "✅ Correct" : `❌ Found ${rev.labels.length}`
    }`
  );

  // Check zero handling
  if (information.newUsers === 0) {
    const allZerosUsers = newUserValues.every((val) => val === 0);
    console.log(
      `   Users zero handling: ${
        allZerosUsers ? "✅ Correct" : "❌ Contains non-zero"
      }`
    );
  }

  if (information.newTutors === 0) {
    const allZerosTutors = newTutorValues.every((val) => val === 0);
    console.log(
      `   Tutors zero handling: ${
        allZerosTutors ? "✅ Correct" : "❌ Contains non-zero"
      }`
    );
  }

  if (information.newTutorRequest === 0) {
    const allZerosRequests = newRequestValues.every((val) => val === 0);
    console.log(
      `   Requests zero handling: ${
        allZerosRequests ? "✅ Correct" : "❌ Contains non-zero"
      }`
    );
  }

  // Check data consistency
  const revenueDataExists = rev.values.every((val) => val > 0);
  console.log(
    `   Revenue data exists: ${
      revenueDataExists ? "✅ All positive" : "❌ Contains zeros"
    }`
  );

  return {
    labels: rev.labels,
    revenueValues: rev.values,
    userValues: newUserValues,
    tutorValues: newTutorValues,
    requestValues: newRequestValues,
  };
}

// Debug potential issues
function debugYearIssues() {
  console.log("\n🔍 DEBUGGING POTENTIAL YEAR ISSUES");
  console.log("=" * 50);

  console.log("\n1. API Endpoint Check:");
  console.log("   Expected endpoint: 'statistical/year'");
  console.log(
    "   Expected data structure: { information: {...}, monthRevenue: { revenue: [...] } }"
  );

  console.log("\n2. Common Issues:");
  console.log("   ❓ API không trả về monthRevenue.revenue array");
  console.log("   ❓ Month format không đúng (expected: 'YYYY-MM')");
  console.log("   ❓ Missing revenue field trong từng month object");
  console.log("   ❓ Information object thiếu các field cần thiết");

  console.log("\n3. Expected API Response Structure:");
  console.log(`   {
     information: {
       revenue: number,
       newUsers: number, 
       newTutors: number,
       newTutorRequest: number,
       revenuePercentage: number,
       newUserPercentage: number,
       newTutorPercentage: number,
       newTutorRequestPercentage: number
     },
     monthRevenue: {
       revenue: [
         { month: "2024-01", revenue: 1200000 },
         { month: "2024-02", revenue: 1350000 },
         ...12 months total
       ]
     }
   }`);

  console.log("\n4. Debug Instructions:");
  console.log("   1. Mở Admin Dashboard, chọn time range 'Năm'");
  console.log("   2. Mở DevTools → Console");
  console.log("   3. Tìm message: '📊 Dashboard API Response for year'");
  console.log("   4. Kiểm tra structure của response.data");
  console.log("   5. Đảm bảo monthRevenue.revenue có 12 items");
  console.log("   6. Kiểm tra format month: 'YYYY-MM'");
}

// Run tests
console.log("🧪 ADMIN DASHBOARD YEAR RANGE VALIDATION");
console.log("========================================");

// Test 1: Normal values
const test1Results = testYearRange(mockYearResponse, "Normal Values Test");

// Test 2: Zero values
const test2Results = testYearRange(mockYearResponseZeros, "Zero Values Test");

// Debug guide
debugYearIssues();

console.log("\n🎯 KIỂM TRA KẾT QUẢ");
console.log("==================");
console.log("Nếu bạn thấy tất cả ✅, nghĩa là logic xử lý year đã đúng.");
console.log("Nếu thấy ❌, có thể có vấn đề với:");
console.log("- API endpoint 'statistical/year' không trả về đúng data");
console.log("- Structure của response không match expected format");
console.log("- Month format không đúng");
console.log(
  "\nHãy mở Admin Dashboard và kiểm tra Console logs khi chọn 'Năm'!"
);
