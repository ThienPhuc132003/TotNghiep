/**
 * 🔍 KIỂM TRA NHANH YEAR RANGE TRONG BROWSER
 * =========================================
 *
 * Làm theo các bước sau để verify year range hoạt động đúng:
 */

console.log("🎯 HƯỚNG DẪN KIỂM TRA YEAR RANGE");
console.log("===============================");

console.log("\n📋 BƯỚC 1: Mở Admin Dashboard");
console.log("1. Truy cập: http://localhost:3000/admin/dashboard");
console.log("2. Đăng nhập admin (nếu chưa)");
console.log("3. Chờ trang load hoàn tất");

console.log("\n📋 BƯỚC 2: Bật Debug Console");
console.log("1. Nhấn F12 để mở DevTools");
console.log("2. Chọn tab Console");
console.log("3. Clear console (Ctrl+L)");

console.log("\n📋 BƯỚC 3: Chọn Time Range 'Năm'");
console.log("1. Click vào button 'Năm' ở góc phải trên");
console.log("2. Chờ data load (spinner hiện và biến mất)");

console.log("\n📋 BƯỚC 4: Kiểm tra Console Logs");
console.log("Bạn phải thấy các messages sau:");
console.log("✅ '📊 Dashboard API Response for year: {...}'");
console.log(
  "✅ '📊 Base Values from API: {newUsers: X, newTutors: Y, newTutorRequest: Z}'"
);
console.log("✅ '📈 Chart Data Generated: {...}'");

console.log("\n📋 BƯỚC 5: Verify Charts Visual");
console.log("Kiểm tra 4 charts hiển thị:");
console.log("✅ Revenue Chart: Line chart với 12 điểm (T01/24 → T12/24)");
console.log("✅ Users Chart: Bar chart với 12 cột");
console.log("✅ Tutors Chart: Doughnut chart với 12 segments");
console.log("✅ Requests Chart: Polar area chart với 12 sections");

console.log("\n📋 BƯỚC 6: Test Zero Values (nếu có)");
console.log(
  "Nếu API trả về newUsers: 0, newTutors: 0, hoặc newTutorRequest: 0:"
);
console.log(
  "✅ Chart tương ứng phải hiển thị all zeros (flat line/empty bars)"
);
console.log("❌ KHÔNG được hiển thị random data");

console.log("\n📋 BƯỚC 7: Test Labels");
console.log("Mouse hover vào từng chart point/bar:");
console.log("✅ Revenue chart: Tooltip hiển thị 'T01/24, T02/24, ...'");
console.log("✅ Giá trị revenue: Format tiền tệ VNĐ");
console.log("✅ Other charts: Tooltip hiển thị số nguyên");

console.log("\n🚨 CÁC VẤN ĐỀ THƯỜNG GẶP:");
console.log("❓ Charts trống: API endpoint 'statistical/year' không tồn tại");
console.log("❓ Labels sai: monthRevenue.revenue thiếu hoặc format month sai");
console.log(
  "❓ Zero values hiển thị random: Logic createMockTimeSeriesData bị lỗi"
);
console.log("❓ Console errors: Kiểm tra Network tab cho API call failures");

console.log("\n💡 DEBUG TIPS:");
console.log("- Nếu không thấy console logs → API call thất bại");
console.log("- Nếu charts trống → Check response.data structure");
console.log("- Nếu labels sai → Check monthRevenue.revenue format");
console.log("- Nếu zero handling sai → Logic đã được fix, check lại");

console.log("\n🎉 KẾT LUẬN:");
console.log("Nếu thấy tất cả ✅ ở trên → Year range hoạt động hoàn hảo!");
console.log("Nếu gặp ❌ → Report chi tiết issue để debug thêm");

// Quick test function to paste into browser console
function quickTestYearRange() {
  console.log("🧪 Quick Test Year Range Logic:");

  // Test month label mapping
  const testMonths = [
    { month: "2024-01", revenue: 1000000 },
    { month: "2024-12", revenue: 1500000 },
  ];

  const mapMonthLabel = (item) => {
    const [year, month] = item.month.split("-");
    return `T${month}/${year.slice(-2)}`;
  };

  testMonths.forEach((month) => {
    const label = mapMonthLabel(month);
    console.log(`${month.month} → ${label}`);
  });

  console.log("✅ Label mapping test complete");
}

// Export for browser use
if (typeof window !== "undefined") {
  window.quickTestYearRange = quickTestYearRange;
  console.log(
    "💡 Paste 'quickTestYearRange()' in browser console to test label mapping"
  );
}
