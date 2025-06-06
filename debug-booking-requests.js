// Debug script để kiểm tra isBookingRequestAccepted trong console
// Paste vào console khi ở trang TutorList để kiểm tra

console.log("=== DEBUG BOOKING REQUESTS STATUS ===");

// Kiểm tra state hiện tại của tutors
const tutorCardElements = document.querySelectorAll(".tutor-card");
console.log(`Found ${tutorCardElements.length} tutor cards on page`);

tutorCardElements.forEach((card, index) => {
  const tutorName = card.querySelector(".tutor-name")?.textContent || "Unknown";
  const viewAcceptedBtn = card.querySelector(".btn-view-accepted");
  const noAcceptedMsg = card.querySelector(".card-info");

  console.log(`\n--- Tutor ${index + 1}: ${tutorName} ---`);
  console.log('Has "Xem YC Duyệt" button:', !!viewAcceptedBtn);
  console.log('Has "Chưa có yêu cầu" message:', !!noAcceptedMsg);

  if (viewAcceptedBtn) {
    console.log("Button text:", viewAcceptedBtn.textContent.trim());
    console.log("Button disabled:", viewAcceptedBtn.disabled);
  }

  if (noAcceptedMsg) {
    console.log("Message text:", noAcceptedMsg.textContent.trim());
  }
});

// Kiểm tra React state nếu có thể truy cập
if (
  window.React &&
  window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
) {
  console.log("\n=== TRYING TO ACCESS REACT STATE ===");
  try {
    const rootElement = document.querySelector("#root");
    if (rootElement && rootElement._reactInternalFiber) {
      console.log("React fiber found, but state access is complex...");
    }
  } catch (e) {
    console.log("Cannot access React state directly");
  }
}

console.log("\n=== END DEBUG ===");
