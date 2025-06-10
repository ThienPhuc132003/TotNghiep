// Quick test to verify if the ProtectRoute was the issue
console.log("🔍 Testing if ProtectRoute was causing the white screen...");

// Function to test page load
async function testPageLoad() {
  console.log("📍 Current URL:", window.location.href);

  // Wait a moment for the page to load
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const bodyText = document.body.textContent || "";
  const hasContent = bodyText.length > 100;

  console.log("📊 Page analysis:");
  console.log("- Body text length:", bodyText.length);
  console.log("- Has meaningful content:", hasContent);
  console.log("- Contains 'Thống kê':", bodyText.includes("Thống kê"));
  console.log(
    "- Contains 'Truy cập bị từ chối':",
    bodyText.includes("Truy cập bị từ chối")
  );
  console.log(
    "- Contains error messages:",
    bodyText.includes("error") || bodyText.includes("lỗi")
  );

  if (hasContent) {
    console.log("✅ SUCCESS: Page has content!");
    console.log("📋 Content preview:", bodyText.substring(0, 200) + "...");
  } else {
    console.log("❌ ISSUE: Page appears empty or minimal");
  }

  // Check if we were redirected
  if (window.location.pathname !== "/tai-khoan/ho-so/thong-ke-doanh-thu") {
    console.log("🔄 REDIRECT detected!");
    console.log("- Current path:", window.location.pathname);
    console.log("- Expected path: /tai-khoan/ho-so/thong-ke-doanh-thu");
  }

  // Check for React errors
  const reactErrors = document.querySelectorAll(
    '[data-testid="error-boundary"], .error, .Error'
  );
  if (reactErrors.length > 0) {
    console.log("⚠️ React errors found:", reactErrors.length);
  }
}

// Auto-run test
testPageLoad();

console.log("⚡ Test completed. Check results above.");
