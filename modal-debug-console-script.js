// 🔍 MODAL DEBUG SCRIPT - Paste vào browser console khi ở Meeting View

console.log("🔍 Starting modal debug script...");

// Test 1: Check current modal states
function checkModalStates() {
  console.log("=== MODAL STATE CHECK ===");

  // Find React component states (if accessible)
  const reactRoot = document.querySelector("#root");
  console.log("React root found:", !!reactRoot);

  // Check for modal elements in DOM
  const modals = document.querySelectorAll('[class*="modal"], [id*="modal"]');
  console.log("Modal elements found:", modals.length);

  modals.forEach((modal, index) => {
    const styles = getComputedStyle(modal);
    console.log(`Modal ${index}:`, {
      element: modal,
      className: modal.className,
      display: styles.display,
      opacity: styles.opacity,
      visibility: styles.visibility,
      zIndex: styles.zIndex,
      position: styles.position,
      top: styles.top,
      left: styles.left,
      transform: styles.transform,
    });
  });

  // Check for overlay elements
  const overlays = document.querySelectorAll(
    '[style*="position: fixed"], [style*="z-index"]'
  );
  console.log("Overlay/Fixed elements:", overlays.length);

  return { modals: modals.length, overlays: overlays.length };
}

// Test 2: Force create a test modal
function createTestModal() {
  console.log("=== CREATING TEST MODAL ===");

  // Remove existing test modal if any
  const existing = document.getElementById("debug-test-modal");
  if (existing) existing.remove();

  // Create test modal
  const modal = document.createElement("div");
  modal.id = "debug-test-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 24px;
    font-family: Arial, sans-serif;
  `;

  modal.innerHTML = `
    <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 30px; border-radius: 10px;">
      <h2>🔍 DEBUG TEST MODAL</h2>
      <p>If you see this, modal rendering works!</p>
      <p>Current view context working!</p>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="padding: 10px 20px; font-size: 16px; background: white; color: black; border: none; border-radius: 5px; cursor: pointer;">
        CLOSE TEST MODAL
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  console.log("✅ Test modal created and added to DOM");

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById("debug-test-modal")) {
      modal.remove();
      console.log("🗑️ Test modal auto-removed");
    }
  }, 10000);
}

// Test 3: Check Z-index stacking context
function checkZIndexContext() {
  console.log("=== Z-INDEX CONTEXT CHECK ===");

  const highZElements = [];
  document.querySelectorAll("*").forEach((el) => {
    const zIndex = getComputedStyle(el).zIndex;
    if (zIndex !== "auto" && parseInt(zIndex) > 100) {
      highZElements.push({
        element: el,
        zIndex: parseInt(zIndex),
        className: el.className,
        tagName: el.tagName,
      });
    }
  });

  // Sort by z-index descending
  highZElements.sort((a, b) => b.zIndex - a.zIndex);
  console.log("High z-index elements:", highZElements);

  return highZElements;
}

// Test 4: Check current view context
function checkViewContext() {
  console.log("=== VIEW CONTEXT CHECK ===");

  const context = {
    url: window.location.href,
    pathname: window.location.pathname,
    body_overflow: document.body.style.overflow,
    html_overflow: document.documentElement.style.overflow,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    scroll_position: { x: window.scrollX, y: window.scrollY },
  };

  // Check for specific view indicators
  const indicators = {
    meeting_view: !!document.querySelector(
      '[class*="meeting"], [id*="meeting"]'
    ),
    classroom_view: !!document.querySelector(
      '[class*="classroom"], [id*="classroom"]'
    ),
    modal_container: !!document.querySelector(
      '[class*="modal-container"], [data-modal-root]'
    ),
    react_portal: !!document.querySelector("[data-react-portal]"),
  };

  console.log("View context:", context);
  console.log("View indicators:", indicators);

  return { context, indicators };
}

// Test 5: Simulate React state changes (if possible)
function simulateModalOpen() {
  console.log("=== SIMULATING MODAL OPEN ===");

  // Try to find React debug buttons or triggers
  const debugButtons = document.querySelectorAll(
    'button[class*="debug"], button[onclick*="modal"]'
  );
  console.log("Debug buttons found:", debugButtons.length);

  // Try to trigger existing modal function if available
  if (window.handleOpenCreateMeetingModal) {
    console.log("Found handleOpenCreateMeetingModal function");
    window.handleOpenCreateMeetingModal("test-id", "Test Classroom");
  } else {
    console.log("handleOpenCreateMeetingModal not found in global scope");
  }

  // Look for create meeting buttons
  const createButtons = Array.from(document.querySelectorAll("button")).filter(
    (btn) =>
      btn.textContent.includes("Tạo phòng học") ||
      btn.textContent.includes("Create")
  );
  console.log("Create buttons found:", createButtons.length);
  createButtons.forEach((btn, index) => {
    console.log(`Button ${index}:`, btn.textContent, btn.onclick);
  });
}

// Run all tests
function runAllTests() {
  console.log("🚀 RUNNING ALL MODAL DEBUG TESTS");
  console.log("=".repeat(50));

  const results = {
    modalStates: checkModalStates(),
    zIndexContext: checkZIndexContext(),
    viewContext: checkViewContext(),
  };

  console.log("=".repeat(50));
  console.log("📊 TEST RESULTS SUMMARY:", results);
  console.log("=".repeat(50));

  // Create test modal after checks
  setTimeout(() => {
    createTestModal();
  }, 1000);

  // Try simulation after test modal
  setTimeout(() => {
    simulateModalOpen();
  }, 2000);

  return results;
}

// Auto-run tests
console.log("🔍 Modal debug script loaded. Available functions:");
console.log("- runAllTests() - Run all debug tests");
console.log("- createTestModal() - Create visual test modal");
console.log("- checkModalStates() - Check existing modal states");
console.log("- checkZIndexContext() - Check z-index stacking");
console.log("- checkViewContext() - Check current view context");
console.log("- simulateModalOpen() - Try to trigger modal");
console.log("");
console.log("🚀 Auto-running tests in 2 seconds...");

setTimeout(runAllTests, 2000);
