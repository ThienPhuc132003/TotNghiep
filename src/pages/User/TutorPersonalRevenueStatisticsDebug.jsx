// Debug version - Simple render without complex logic
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Alert } from "@mui/material";

const TutorPersonalRevenueStatisticsDebug = () => {
  const [debugInfo, setDebugInfo] = useState("Initializing...");
  const [error, setError] = useState(null);

  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    try {
      setDebugInfo("Component mounted successfully");
      console.log("🔍 Debug - User Profile:", userProfile);
      console.log("🔍 Debug - Is Authenticated:", isAuthenticated);

      // Check if user profile exists
      if (!userProfile) {
        setDebugInfo("User profile is null/undefined");
        return;
      }

      // Check role
      const roleId = userProfile?.roleId;
      setDebugInfo(`Role ID: ${roleId}, Type: ${typeof roleId}`);

      // Check tutor status
      const isTutor = roleId && String(roleId).toUpperCase() === "TUTOR";
      setDebugInfo(`Is Tutor: ${isTutor}`);

      // Check tutor ID
      const tutorId = userProfile?.userProfile?.userId;
      setDebugInfo(`Tutor ID: ${tutorId}`);
    } catch (err) {
      console.error("🚨 Debug Error:", err);
      setError(err.message);
    }
  }, [userProfile, isAuthenticated]);

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="error">
          <h3>Component Error</h3>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔧 Debug Tutor Revenue Statistics</h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
        }}
      >
        <h3>Debug Information:</h3>
        <p>
          <strong>Status:</strong> {debugInfo}
        </p>
        <p>
          <strong>Authenticated:</strong> {String(isAuthenticated)}
        </p>
        <p>
          <strong>User Profile:</strong> {userProfile ? "Exists" : "Null"}
        </p>
      </div>

      <div
        style={{
          background: "#e8f5e8",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
        }}
      >
        <h3>Raw Redux State:</h3>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(
            {
              isAuthenticated,
              userProfile: userProfile
                ? {
                    roleId: userProfile.roleId,
                    userId: userProfile?.userProfile?.userId,
                    // Add other relevant fields
                  }
                : null,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div
        style={{
          background: "#fff3cd",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
        }}
      >
        <h3>Next Steps:</h3>
        <p>If you see this page, the component is rendering correctly.</p>
        <p>Check the console for any error messages.</p>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsDebug;
