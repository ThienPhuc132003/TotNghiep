// Debug script để test axios GET với body data
// Paste vào Console để test

console.log("🔧 Testing Axios GET with Body Data - Multiple Methods");

// Test 1: axios.get với config.data (cách cũ - có thể không work)
async function testAxiosGetWithConfigData() {
  console.log("\n🧪 Test 1: axios.get với config.data");

  try {
    const response = await axios.get("https://httpbin.org/anything", {
      data: { classroomId: "test123" },
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Success:", response.status);
    console.log("📊 Request Body Received:", response.data.data);
    console.log("🔍 Full Response:", response.data);

    return { success: true, data: response.data };
  } catch (error) {
    console.log("❌ Failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: axios.request với method GET (cách mới - đúng)
async function testAxiosRequestWithMethodGET() {
  console.log("\n🧪 Test 2: axios.request với method GET");

  try {
    const response = await axios.request({
      method: "GET",
      url: "https://httpbin.org/anything",
      data: { classroomId: "test123" },
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Success:", response.status);
    console.log("📊 Request Body Received:", response.data.data);
    console.log("🔍 Full Response:", response.data);

    return { success: true, data: response.data };
  } catch (error) {
    console.log("❌ Failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: axios() với config object (cách khác)
async function testAxiosConfigObject() {
  console.log("\n🧪 Test 3: axios() với config object");

  try {
    const response = await axios({
      method: "GET",
      url: "https://httpbin.org/anything",
      data: { classroomId: "test123" },
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Success:", response.status);
    console.log("📊 Request Body Received:", response.data.data);
    console.log("🔍 Full Response:", response.data);

    return { success: true, data: response.data };
  } catch (error) {
    console.log("❌ Failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Test 4: Test với API thật (nếu có token)
async function testRealMeetingAPI() {
  console.log("\n🧪 Test 4: Test với API meeting/get-meeting thật");

  if (typeof Api === "undefined") {
    console.log("❌ Api function not available");
    return { success: false, error: "Api function not found" };
  }

  try {
    const response = await Api({
      endpoint: "meeting/get-meeting",
      method: "GET",
      data: { classroomId: "test-classroom-id" },
      requireToken: true,
    });

    console.log("✅ Success:", response);
    return { success: true, data: response };
  } catch (error) {
    console.log("❌ Failed:", error.message);
    console.log("📊 Error Details:", error.response?.data);
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
}

// Main test function
async function runAllAxiosTests() {
  console.log("🚀 Starting Axios GET Body Tests...");
  console.log("=====================================");

  const results = {};

  // Test 1
  results.configData = await testAxiosGetWithConfigData();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2
  results.requestMethod = await testAxiosRequestWithMethodGET();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3
  results.configObject = await testAxiosConfigObject();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 4
  results.realAPI = await testRealMeetingAPI();

  console.log("=====================================");
  console.log("🏁 All tests completed!");
  console.log("📊 Summary:");
  console.table(
    Object.entries(results).map(([test, result]) => ({
      Test: test,
      Success: result.success,
      Error: result.error || "None",
    }))
  );

  return results;
}

// Export to window
window.debugAxiosGetBody = {
  testAxiosGetWithConfigData,
  testAxiosRequestWithMethodGET,
  testAxiosConfigObject,
  testRealMeetingAPI,
  runAllAxiosTests,
};

console.log("✅ Axios GET Body Debug Script loaded!");
console.log("🎯 Available functions:");
console.log("- debugAxiosGetBody.testAxiosGetWithConfigData()");
console.log("- debugAxiosGetBody.testAxiosRequestWithMethodGET()");
console.log("- debugAxiosGetBody.testAxiosConfigObject()");
console.log("- debugAxiosGetBody.testRealMeetingAPI()");
console.log("- debugAxiosGetBody.runAllAxiosTests()");
console.log("");
console.log("💡 Run debugAxiosGetBody.runAllAxiosTests() to test all methods");
console.log(
  "🔍 httpbin.org will echo back the request to show if body data was sent"
);
