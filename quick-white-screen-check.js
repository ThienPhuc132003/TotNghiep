// Quick check for white screen issue recovery
console.log("🔍 Checking white screen recovery...");

setTimeout(() => {
  const bodyText = document.body.textContent || "";
  const hasContent = bodyText.length > 100;

  console.log("📊 Page status check:");
  console.log("- URL:", window.location.href);
  console.log("- Content length:", bodyText.length);
  console.log("- Has meaningful content:", hasContent);
  console.log("- Contains 'Thống kê':", bodyText.includes("Thống kê"));
  console.log(
    "- Contains error:",
    bodyText.includes("error") || bodyText.includes("lỗi")
  );

  if (hasContent && bodyText.includes("Thống kê")) {
    console.log("✅ SUCCESS: Page recovered successfully!");
  } else if (!hasContent) {
    console.log("❌ ISSUE: Still white screen");
  } else {
    console.log("⚠️ PARTIAL: Some content but may have issues");
  }

  // Show first 200 characters of content
  console.log("📄 Content preview:", bodyText.substring(0, 200));
}, 3000);

console.log("⏳ Waiting 3 seconds to check page content...");
