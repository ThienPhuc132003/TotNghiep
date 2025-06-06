/**
 * QUICK VERIFICATION - Booking Button Fix
 * Copy and paste this into browser console to verify the fix
 */

console.log("🔍 BOOKING BUTTON FIX VERIFICATION");
console.log("=================================");

// Check if we're on the tutor search page
const isTutorPage =
  window.location.pathname.includes("/tim-gia-su") ||
  document.querySelector(".tutor-card, .search-results-section");

if (!isTutorPage) {
  console.log("❌ Please navigate to the tutor search page first");
  console.log("   Go to: /tim-gia-su or any page with tutor cards");
} else {
  console.log("✅ On tutor search page");

  // 1. Check for tutor cards
  const tutorCards = document.querySelectorAll(
    '.tutor-card, [data-testid="tutor-card"]'
  );
  console.log(`📋 Found ${tutorCards.length} tutor cards`);

  // 2. Check button text improvements
  const oldTextButtons = document.querySelectorAll('button:contains("YC")');
  const newTextButtons = document.querySelectorAll(
    'button:contains("Xem Yêu Cầu Được Duyệt")'
  );

  console.log("📝 Button text verification:");
  console.log(`   Old "YC" buttons: ${oldTextButtons.length}`);
  console.log(`   New descriptive buttons: ${newTextButtons.length}`);

  if (oldTextButtons.length === 0 && newTextButtons.length > 0) {
    console.log("✅ Button text successfully updated!");
  } else if (oldTextButtons.length > 0) {
    console.log("⚠️  Still found old 'YC' text in buttons");
  }

  // 3. Check for API refresh logging setup
  const originalFetch = window.fetch;
  let apiCalls = [];

  window.fetch = (...args) => {
    const url = args[0];
    if (typeof url === "string" && url.includes("tutor-public")) {
      apiCalls.push({
        url: url,
        timestamp: new Date().toISOString(),
        action: "API_REFRESH",
      });
      console.log(`🔄 [API REFRESH] Detected: ${url}`);
    }
    return originalFetch.apply(window, args);
  };

  // 4. Check button visibility logic
  console.log("🎯 Button visibility check:");
  tutorCards.forEach((card, index) => {
    const sendButton = card.querySelector(
      '.btn-request-new, button:contains("Yêu Cầu Mới")'
    );
    const cancelButton = card.querySelector(
      '.btn-cancel-small, button:contains("Hủy Yêu Cầu")'
    );
    const viewButton = card.querySelector(
      '.btn-view-accepted, button:contains("Xem Yêu Cầu")'
    );
    const noRequestMsg = card.querySelector(
      ".booking-status-indicator.disabled-look"
    );

    console.log(`   Card ${index + 1}:`, {
      hasLogin: !!document.querySelector("[data-user-logged-in]"),
      sendRequest: !!sendButton,
      cancelRequest: !!cancelButton,
      viewAccepted: !!viewButton,
      noAcceptedMsg: !!noRequestMsg,
    });
  });

  // 5. Simulate button click test (if available)
  const testButton = document.querySelector(
    ".btn-request-new, .btn-cancel-small"
  );
  if (testButton) {
    console.log("🧪 Test button interaction:");
    console.log("   Found clickable button:", testButton.textContent.trim());
    console.log(
      "   Ready for manual testing - click the button and watch for:"
    );
    console.log("   1. Console logs with '[API REFRESH]'");
    console.log("   2. Network requests to 'get-list-tutor-public'");
    console.log("   3. Button state changes without page refresh");
  } else {
    console.log("ℹ️  No test buttons available (user may not be logged in)");
  }

  // 6. Summary
  setTimeout(() => {
    console.log("");
    console.log("📊 VERIFICATION SUMMARY:");
    console.log(`   - Tutor cards found: ${tutorCards.length}`);
    console.log(
      `   - Button text updated: ${oldTextButtons.length === 0 ? "YES" : "NO"}`
    );
    console.log(`   - API monitoring active: YES`);
    console.log(
      `   - Ready for manual testing: ${
        testButton ? "YES" : "NO (login required)"
      }`
    );
    console.log("");
    console.log("✅ NEXT STEPS:");
    console.log("1. Login if not already logged in");
    console.log("2. Find a tutor with 'Yêu Cầu Mới' button");
    console.log("3. Click button and watch for API refresh logs");
    console.log("4. Verify button changes without page refresh");

    // Restore original fetch after 30 seconds
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log("🔄 API monitoring stopped");
      console.log(`📈 Total API calls monitored: ${apiCalls.length}`);
    }, 30000);
  }, 1000);
}

// Export for manual use
window.verifyBookingFix = () => {
  console.clear();
  // Re-run this script
  eval(
    document.querySelector("script[data-booking-fix-verification]")
      ?.textContent || ""
  );
};
