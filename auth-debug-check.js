// Authentication debug script - Run in browser console
console.log("🔐 Authentication Debug Check");
console.log("=".repeat(50));

// Check localStorage for authentication data
const checkLocalStorage = () => {
  console.log("📱 LocalStorage Check:");

  const token = localStorage.getItem("token");
  const persistUser = localStorage.getItem("persist:user");

  console.log("Token:", token ? "EXISTS" : "NOT FOUND");
  console.log("Persist:user:", persistUser ? "EXISTS" : "NOT FOUND");

  if (persistUser) {
    try {
      const parsed = JSON.parse(persistUser);
      console.log("Persist user data:", parsed);

      if (parsed.userProfile) {
        const userProfile = JSON.parse(parsed.userProfile);
        console.log("User profile:", userProfile);
        console.log("User roles:", userProfile.roles);

        const isTutor = userProfile.roles?.some(
          (role) => role.name === "TUTOR"
        );
        console.log("Is Tutor:", isTutor);
      }
    } catch (error) {
      console.log("Error parsing persist:user:", error);
    }
  }
};

// Check Redux store state
const checkReduxStore = () => {
  console.log("🔧 Redux Store Check:");

  if (window.__store__) {
    const state = window.__store__.getState();
    console.log("Redux state:", state);
    console.log("User state:", state.user);
    console.log("Is authenticated:", state.user?.isAuthenticated);
    console.log("User profile:", state.user?.userProfile);

    if (state.user?.userProfile) {
      const roles = state.user.userProfile.roles || [];
      const isTutor = roles.some((role) => role.name === "TUTOR");
      console.log(
        "User roles:",
        roles.map((r) => r.name)
      );
      console.log("Is Tutor:", isTutor);
    }
  } else {
    console.log("Redux store not found on window.__store__");
  }
};

// Check current page protection
const checkPageProtection = () => {
  console.log("🛡️ Page Protection Check:");
  console.log("Current URL:", window.location.href);
  console.log(
    "Protected route:",
    window.location.pathname.includes("/tai-khoan/")
  );
  console.log(
    "Tutor route:",
    window.location.pathname.includes("/thong-ke-doanh-thu")
  );
};

// Run all checks
checkLocalStorage();
console.log("");
checkReduxStore();
console.log("");
checkPageProtection();

console.log("");
console.log("💡 Instructions:");
console.log("1. If token/auth data is missing -> Go to /login");
console.log("2. If user is not TUTOR -> Login with tutor account");
console.log("3. If auth data exists but page still fails -> Component issue");

// Test functions for manual use
window.authDebugCheck = () => {
  checkLocalStorage();
  checkReduxStore();
  checkPageProtection();
};

window.clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("persist:user");
  console.log("Auth data cleared. Please refresh and login again.");
};

console.log("");
console.log("🛠️ Manual Debug Functions Available:");
console.log("- authDebugCheck() - Run this check again");
console.log("- clearAuthData() - Clear auth data and login again");
