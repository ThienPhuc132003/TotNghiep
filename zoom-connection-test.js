/**
 * ZOOM CONNECTION FLOW TEST GUIDE
 *
 * Test case: Gia sư tạo phòng học Zoom từ TutorClassroomPage
 *
 * Prerequisites:
 * 1. User đã đăng nhập với role TUTOR
 * 2. User có ít nhất 1 lớp học trong hệ thống
 * 3. User chưa kết nối tài khoản Zoom (localStorage không có zoomAccessToken)
 *
 * Test Steps:
 * 1. Navigate to "/tai-khoan/ho-so/quan-ly-lop-hoc"
 * 2. Click "Tạo phòng học" button on any classroom card
 * 3. Verify redirect to "/tai-khoan/ho-so/phong-hop-zoom" with connection UI
 * 4. Click "Kết nối tài khoản Zoom" button
 * 5. Complete Zoom OAuth flow
 * 6. Verify redirect back to "/tai-khoan/ho-so/quan-ly-lop-hoc"
 * 7. Verify success toast: "Kết nối Zoom thành công! Bây giờ bạn có thể tạo phòng học."
 * 8. Verify auto-open of Create Meeting Modal after 1 second
 * 9. Fill meeting form and submit
 * 10. Verify successful meeting creation and redirect to meeting room
 *
 * Expected Results:
 * - Smooth flow from classroom → Zoom connection → back to classroom → create meeting
 * - No broken navigation or stuck states
 * - Proper toast notifications at each step
 * - Meeting room opens with correct classroom context
 *
 * Files Involved:
 * - TutorClassroomPage.jsx: Handles initial request and return from Zoom
 * - TutorMeetingRoomPage.jsx: Shows Zoom connection UI when needed
 * - ZoomCallback.jsx: Processes OAuth callback and redirects appropriately
 *
 * Key Features Tested:
 * ✅ Auto-detection of missing Zoom token
 * ✅ Proper storage and retrieval of return path/state
 * ✅ Seamless navigation flow
 * ✅ Auto-opening of modal after successful connection
 * ✅ Integration between classroom management and Zoom meetings
 */

// Test helper functions for manual testing in browser console:

// 1. Clear Zoom token to simulate disconnected state
window.clearZoomToken = function () {
  localStorage.removeItem("zoomAccessToken");
  localStorage.removeItem("zoomRefreshToken");
  localStorage.removeItem("zoomUserId");
  console.log("Zoom tokens cleared - ready to test connection flow");
};

// 2. Check current Zoom connection state
window.checkZoomState = function () {
  const token = localStorage.getItem("zoomAccessToken");
  const returnPath = sessionStorage.getItem("zoomReturnPath");
  const returnState = sessionStorage.getItem("zoomReturnState");

  console.log("Zoom Connection State:", {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + "..." : null,
    returnPath,
    returnState: returnState ? JSON.parse(returnState) : null,
  });
};

// 3. Simulate successful Zoom connection (for testing return flow)
window.simulateZoomConnection = function () {
  // Set return info
  sessionStorage.setItem("zoomReturnPath", "/tai-khoan/ho-so/quan-ly-lop-hoc");
  sessionStorage.setItem(
    "zoomReturnState",
    JSON.stringify({
      zoomConnected: true,
      fromClassroom: true,
      classroomId: "test-classroom-123",
      classroomName: "Test Classroom",
    })
  );

  // Set dummy token
  localStorage.setItem("zoomAccessToken", "dummy-token-for-testing");

  console.log(
    "Simulated Zoom connection - navigate to classroom page to test return flow"
  );
};

// 4. Reset all test state
window.resetTestState = function () {
  // Clear tokens
  localStorage.removeItem("zoomAccessToken");
  localStorage.removeItem("zoomRefreshToken");
  localStorage.removeItem("zoomUserId");

  // Clear session storage
  sessionStorage.removeItem("zoomReturnPath");
  sessionStorage.removeItem("zoomReturnState");

  console.log("All test state reset");
};

// Export for use in other test files
window.zoomTestHelpers = {
  clearZoomToken: window.clearZoomToken,
  checkZoomState: window.checkZoomState,
  simulateZoomConnection: window.simulateZoomConnection,
  resetTestState: window.resetTestState,
};

// Usage instructions:
console.log(`
🧪 ZOOM CONNECTION TEST HELPERS LOADED

Usage:
1. clearZoomToken() - Clear tokens to test connection flow
2. checkZoomState() - Check current connection and return state
3. simulateZoomConnection() - Simulate successful connection for testing return flow
4. resetTestState() - Reset all test state

Test the full flow:
1. Run clearZoomToken()
2. Go to classroom management page
3. Click "Tạo phòng học" on any classroom
4. Follow the Zoom connection flow
5. Verify smooth return to classroom page with auto-opening modal
`);
