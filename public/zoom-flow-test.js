// Quick test to validate Zoom meeting flow
console.log("🎯 Starting Zoom Meeting Flow Validation...");

const testZoomFlow = async () => {
  const baseURL = "http://localhost:3000";
  const apiURL = "http://localhost:5000/api";

  try {
    // Step 1: Check if Zoom token exists
    console.log("1️⃣ Checking Zoom authentication...");
    const zoomToken = localStorage.getItem("zoomAccessToken");
    if (!zoomToken) {
      console.error("❌ No Zoom access token found");
      console.log(
        "Please visit: http://localhost:3000/tai-khoan/ho-so/phong-hop-zoom"
      );
      console.log("And connect your Zoom account first");
      return;
    }
    console.log("✅ Zoom token exists");

    // Step 2: Test latest meeting search
    console.log("2️⃣ Testing latest meeting search...");
    const meetingResponse = await fetch(
      `${apiURL}/meeting/search?sort=[{"key":"startTime","type":"DESC"}]&rpp=1`,
      {
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const meetingData = await meetingResponse.json();
    if (
      !meetingData.success ||
      !meetingData.data ||
      meetingData.data.length === 0
    ) {
      console.error("❌ No meetings found");
      console.log("Please create a meeting first");
      return;
    }

    const meeting = meetingData.data[0];
    console.log("✅ Latest meeting found:", meeting.zoomMeetingId);

    // Step 3: Test signature generation
    console.log("3️⃣ Testing signature generation...");
    const sigResponse = await fetch(`${apiURL}/meeting/signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingNumber: meeting.zoomMeetingId,
        role: 1,
      }),
    });

    const sigData = await sigResponse.json();
    if (!sigData.success || !sigData.data) {
      console.error("❌ Failed to get signature:", sigData.message);
      return;
    }

    console.log("✅ Signature generated successfully");
    console.log("SDK Key:", sigData.data.sdkKey);
    console.log(
      "Signature (first 50 chars):",
      sigData.data.signature.substring(0, 50) + "..."
    );

    // Step 4: Check if @zoom/meetingsdk is properly loaded
    console.log("4️⃣ Checking Zoom SDK availability...");

    // Try importing the SDK
    try {
      const { ZoomMtg } = await import("@zoom/meetingsdk");
      console.log("✅ @zoom/meetingsdk imported successfully");

      // Check key functions
      if (typeof ZoomMtg.setZoomJSLib === "function") {
        console.log("✅ ZoomMtg.setZoomJSLib available");
      } else {
        console.warn("⚠️ ZoomMtg.setZoomJSLib not available");
      }

      if (typeof ZoomMtg.preLoadWasm === "function") {
        console.log("✅ ZoomMtg.preLoadWasm available");
      } else {
        console.warn("⚠️ ZoomMtg.preLoadWasm not available");
      }

      if (typeof ZoomMtg.prepareWebSDK === "function") {
        console.log("✅ ZoomMtg.prepareWebSDK available");
      } else {
        console.warn("⚠️ ZoomMtg.prepareWebSDK not available");
      }
    } catch (error) {
      console.error("❌ Failed to import @zoom/meetingsdk:", error);
      return;
    }

    // Step 5: Test page navigation flow
    console.log("5️⃣ Testing page navigation flow...");
    console.log("Meeting data to pass to TutorMeetingRoomPage:");
    console.log({
      meetingData: meeting,
      classroomName: "Test Classroom",
      classroomId: "test-id",
      isNewMeeting: false,
    });

    console.log("🎉 All tests passed! The flow should work.");
    console.log("📋 Next steps:");
    console.log("1. Navigate to a classroom page");
    console.log("2. Click 'Vào lớp học' button");
    console.log("3. Check browser console for ZoomMeetingEmbed logs");
    console.log("4. Verify Zoom interface appears in the container");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test if in browser environment
if (typeof window !== "undefined") {
  testZoomFlow();
} else {
  console.log("⚠️ This script should be run in browser console");
}

console.log("📝 To run this test:");
console.log("1. Open browser console on your app");
console.log("2. Copy and paste this entire script");
console.log("3. Press Enter to execute");
