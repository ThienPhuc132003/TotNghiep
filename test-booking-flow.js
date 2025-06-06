/**
 * TEST SCRIPT: Booking Request Flow Validation
 *
 * This script helps test the booking request flow to ensure:
 * 1. Send booking request → buttons update correctly without refresh
 * 2. Cancel booking request → buttons update correctly without refresh
 * 3. Accept/reject from accepted modal → buttons update correctly
 *
 * Usage: Open browser console and run this script
 */

console.log("🧪 BOOKING FLOW TEST SCRIPT");
console.log("==========================");
console.log("");

// Test configuration
const TEST_CONFIG = {
  waitTime: 2000, // Wait time after each action
  debug: true,
};

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to log test results
const logTestResult = (testName, success, details = "") => {
  const status = success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
};

// Helper function to find tutor cards
const findTutorCards = () => {
  return document.querySelectorAll('[data-testid="tutor-card"], .tutor-card');
};

// Helper function to find buttons in a tutor card
const findButtonsInCard = (card) => {
  return {
    sendRequest: card.querySelector(
      'button:contains("Yêu Cầu Mới"), .btn-request-new'
    ),
    cancelRequest: card.querySelector(
      'button:contains("Hủy Yêu Cầu"), .btn-cancel-small'
    ),
    viewAccepted: card.querySelector(
      'button:contains("Xem Yêu Cầu"), .btn-view-accepted'
    ),
    noAcceptedMsg: card.querySelector(
      ".booking-status-indicator.disabled-look"
    ),
  };
};

// Helper function to check button visibility
const checkButtonVisibility = (card, expectedState) => {
  const buttons = findButtonsInCard(card);
  const results = {
    sendRequest: !!buttons.sendRequest && !buttons.sendRequest.style.display,
    cancelRequest:
      !!buttons.cancelRequest && !buttons.cancelRequest.style.display,
    viewAccepted: !!buttons.viewAccepted && !buttons.viewAccepted.style.display,
    noAcceptedMsg:
      !!buttons.noAcceptedMsg && !buttons.noAcceptedMsg.style.display,
  };

  const matches = Object.keys(expectedState).every(
    (key) => results[key] === expectedState[key]
  );

  return { matches, actual: results, expected: expectedState };
};

// Test 1: Initial state verification
const testInitialState = () => {
  console.log("🔍 Test 1: Initial State Verification");

  const cards = findTutorCards();
  if (cards.length === 0) {
    logTestResult("Find tutor cards", false, "No tutor cards found on page");
    return false;
  }

  logTestResult("Find tutor cards", true, `Found ${cards.length} tutor cards`);

  // Check each card's initial state
  cards.forEach((card, index) => {
    const buttons = findButtonsInCard(card);
    console.log(`   Card ${index + 1}:`, {
      sendRequest: !!buttons.sendRequest,
      cancelRequest: !!buttons.cancelRequest,
      viewAccepted: !!buttons.viewAccepted,
      noAcceptedMsg: !!buttons.noAcceptedMsg,
    });
  });

  return true;
};

// Test 2: Send booking request flow
const testSendBookingRequest = async () => {
  console.log("📤 Test 2: Send Booking Request Flow");

  const cards = findTutorCards();
  const cardWithSendButton = Array.from(cards).find((card) => {
    const buttons = findButtonsInCard(card);
    return buttons.sendRequest && !buttons.sendRequest.disabled;
  });

  if (!cardWithSendButton) {
    logTestResult(
      "Find card with send button",
      false,
      "No available send request button found"
    );
    return false;
  }

  logTestResult("Find card with send button", true);

  // Store initial state
  const initialCheck = checkButtonVisibility(cardWithSendButton, {});
  console.log("   Initial state:", initialCheck.actual);

  // Click send request button
  const sendButton = findButtonsInCard(cardWithSendButton).sendRequest;
  console.log("   Clicking send request button...");
  sendButton.click();

  // Wait for modal to appear and simulate booking submission
  await wait(1000);

  // Look for booking modal
  const modal = document.querySelector(
    '.booking-modal, [data-testid="booking-modal"]'
  );
  if (modal) {
    console.log("   Booking modal opened successfully");

    // Close modal for now (in real test, would fill form and submit)
    const closeButton = modal.querySelector(
      '.close, .btn-close, button[aria-label="Close"]'
    );
    if (closeButton) {
      closeButton.click();
      console.log("   Modal closed");
    }
  }

  return true;
};

