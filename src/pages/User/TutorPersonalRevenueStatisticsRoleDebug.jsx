// Debug component to analyze roles structure
import React from "react";
import { useSelector } from "react-redux";

const TutorPersonalRevenueStatisticsRoleDebug = () => {
  console.log("🔍 Role Debug Component Loading...");

  const reduxState = useSelector((state) => {
    console.log("📊 Full Redux State:", state);
    return state;
  });

  const userState = reduxState?.user;
  const userProfile = userState?.userProfile;
  const roles = userProfile?.roles;

  console.log("🔍 Detailed Role Analysis:", {
    userProfile,
    roles,
    rolesType: typeof roles,
    rolesIsArray: Array.isArray(roles),
    rolesLength: roles?.length,
  });

  // Different ways to check for TUTOR role
  let tutorChecks = {};

  if (roles) {
    // Check 1: role.name === "TUTOR"
    tutorChecks.nameEquals = roles.some((role) => role.name === "TUTOR");

    // Check 2: role.name === "Tutor" (case sensitive)
    tutorChecks.nameCaseSensitive = roles.some((role) => role.name === "Tutor");

    // Check 3: toLowerCase comparison
    tutorChecks.toLowerCase = roles.some(
      (role) => role.name?.toLowerCase() === "tutor"
    );

    // Check 4: includes check
    tutorChecks.includes = roles.some(
      (role) => role.name?.includes("TUTOR") || role.name?.includes("tutor")
    );

    // Check 5: role.roleName (alternative property)
    tutorChecks.roleName = roles.some((role) => role.roleName === "TUTOR");

    // Check 6: role.type
    tutorChecks.roleType = roles.some((role) => role.type === "TUTOR");

    console.log("🧪 Tutor Role Checks:", tutorChecks);
  }

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#2e7d32" }}>🔍 Role Structure Debug</h1>

      <div
        style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Raw User Profile Data</h3>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(userProfile, null, 2)}
        </pre>
      </div>

      <div
        style={{
          backgroundColor: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Roles Analysis</h3>
        <p>
          <strong>Roles Array:</strong> {roles ? "Available" : "Not found"}
        </p>
        <p>
          <strong>Roles Type:</strong> {typeof roles}
        </p>
        <p>
          <strong>Is Array:</strong> {Array.isArray(roles) ? "Yes" : "No"}
        </p>
        <p>
          <strong>Length:</strong> {roles?.length || 0}
        </p>

        {roles && roles.length > 0 && (
          <div>
            <h4>Individual Roles:</h4>
            {roles.map((role, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                <p>
                  <strong>Role #{index + 1}:</strong>
                </p>
                <p>
                  <strong>Full Object:</strong> {JSON.stringify(role)}
                </p>
                <p>
                  <strong>Name:</strong> "{role.name}" (type: {typeof role.name}
                  )
                </p>
                <p>
                  <strong>RoleName:</strong> "{role.roleName}" (type:{" "}
                  {typeof role.roleName})
                </p>
                <p>
                  <strong>Type:</strong> "{role.type}" (type: {typeof role.type}
                  )
                </p>
                <p>
                  <strong>ID:</strong> {role.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>TUTOR Role Detection Tests</h3>
        {Object.entries(tutorChecks).map(([testName, result]) => (
          <p key={testName}>
            <strong>{testName}:</strong> {result ? "✅ Found" : "❌ Not found"}
          </p>
        ))}
      </div>

      <div
        style={{
          backgroundColor:
            roles && Object.values(tutorChecks).some(Boolean)
              ? "#e8f5e8"
              : "#ffebee",
          border: `1px solid ${
            roles && Object.values(tutorChecks).some(Boolean)
              ? "#4caf50"
              : "#f44336"
          }`,
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Recommendation</h3>
        {roles && Object.values(tutorChecks).some(Boolean) ? (
          <div>
            <p style={{ color: "#2e7d32" }}>
              ✅ TUTOR role detected! The issue is with the role checking logic
              in the main component.
            </p>
            <p>
              <strong>Working check method:</strong>
            </p>
            <ul>
              {Object.entries(tutorChecks)
                .filter(([_, result]) => result)
                .map(([testName, _]) => (
                  <li key={testName}>{testName}</li>
                ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: "#d32f2f" }}>
            ❌ No TUTOR role found. User may need to complete tutor registration
            or contact administrator.
          </p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => console.log("Full Redux State:", reduxState)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#607d8b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          📊 Log Full State
        </button>
        <button
          onClick={() => console.log("User Profile:", userProfile)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#9c27b0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          👤 Log User Profile
        </button>
        <button
          onClick={() => console.log("Roles Array:", roles)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff5722",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🎭 Log Roles
        </button>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsRoleDebug;
