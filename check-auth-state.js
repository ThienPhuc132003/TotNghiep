// Quick authentication state checker
console.log("🔍 Checking authentication state...");

// Check localStorage for auth data
const authData = {
  token: localStorage.getItem("token") || localStorage.getItem("authToken"),
  userProfile: localStorage.getItem("userProfile"),
  refreshToken: localStorage.getItem("refreshToken"),
  userId: localStorage.getItem("userId"),
  role: localStorage.getItem("role"),
  roleId: localStorage.getItem("roleId"),
};

console.log("📦 LocalStorage auth data:", authData);

// Try to parse userProfile
if (authData.userProfile) {
  try {
    const profile = JSON.parse(authData.userProfile);
    console.log("👤 Parsed user profile:", profile);
    console.log("🎯 User roles:", profile.roles);
    console.log("🏷️ User roleId:", profile.roleId);
  } catch (e) {
    console.error("❌ Failed to parse userProfile:", e);
  }
}

// Check cookies
const cookies = document.cookie.split(";").reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split("=");
  acc[key] = value;
  return acc;
}, {});

console.log("🍪 Cookies:", cookies);

// Check Redux store if available
if (window.store) {
  const state = window.store.getState();
  console.log("🏪 Redux state:", state);
  console.log("🔐 User state:", state.user);
} else {
  console.log("❌ Redux store not accessible");
}

// Check current URL and navigation
console.log("📍 Current location:", {
  href: window.location.href,
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

// Check if page is actually the login page (redirected)
if (window.location.pathname === "/login") {
  console.log("🔄 REDIRECTED TO LOGIN - User likely not authenticated");
} else if (window.location.pathname === "/trang-chu") {
  console.log("🔄 REDIRECTED TO HOME - User likely doesn't have required role");
} else {
  console.log("✅ On expected page");
}

// Check page content
setTimeout(() => {
  const bodyText = document.body.textContent || "";
  console.log("📄 Page content analysis:");
  console.log("- Content length:", bodyText.length);
  console.log(
    "- Has login form:",
    bodyText.includes("Đăng nhập") || bodyText.includes("login")
  );
  console.log(
    "- Has revenue content:",
    bodyText.includes("Thống kê") || bodyText.includes("doanh thu")
  );
  console.log("- Has access denied:", bodyText.includes("Truy cập bị từ chối"));
  console.log("- Preview:", bodyText.substring(0, 200));
}, 2000);

console.log("🎯 Authentication check complete. Check results above.");
