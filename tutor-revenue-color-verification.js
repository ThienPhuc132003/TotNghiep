// Color Improvements Verification Test
// File: tutor-revenue-color-verification.js

console.log("🎨 Tutor Revenue Color Improvements - Verification Test");

function verifyColorImprovements() {
  console.log("\n=== VERIFYING COLOR IMPROVEMENTS ===\n");

  // Test 1: Container Background
  const container = document.querySelector(".trs-container");
  if (container) {
    const containerBg = window.getComputedStyle(container).background;
    console.log(
      "✅ Container background:",
      containerBg.includes("gradient") ? "Gradient detected" : "Plain color"
    );

    const containerColor = window.getComputedStyle(container).color;
    console.log("✅ Container text color:", containerColor);
  }

  // Test 2: Stats Cards
  const statsCards = document.querySelectorAll(".trs-stats-card");
  console.log(`\n📊 Found ${statsCards.length} stats cards`);

  statsCards.forEach((card, index) => {
    const cardBg = window.getComputedStyle(card).backgroundColor;
    const cardColor = window.getComputedStyle(card).color;
    console.log(`   Card ${index + 1}: bg=${cardBg}, color=${cardColor}`);
  });

  // Test 3: Table
  const table = document.querySelector(".trs-table");
  if (table) {
    const tableBg = window.getComputedStyle(table).backgroundColor;
    const tableColor = window.getComputedStyle(table).color;
    console.log(`\n📋 Table: bg=${tableBg}, color=${tableColor}`);

    // Test table headers
    const headers = table.querySelectorAll("th");
    if (headers.length > 0) {
      const headerBg = window.getComputedStyle(headers[0]).backgroundColor;
      const headerColor = window.getComputedStyle(headers[0]).color;
      console.log(`   Headers: bg=${headerBg}, color=${headerColor}`);
    }
  }

  // Test 4: Text Elements
  const textElements = [
    { selector: ".trs-stats-label", name: "Stats Label" },
    { selector: ".trs-stats-value", name: "Stats Value" },
    { selector: ".trs-stats-description", name: "Stats Description" },
    { selector: ".trs-student-name", name: "Student Name" },
    { selector: ".trs-student-id", name: "Student ID" },
  ];

  console.log("\n📝 Text Element Colors:");
  textElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (element) {
      const color = window.getComputedStyle(element).color;
      console.log(`   ${name}: ${color}`);
    }
  });

  // Test 5: Coin Amounts
  const coinAmounts = document.querySelectorAll(".trs-coin-amount");
  console.log(`\n💰 Found ${coinAmounts.length} coin amount elements`);

  coinAmounts.forEach((coin, index) => {
    const coinBg = window.getComputedStyle(coin).backgroundColor;
    const coinColor = window.getComputedStyle(coin).color;
    const coinClasses = coin.className;
    console.log(
      `   Coin ${index + 1}: ${coinClasses} - bg=${coinBg}, color=${coinColor}`
    );
  });

  // Test 6: Color Contrast Check
  console.log("\n🔍 Color Contrast Analysis:");

  const isLightColor = (color) => {
    // Simple brightness check
    const rgb = color.match(/\d+/g);
    if (rgb) {
      const brightness =
        (parseInt(rgb[0]) * 299 +
          parseInt(rgb[1]) * 587 +
          parseInt(rgb[2]) * 114) /
        1000;
      return brightness > 128;
    }
    return false;
  };

  if (container) {
    const bgIsLight = isLightColor(
      window.getComputedStyle(container).backgroundColor
    );
    const textIsLight = isLightColor(window.getComputedStyle(container).color);
    console.log(`   Background is ${bgIsLight ? "light" : "dark"}`);
    console.log(`   Text is ${textIsLight ? "light" : "dark"}`);
    console.log(
      `   Contrast: ${bgIsLight !== textIsLight ? "✅ Good" : "❌ Poor"}`
    );
  }

  console.log("\n🎯 Verification Complete!");
  console.log("\nTo run this test:");
  console.log("1. Open browser dev tools");
  console.log("2. Navigate to the tutor revenue page");
  console.log("3. Paste this script in console");
  console.log("4. Run verifyColorImprovements()");
}

// Auto-run if on the right page
if (window.location.pathname.includes("thong-ke-doanh-thu")) {
  setTimeout(verifyColorImprovements, 2000);
} else {
  console.log(
    "💡 Navigate to tutor revenue page first, then run verifyColorImprovements()"
  );
}

// Export for manual usage
window.verifyColorImprovements = verifyColorImprovements;
