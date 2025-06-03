// API Debug Script for testing classroom API calls

// Function to check user token
const checkUserToken = () => {
  const userToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("userSystemToken="))
    ?.split("=")[1];

  console.log("User Token from Cookie:", userToken ? "EXISTS" : "NOT FOUND");
  return userToken;
};

// Function to test API call directly
const testMeetingAPI = async (classroomId) => {
  try {
    const token = checkUserToken();
    if (!token) {
      console.error("No user token found in cookies");
      return;
    }

    console.log("Testing API call with classroomId:", classroomId);

    const url = `http://localhost:8080/api/meeting/get-meeting?classroomId=${classroomId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("Response data:", data);

    return data;
  } catch (error) {
    console.error("API Test Error:", error);
  }
};

// Function to test get classrooms API
const testClassroomsAPI = async () => {
  try {
    const token = checkUserToken();
    if (!token) {
      console.error("No user token found in cookies");
      return;
    }

    console.log("Testing get classrooms API...");

    const url =
      "http://localhost:8080/api/classroom/search-for-user?page=1&rpp=5";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Require-Token": "true",
      },
    });

    console.log("Classrooms Response status:", response.status);

    const data = await response.json();
    console.log("Classrooms Response data:", data);

    // If successful, try to get first classroom's meeting
    if (data.success && data.data?.items?.length > 0) {
      const firstClassroom = data.data.items[0];
      console.log(
        "Testing with first classroom ID:",
        firstClassroom.classroomId
      );
      await testMeetingAPI(firstClassroom.classroomId);
    }

    return data;
  } catch (error) {
    console.error("Classrooms API Test Error:", error);
  }
};

// Add functions to window for console testing
window.checkUserToken = checkUserToken;
window.testMeetingAPI = testMeetingAPI;
window.testClassroomsAPI = testClassroomsAPI;

console.log("API Debug script loaded!");
console.log("Available functions:");
console.log("- window.checkUserToken() - Check if user token exists");
console.log("- window.testClassroomsAPI() - Test get classrooms API");
console.log(
  "- window.testMeetingAPI(classroomId) - Test get meeting API with specific classroom ID"
);
