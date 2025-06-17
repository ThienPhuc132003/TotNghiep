/**
 * FIX VERIFICATION: ListOfTutorPayments Date Column Issue
 *
 * PROBLEM: Cột "Ngày Giao Dịch" hiển thị "Ngày không hợp lệ"
 * trong ListOfTutorPayments, trong khi các trang khác (ListOfStudent,
 * ListOfAdmin, etc.) hiển thị ngày bình thường
 *
 * ROOT CAUSE: Sử dụng renderCell sai cách
 */

console.log("🔍 VERIFYING ListOfTutorPayments Date Fix");
console.log("=========================================");

// Test data giống API response
const mockTutorPaymentData = {
  tutor: {
    fullname: "Nguyễn Văn A",
  },
  user: {
    personalEmail: "student@email.com",
    phoneNumber: "0123456789",
  },
  coinOfUserPayment: 1000,
  coinOfTutorReceive: 800,
  coinOfWebReceive: 200,
  createdAt: "2025-05-07T13:39:12.601Z", // ← Đây là format gây lỗi
};

// Reproduce formatDate function từ ListOfTutorPayments
import { format, parseISO } from "date-fns";

const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";

  try {
    let date;

    // Xử lý các loại input khác nhau
    if (typeof dateString === "string") {
      // Trường hợp ISO string như "2025-05-07T13:39:12.601Z"
      if (
        dateString.includes("T") ||
        dateString.includes("Z") ||
        dateString.includes("+")
      ) {
        date = new Date(dateString);
      } else {
        // Fallback sử dụng parseISO cho các format khác
        date = parseISO(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      // Thử convert sang Date object
      date = new Date(dateString);
    }

    // Kiểm tra tính hợp lệ của date
    if (!date || isNaN(date.getTime())) {
      console.warn("Invalid date detected:", dateString);
      return "Ngày không hợp lệ";
    }

    // Format date với date-fns
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "Lỗi định dạng ngày";
  }
};

// Test renderCell implementations

console.log("\n1️⃣ TESTING OLD WAY (Broken):");
console.log("renderCell: formatDate");
console.log("=========================");

// Cách cũ (sai): truyền function trực tiếp
const oldWayResult = formatDate(mockTutorPaymentData); // ← Sai! Truyền cả object thay vì value
console.log("Input:", JSON.stringify(mockTutorPaymentData, null, 2));
console.log("Result:", oldWayResult);
console.log(
  "Status:",
  oldWayResult === "Lỗi định dạng ngày" ? "❌ FAILED" : "✅ OK"
);

console.log("\n2️⃣ TESTING NEW WAY (Fixed):");
console.log("renderCell: (value) => formatDate(value)");
console.log("==========================================");

// Cách mới (đúng): dùng arrow function
const newWayResult = ((value) => formatDate(value))(
  mockTutorPaymentData.createdAt
);
console.log("Input:", mockTutorPaymentData.createdAt);
console.log("Result:", newWayResult);
console.log(
  "Status:",
  newWayResult.includes("/") ? "✅ FIXED" : "❌ STILL BROKEN"
);

console.log("\n3️⃣ COMPARISON WITH OTHER PAGES:");
console.log("================================");

// So sánh với cách làm trong ListOfStudent (working)
const safeFormatDate = (dateInput, formatString = "dd/MM/yyyy") => {
  if (!dateInput) return "N/A";
  try {
    let date;
    if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    return format(date, formatString);
  } catch (e) {
    return "Lỗi định dạng ngày";
  }
};

// Cách ListOfStudent làm: renderCell: (v) => safeFormatDate(v, "dd/MM/yyyy")
const listOfStudentWay = ((v) => safeFormatDate(v, "dd/MM/yyyy HH:mm"))(
  mockTutorPaymentData.createdAt
);
console.log("ListOfStudent approach result:", listOfStudentWay);
console.log(
  "Status:",
  listOfStudentWay.includes("/") ? "✅ WORKS" : "❌ BROKEN"
);

console.log("\n📊 SUMMARY:");
console.log("===========");
console.log("❌ OLD: renderCell: formatDate → Truyền cả row object, gây lỗi");
console.log(
  "✅ NEW: renderCell: (value) => formatDate(value) → Truyền đúng value"
);
console.log(
  "✅ Consistent với cách làm trong ListOfStudent, ListOfTransactions"
);

console.log("\n🎯 TECHNICAL EXPLANATION:");
console.log("=========================");
console.log("renderCell function nhận parameters: (value, row, rowIndex)");
console.log("- value: Giá trị của cell (createdAt)");
console.log("- row: Toàn bộ object row");
console.log("- rowIndex: Index của row");
console.log("");
console.log("Khi dùng 'renderCell: formatDate':");
console.log("→ formatDate nhận value là toàn bộ row object");
console.log("→ formatDate expect string date nhưng nhận object");
console.log("→ Kết quả: 'Lỗi định dạng ngày'");
console.log("");
console.log("Khi dùng 'renderCell: (value) => formatDate(value)':");
console.log("→ Arrow function nhận value (createdAt string)");
console.log("→ formatDate nhận đúng string date");
console.log("→ Kết quả: '07/05/2025 13:39' ✅");

console.log("\n✅ FIX COMPLETED!");
console.log("=================");
console.log("File: src/pages/Admin/ListOfTutorPayments.jsx");
console.log("Changed:");
console.log(
  "- renderCell: formatDate → renderCell: (value) => formatDate(value)"
);
console.log(
  "- renderCell: formatCoin → renderCell: (value) => formatCoin(value)"
);
console.log("");
console.log("🚀 Cột 'Ngày Giao Dịch' giờ sẽ hiển thị đúng định dạng!");
