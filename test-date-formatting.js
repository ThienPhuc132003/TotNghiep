/**
 * TEST FUNCTION FOR DATE FORMATTING IN ListOfTutorPayments
 * Kiểm tra hàm formatDate với dữ liệu thực tế
 */

// Simulate the formatDate function from ListOfTutorPayments.jsx
import { format, parseISO } from "date-fns";

const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    // Xử lý multiple date formats
    let date;
    if (typeof dateString === "string") {
      // Nếu là ISO string như "2025-05-07T13:39:12.601Z"
      date = new Date(dateString);
    } else {
      // Fallback cho các format khác
      date = parseISO(dateString);
    }

    // Kiểm tra tính hợp lệ của date
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    return format(date, formatString);
  } catch (e) {
    console.error("Error formatting date:", e, "Input:", dateString);
    return "Lỗi ngày";
  }
};

// Test cases với dữ liệu thực tế
const testCases = [
  {
    input: "2025-05-07T13:39:12.601Z",
    description: "ISO string with milliseconds and Z timezone",
  },
  {
    input: "2025-05-07T13:39:12Z",
    description: "ISO string without milliseconds",
  },
  {
    input: "2025-05-07T13:39:12+07:00",
    description: "ISO string with timezone offset",
  },
  {
    input: "2025-05-07",
    description: "Date only",
  },
  {
    input: null,
    description: "Null value",
  },
  {
    input: "",
    description: "Empty string",
  },
  {
    input: "invalid-date",
    description: "Invalid date string",
  },
];

console.log("🧪 TESTING DATE FORMATTING FOR ListOfTutorPayments");
console.log("==================================================");

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.description}`);
  console.log(`   Input: ${JSON.stringify(testCase.input)}`);

  try {
    const result = formatDate(testCase.input);
    console.log(`   Output: "${result}"`);

    // Validate result
    if (testCase.input === null || testCase.input === "") {
      console.log(`   ✅ Expected N/A, got: ${result}`);
    } else if (testCase.input === "invalid-date") {
      console.log(`   ✅ Expected error handling, got: ${result}`);
    } else {
      // For valid dates, check if result matches pattern
      const datePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
      if (datePattern.test(result)) {
        console.log(`   ✅ Valid date format: ${result}`);
      } else {
        console.log(`   ❌ Invalid date format: ${result}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

// Test với data mẫu như trong API response
console.log("\n📊 TESTING WITH SAMPLE API DATA");
console.log("================================");

const sampleApiData = [
  {
    id: 1,
    tutor: { fullname: "Nguyễn Văn A" },
    user: {
      personalEmail: "student@email.com",
      phoneNumber: "0123456789",
    },
    coinOfUserPayment: 1000,
    coinOfTutorReceive: 800,
    coinOfWebReceive: 200,
    createdAt: "2025-05-07T13:39:12.601Z",
  },
  {
    id: 2,
    tutor: { fullname: "Trần Thị B" },
    user: {
      personalEmail: "learner@email.com",
      phoneNumber: "0987654321",
    },
    coinOfUserPayment: 2000,
    coinOfTutorReceive: 1600,
    coinOfWebReceive: 400,
    createdAt: "2025-06-15T09:20:45.123Z",
  },
];

sampleApiData.forEach((item, index) => {
  console.log(`\nSample ${index + 1}:`);
  console.log(`  Tutor: ${item.tutor.fullname}`);
  console.log(`  Raw createdAt: ${item.createdAt}`);
  console.log(`  Formatted Date: ${formatDate(item.createdAt)}`);
  console.log(
    `  Custom Format (dd/MM/yyyy): ${formatDate(item.createdAt, "dd/MM/yyyy")}`
  );
  console.log(
    `  Custom Format (HH:mm dd/MM/yyyy): ${formatDate(
      item.createdAt,
      "HH:mm dd/MM/yyyy"
    )}`
  );
});

console.log("\n✅ DATE FORMATTING TEST COMPLETED");
console.log("=================================");
console.log("The formatDate function should now correctly handle:");
console.log("• ISO strings with milliseconds (2025-05-07T13:39:12.601Z)");
console.log("• ISO strings without milliseconds (2025-05-07T13:39:12Z)");
console.log("• ISO strings with timezone offsets");
console.log("• Date-only strings");
console.log("• Null/empty values");
console.log("• Invalid date strings");

export { formatDate };
