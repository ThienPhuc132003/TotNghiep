// Check debug page functionality
console.log("🔧 Checking debug page status...");

// Check if we're on the correct page
const currentPath = window.location.pathname;
console.log("Current path:", currentPath);

if (currentPath.includes("thong-ke-doanh-thu")) {
  console.log("✅ On the correct revenue statistics page");

  // Check if the debug component is rendered
  const debugTitle = document.querySelector("h1");
  if (
    debugTitle &&
    debugTitle.textContent.includes("Debug: Tutor Revenue Statistics")
  ) {
    console.log("✅ Debug component is rendered");

    // Check for any React errors
    const reactErrors = document.querySelectorAll("[data-reactroot]");
    console.log("React elements found:", reactErrors.length);

    // Look for authentication status
    const authStatus = document.querySelector("h3");
    if (authStatus) {
      console.log("Auth status element:", authStatus.textContent);
    }

    // Check for API test button
    const testButton = document.querySelector("button");
    if (testButton) {
      console.log("✅ API test button found:", testButton.textContent);
    } else {
      console.log("❌ API test button not found");
    }
  } else {
    console.log("❌ Debug component not rendered - checking for errors...");

    // Check for error elements
    const errorElements = document.querySelectorAll(
      '.error, .error-message, [class*="error"]'
    );
    console.log("Error elements found:", errorElements.length);

    // Check for any error text in the page
    const bodyText = document.body.textContent;
    if (
      bodyText.includes("500") ||
      bodyText.includes("Internal Server Error")
    ) {
      console.log("❌ 500 error detected on page");
    }

    if (bodyText.includes("404") || bodyText.includes("Not Found")) {
      console.log("❌ 404 error detected on page");
    }
  }
} else {
  console.log("❌ Not on the revenue statistics page");
}

// Check browser console for errors
console.log("🔍 Checking for console errors...");
const originalError = console.error;
let errorCount = 0;

console.error = function (...args) {
  errorCount++;
  console.log(`🚨 Console Error #${errorCount}:`, ...args);
  originalError.apply(console, args);
};

// Check for React development mode
if (window.React && window.React.version) {
  console.log("✅ React version:", window.React.version);
} else {
  console.log("❓ React not detected in global scope");
}

// Check Redux store
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log("✅ Redux DevTools available");
  try {
    const state = window.store?.getState?.();
    if (state) {
      console.log("✅ Redux store accessible");
      console.log("User state:", state.user);
    }
  } catch (e) {
    console.log("❌ Redux store access error:", e.message);
  }
} else {
  console.log("❓ Redux DevTools not available");
}

console.log("✅ Debug page check complete");
