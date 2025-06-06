// Test script to verify booking UI refresh functionality
// Run this in browser console after making a booking request

console.log("=== BOOKING UI REFRESH TEST ===");

// Monitor console for specific debug messages
const originalLog = console.log;
const debugMessages = [];

console.log = function (...args) {
  const message = args.join(" ");

  // Capture specific debug messages
  if (message.includes("[DEBUG]") || message.includes("[API REFRESH]")) {
    debugMessages.push({
      timestamp: new Date().toISOString(),
      message: message,
      type: "debug",
    });
  }

  originalLog.apply(console, args);
};

// Function to check if UI refresh is working
window.testBookingRefresh = function () {
  console.log("🔍 Testing booking UI refresh functionality...");

  // Check for key debug messages
  const requiredMessages = [
    "[DEBUG handleBookingSuccessInList] Called with:",
    "[API REFRESH] Refreshing tutor list after booking success...",
    "[DEBUG] AFTER API refresh - mapped tutors:",
    "[DEBUG] State updated with new tutors data",
    "[DEBUG RENDER] Rendering TutorCard",
  ];

  console.log("\n📝 Recent debug messages:");
  debugMessages.slice(-10).forEach((msg, i) => {
    console.log(`${i + 1}. ${msg.timestamp} - ${msg.message}`);
  });

  console.log("\n✅ Required messages check:");
  requiredMessages.forEach((required) => {
    const found = debugMessages.some((msg) => msg.message.includes(required));
    console.log(`${found ? "✅" : "❌"} ${required}`);
  });

  // Check for TutorCard refresh keys
  const renderMessages = debugMessages.filter((msg) =>
    msg.message.includes("[DEBUG RENDER] Rendering TutorCard")
  );

  if (renderMessages.length > 0) {
    console.log("\n🔄 TutorCard render tracking:");
    renderMessages.slice(-5).forEach((msg) => {
      const keyMatch = msg.message.match(/with key: (.+)$/);
      if (keyMatch) {
        console.log(`   Key: ${keyMatch[1]}`);
      }
    });
  }

  return {
    totalDebugMessages: debugMessages.length,
    renderMessages: renderMessages.length,
    requiredMessagesFound: requiredMessages.filter((required) =>
      debugMessages.some((msg) => msg.message.includes(required))
    ).length,
  };
};

// Function to clear debug log
window.clearDebugLog = function () {
  debugMessages.length = 0;
  console.log("🧹 Debug log cleared");
};

console.log("📋 Test functions available:");
console.log("  - testBookingRefresh() - Check if refresh is working");
console.log("  - clearDebugLog() - Clear debug messages");
console.log(
  "\n🚀 Now try making a booking request and run testBookingRefresh()"
);
