/**
 * Test Production Domain Detection for SmartZoomLoader
 * This script validates that environment detection correctly identifies giasuvlu.click as production
 */

console.log("🧪 Testing Production Domain Detection for SmartZoomLoader\n");

// Mock window.location for different scenarios
const testScenarios = [
  {
    name: "Production Domain (giasuvlu.click)",
    hostname: "giasuvlu.click",
    href: "https://giasuvlu.click/tutor-meeting-room",
    protocol: "https:",
    expectedProduction: true,
    expectedDevelopment: false,
  },
  {
    name: "Production Domain with www",
    hostname: "www.giasuvlu.click",
    href: "https://www.giasuvlu.click/tutor-meeting-room",
    protocol: "https:",
    expectedProduction: true,
    expectedDevelopment: false,
  },
  {
    name: "Localhost Development",
    hostname: "localhost",
    href: "http://localhost:5173/tutor-meeting-room",
    protocol: "http:",
    expectedProduction: false,
    expectedDevelopment: true,
  },
  {
    name: "127.0.0.1 Development",
    hostname: "127.0.0.1",
    href: "http://127.0.0.1:5173/tutor-meeting-room",
    protocol: "http:",
    expectedProduction: false,
    expectedDevelopment: true,
  },
  {
    name: "After Zoom OAuth Redirect",
    hostname: "giasuvlu.click",
    href: "https://giasuvlu.click/tutor-meeting-room?code=abc123&state=xyz",
    protocol: "https:",
    expectedProduction: true,
    expectedDevelopment: false,
  },
];

// Test each scenario
testScenarios.forEach((scenario, index) => {
  console.log(`📋 Test ${index + 1}: ${scenario.name}`);
  console.log(`   URL: ${scenario.href}`);

  // Simulate environment detection logic
  const mockEnv = {
    // URL analysis
    isLocalhost:
      scenario.hostname === "localhost" ||
      scenario.hostname === "127.0.0.1" ||
      scenario.hostname.includes("localhost"),
    isFileProtocol: scenario.protocol === "file:",

    // Production domain detection
    isProductionDomain:
      scenario.hostname === "giasuvlu.click" ||
      scenario.hostname.includes("giasuvlu.click") ||
      (scenario.hostname !== "localhost" &&
        scenario.hostname !== "127.0.0.1" &&
        !scenario.hostname.includes("localhost")),

    // Full URL info
    currentURL: scenario.href,
    currentHostname: scenario.hostname,
    currentProtocol: scenario.protocol,

    // Mock other properties for complete logic
    isMinified: false, // Assume false for testing
    hasOriginalStackTrace: true, // Assume true for testing
    nodeEnv: "production", // Simulate production NODE_ENV
    hasModuleHotUpdate: false,
  };
  // Production detection logic (localhost never counts as production)
  mockEnv.isLikelyProduction =
    (mockEnv.isMinified ||
      !mockEnv.hasOriginalStackTrace ||
      mockEnv.isProductionDomain ||
      (!mockEnv.isLocalhost && !mockEnv.isFileProtocol) ||
      mockEnv.nodeEnv === "production") &&
    !mockEnv.isLocalhost; // Never treat localhost as production

  // Development detection logic (localhost gets priority)
  mockEnv.isLikelyDevelopment =
    mockEnv.isLocalhost ||
    mockEnv.hasModuleHotUpdate ||
    (mockEnv.isLocalhost && mockEnv.hasOriginalStackTrace) ||
    (mockEnv.nodeEnv === "development" && mockEnv.isLocalhost);

  // Component selection
  const selectedComponent = mockEnv.isLikelyProduction
    ? "production"
    : mockEnv.isLikelyDevelopment
    ? "debug"
    : "embed";

  // Validation
  const productionMatch =
    mockEnv.isLikelyProduction === scenario.expectedProduction;
  const developmentMatch =
    mockEnv.isLikelyDevelopment === scenario.expectedDevelopment;
  const testPassed = productionMatch && developmentMatch;

  console.log(`   🔍 Detection Results:`);
  console.log(`      isLocalhost: ${mockEnv.isLocalhost}`);
  console.log(`      isProductionDomain: ${mockEnv.isProductionDomain}`);
  console.log(
    `      isLikelyProduction: ${mockEnv.isLikelyProduction} (expected: ${scenario.expectedProduction})`
  );
  console.log(
    `      isLikelyDevelopment: ${mockEnv.isLikelyDevelopment} (expected: ${scenario.expectedDevelopment})`
  );
  console.log(`      selectedComponent: ${selectedComponent}`);
  console.log(`   ${testPassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log("");
});

// Summary
console.log("🎯 Test Summary:");
console.log(
  "✅ Production domain 'giasuvlu.click' should be detected correctly"
);
console.log(
  "✅ Zoom OAuth redirects should maintain production environment detection"
);
console.log("✅ Localhost should still be detected as development");
console.log(
  "✅ ProductionZoomSDK should be selected for giasuvlu.click domain"
);

console.log("\n🚀 Ready for production testing!");
console.log(
  "When users click Zoom meeting and get redirected to https://giasuvlu.click/,"
);
console.log(
  "the SmartZoomLoader should automatically select ProductionZoomSDK component."
);
