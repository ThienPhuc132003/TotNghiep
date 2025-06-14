// CSS DEBUG SCRIPT - Paste this in browser console to check if styles are applied
// Tập lệnh debug CSS - Dán vào console browser để kiểm tra style có được apply không

console.log("=== DEBUGGING STUDENT CLASSROOM CSS ===");

// 1. Check if CSS file is loaded
console.log("1. Checking CSS files loaded:");
const stylesheets = Array.from(document.styleSheets);
const studentCSS = stylesheets.find(
  (sheet) => sheet.href && sheet.href.includes("StudentClassroomPage.style.css")
);

if (studentCSS) {
  console.log("✅ StudentClassroomPage.style.css is loaded:", studentCSS.href);
} else {
  console.log(
    "❌ StudentClassroomPage.style.css NOT found in loaded stylesheets"
  );
  console.log(
    "Available stylesheets:",
    stylesheets.map((s) => s.href)
  );
}

// 2. Check if main container exists
console.log("\n2. Checking main container:");
const mainContainer = document.querySelector(".student-classroom-page");
if (mainContainer) {
  console.log("✅ Main container found:", mainContainer);
  console.log("Computed styles:", window.getComputedStyle(mainContainer));
} else {
  console.log("❌ Main container (.student-classroom-page) not found");
}

// 3. Check classroom grid
console.log("\n3. Checking classroom grid:");
const classroomGrid = document.querySelector(".scp-classroom-grid");
if (classroomGrid) {
  console.log("✅ Classroom grid found:", classroomGrid);
  const gridStyles = window.getComputedStyle(classroomGrid);
  console.log("Grid display:", gridStyles.display);
  console.log("Grid template columns:", gridStyles.gridTemplateColumns);
  console.log("Gap:", gridStyles.gap);
} else {
  console.log("❌ Classroom grid (.scp-classroom-grid) not found");
}

// 4. Check classroom cards
console.log("\n4. Checking classroom cards:");
const classroomCards = document.querySelectorAll(".scp-classroom-card");
console.log(`Found ${classroomCards.length} classroom cards`);

classroomCards.forEach((card, index) => {
  const cardStyles = window.getComputedStyle(card);
  console.log(`Card ${index + 1}:`, {
    background: cardStyles.background,
    borderRadius: cardStyles.borderRadius,
    boxShadow: cardStyles.boxShadow,
    padding: cardStyles.padding,
  });
});

// 5. Check for CSS conflicts
console.log("\n5. Checking for CSS conflicts:");
if (classroomGrid) {
  const allRules = [];
  for (let sheet of stylesheets) {
    try {
      for (let rule of sheet.cssRules || sheet.rules || []) {
        if (
          rule.selectorText &&
          rule.selectorText.includes(".scp-classroom-grid")
        ) {
          allRules.push({
            selector: rule.selectorText,
            styles: rule.style.cssText,
            sheet: sheet.href || "inline",
          });
        }
      }
    } catch (e) {
      console.log("Cannot read stylesheet:", sheet.href, e.message);
    }
  }
  console.log("CSS rules affecting .scp-classroom-grid:", allRules);
}

// 6. Apply test styles directly
console.log("\n6. Applying test styles directly:");
if (classroomGrid) {
  // Apply direct styles to test
  classroomGrid.style.cssText = `
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)) !important;
        gap: 24px !important;
        margin-top: 20px !important;
        background: red !important;
        padding: 10px !important;
    `;
  console.log("✅ Applied test styles to classroom grid");
}

classroomCards.forEach((card) => {
  card.style.cssText = `
        background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%) !important;
        border: 1px solid #e0e6ed !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
        overflow: hidden !important;
        margin-bottom: 16px !important;
        transition: all 0.3s ease !important;
    `;
});

if (classroomCards.length > 0) {
  console.log("✅ Applied test styles to classroom cards");
}

console.log("=== DEBUG COMPLETE ===");
console.log(
  "If styles are applied now, the issue is CSS specificity or loading order."
);
console.log(
  "If styles still don't work, the issue is with the HTML structure."
);
