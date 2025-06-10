// Simple authentication test component
import React from "react";
import { useSelector } from "react-redux";

const TutorPersonalRevenueStatisticsAuthTest = () => {
  console.log("🔐 Auth Test Component Loading...");

  // Get Redux state
  let reduxState;
  let authError = null;

  try {
    reduxState = useSelector((state) => {
      console.log("📊 Full Redux State:", state);
      return state;
    });
  } catch (error) {
    authError = `Redux Error: ${error.message}`;
    console.error("❌ Redux Selector Error:", error);
  }

  if (authError) {
    return (
      <div
        style={{ padding: "20px", backgroundColor: "#ffebee", margin: "20px" }}
      >
        <h1 style={{ color: "#d32f2f" }}>❌ Redux Connection Failed</h1>
        <p>
          <strong>Error:</strong> {authError}
        </p>
        <p>The Redux store is not properly connected.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          🔄 Reload Page
        </button>
      </div>
    );
  }

  const userState = reduxState?.user;
  const isAuthenticated = userState?.isAuthenticated;
  const userProfile = userState?.userProfile;
  const roles = userProfile?.roles || [];
  const isTutor = roles.some((role) => role.name === "TUTOR");

  console.log("🔍 Authentication State:", {
    isAuthenticated,
    userProfile: !!userProfile,
    roles: roles.map((r) => r.name),
    isTutor,
  });

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#2e7d32" }}>🔐 Authentication Test Results</h1>

      <div
        style={{
          backgroundColor: isAuthenticated ? "#e8f5e8" : "#ffebee",
          border: `1px solid ${isAuthenticated ? "#4caf50" : "#f44336"}`,
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Authentication Status</h3>
        <p>
          <strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}
        </p>
        {!isAuthenticated && (
          <div>
            <p style={{ color: "#d32f2f" }}>
              ⚠️ User is not authenticated. Please login first.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔑 Go to Login
            </button>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div
          style={{
            backgroundColor: userProfile ? "#e8f5e8" : "#fff3e0",
            border: `1px solid ${userProfile ? "#4caf50" : "#ff9800"}`,
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>User Profile</h3>
          <p>
            <strong>Profile Loaded:</strong> {userProfile ? "✅ Yes" : "❌ No"}
          </p>
          {userProfile && (
            <div>
              <p>
                <strong>User ID:</strong> {userProfile.id}
              </p>
              <p>
                <strong>Email:</strong> {userProfile.email}
              </p>
              <p>
                <strong>Full Name:</strong> {userProfile.fullName}
              </p>
              <p>
                <strong>Roles:</strong> {roles.map((r) => r.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {isAuthenticated && userProfile && (
        <div
          style={{
            backgroundColor: isTutor ? "#e8f5e8" : "#ffebee",
            border: `1px solid ${isTutor ? "#4caf50" : "#f44336"}`,
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Tutor Access Check</h3>
          <p>
            <strong>Is Tutor:</strong> {isTutor ? "✅ Yes" : "❌ No"}
          </p>
          {!isTutor && (
            <div>
              <p style={{ color: "#d32f2f" }}>
                ⚠️ User does not have TUTOR role. This page is only accessible
                to tutors.
              </p>
              <p>
                <strong>Available Roles:</strong>{" "}
                {roles.map((r) => r.name).join(", ") || "None"}
              </p>
              <p>
                If you should be a tutor, please contact administration or
                complete tutor registration.
              </p>
            </div>
          )}
        </div>
      )}

      {isAuthenticated && userProfile && isTutor && (
        <div
          style={{
            backgroundColor: "#e8f5e8",
            border: "1px solid #4caf50",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>✅ All Checks Passed!</h3>
          <p>
            User is authenticated and has TUTOR role. The revenue statistics
            component should be able to load.
          </p>
          <p>
            <strong>Next step:</strong> Load the actual revenue statistics
            component.
          </p>
          <button
            onClick={() => {
              // Switch back to Fixed component
              console.log("🔄 Switching to Fixed component...");
              alert("Check console - switching to fixed component");
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✅ Load Revenue Statistics
          </button>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "15px",
        }}
      >
        <h3>Debug Information</h3>
        <p>
          <strong>Current URL:</strong> {window.location.href}
        </p>
        <p>
          <strong>Timestamp:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>Redux State Available:</strong> {!!reduxState ? "Yes" : "No"}
        </p>

        <div style={{ marginTop: "15px" }}>
          <button
            onClick={() => console.log("Redux State:", reduxState)}
            style={{
              marginRight: "10px",
              padding: "8px 15px",
              backgroundColor: "#607d8b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📊 Log Redux State
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 15px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsAuthTest;
