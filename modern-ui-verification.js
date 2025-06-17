// CSS và Component Verification Script
// Chạy script này trong browser console để kiểm tra setup

console.log("🔍 Kiểm tra Modern UI Setup...\n");

// 1. Kiểm tra CSS file đã được load
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
const modernCssLoaded = Array.from(cssLinks).some((link) =>
  link.href.includes("ModernRevenueStatistics.style.css")
);

console.log("✅ CSS File Check:");
console.log(`   Modern CSS loaded: ${modernCssLoaded ? "✅ YES" : "❌ NO"}`);

// 2. Kiểm tra main container class
const mainContainer = document.querySelector(".tprs-container");
console.log("\n✅ Main Container Check:");
console.log(`   .tprs-container found: ${mainContainer ? "✅ YES" : "❌ NO"}`);

// 3. Kiểm tra header
const header = document.querySelector(".tprs-header");
console.log("\n✅ Header Check:");
console.log(`   .tprs-header found: ${header ? "✅ YES" : "❌ NO"}`);

// 4. Kiểm tra stats cards
const statsCards = document.querySelectorAll(".tprs-stats-card");
console.log("\n✅ Stats Cards Check:");
console.log(`   .tprs-stats-card count: ${statsCards.length}`);

// 5. Kiểm tra computed styles của container
if (mainContainer) {
  const computedStyle = window.getComputedStyle(mainContainer);
  const backgroundImage = computedStyle.backgroundImage;
  const hasGradient = backgroundImage.includes("linear-gradient");

  console.log("\n✅ Styling Check:");
  console.log(`   Gradient background: ${hasGradient ? "✅ YES" : "❌ NO"}`);
  console.log(`   Background: ${backgroundImage.substring(0, 100)}...`);
}

// 6. Kiểm tra Font Family
const bodyFont = window.getComputedStyle(document.body).fontFamily;
console.log("\n✅ Font Check:");
console.log(`   Font Family: ${bodyFont}`);

// 7. Kiểm tra class conflicts
const oldClasses = [
  ".revenue-dashboard",
  ".revenue-header",
  ".stats-section",
  ".stat-card",
];

console.log("\n⚠️  Old Classes Check (should be EMPTY):");
oldClasses.forEach((className) => {
  const elements = document.querySelectorAll(className);
  if (elements.length > 0) {
    console.log(
      `   ${className}: ❌ ${elements.length} elements found (should be 0)`
    );
  } else {
    console.log(`   ${className}: ✅ Not found (good)`);
  }
});

// 8. Recommendations
console.log("\n🎯 Recommendations:");
if (!modernCssLoaded) {
  console.log("   ❌ Modern CSS not loaded - check import path");
}
if (!mainContainer) {
  console.log("   ❌ Main container not found - check component class names");
}
if (statsCards.length === 0) {
  console.log("   ❌ No stats cards found - check component rendering");
}

console.log("\n✨ Setup verification complete!");
