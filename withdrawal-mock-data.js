// Mock Data Generator for Withdrawal Requests Testing
// Run this in browser console to generate test data

console.log("🧪 Withdrawal Requests Mock Data Generator");

// Mock data structure based on expected API response
const mockWithdrawalRequests = {
  success: true,
  data: {
    items: [
      {
        manageBankingId: "WDR-001",
        tutorId: "TUTOR-001",
        coinWithdraw: 500000,
        status: "PENDING",
        createdAt: "2024-06-15T10:30:00Z",
        description: "Yêu cầu rút tiền tháng 6",
        gotValue: 0,
        tutor: {
          userId: "TUTOR-001",
          fullname: "Nguyễn Văn An",
          tutorProfile: {
            fullname: "Nguyễn Văn An",
            bankName: "Vietcombank",
            bankNumber: "1234567890",
          },
        },
      },
      {
        manageBankingId: "WDR-002",
        tutorId: "TUTOR-002",
        coinWithdraw: 750000,
        status: "APPROVED",
        createdAt: "2024-06-14T15:20:00Z",
        description: "Rút tiền sau hoàn thành khóa học",
        gotValue: 750000,
        tutor: {
          userId: "TUTOR-002",
          fullname: "Trần Thị Bình",
          tutorProfile: {
            fullname: "Trần Thị Bình",
            bankName: "BIDV",
            bankNumber: "9876543210",
          },
        },
      },
      {
        manageBankingId: "WDR-003",
        tutorId: "TUTOR-003",
        coinWithdraw: 300000,
        status: "REJECTED",
        createdAt: "2024-06-13T09:15:00Z",
        description: "Không đủ điều kiện rút tiền",
        gotValue: 0,
        tutor: {
          userId: "TUTOR-003",
          fullname: "Lê Văn Cường",
          tutorProfile: {
            fullname: "Lê Văn Cường",
            bankName: "ACB",
            bankNumber: "5555666677",
          },
        },
      },
      {
        manageBankingId: "WDR-004",
        tutorId: "TUTOR-004",
        coinWithdraw: 1200000,
        status: "PENDING",
        createdAt: "2024-06-16T14:45:00Z",
        description: "Yêu cầu rút tiền khẩn cấp",
        gotValue: 0,
        tutor: {
          userId: "TUTOR-004",
          fullname: "Phạm Thị Diễm",
          tutorProfile: {
            fullname: "Phạm Thị Diễm",
            bankName: "Techcombank",
            bankNumber: "1111222233",
          },
        },
      },
      {
        manageBankingId: "WDR-005",
        tutorId: "TUTOR-005",
        coinWithdraw: 650000,
        status: "PROCESSED",
        createdAt: "2024-06-12T11:30:00Z",
        description: "Đã chuyển khoản thành công",
        gotValue: 650000,
        tutor: {
          userId: "TUTOR-005",
          fullname: "Hoàng Minh Đức",
          tutorProfile: {
            fullname: "Hoàng Minh Đức",
            bankName: "TPBank",
            bankNumber: "4444555566",
          },
        },
      },
    ],
    total: 5,
    currentPage: 1,
    totalPages: 1,
  },
};

// Function to inject mock data (for testing purposes)
function injectMockData() {
  console.log("🔧 Injecting mock data...");

  // Override fetch for the specific endpoint
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    console.log("🌐 Intercepted fetch:", url);

    if (url.includes("manage-banking/search")) {
      console.log("🎯 Mock response for withdrawal requests");
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWithdrawalRequests),
      });
    }

    // Use original fetch for other requests
    return originalFetch.apply(this, arguments);
  };

  console.log("✅ Mock data injection complete");
  console.log("📊 Mock data:", mockWithdrawalRequests);
}

// Function to restore original fetch
function restoreFetch() {
  console.log("🔄 Restoring original fetch...");
  // Note: This is simplified - in real scenario you'd store the original reference
  location.reload(); // Simple way to restore everything
}

// Test data transformation
function testDataTransformation() {
  console.log("🧪 Testing data transformation...");

  const transformedData = mockWithdrawalRequests.data.items.map(
    (item, index) => {
      return {
        withdrawalRequestId: item.manageBankingId || `REQ-${index}`,
        tutorId: item.tutorId || "N/A",
        tutorName:
          item.tutor?.fullname || item.tutor?.tutorProfile?.fullname || "N/A",
        amount: item.coinWithdraw || item.amount || 0,
        bankInfo: {
          bankName: item.tutor?.tutorProfile?.bankName || "N/A",
          accountNumber: item.tutor?.tutorProfile?.bankNumber || "N/A",
          accountHolderName:
            item.tutor?.fullname || item.tutor?.tutorProfile?.fullname || "N/A",
        },
        status: item.status || "PENDING",
        createdAt: item.createdAt || new Date().toISOString(),
        note: item.description || "",
        gotValue: item.gotValue || 0,
        originalData: item,
      };
    }
  );

  console.log("✅ Transformed data:", transformedData);
  return transformedData;
}

// Export functions for testing
window.withdrawalTestUtils = {
  injectMockData,
  restoreFetch,
  testDataTransformation,
  mockData: mockWithdrawalRequests,
};

console.log("🚀 Mock data generator ready!");
console.log("📝 Usage:");
console.log("- withdrawalTestUtils.injectMockData() - Enable mock data");
console.log(
  "- withdrawalTestUtils.testDataTransformation() - Test transformation"
);
console.log("- withdrawalTestUtils.restoreFetch() - Restore normal API calls");
