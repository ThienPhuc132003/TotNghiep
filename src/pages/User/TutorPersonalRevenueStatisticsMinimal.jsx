// Minimal test component to identify white screen issue
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const TutorPersonalRevenueStatisticsMinimal = () => {
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState(null);

  // Redux selectors
  const userProfile = useSelector((state) => {
    console.log("Redux state:", state);
    return state.user?.userProfile;
  });
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);

  useEffect(() => {
    console.log("🔍 Minimal component mounted");
    console.log("User profile:", userProfile);
    console.log("Is authenticated:", isAuthenticated);

    try {
      // Simple checks without API calls
      if (!isAuthenticated) {
        setError("Not authenticated");
        return;
      }

      if (!userProfile) {
        setError("No user profile");
        return;
      }

      const tutorId = userProfile?.id;
      const roles = userProfile?.roles || [];
      const isTutor = roles.some((role) => role.name === "TUTOR");

      console.log("Tutor ID:", tutorId);
      console.log("Roles:", roles);
      console.log("Is tutor:", isTutor);

      if (!isTutor) {
        setError("User is not a tutor");
        return;
      }

      if (!tutorId) {
        setError("No tutor ID found");
        return;
      }

      setStatus("All checks passed - Ready to load data");
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError(err.message);
    }
  }, [userProfile, isAuthenticated]);

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "4px",
          margin: "20px",
        }}
      >
        <h2 style={{ color: "#d32f2f" }}>❌ Error Detected</h2>
        <p>
          <strong>Error:</strong> {error}
        </p>
        <p>
          <strong>Debug info:</strong>
        </p>
        <ul>
          <li>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</li>
          <li>User Profile: {userProfile ? "Available" : "Missing"}</li>
          <li>User ID: {userProfile?.id || "N/A"}</li>
          <li>
            Roles: {userProfile?.roles?.map((r) => r.name).join(", ") || "N/A"}
          </li>
        </ul>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
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
    );
  }

  return (
    <div style={{ padding: "20px", margin: "20px" }}>
      <h1 style={{ color: "#2e7d32" }}>
        ✅ Tutor Revenue Statistics - Minimal Test
      </h1>

      <div
        style={{
          backgroundColor: "#e8f5e8",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <h3>Status: {status}</h3>
        <p>
          <strong>Time:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>URL:</strong> {window.location.pathname}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "15px",
          borderRadius: "4px",
        }}
      >
        <h3>🔧 Authentication Details</h3>
        <ul>
          <li>
            <strong>Authenticated:</strong>{" "}
            {isAuthenticated ? "✅ Yes" : "❌ No"}
          </li>
          <li>
            <strong>User ID:</strong> {userProfile?.id || "N/A"}
          </li>
          <li>
            <strong>Email:</strong> {userProfile?.email || "N/A"}
          </li>
          <li>
            <strong>Roles:</strong>{" "}
            {userProfile?.roles?.map((r) => r.name).join(", ") || "N/A"}
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff3e0",
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Next step:</strong> If you see this page and it doesn't go
          white, the authentication is working. The issue is likely in the data
          fetching or rendering logic of the main component.
        </p>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsMinimal;
