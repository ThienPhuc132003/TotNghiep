/**
 * TEST UTILITY: Meeting Creation Debug
 *
 * This tool helps debug the meeting/create API call issue
 * Run in browser console on the tutor classroom page
 */

// Test meeting creation API directly
window.testMeetingCreation = async function (
  classroomId = "test-classroom-123"
) {
  console.log("🧪 Testing meeting creation API...");

  // Check tokens
  const userToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  const zoomToken = localStorage.getItem("zoomAccessToken");

  console.log("📝 Token Status:");
  console.log("- User token:", userToken ? "✅ Available" : "❌ Missing");
  console.log("- Zoom token:", zoomToken ? "✅ Available" : "❌ Missing");

  if (!zoomToken) {
    console.error("❌ No Zoom token found. Please connect Zoom first.");
    return false;
  }

  try {
    // Test with fetch to see raw response
    console.log("🌐 Making direct API call...");

    const response = await fetch("/api/meeting/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken?.split("=")[1] || ""}`,
        "X-Zoom-Token": `Bearer ${zoomToken}`,
        "X-Require-Token": "true",
      },
      body: JSON.stringify({
        topic: "Test Meeting from Debug Tool",
        password: "123456",
        classroomId: classroomId,
        zoomAccessToken: zoomToken,
      }),
    });

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📡 Raw response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("📡 Parsed response:", responseData);
    } catch (e) {
      console.log("📡 Response is not JSON:", responseText);
      return false;
    }

    if (response.ok && responseData.success) {
      console.log("✅ Meeting creation successful!");
      return responseData;
    } else {
      console.error(
        "❌ Meeting creation failed:",
        responseData.message || responseData
      );
      return false;
    }
  } catch (error) {
    console.error("❌ API call error:", error);
    return false;
  }
};

// Test different token configurations
window.testTokenConfigurations = async function () {
  console.log("🔑 Testing different token configurations...");

  const userToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  const zoomToken = localStorage.getItem("zoomAccessToken");

  const configurations = [
    {
      name: "User token in Authorization header",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: {
        topic: "Test 1",
        password: "123456",
        classroomId: "test-123",
        zoomAccessToken: zoomToken,
      },
    },
    {
      name: "Zoom token in Authorization header",
      headers: {
        Authorization: `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: {
        topic: "Test 2",
        password: "123456",
        classroomId: "test-123",
      },
    },
    {
      name: "Both tokens in headers",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "X-Zoom-Token": `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: {
        topic: "Test 3",
        password: "123456",
        classroomId: "test-123",
      },
    },
    {
      name: "Zoom token in body only",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: {
        topic: "Test 4",
        password: "123456",
        classroomId: "test-123",
        zoomAccessToken: zoomToken,
      },
    },
  ];

  for (const config of configurations) {
    console.log(`\n🧪 Testing: ${config.name}`);

    try {
      const response = await fetch("/api/meeting/create", {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify(config.body),
      });

      console.log(`Status: ${response.status}`);

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        console.log(`✅ Success with "${config.name}":`, data);
        return config;
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed with "${config.name}":`, errorText);
      }
    } catch (error) {
      console.log(`❌ Error with "${config.name}":`, error.message);
    }
  }

  return null;
};

// Check API endpoint availability
window.checkMeetingAPIEndpoints = async function () {
  console.log("🔍 Checking meeting API endpoints...");

  const endpoints = [
    { path: "/api/meeting/auth", method: "GET" },
    { path: "/api/meeting/create", method: "POST" },
    { path: "/api/meeting/get-meeting", method: "POST" },
    { path: "/api/meeting/signature", method: "POST" },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: endpoint.method === "POST" ? JSON.stringify({}) : undefined,
      });

      console.log(`${endpoint.method} ${endpoint.path}: ${response.status}`);
    } catch (error) {
      console.log(
        `${endpoint.method} ${endpoint.path}: ERROR - ${error.message}`
      );
    }
  }
};

// Auto-run basic checks
console.log("🚀 Meeting Creation Debug Tool Loaded");
console.log("\nAvailable commands:");
console.log("- testMeetingCreation(classroomId)");
console.log("- testTokenConfigurations()");
console.log("- checkMeetingAPIEndpoints()");

// Auto-check tokens
const userToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("token="));
const zoomToken = localStorage.getItem("zoomAccessToken");

console.log("\n📋 Current Status:");
console.log("User Token:", userToken ? "✅ Available" : "❌ Missing");
console.log("Zoom Token:", zoomToken ? "✅ Available" : "❌ Missing");

if (!zoomToken) {
  console.log("\n⚠️ No Zoom token found. To get one:");
  console.log("1. Go to tutor classroom page");
  console.log("2. Click 'Tạo phòng học' without Zoom connection");
  console.log("3. Complete Zoom OAuth flow");
  console.log("4. Return to this page and run tests");
}
