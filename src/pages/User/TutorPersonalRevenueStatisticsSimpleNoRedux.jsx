// Very simple debug component without Redux
import React from "react";

const TutorPersonalRevenueStatisticsSimpleNoRedux = () => {
  console.log("🧪 Simple No-Redux component is rendering");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔧 Debug: Tutor Revenue Statistics (No Redux)</h1>

      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Basic Information</h2>
        <p>
          <strong>Current URL:</strong> {window.location.href}
        </p>
        <p>
          <strong>Current Time:</strong> {new Date().toISOString()}
        </p>
        <p>
          <strong>User Agent:</strong> {navigator.userAgent}
        </p>
      </div>

      <div
        style={{
          background: "#d4edda",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>✅ Component Status</h3>
        <ul>
          <li>✅ Component renders successfully</li>
          <li>✅ No Redux dependencies</li>
          <li>✅ No complex imports</li>
          <li>✅ Basic React functionality working</li>
        </ul>
      </div>

      <div
        style={{
          background: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>🔍 Local Storage Check</h3>
        <div>
          <p>
            <strong>Token:</strong>{" "}
            {localStorage.getItem("token") ? "Found" : "Not found"}
          </p>
          <p>
            <strong>User Profile:</strong>{" "}
            {localStorage.getItem("userProfile") ? "Found" : "Not found"}
          </p>
          {localStorage.getItem("userProfile") && (
            <pre
              style={{
                fontSize: "12px",
                overflow: "auto",
                background: "#f8f9fa",
                padding: "10px",
              }}
            >
              {localStorage.getItem("userProfile")}
            </pre>
          )}
        </div>
      </div>

      <div
        style={{
          background: "#f8d7da",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>⚠️ Testing Notes</h3>
        <p>
          This component works without Redux. If this loads but the Redux
          version doesn't, the issue is likely:
        </p>
        <ul>
          <li>Redux store configuration problem</li>
          <li>useSelector hook issues</li>
          <li>State management errors</li>
          <li>Missing Redux provider</li>
        </ul>
      </div>

      <button
        onClick={() => {
          console.log("🧪 Button clicked - testing basic functionality");
          alert("Button works! Component is interactive.");
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        🧪 Test Button
      </button>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsSimpleNoRedux;
