// Test script để debug GET body data issue
// Paste vào Console khi load main app

console.log("🔧 API GET Body Debug Script");

// 1. Test API Logger trực tiếp
function testAPILoggerDirect() {
  console.log("\n🧪 Testing API Logger Direct...");

  if (window.apiLogger) {
    const testData = {
      classroomId: "test_classroom_123",
      userId: "test_user_456",
    };

    const testQuery = {
      page: 1,
      limit: 10,
    };

    console.log("📤 Test data:", testData);
    console.log("📋 Test query:", testQuery);

    const requestId = window.apiLogger.logRequest(
      "GET",
      "http://localhost:5174/api/test/get-with-body",
      testData,
      testQuery
    );

    console.log("✅ API Logger test completed. RequestId:", requestId);
    console.log("🔍 Check console above for logging output");

    return requestId;
  } else {
    console.log("❌ window.apiLogger not found");
    return null;
  }
}

// 2. Test axios GET with body trực tiếp
async function testAxiosGetWithBody() {
  console.log("\n🧪 Testing Axios GET with Body...");

  const testUrl = "https://httpbin.org/anything"; // Echo service for testing
  const testData = {
    classroomId: "test_classroom_999",
    action: "search-for-user",
  };

  try {
    console.log("📤 Sending GET request with body data...");
    console.log("🔗 URL:", testUrl);
    console.log("📄 Data:", testData);

    // Test với axios.get và config.data
    const response = await axios.get(testUrl, {
      data: testData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response received:");
    console.log("📊 Status:", response.status);
    console.log("📄 Data:", response.data);

    // Kiểm tra xem body data có được gửi không
    if (response.data && response.data.data) {
      console.log("🔍 Body data in request:", response.data.data);
    } else {
      console.log("⚠️ No body data found in echo response");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Axios GET with body failed:", error);
    return null;
  }
}

// 3. Test API function với GET body
async function testAPIFunctionGetBody() {
  console.log("\n🧪 Testing API Function GET with Body...");

  if (typeof Api !== "undefined") {
    const testData = {
      classroomId: "test_api_function_123",
    };

    try {
      console.log("📤 Testing API function...");
      console.log("📄 Data:", testData);

      // Test với API function (sẽ fail vì endpoint không tồn tại, nhưng sẽ log)
      const response = await Api({
        endpoint: "test/get-with-body",
        method: "GET",
        data: testData,
        requireToken: false,
      });

      console.log("✅ API function response:", response);
      return response;
    } catch (error) {
      console.log(
        "❌ API function failed (expected for test endpoint):",
        error.message
      );
      console.log("🔍 But check API Logger output above");
      return null;
    }
  } else {
    console.log("❌ Api function not found");
    return null;
  }
}

// 4. Test real meeting API call
async function testRealMeetingAPI() {
  console.log("\n🧪 Testing Real Meeting API...");

  const testData = {
    classroomId: "classroom_real_test",
  };

  try {
    console.log("📤 Testing real meeting/get-meeting API...");
    console.log("📄 Data:", testData);

    if (typeof Api !== "undefined") {
      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: "GET",
        data: testData,
        requireToken: true,
      });

      console.log("✅ Meeting API response:", response);
      return response;
    } else {
      console.log("❌ Api function not available");
      return null;
    }
  } catch (error) {
    console.log("❌ Meeting API failed:", error.message);
    console.log('🔍 Check if this is the "missing classroomId" error');
    console.log("📊 Error details:", error);
    return null;
  }
}

// 5. Manual check axios config for GET with body
function checkAxiosGetBodySupport() {
  console.log("\n🔍 Checking Axios GET Body Support...");

  console.log("📋 Axios version:", axios.VERSION || "Unknown");

  // Test manual axios config
  const config = {
    method: "GET",
    url: "https://httpbin.org/anything",
    data: { test: "body data" },
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log("🔧 Test config:", config);

  // Kiểm tra xem axios có chấp nhận config này không
  try {
    const request = axios.request(config);
    console.log("✅ Axios accepts GET with body config");
    return true;
  } catch (error) {
    console.log("❌ Axios rejects GET with body config:", error.message);
    return false;
  }
}

// 6. Main test function
async function runAllTests() {
  console.log("🚀 Starting API GET Body Debug Tests...");
  console.log("=====================================");

  // Test 1: API Logger Direct
  testAPILoggerDirect();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Axios GET Body Support
  checkAxiosGetBodySupport();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Axios GET with Body
  await testAxiosGetWithBody();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 4: API Function GET Body
  await testAPIFunctionGetBody();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 5: Real Meeting API
  await testRealMeetingAPI();

  console.log("=====================================");
  console.log("🏁 All tests completed!");
  console.log("📊 Check console output above for results");
}

// Export functions to window for manual testing
window.debugAPIGetBody = {
  testAPILoggerDirect,
  testAxiosGetWithBody,
  testAPIFunctionGetBody,
  testRealMeetingAPI,
  checkAxiosGetBodySupport,
  runAllTests,
};

console.log("✅ API GET Body Debug Script loaded!");
console.log("🎯 Available functions:");
console.log("- debugAPIGetBody.testAPILoggerDirect()");
console.log("- debugAPIGetBody.testAxiosGetWithBody()");
console.log("- debugAPIGetBody.testAPIFunctionGetBody()");
console.log("- debugAPIGetBody.testRealMeetingAPI()");
console.log("- debugAPIGetBody.checkAxiosGetBodySupport()");
console.log("- debugAPIGetBody.runAllTests()");
console.log("");
console.log("💡 Run debugAPIGetBody.runAllTests() to test everything");
