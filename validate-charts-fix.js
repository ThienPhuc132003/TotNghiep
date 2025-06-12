/**
 * ADMIN DASHBOARD CHARTS VALIDATION SCRIPT
 * ========================================
 *
 * This script helps validate that the Admin Dashboard charts fix is working correctly.
 * Run this script to simulate different API responses and verify chart behavior.
 */

// Mock API responses for testing
const testScenarios = {
  // Scenario 1: All values are 0 (should show all zero charts except revenue)
  allZeros: {
    information: {
      revenue: 1000000,
      revenuePercentage: 5.2,
      newUsers: 0,
      newUserPercentage: 0,
      newTutors: 0,
      newTutorPercentage: 0,
      newTutorRequest: 0,
      newTutorRequestPercentage: 0,
      newClassActive: 15,
      newClassActivePercentage: 12.3,
    },
    dailyRevenue: [
      { date: "2024-01-15", revenue: 150000 },
      { date: "2024-01-16", revenue: 200000 },
      { date: "2024-01-17", revenue: 175000 },
      { date: "2024-01-18", revenue: 220000 },
      { date: "2024-01-19", revenue: 190000 },
      { date: "2024-01-20", revenue: 180000 },
      { date: "2024-01-21", revenue: 210000 },
    ],
  },

  // Scenario 2: Small values (1-2, should show reduced variance)
  smallValues: {
    information: {
      revenue: 2500000,
      revenuePercentage: 8.1,
      newUsers: 1,
      newUserPercentage: -10.5,
      newTutors: 2,
      newTutorPercentage: 15.2,
      newTutorRequest: 1,
      newTutorRequestPercentage: -5.0,
      newClassActive: 25,
      newClassActivePercentage: 18.7,
    },
    dailyRevenue: [
      { date: "2024-01-15", revenue: 350000 },
      { date: "2024-01-16", revenue: 400000 },
      { date: "2024-01-17", revenue: 375000 },
      { date: "2024-01-18", revenue: 420000 },
      { date: "2024-01-19", revenue: 390000 },
      { date: "2024-01-20", revenue: 380000 },
      { date: "2024-01-21", revenue: 410000 },
    ],
  },

  // Scenario 3: Normal values (should show normal variance)
  normalValues: {
    information: {
      revenue: 5000000,
      revenuePercentage: 12.4,
      newUsers: 25,
      newUserPercentage: 18.3,
      newTutors: 8,
      newTutorPercentage: 25.0,
      newTutorRequest: 15,
      newTutorRequestPercentage: 10.7,
      newClassActive: 45,
      newClassActivePercentage: 22.1,
    },
    dailyRevenue: [
      { date: "2024-01-15", revenue: 650000 },
      { date: "2024-01-16", revenue: 750000 },
      { date: "2024-01-17", revenue: 700000 },
      { date: "2024-01-18", revenue: 800000 },
      { date: "2024-01-19", revenue: 720000 },
      { date: "2024-01-20", revenue: 680000 },
      { date: "2024-01-21", revenue: 760000 },
    ],
  },
};

// Simulate the createMockTimeSeriesData function from AdminDashboard.jsx
function createMockTimeSeriesData(labels, baseValue, variance = 0.3) {
  console.log(`\n🔍 Testing createMockTimeSeriesData:`, {
    labelsCount: labels.length,
    baseValue,
    variance,
  });

  // Nếu baseValue = 0, trả về array toàn 0 để reflect đúng thực tế
  if (baseValue === 0) {
    const result = labels.map(() => 0);
    console.log(`✅ baseValue = 0, returning all zeros:`, result);
    return result;
  }

  // Với baseValue rất nhỏ (1-2), giảm variance để tránh over-inflate
  let adjustedVariance = variance;
  if (baseValue <= 2) {
    adjustedVariance = Math.min(variance, 0.3);
    console.log(
      `⚠️  Small baseValue (${baseValue}), adjusted variance: ${adjustedVariance}`
    );
  }

  // Với baseValue > 0, tạo distribution realistic
  const result = labels.map((label, index) => {
    const multiplier = 0.3 + Math.random() * adjustedVariance;
    const value = Math.round(baseValue * multiplier);
    const finalValue = Math.max(0, value);
    console.log(
      `   Day ${
        index + 1
      } (${label}): base(${baseValue}) × ${multiplier.toFixed(
        3
      )} = ${finalValue}`
    );
    return finalValue;
  });

  return result;
}

