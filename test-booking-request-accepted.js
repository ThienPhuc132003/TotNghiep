// Script để test isBookingRequestAccepted trong console
// Chạy script này trong console khi ở trang tutor search

// Test function để simulate different values of isBookingRequestAccepted
function testBookingRequestAcceptedDisplay() {
  console.log("=== TESTING isBookingRequestAccepted DISPLAY LOGIC ===");

  // Find all tutor cards
  const tutorCards = document.querySelectorAll(".tutor-card");
  console.log(`Found ${tutorCards.length} tutor cards`);

  tutorCards.forEach((card, index) => {
    const tutorName =
      card.querySelector(".tutor-name")?.textContent?.trim() ||
      `Tutor ${index + 1}`;
    const viewAcceptedBtn = card.querySelector(".btn-view-accepted");
    const noAcceptedMsg = card.querySelector(".card-info");
    const requestNewBtn = card.querySelector(".btn-request-new");
    const pendingCard = card.querySelector(".status-with-action-card");

    console.log(`\n--- ${tutorName} ---`);
    console.log("Elements found:");
    console.log('  - "Xem YC Duyệt" button:', !!viewAcceptedBtn);
    console.log('  - "Chưa có yêu cầu" message:', !!noAcceptedMsg);
    console.log('  - "Yêu Cầu Mới" button:', !!requestNewBtn);
    console.log("  - Pending approval card:", !!pendingCard);

    if (viewAcceptedBtn) {
      console.log("  - Button text:", viewAcceptedBtn.textContent.trim());
      console.log("  - Button enabled:", !viewAcceptedBtn.disabled);
    }

    if (noAcceptedMsg) {
      console.log("  - Message text:", noAcceptedMsg.textContent.trim());
    }
  });

  console.log("\n=== END TEST ===");
}

// Auto-run when script is loaded
testBookingRequestAcceptedDisplay();

// Also export for manual testing
window.testBookingRequestAccepted = testBookingRequestAcceptedDisplay;