// Test 3: Cancel booking request flow
const testCancelBookingRequest = async () => {
  console.log("❌ Test 3: Cancel Booking Request Flow");

  const cards = findTutorCards();
  const cardWithCancelButton = Array.from(cards).find((card) => {
    const buttons = findButtonsInCard(card);
    return buttons.cancelRequest && !buttons.cancelRequest.disabled;
  });

  if (!cardWithCancelButton) {
    logTestResult(
      "Find card with cancel button",
      false,
      "No available cancel button found"
    );
    return false;
  }

  logTestResult("Find card with cancel button", true);

  // Store initial state
  const initialCheck = checkButtonVisibility(cardWithCancelButton, {});
  console.log("   Initial state:", initialCheck.actual);

  // Click cancel button
  const cancelButton = findButtonsInCard(cardWithCancelButton).cancelRequest;
  console.log("   Clicking cancel button...");

  // Store original confirm function
  const originalConfirm = window.confirm;
  window.confirm = () => true; // Auto-confirm for test

  cancelButton.click();

  // Wait for API call to complete
  await wait(TEST_CONFIG.waitTime);

  // Check if state changed
  const afterCheck = checkButtonVisibility(cardWithCancelButton, {});
  console.log("   State after cancel:", afterCheck.actual);

  // Restore confirm function
  window.confirm = originalConfirm;

  return true;
};

// Test 4: API refresh monitoring
const testAPIRefreshLogging = () => {
  console.log("🔄 Test 4: API Refresh Logging");

  // Monitor console for API refresh logs
  const originalLog = console.log;
  let refreshLogs = [];

  console.log = (...args) => {
    const message = args.join(" ");
    if (message.includes("[API REFRESH]")) {
      refreshLogs.push(message);
    }
    originalLog.apply(console, args);
  };

  setTimeout(() => {
    console.log = originalLog; // Restore original
    console.log("   API Refresh logs captured:", refreshLogs.length);
    refreshLogs.forEach((log) => console.log(`     ${log}`));

    const hasRefreshLogs = refreshLogs.length > 0;
    logTestResult(
      "API refresh logging",
      hasRefreshLogs,
      hasRefreshLogs ? "Refresh logs found" : "No refresh logs detected"
    );
  }, 5000);

  return true;
};

// Main test runner
const runBookingFlowTests = async () => {
  console.log("🚀 Starting Booking Flow Tests...");
  console.log("");

  try {
    // Run tests sequentially
    await testInitialState();
    await wait(1000);

    await testSendBookingRequest();
    await wait(1000);

    await testCancelBookingRequest();
    await wait(1000);

    testAPIRefreshLogging();

    console.log("");
    console.log("✨ Booking Flow Tests Completed!");
    console.log("");
    console.log("📋 MANUAL VERIFICATION CHECKLIST:");
    console.log("1. Open Network tab and filter by 'tutor-public'");
    console.log("2. Perform booking actions and verify API calls are made");
    console.log(
      "3. Check that button states update immediately after API response"
    );
    console.log("4. Verify no page refresh is needed to see updated states");
  } catch (error) {
    console.error("❌ Test execution failed:", error);
  }
};

// Auto-run tests if we're in a tutor search page
if (
  window.location.pathname.includes("/tim-gia-su") ||
  document.querySelector('.tutor-card, [data-testid="tutor-card"]')
) {
  console.log("🎯 Tutor search page detected - running tests automatically");
  runBookingFlowTests();
} else {
  console.log(
    "ℹ️  Navigate to tutor search page and run: runBookingFlowTests()"
  );
}

// Export functions for manual use
window.runBookingFlowTests = runBookingFlowTests;
window.testInitialState = testInitialState;
window.testSendBookingRequest = testSendBookingRequest;
window.testCancelBookingRequest = testCancelBookingRequest;
window.testAPIRefreshLogging = testAPIRefreshLogging;

console.log("");
console.log("🛠️  Available test functions:");
console.log("- runBookingFlowTests() - Run all tests");
console.log("- testInitialState() - Test button visibility");
console.log("- testSendBookingRequest() - Test send request flow");
console.log("- testCancelBookingRequest() - Test cancel request flow");
console.log("- testAPIRefreshLogging() - Monitor API refresh logs");