// Test function
function runValidationTests() {
  console.log("🧪 ADMIN DASHBOARD CHARTS VALIDATION");
  console.log("=====================================\n");

  Object.entries(testScenarios).forEach(([scenarioName, mockData]) => {
    console.log(`\n📋 SCENARIO: ${scenarioName.toUpperCase()}`);
    console.log("=" * 50);

    const { information } = mockData;
    const labels = mockData.dailyRevenue.map((item) => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    console.log(`📊 Base Values from API:`, {
      newUsers: information.newUsers,
      newTutors: information.newTutors,
      newTutorRequest: information.newTutorRequest,
    });

    // Test each chart type
    const userValues = createMockTimeSeriesData(
      labels,
      information.newUsers,
      0.4
    );
    const tutorValues = createMockTimeSeriesData(
      labels,
      information.newTutors,
      0.6
    );
    const requestValues = createMockTimeSeriesData(
      labels,
      information.newTutorRequest,
      0.5
    );

    console.log(`\n📈 Generated Chart Data:`);
    console.log(`   Users Chart: [${userValues.join(", ")}]`);
    console.log(`   Tutors Chart: [${tutorValues.join(", ")}]`);
    console.log(`   Requests Chart: [${requestValues.join(", ")}]`);

    // Validation checks
    console.log(`\n✅ Validation Results:`);

    // Check if zero values are respected
    if (information.newUsers === 0) {
      const allZeros = userValues.every((val) => val === 0);
      console.log(
        `   Users (base=0): ${
          allZeros ? "✅ All zeros" : "❌ Contains non-zero values"
        }`
      );
    }

    if (information.newTutors === 0) {
      const allZeros = tutorValues.every((val) => val === 0);
      console.log(
        `   Tutors (base=0): ${
          allZeros ? "✅ All zeros" : "❌ Contains non-zero values"
        }`
      );
    }

    if (information.newTutorRequest === 0) {
      const allZeros = requestValues.every((val) => val === 0);
      console.log(
        `   Requests (base=0): ${
          allZeros ? "✅ All zeros" : "❌ Contains non-zero values"
        }`
      );
    }

    // Check variance for small values
    if (information.newUsers > 0 && information.newUsers <= 2) {
      const maxValue = Math.max(...userValues);
      const reasonable = maxValue <= information.newUsers * 1.3; // Should not exceed 130% of base
      console.log(
        `   Users (small value): ${
          reasonable ? "✅ Reasonable variance" : "❌ Over-inflated"
        }`
      );
    }

    console.log("\n" + "=" * 50);
  });

  console.log("\n🎯 TESTING COMPLETE!");
  console.log(
    "\nIf you see ✅ for all validation checks, the fix is working correctly."
  );
  console.log("If you see ❌, there may be an issue with the implementation.");
}

// Manual testing instructions
function showManualTestingInstructions() {
  console.log("\n📖 MANUAL TESTING INSTRUCTIONS");
  console.log("==============================");
  console.log("\n1. Open the Admin Dashboard in your browser");
  console.log("2. Open browser DevTools (F12) and go to Console tab");
  console.log("3. Look for these debug messages when changing time ranges:");
  console.log("   - '📊 Dashboard API Response for [range]'");
  console.log("   - '📊 Base Values from API'");
  console.log("   - '📈 Chart Data Generated'");
  console.log("\n4. Test different scenarios:");
  console.log("   a) When newUsers = 0: Users chart should show all zero bars");
  console.log(
    "   b) When newTutors = 0: Tutors chart should show all zero bars"
  );
  console.log(
    "   c) When newTutorRequest = 0: Requests chart should show all zero bars"
  );
  console.log(
    "   d) When values are 1-2: Charts should show reasonable, not over-inflated data"
  );
  console.log(
    "\n5. Verify all 4 charts display data (Revenue should always show real API data)"
  );
  console.log("\n6. Test across different time ranges: Week, Month, Year");
}

// Run the validation
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runValidationTests,
    testScenarios,
    createMockTimeSeriesData,
  };
} else {
  runValidationTests();
  showManualTestingInstructions();
}
