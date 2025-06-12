// FontAwesome Debug Script for TutorRevenueStable
// Run this in browser console to debug icon issues

console.log("🔧 Starting FontAwesome Debug for TutorRevenueStable...");

// 1. Check if FontAwesome CSS is loaded
function checkFontAwesomeCSSLoaded() {
  console.log("\n1️⃣ Checking FontAwesome CSS...");

  const stylesheets = Array.from(document.styleSheets);
  const faStylesheets = stylesheets.filter((sheet) => {
    try {
      return (
        sheet.href &&
        (sheet.href.includes("font-awesome") ||
          sheet.href.includes("fontawesome"))
      );
    } catch (e) {
      return false;
    }
  });

  if (faStylesheets.length > 0) {
    console.log(
      "✅ FontAwesome CSS found:",
      faStylesheets.map((s) => s.href)
    );
    return true;
  } else {
    console.log("❌ FontAwesome CSS not found");
    return false;
  }
}

// 2. Check if FontAwesome fonts are loaded
function checkFontAwesomeFontsLoaded() {
  console.log("\n2️⃣ Checking FontAwesome fonts...");

  const testElement = document.createElement("span");
  testElement.style.fontFamily = "Font Awesome 6 Free, FontAwesome";
  testElement.style.fontSize = "16px";
  testElement.style.position = "absolute";
  testElement.style.left = "-9999px";
  testElement.innerHTML = "&#xf007;"; // fa-user unicode
  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.fontFamily;

  document.body.removeChild(testElement);

  if (
    fontFamily.includes("Font Awesome") ||
    fontFamily.includes("FontAwesome")
  ) {
    console.log("✅ FontAwesome fonts loaded:", fontFamily);
    return true;
  } else {
    console.log("❌ FontAwesome fonts not loaded. Current font:", fontFamily);
    return false;
  }
}

// 3. Check specific icons in TutorRevenueStable
function checkTutorRevenueIcons() {
  console.log("\n3️⃣ Checking TutorRevenueStable icons...");

  const iconSelectors = [
    ".fas.fa-chart-line",
    ".fas.fa-coins",
    ".fas.fa-receipt",
    ".fas.fa-users",
    ".fas.fa-list-alt",
    ".fas.fa-sync-alt",
    ".fas.fa-file-csv",
    ".fas.fa-spinner",
    ".fas.fa-exclamation-triangle",
    ".fas.fa-ban",
    ".fas.fa-info-circle",
  ];

  iconSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`✅ Found ${elements.length} elements with ${selector}`);

      // Check if the icon is actually displaying
      elements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el, ":before");
        const content = computedStyle.content;
        if (content && content !== "none" && content !== '""') {
          console.log(`  ✅ Icon ${index + 1} is displaying: ${content}`);
        } else {
          console.log(`  ❌ Icon ${index + 1} is NOT displaying`);
        }
      });
    } else {
      console.log(`❌ No elements found with ${selector}`);
    }
  });
}

// 4. Check CSS rules for FontAwesome
function checkFontAwesomeCSS() {
  console.log("\n4️⃣ Checking FontAwesome CSS rules...");

  try {
    const stylesheets = Array.from(document.styleSheets);
    let foundFACSS = false;

    stylesheets.forEach((sheet) => {
      try {
        if (sheet.href && sheet.href.includes("font-awesome")) {
          foundFACSS = true;
          console.log("✅ FontAwesome stylesheet:", sheet.href);

          // Try to access some rules
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            const faRules = rules.filter(
              (rule) => rule.selectorText && rule.selectorText.includes(".fa")
            );
            console.log(`  Found ${faRules.length} FontAwesome CSS rules`);
          } catch (e) {
            console.log("  Cannot access stylesheet rules (CORS)");
          }
        }
      } catch (e) {
        // CORS or other error
      }
    });

    if (!foundFACSS) {
      console.log("❌ No FontAwesome stylesheets found");
    }
  } catch (e) {
    console.log("❌ Error checking CSS:", e.message);
  }
}

// 5. Test icon rendering
function testIconRendering() {
  console.log("\n5️⃣ Testing icon rendering...");

  const testIcons = ["fa-chart-line", "fa-coins", "fa-users"];

  testIcons.forEach((iconClass) => {
    const testDiv = document.createElement("div");
    testDiv.innerHTML = `<i class="fas ${iconClass}"></i>`;
    testDiv.style.position = "absolute";
    testDiv.style.left = "-9999px";
    document.body.appendChild(testDiv);

    const icon = testDiv.querySelector("i");
    const computedStyle = window.getComputedStyle(icon, ":before");
    const content = computedStyle.content;
    const fontFamily = computedStyle.fontFamily;

    console.log(`Icon ${iconClass}:`);
    console.log(`  Content: ${content}`);
    console.log(`  Font Family: ${fontFamily}`);

    if (content && content !== "none" && content !== '""') {
      console.log(`  ✅ ${iconClass} is working`);
    } else {
      console.log(`  ❌ ${iconClass} is NOT working`);
    }

    document.body.removeChild(testDiv);
  });
}

// 6. Provide fix suggestions
function provideFixes() {
  console.log("\n6️⃣ Fix suggestions:");

  const cssLoaded = checkFontAwesomeCSSLoaded();
  const fontsLoaded = checkFontAwesomeFontsLoaded();

  if (!cssLoaded) {
    console.log("🔧 Fix 1: Add FontAwesome CSS to index.html");
    console.log(
      `   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">`
    );
  }

  if (!fontsLoaded) {
    console.log("🔧 Fix 2: Check network connectivity or use alternative CDN");
    console.log("🔧 Fix 3: Add fallback emoji icons in CSS");
  }

  console.log("🔧 Fix 4: Add this CSS to force icon display:");
  console.log(`
    .fas, .far, .fab {
        font-family: "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
        display: inline-block !important;
    }
    `);
}

// Run all checks
function runAllChecks() {
  checkFontAwesomeCSSLoaded();
  checkFontAwesomeFontsLoaded();
  checkTutorRevenueIcons();
  checkFontAwesomeCSS();
  testIconRendering();
  provideFixes();

  console.log("\n🏁 FontAwesome debug complete!");
}

// Auto-run after page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(runAllChecks, 1000);
  });
} else {
  setTimeout(runAllChecks, 1000);
}

// Export functions for manual testing
window.FontAwesomeDebug = {
  runAllChecks,
  checkFontAwesomeCSSLoaded,
  checkFontAwesomeFontsLoaded,
  checkTutorRevenueIcons,
  checkFontAwesomeCSS,
  testIconRendering,
  provideFixes,
};

console.log("💡 You can also run individual checks using:");
console.log("  FontAwesomeDebug.runAllChecks()");
console.log("  FontAwesomeDebug.checkTutorRevenueIcons()");
console.log("  FontAwesomeDebug.testIconRendering()");
