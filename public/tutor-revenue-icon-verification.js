// TutorRevenueStable Icon Fix Verification Script
// Run this in browser console on TutorRevenueStable page

console.log("🔧 Starting TutorRevenueStable Icon Fix Verification...");

function verifyIconFix() {
  console.log("\n📊 Checking TutorRevenueStable Icons...");

  // Check if we're on the correct page
  const currentPath = window.location.pathname;
  if (
    !currentPath.includes("thong-ke-doanh-thu") &&
    !currentPath.includes("icon-test")
  ) {
    console.log(
      "❌ Not on TutorRevenueStable page. Navigate to the revenue statistics page first."
    );
    return;
  }

  // List of icons to check with their fallback emojis
  const iconsToCheck = [
    { selector: ".fa-chart-line", name: "Chart Line", emoji: "📊" },
    { selector: ".fa-coins", name: "Coins", emoji: "🪙" },
    { selector: ".fa-receipt", name: "Receipt", emoji: "🧾" },
    { selector: ".fa-users", name: "Users", emoji: "👥" },
    { selector: ".fa-list-alt", name: "List Alt", emoji: "📋" },
    { selector: ".fa-sync-alt", name: "Sync Alt", emoji: "🔄" },
    { selector: ".fa-file-csv", name: "File CSV", emoji: "📊" },
    { selector: ".fa-spinner", name: "Spinner", emoji: "⏳" },
    { selector: ".fa-exclamation-triangle", name: "Warning", emoji: "⚠️" },
    { selector: ".fa-ban", name: "Ban", emoji: "🚫" },
    { selector: ".fa-info-circle", name: "Info Circle", emoji: "ℹ️" },
  ];

  let totalIcons = 0;
  let workingIcons = 0;
  let iconsFallback = 0;

  console.log("\n🎯 Icon Status Check:");
  console.log("═".repeat(60));

  iconsToCheck.forEach((iconInfo) => {
    const elements = document.querySelectorAll(iconInfo.selector);

    if (elements.length === 0) {
      console.log(`⚪ ${iconInfo.name}: Not found on this page`);
      return;
    }

    elements.forEach((element, index) => {
      totalIcons++;
      const elementText = element.textContent.trim();
      const computedStyle = window.getComputedStyle(element, ":before");
      const beforeContent = computedStyle.content;

      // Check if FontAwesome is working (has ::before content)
      const hasFontAwesome =
        beforeContent &&
        beforeContent !== "none" &&
        beforeContent !== '""' &&
        beforeContent !== '"\\f000"'; // Empty FontAwesome

      // Check if emoji fallback is showing
      const hasEmojiFallback = elementText.includes(iconInfo.emoji);

      if (hasFontAwesome) {
        console.log(
          `✅ ${iconInfo.name} ${
            index + 1
          }: FontAwesome working (${beforeContent})`
        );
        workingIcons++;
      } else if (hasEmojiFallback) {
        console.log(
          `🔄 ${iconInfo.name} ${
            index + 1
          }: Emoji fallback working (${elementText})`
        );
        iconsFallback++;
      } else {
        console.log(
          `❌ ${iconInfo.name} ${
            index + 1
          }: Neither FontAwesome nor emoji fallback working`
        );
        console.log(`   Element text: "${elementText}"`);
        console.log(`   Before content: ${beforeContent}`);
      }
    });
  });

  console.log("\n📈 Summary:");
  console.log("═".repeat(40));
  console.log(`Total Icons Found: ${totalIcons}`);
  console.log(`FontAwesome Working: ${workingIcons}`);
  console.log(`Emoji Fallback Working: ${iconsFallback}`);
  console.log(`Not Working: ${totalIcons - workingIcons - iconsFallback}`);

  const successRate =
    totalIcons > 0
      ? Math.round(((workingIcons + iconsFallback) / totalIcons) * 100)
      : 0;

  console.log(`Success Rate: ${successRate}%`);

  if (successRate >= 100) {
    console.log("🎉 All icons are working perfectly!");
  } else if (successRate >= 80) {
    console.log("✅ Most icons are working. Minor issues may exist.");
  } else if (successRate >= 50) {
    console.log("⚠️ Some icons are working, but there are issues.");
  } else {
    console.log("❌ Major icon issues detected. Need further investigation.");
  }

  return {
    total: totalIcons,
    working: workingIcons,
    fallback: iconsFallback,
    failed: totalIcons - workingIcons - iconsFallback,
    successRate: successRate,
  };
}

// Check FontAwesome CSS loading
function checkFontAwesomeCSS() {
  console.log("\n🎨 Checking FontAwesome CSS...");

  const links = document.querySelectorAll('link[href*="font-awesome"]');
  if (links.length > 0) {
    console.log(`✅ Found ${links.length} FontAwesome CSS link(s):`);
    links.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.href}`);
    });
  } else {
    console.log("❌ No FontAwesome CSS links found");
  }
}

// Check TutorRevenueStable specific elements
function checkTutorRevenueElements() {
  console.log("\n🏠 Checking TutorRevenueStable specific elements...");

  const elements = [
    { selector: ".trs-page-title", name: "Page Title" },
    { selector: ".trs-stats-card", name: "Stats Cards" },
    { selector: ".trs-section-title", name: "Section Title" },
    { selector: ".trs-refresh-btn", name: "Refresh Button" },
    { selector: ".trs-export-btn", name: "Export Button" },
  ];

  elements.forEach((elementInfo) => {
    const found = document.querySelectorAll(elementInfo.selector);
    if (found.length > 0) {
      console.log(`✅ ${elementInfo.name}: Found ${found.length} element(s)`);
    } else {
      console.log(`❌ ${elementInfo.name}: Not found`);
    }
  });
}

// Provide troubleshooting tips
function provideTroubleshootingTips() {
  console.log("\n🛠️ Troubleshooting Tips:");
  console.log("═".repeat(50));
  console.log("1. Check Network Tab for failed FontAwesome CSS requests");
  console.log(
    "2. Verify CDN availability: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
  );
  console.log("3. Clear browser cache and reload");
  console.log("4. Check if ad blockers are blocking FontAwesome");
  console.log("5. Emoji fallbacks should show even if FontAwesome fails");
  console.log("\n💡 Manual test:");
  console.log("Run: FontAwesomeDebug.runAllChecks() for detailed analysis");
}

// Run all checks
function runCompleteIconVerification() {
  console.log("🚀 Running Complete Icon Verification for TutorRevenueStable");
  console.log("=".repeat(70));

  checkFontAwesomeCSS();
  checkTutorRevenueElements();
  const results = verifyIconFix();
  provideTroubleshootingTips();

  console.log("\n🏁 Verification Complete!");
  return results;
}

// Auto-run if on the correct page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(runCompleteIconVerification, 2000);
  });
} else {
  setTimeout(runCompleteIconVerification, 1000);
}

// Export for manual use
window.TutorRevenueIconVerification = {
  runCompleteIconVerification,
  verifyIconFix,
  checkFontAwesomeCSS,
  checkTutorRevenueElements,
  provideTroubleshootingTips,
};

console.log("\n💡 Manual commands available:");
console.log("TutorRevenueIconVerification.runCompleteIconVerification()");
console.log("TutorRevenueIconVerification.verifyIconFix()");
