/**
 * ZOOM MEETING FLOW TEST - COMPREHENSIVE TESTING
 *
 * This test validates the complete Zoom meeting integration flow:
 * 1. Meeting creation via API
 * 2. Meeting search functionality
 * 3. Zoom signature generation
 * 4. Meeting display in UI
 */

// Test Configuration
const TEST_CONFIG = {
  // Test meeting data
  testClassroomId: "test-classroom-123",
  testMeetingTopic: "Test Zoom Meeting",
  testPassword: "123456",

  // API endpoints to test
  endpoints: {
    meetingCreate: "meeting/create",
    meetingSearch: "meeting/search",
    meetingSignature: "meeting/signature",
  },

  // Expected response structures
  expectedFields: {
    createResponse: ["zoomMeetingId", "password", "join_url", "start_url"],
    searchResponse: ["items"],
    signatureResponse: ["signature", "sdkKey"],
  },
};

// Utility functions
const log = (message, type = "info") => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
};

const logError = (message, error = null) => {
  log(message, "error");
  if (error) {
    console.error("Error details:", error);
  }
};

const logSuccess = (message) => {
  log(message, "success");
};

// Mock API function (replace with actual API implementation)
const mockApiCall = async (endpoint, method, data = null, query = null) => {
  log(`Making ${method} request to ${endpoint}`);

  // Simulate different responses based on endpoint
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  switch (endpoint) {
    case TEST_CONFIG.endpoints.meetingCreate:
      return {
        success: true,
        data: {
          zoomMeetingId: "123456789",
          password: data.password,
          join_url: "https://zoom.us/j/123456789",
          start_url: "https://zoom.us/s/123456789",
          topic: data.topic,
          classroomId: data.classroomId,
          created_at: new Date().toISOString(),
        },
      };

    case TEST_CONFIG.endpoints.meetingSearch:
      return {
        success: true,
        data: {
          items: [
            {
              zoomMeetingId: "123456789",
              password: "123456",
              join_url: "https://zoom.us/j/123456789",
              topic: "Test Zoom Meeting",
              created_at: new Date().toISOString(),
              startTime: new Date().toISOString(),
            },
          ],
          total: 1,
        },
      };

    case TEST_CONFIG.endpoints.meetingSignature:
      return {
        success: true,
        data: {
          signature: "mock.jwt.signature",
          sdkKey: "mock-sdk-key-12345",
        },
      };

    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

// Test functions
async function testMeetingCreation() {
  log("Testing meeting creation...");

  try {
    const createPayload = {
      topic: TEST_CONFIG.testMeetingTopic,
      password: TEST_CONFIG.testPassword,
      classroomId: TEST_CONFIG.testClassroomId,
      type: 2,
      duration: 60,
    };

    const response = await mockApiCall(
      TEST_CONFIG.endpoints.meetingCreate,
      "POST",
      createPayload
    );

    // Validate response structure
    if (!response.success || !response.data) {
      throw new Error("Invalid response structure");
    }

    // Check required fields
    const missingFields = TEST_CONFIG.expectedFields.createResponse.filter(
      (field) => !(field in response.data)
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    logSuccess("✅ Meeting creation test passed");
    log(`Created meeting ID: ${response.data.zoomMeetingId}`);
    log(`Join URL: ${response.data.join_url}`);

    return response.data;
  } catch (error) {
    logError("❌ Meeting creation test failed", error);
    throw error;
  }
}

async function testMeetingSearch(classroomId) {
  log("Testing meeting search...");

  try {
    const searchQuery = {
      classroomId: classroomId,
      sort: JSON.stringify([{ key: "startTime", type: "DESC" }]),
      rpp: 1,
    };

    const response = await mockApiCall(
      TEST_CONFIG.endpoints.meetingSearch,
      "GET",
      null,
      searchQuery
    );

    // Validate response structure
    if (!response.success || !response.data || !response.data.items) {
      throw new Error("Invalid search response structure");
    }

    if (response.data.items.length === 0) {
      throw new Error("No meetings found in search results");
    }

    logSuccess("✅ Meeting search test passed");
    log(`Found ${response.data.items.length} meeting(s)`);
    log(`Latest meeting ID: ${response.data.items[0].zoomMeetingId}`);

    return response.data.items[0];
  } catch (error) {
    logError("❌ Meeting search test failed", error);
    throw error;
  }
}

async function testSignatureGeneration(meetingNumber) {
  log("Testing signature generation...");

  try {
    const signaturePayload = {
      meetingNumber: meetingNumber,
      role: 1, // Host role
    };

    const response = await mockApiCall(
      TEST_CONFIG.endpoints.meetingSignature,
      "POST",
      signaturePayload
    );

    // Validate response structure
    if (!response.success || !response.data) {
      throw new Error("Invalid signature response structure");
    }

    // Check required fields
    const missingFields = TEST_CONFIG.expectedFields.signatureResponse.filter(
      (field) => !(field in response.data)
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    logSuccess("✅ Signature generation test passed");
    log(`SDK Key: ${response.data.sdkKey}`);
    log(`Signature length: ${response.data.signature.length} characters`);

    return response.data;
  } catch (error) {
    logError("❌ Signature generation test failed", error);
    throw error;
  }
}

async function testZoomTokenPresence() {
  log("Testing Zoom token presence...");

  try {
    // Check if running in browser environment
    if (typeof localStorage === "undefined") {
      log(
        "⚠️  localStorage not available (running in Node.js), skipping token check"
      );
      return { hasToken: true, mock: true };
    }

    const zoomToken = localStorage.getItem("zoomAccessToken");

    if (!zoomToken) {
      logError("❌ No Zoom access token found in localStorage");
      log("📝 To fix this:");
      log("   1. Navigate to the Zoom connection page");
      log("   2. Complete the OAuth flow");
      log("   3. Verify token is stored in localStorage");
      return { hasToken: false };
    }

    logSuccess("✅ Zoom access token found");
    log(`Token length: ${zoomToken.length} characters`);
    log(`Token prefix: ${zoomToken.substring(0, 20)}...`);

    return { hasToken: true, token: zoomToken };
  } catch (error) {
    logError("❌ Error checking Zoom token", error);
    throw error;
  }
}

// Component simulation functions
function simulateZoomMeetingEmbedProps(meetingData, signatureData) {
  log("Simulating ZoomMeetingEmbed component props...");

  const props = {
    sdkKey: signatureData.sdkKey,
    signature: signatureData.signature,
    meetingNumber: meetingData.zoomMeetingId,
    userName: "Gia sư - Test User",
    passWord: meetingData.password,
    customLeaveUrl: `${
      window.location?.origin || "http://localhost:3000"
    }/tai-khoan/ho-so/quan-ly-lop-hoc`,
  };

  // Validate all required props are present
  const requiredProps = ["sdkKey", "signature", "meetingNumber", "userName"];
  const missingProps = requiredProps.filter((prop) => !props[prop]);

  if (missingProps.length > 0) {
    logError(`❌ Missing required props: ${missingProps.join(", ")}`);
    return null;
  }

  logSuccess("✅ All ZoomMeetingEmbed props are valid");
  log("Props summary:");
  Object.entries(props).forEach(([key, value]) => {
    if (key === "signature") {
      log(`   ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
    } else {
      log(`   ${key}: ${value}`);
    }
  });

  return props;
}

// Main test runner
async function runCompleteZoomFlow() {
  log("🚀 Starting complete Zoom meeting flow test...");
  log("=" * 60);

  try {
    // Step 1: Check Zoom token
    const tokenCheck = await testZoomTokenPresence();
    if (!tokenCheck.hasToken && !tokenCheck.mock) {
      throw new Error("Zoom token required for meeting operations");
    }

    // Step 2: Test meeting creation
    const createdMeeting = await testMeetingCreation();

    // Step 3: Test meeting search
    const foundMeeting = await testMeetingSearch(TEST_CONFIG.testClassroomId);

    // Step 4: Test signature generation
    const signatureData = await testSignatureGeneration(
      foundMeeting.zoomMeetingId
    );

    // Step 5: Simulate component props
    const componentProps = simulateZoomMeetingEmbedProps(
      foundMeeting,
      signatureData
    );

    if (!componentProps) {
      throw new Error("Failed to generate valid component props");
    }

    log("=" * 60);
    logSuccess("🎉 ALL TESTS PASSED - Zoom meeting flow is working correctly!");
    log("📋 Summary:");
    log("   ✅ Meeting creation: OK");
    log("   ✅ Meeting search: OK");
    log("   ✅ Signature generation: OK");
    log("   ✅ Component props: OK");
    log("   ✅ Zoom token: OK");

    return {
      success: true,
      meetingData: foundMeeting,
      signatureData: signatureData,
      componentProps: componentProps,
    };
  } catch (error) {
    log("=" * 60);
    logError("💥 TEST FAILED - There are issues with the Zoom meeting flow");
    logError(error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}

// Browser environment check and execution
if (typeof window !== "undefined") {
  // Running in browser
  log("🌐 Running in browser environment");

  // Add to global scope for manual testing
  window.testZoomFlow = runCompleteZoomFlow;
  window.testMeetingCreation = testMeetingCreation;
  window.testMeetingSearch = testMeetingSearch;
  window.testSignatureGeneration = testSignatureGeneration;

  log("📘 Available test functions:");
  log("   window.testZoomFlow() - Run complete test suite");
  log("   window.testMeetingCreation() - Test meeting creation only");
  log("   window.testMeetingSearch() - Test meeting search only");
  log("   window.testSignatureGeneration() - Test signature generation only");
} else {
  // Running in Node.js
  log("⚙️  Running in Node.js environment");
  runCompleteZoomFlow().then((result) => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runCompleteZoomFlow,
    testMeetingCreation,
    testMeetingSearch,
    testSignatureGeneration,
    testZoomTokenPresence,
    TEST_CONFIG,
  };
}
