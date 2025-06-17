/**
 * ZOOM MEETING CREATION FLOW - COMPLETE TEST GUIDE
 * Hướng dẫn test luồng tạo phòng học Zoom cho gia sư
 *
 * VẤN ĐỀ ĐÃ ĐƯỢC SỬA:
 * ✅ Path redirect sau OAuth đã được chuẩn hóa
 * ✅ Modal tạo meeting sẽ tự động mở sau khi connect Zoom thành công
 * ✅ Sau khi tạo meeting thành công, sẽ auto-switch sang tab IN_SESSION
 * ✅ Cache meeting được clear để force refresh data mới
 * ✅ Thêm debug logs để theo dõi luồng
 */

console.log("🧪 ZOOM MEETING CREATION FLOW - TEST INSTRUCTIONS");
console.log("================================================");

console.log("\n📋 BƯỚC 1: CHUẨN BỊ TEST");
console.log("✓ Đăng nhập với role TUTOR");
console.log("✓ Có ít nhất 1 lớp học trong hệ thống");
console.log("✓ Xóa zoomAccessToken khỏi localStorage (nếu có):");
console.log("  localStorage.removeItem('zoomAccessToken')");

console.log(
  "\n🎯 BƯỚC 2: TEST LUỒNG TẠO PHÒNG HỌC - CASE 1 (Chưa kết nối Zoom)"
);
console.log("1. Vào '/tai-khoan/ho-so/quan-ly-lop-hoc'");
console.log("2. Click nút 'Xem phòng học' trên 1 lớp học");
console.log("3. Trong meeting view, click nút 'Tạo phòng học' (màu xanh)");
console.log("4. ❗ Sẽ hiện toast error: 'Vui lòng kết nối với Zoom...'");
console.log("5. ❗ Tự động chuyển đến '/tai-khoan/ho-so/phong-hoc'");
console.log("6. Click 'Kết nối tài khoản Zoom' và hoàn thành OAuth");
console.log(
  "7. ✅ Sau OAuth: Tự động quay về '/tai-khoan/ho-so/quan-ly-lop-hoc'"
);
console.log("8. ✅ Modal tạo phòng học tự động mở với thông tin lớp học");
console.log("9. Điền form và click 'Tạo phòng học'");
console.log(
  "10. ✅ Thành công: Toast success + modal đóng + auto-switch sang tab 'Đang hoạt động'"
);
console.log("11. ✅ Phòng học mới xuất hiện trong danh sách");

console.log("\n🔄 BƯỚC 3: TEST LUỒNG TẠO PHÒNG HỌC - CASE 2 (Đã kết nối Zoom)");
console.log("1. Ở meeting view, click nút 'Tạo phòng học' (màu xanh)");
console.log("2. ✅ Modal tạo phòng học mở ngay lập tức");
console.log("3. Điền form và click 'Tạo phòng học'");
console.log("4. ✅ Thành công: Toast success + modal đóng + refresh danh sách");
console.log("5. ✅ Phòng học mới xuất hiện trong tab phù hợp");

console.log("\n🕵️ BƯỚC 4: THEO DÕI DEBUG LOGS");
console.log("Mở Chrome DevTools Console để theo dõi:");
console.log("🔍 [TUTOR DEBUG] - Các logs về API calls");
console.log("🔍 [DEBUG] - Logs về meeting creation");
console.log("🔍 Modal render check - Logs về modal state");
console.log("✅/❌ - Logs về success/error states");

console.log("\n🔧 BƯỚC 5: TROUBLESHOOTING");
console.log("Nếu gặp vấn đề:");
console.log("1. Check Console logs for errors");
console.log("2. Verify zoomAccessToken exists after OAuth:");
console.log("   console.log(localStorage.getItem('zoomAccessToken'))");
console.log("3. Check Network tab cho API calls:");
console.log("   - meeting/auth (OAuth URL)");
console.log("   - meeting/handle (Process OAuth callback)");
console.log("   - meeting/create (Create meeting)");
console.log("   - meeting/get-meeting (Fetch meetings list)");

console.log("\n📊 KẾT QUẢ MONG ĐỢI:");
console.log("✅ Luồng OAuth hoạt động mượt mà");
console.log("✅ Modal tự động mở sau khi connect Zoom");
console.log("✅ Tạo meeting thành công");
console.log("✅ Phòng học mới hiển thị ngay trong danh sách");
console.log("✅ Tab switching hoạt động đúng");
console.log("✅ Không có redirect sai trang");

console.log("\n🐛 CÁC VẤN ĐỀ ĐÃ ĐƯỢC SỬA:");
console.log("1. Path conflict: zoomReturnPath đã được chuẩn hóa");
console.log("2. Modal auto-open: Đã có logic auto-open sau OAuth");
console.log("3. Cache clearing: Force refresh data sau khi tạo meeting");
console.log("4. Tab switching: Auto-switch sang IN_SESSION tab");
console.log("5. URL cleaning: Clear OAuth params để tránh re-trigger");

console.log("\n🎉 Ready for testing! Good luck! 🎉");
