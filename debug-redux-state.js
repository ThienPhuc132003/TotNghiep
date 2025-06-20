// Debug Redux State - Check User Profile Data
console.log("🔍 Debug Redux State...");

// Thêm script này vào browser console để debug
function debugUserProfile() {
  // Check Redux store state
  const state =
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__.connect();

  console.log("=== REDUX STATE DEBUG ===");

  // Nếu có Redux DevTools
  if (window.store) {
    const currentState = window.store.getState();
    console.log("Full Redux State:", currentState);
    console.log("User State:", currentState.user);
    console.log("User Profile:", currentState.user?.userProfile);
  } else {
    console.log("Redux store không tìm thấy trong window.store");
    console.log("Hãy thử các cách khác...");
  }

  // Check localStorage
  console.log("\n=== LOCAL STORAGE DEBUG ===");
  console.log("Token:", localStorage.getItem("token"));
  console.log("User Info:", localStorage.getItem("userInfo"));

  // Check cookies
  console.log("\n=== COOKIES DEBUG ===");
  console.log("All cookies:", document.cookie);

  // Check React components state
  console.log("\n=== REACT COMPONENTS DEBUG ===");
  const userDropdown = document.querySelector(".user-dropdown");
  if (userDropdown) {
    console.log("User dropdown element found:", userDropdown);
    const avatar = userDropdown.querySelector("img");
    if (avatar) {
      console.log("Avatar src:", avatar.src);
      console.log("Avatar alt:", avatar.alt);
    }
  }
}

// Instructions
console.log("📋 Hướng dẫn debug:");
console.log("1. Mở Browser DevTools (F12)");
console.log("2. Vào tab Console");
console.log("3. Chạy: debugUserProfile()");
console.log("4. Kiểm tra output để xem dữ liệu trong Redux state");

// Export function to global scope
if (typeof window !== "undefined") {
  window.debugUserProfile = debugUserProfile;
}

module.exports = { debugUserProfile };
