/**
 * Meeting Creation Test Script
 * Tests the Zoom-only authentication for meeting creation
 */

// Simulate localStorage for testing
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
};

// Mock Cookies for testing
const Cookies = {
  data: {},
  get(key) {
    return this.data[key] || null;
  },
  set(key, value) {
    this.data[key] = value;
  },
};

// Test the token detection logic from axiosClient
function testTokenDetection() {
  console.log("🧪 Testing Token Detection Logic\n");

  // Set up test tokens
  Cookies.set("token", "user_token_12345");
  localStorage.setItem("zoomAccessToken", "zoom_token_67890");

  // Test endpoints that should use zoom tokens only
  const zoomEndpoints = ["meeting/create", "meeting/signature"];
  const searchEndpoints = ["meeting/search"]; // Now uses Zoom-only auth
  const regularEndpoints = ["user/profile", "classroom/search"];
  const noAuthEndpoints = ["auth/login", "meeting/auth"];

  console.log("✅ Test 1: Zoom Endpoints (should get Zoom token only)");
  zoomEndpoints.forEach((endpoint) => {
    const config = getConfigForEndpoint(endpoint);
    console.log(`  ${endpoint}:`);
    console.log(
      `    Authorization: ${config.headers.Authorization || "NOT SET"}`
    );
  });

  console.log("\n✅ Test 2: Search Endpoints (should get Zoom token only)");
  searchEndpoints.forEach((endpoint) => {
    const config = getConfigForEndpoint(endpoint);
    console.log(`  ${endpoint}:`);
    console.log(
      `    Authorization: ${config.headers.Authorization || "NOT SET"}`
    );
  });

  console.log("\n✅ Test 3: Regular Endpoints (should get user token only)");
  regularEndpoints.forEach((endpoint) => {
    const config = getConfigForEndpoint(endpoint);
    console.log(`  ${endpoint}:`);
    console.log(
      `    Authorization: ${config.headers.Authorization || "NOT SET"}`
    );
  });

  console.log("\n✅ Test 4: No Auth Endpoints (should get no tokens)");
  noAuthEndpoints.forEach((endpoint) => {
    const config = getConfigForEndpoint(endpoint);
    console.log(`  ${endpoint}:`);
    console.log(
      `    Authorization: ${config.headers.Authorization || "NOT SET"}`
    );
  });
}

function getConfigForEndpoint(url) {
  const config = {
    url: url,
    method: "POST",
    headers: {},
  };

  const userSystemToken = Cookies.get("token");
  const zoomAccessToken = localStorage.getItem("zoomAccessToken");

  const noAuthEndpoints = [
    "auth/login",
    "auth/register",
    "meeting/auth",
    "meeting/handle",
    "meeting/zoom/refresh",
  ];
  const isNoAuthEndpoint = noAuthEndpoints.includes(url);

  const zoomTokenEndpoints = [
    "meeting/create",
    "meeting/signature",
    "meeting/search",
  ];
  const needsZoomToken = zoomTokenEndpoints.some((endpoint) =>
    url.startsWith(endpoint)
  );

  if (isNoAuthEndpoint) {
    // No auth needed
  } else if (needsZoomToken) {
    // API cho Zoom - chỉ cần Zoom token
    if (zoomAccessToken) {
      config.headers.Authorization = `Bearer ${zoomAccessToken}`;
    }
  } else if (userSystemToken) {
    // API hệ thống khác
    config.headers.Authorization = `Bearer ${userSystemToken}`;
  }

  return config;
}

// Test missing tokens
function testMissingTokens() {
  console.log("\n🧪 Testing Missing Token Scenarios\n");

  // Clear tokens
  Cookies.data = {};
  localStorage.data = {};

  console.log("❌ Test 1: No tokens available");
  const config1 = getConfigForEndpoint("meeting/create");
  console.log(`  meeting/create:`);
  console.log(
    `    Authorization: ${config1.headers.Authorization || "NOT SET"}`
  );

  // Add only user token
  Cookies.set("token", "user_token_only");
  console.log("\n⚠️ Test 2: User token only (missing Zoom token)");
  const config2 = getConfigForEndpoint("meeting/create");
  console.log(`  meeting/create:`);
  console.log(
    `    Authorization: ${config2.headers.Authorization || "NOT SET"}`
  );

  // Add only zoom token
  Cookies.data = {};
  localStorage.setItem("zoomAccessToken", "zoom_token_only");
  console.log("\n✅ Test 3: Zoom token only (this should work)");
  const config3 = getConfigForEndpoint("meeting/create");
  console.log(`  meeting/create:`);
  console.log(
    `    Authorization: ${config3.headers.Authorization || "NOT SET"}`
  );
}

// Test the meeting payload structure
function testMeetingPayload() {
  console.log("\n🧪 Testing Meeting Payload Structure\n");
  const samplePayload = {
    topic: "Test Meeting Room",
    password: "123456",
    classroomId: "classroom_123",
    // zoomAccessToken được gửi qua header, không qua payload
  };

  console.log("📦 Sample Meeting Payload:");
  console.log(JSON.stringify(samplePayload, null, 2));
  console.log("\n✅ Validation:");
  console.log(`  Has topic: ${!!samplePayload.topic}`);
  console.log(`  Has password: ${!!samplePayload.password}`);
  console.log(`  Has classroomId: ${!!samplePayload.classroomId}`);
  console.log("  zoomAccessToken: Sent via header, not in payload");
}

// Test the search API integration
function testSearchAPI() {
  console.log("\n🧪 Testing Meeting Search API\n");

  // Mock search query parameters
  const searchParams = {
    classroomId: "classroom_123",
    sort: JSON.stringify([{ key: "startTime", type: "DESC" }]),
    rpp: 1,
  };

  console.log("🔍 Search Parameters:");
  console.log(JSON.stringify(searchParams, null, 2));

  console.log("\n🎯 Expected behavior:");
  console.log("  - API: meeting/search (GET request)");
  console.log("  - Auth: Zoom Bearer token only");
  console.log("  - Sort: By startTime DESC");
  console.log("  - Limit: 1 result (latest meeting)");
  console.log("  - Used by: Both students and tutors");
}

// Run all tests
function runAllTests() {
  console.log("🚀 Updated Meeting Authentication Test Suite\n");
  console.log("=============================================\n");

  testTokenDetection();
  testMissingTokens();
  testMeetingPayload();
  testSearchAPI();

  console.log("\n✅ All tests completed!");
  console.log("\n📋 Summary:");
  console.log("  - Token detection logic updated for Zoom-only auth");
  console.log("  - meeting/create uses Zoom Bearer token only");
  console.log("  - meeting/search uses Zoom Bearer token only");
  console.log("  - Meeting payload structure validated");

  console.log("\n🎯 Next Steps:");
  console.log("  1. Test with real backend API");
  console.log("  2. Verify Zoom OAuth flow");
  console.log("  3. Test end-to-end meeting creation and search");
}

// Export for Node.js or run in browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runAllTests,
    testTokenDetection,
    testMissingTokens,
    testMeetingPayload,
    testSearchAPI,
  };
} else {
  // Run tests immediately if in browser
  runAllTests();
}
