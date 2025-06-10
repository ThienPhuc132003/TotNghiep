// Progressive loading test component
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const TutorPersonalRevenueStatisticsProgressive = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(isError ? "❌" : "✅", logEntry);
    setLogs((prev) => [...prev, { message: logEntry, isError }]);
  };

  useEffect(() => {
    addLog("Step 1: Component mounted successfully");

    const timer1 = setTimeout(() => {
      try {
        addLog("Step 2: Starting Redux connection test...");
        setStep(2);
      } catch (err) {
        addLog(`Step 2 failed: ${err.message}`, true);
        setError(err.message);
      }
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (step === 2) {
      const timer2 = setTimeout(() => {
        try {
          addLog("Step 3: Testing Redux selectors...");
          setStep(3);
        } catch (err) {
          addLog(`Step 3 failed: ${err.message}`, true);
          setError(err.message);
        }
      }, 1000);

      return () => clearTimeout(timer2);
    }
  }, [step]);

  // Step 3: Redux selectors (this might be where it fails)
  let userProfile = null;
  let isAuthenticated = false;
  let reduxError = null;

  if (step >= 3) {
    try {
      addLog("Testing Redux selectors...");
      userProfile = useSelector((state) => {
        addLog("Redux state accessed successfully");
        return state.user?.userProfile;
      });
      isAuthenticated = useSelector((state) => state.user?.isAuthenticated);
      addLog("Redux selectors completed successfully");
    } catch (err) {
      reduxError = err.message;
      addLog(`Redux selector failed: ${err.message}`, true);
      setError(err.message);
    }
  }

  useEffect(() => {
    if (step === 3 && !reduxError) {
      const timer3 = setTimeout(() => {
        try {
          addLog("Step 4: Testing authentication logic...");
          setStep(4);
        } catch (err) {
          addLog(`Step 4 failed: ${err.message}`, true);
          setError(err.message);
        }
      }, 1000);

      return () => clearTimeout(timer3);
    }
  }, [step, reduxError]);

  // Step 4: Authentication check
  let isTutor = false;
  let tutorId = null;
  let authError = null;

  if (step >= 4 && !reduxError) {
    try {
      addLog("Checking authentication and tutor status...");

      if (userProfile && userProfile.roles) {
        isTutor = userProfile.roles.some((role) => role.name === "TUTOR");
        tutorId = userProfile.id;
        addLog(`Authentication check: isTutor=${isTutor}, tutorId=${tutorId}`);
      } else {
        addLog("No user profile or roles found", true);
        authError = "No user profile or roles found";
        setError(authError);
      }
    } catch (err) {
      authError = err.message;
      addLog(`Authentication check failed: ${err.message}`, true);
      setError(err.message);
    }
  }

  useEffect(() => {
    if (step === 4 && !reduxError && !authError) {
      const timer4 = setTimeout(() => {
        try {
          addLog("Step 5: All tests completed successfully!");
          setStep(5);
        } catch (err) {
          addLog(`Step 5 failed: ${err.message}`, true);
          setError(err.message);
        }
      }, 1000);

      return () => clearTimeout(timer4);
    }
  }, [step, reduxError, authError]);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "monospace",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: error ? "#d32f2f" : "#2e7d32" }}>
        🔬 Progressive Loading Test
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Current Step: {step}/5</h3>
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#ddd",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(step / 5) * 100}%`,
              height: "100%",
              backgroundColor: error ? "#f44336" : "#4caf50",
              transition: "width 0.5s ease",
            }}
          ></div>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#d32f2f" }}>❌ Error Detected</h3>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p>
            <strong>Failed at step:</strong> {step}
          </p>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Test Status</h3>
        <ul>
          <li>
            Step 1 - Component Mount: {step >= 1 ? "✅ Passed" : "⏳ Pending"}
          </li>
          <li>
            Step 2 - Initial Setup: {step >= 2 ? "✅ Passed" : "⏳ Pending"}
          </li>
          <li>
            Step 3 - Redux Selectors:{" "}
            {step >= 3
              ? reduxError
                ? "❌ Failed"
                : "✅ Passed"
              : "⏳ Pending"}
          </li>
          <li>
            Step 4 - Authentication:{" "}
            {step >= 4 ? (authError ? "❌ Failed" : "✅ Passed") : "⏳ Pending"}
          </li>
          <li>Step 5 - Complete: {step >= 5 ? "✅ Passed" : "⏳ Pending"}</li>
        </ul>
      </div>

      {step >= 3 && !reduxError && (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            border: "1px solid #2196f3",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Redux Data</h3>
          <ul>
            <li>
              <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </li>
            <li>
              <strong>User Profile:</strong>{" "}
              {userProfile ? "Available" : "Missing"}
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
            <li>
              <strong>Is Tutor:</strong> {isTutor ? "Yes" : "No"}
            </li>
          </ul>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "4px",
          padding: "15px",
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        <h3>Execution Log</h3>
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              color: log.isError ? "#d32f2f" : "#2e7d32",
              marginBottom: "5px",
              fontSize: "12px",
            }}
          >
            {log.message}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
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
          🔄 Reload Test
        </button>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsProgressive;
