// Enhanced ZoomMeetingEmbed with better debugging
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";

// Debug component for Zoom integration
function ZoomMeetingDebug({
  sdkKey,
  signature,
  meetingNumber,
  userName,
  passWord,
  customLeaveUrl,
  onMeetingEnd,
  onError,
  onMeetingJoined,
}) {
  const [debugInfo, setDebugInfo] = useState({
    sdkLoaded: false,
    propsValidated: false,
    initCompleted: false,
    joinAttempted: false,
    error: null,
  });

  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setLogs((prev) => [...prev, logEntry]);
    console.log(`[ZoomDebug][${type}] ${message}`);
  }, []);

  // Validate props
  useEffect(() => {
    addLog("Starting Zoom component validation...");

    const requiredProps = { sdkKey, signature, meetingNumber, userName };
    const missingProps = Object.entries(requiredProps)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingProps.length > 0) {
      const error = `Missing required props: ${missingProps.join(", ")}`;
      addLog(error, "error");
      setDebugInfo((prev) => ({ ...prev, error, propsValidated: false }));
      if (onError) onError(error);
      return;
    }

    addLog("All required props are present", "success");
    setDebugInfo((prev) => ({ ...prev, propsValidated: true }));

    // Log prop details
    addLog(`SDK Key: ${sdkKey?.substring(0, 20)}...`);
    addLog(`Signature: ${signature?.substring(0, 30)}...`);
    addLog(`Meeting Number: ${meetingNumber}`);
    addLog(`User Name: ${userName}`);
  }, [sdkKey, signature, meetingNumber, userName, addLog, onError]);

  // Check Zoom SDK availability
  useEffect(() => {
    addLog("Checking Zoom SDK availability...");

    // Try dynamic import first
    import("@zoom/meetingsdk")
      .then((ZoomMtg) => {
        addLog("Zoom SDK loaded successfully via import", "success");
        setDebugInfo((prev) => ({ ...prev, sdkLoaded: true }));

        // Test basic SDK availability
        if (ZoomMtg.default && typeof ZoomMtg.default.init === "function") {
          addLog("Zoom SDK methods are available", "success");
        } else {
          addLog("Zoom SDK methods not available", "error");
        }
      })
      .catch((error) => {
        addLog(`Failed to load Zoom SDK: ${error.message}`, "error");

        // Fallback: check if ZoomMtg is globally available
        if (typeof window !== "undefined" && window.ZoomMtg) {
          addLog("Zoom SDK found in global scope", "success");
          setDebugInfo((prev) => ({ ...prev, sdkLoaded: true }));
        } else {
          const errorMsg =
            "Zoom SDK not available. Please ensure @zoom/meetingsdk is installed.";
          addLog(errorMsg, "error");
          setDebugInfo((prev) => ({ ...prev, error: errorMsg }));
          if (onError) onError(errorMsg);
        }
      });
  }, [addLog, onError]);

  // Initialize Zoom when ready
  useEffect(() => {
    if (!debugInfo.sdkLoaded || !debugInfo.propsValidated) {
      return;
    }

    const initializeZoom = async () => {
      try {
        addLog("Attempting to initialize Zoom...", "info");

        const ZoomMtg = await import("@zoom/meetingsdk");
        const Zoom = ZoomMtg.default || ZoomMtg;

        addLog("Preparing Zoom SDK...", "info");
        await Zoom.preLoadWasm();
        await Zoom.prepareWebSDK();

        addLog("Zoom SDK prepared successfully", "success");
        setDebugInfo((prev) => ({ ...prev, initCompleted: true }));

        addLog("Initializing Zoom meeting...", "info");
        Zoom.init({
          leaveUrl: customLeaveUrl || window.location.origin,
          patchJsMedia: true,
          success: function () {
            addLog("Zoom init successful, attempting to join...", "success");

            Zoom.join({
              sdkKey: sdkKey,
              signature: signature,
              meetingNumber: String(meetingNumber),
              userName: userName,
              userEmail: "",
              passWord: passWord || "",
              tk: "",
              success: function (joinRes) {
                addLog("Successfully joined Zoom meeting!", "success");
                setDebugInfo((prev) => ({ ...prev, joinAttempted: true }));
                if (onMeetingJoined) onMeetingJoined(joinRes);
              },
              error: function (joinError) {
                const errorMsg = `Failed to join meeting: ${JSON.stringify(
                  joinError
                )}`;
                addLog(errorMsg, "error");
                setDebugInfo((prev) => ({ ...prev, error: errorMsg }));
                if (onError) onError(errorMsg);
              },
            });
          },
          error: function (initError) {
            const errorMsg = `Failed to initialize Zoom: ${JSON.stringify(
              initError
            )}`;
            addLog(errorMsg, "error");
            setDebugInfo((prev) => ({ ...prev, error: errorMsg }));
            if (onError) onError(errorMsg);
          },
        });
      } catch (error) {
        const errorMsg = `Zoom initialization error: ${error.message}`;
        addLog(errorMsg, "error");
        setDebugInfo((prev) => ({ ...prev, error: errorMsg }));
        if (onError) onError(errorMsg);
      }
    };

    initializeZoom();
  }, [
    debugInfo.sdkLoaded,
    debugInfo.propsValidated,
    sdkKey,
    signature,
    meetingNumber,
    userName,
    passWord,
    customLeaveUrl,
    addLog,
    onError,
    onMeetingJoined,
  ]);

  const getStatusColor = (status) => {
    if (status === true) return "#28a745";
    if (status === false) return "#dc3545";
    return "#ffc107";
  };

  const getStatusIcon = (status) => {
    if (status === true) return "✅";
    if (status === false) return "❌";
    return "⏳";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h3>🔍 Zoom Meeting Debug Information</h3>

      {/* Status Overview */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>Status Overview</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <div>
            <span style={{ color: getStatusColor(debugInfo.propsValidated) }}>
              {getStatusIcon(debugInfo.propsValidated)} Props Validated
            </span>
          </div>
          <div>
            <span style={{ color: getStatusColor(debugInfo.sdkLoaded) }}>
              {getStatusIcon(debugInfo.sdkLoaded)} SDK Loaded
            </span>
          </div>
          <div>
            <span style={{ color: getStatusColor(debugInfo.initCompleted) }}>
              {getStatusIcon(debugInfo.initCompleted)} Init Completed
            </span>
          </div>
          <div>
            <span style={{ color: getStatusColor(debugInfo.joinAttempted) }}>
              {getStatusIcon(debugInfo.joinAttempted)} Join Attempted
            </span>
          </div>
        </div>

        {debugInfo.error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
              border: "1px solid #f5c6cb",
            }}
          >
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
      </div>

      {/* Props Information */}
      <div
        style={{
          background: "#e3f2fd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>Props Information</h4>
        <div style={{ fontSize: "14px", fontFamily: "monospace" }}>
          <div>
            <strong>SDK Key:</strong>{" "}
            {sdkKey
              ? `${sdkKey.substring(0, 20)}... (${sdkKey.length} chars)`
              : "Not provided"}
          </div>
          <div>
            <strong>Signature:</strong>{" "}
            {signature
              ? `${signature.substring(0, 30)}... (${signature.length} chars)`
              : "Not provided"}
          </div>
          <div>
            <strong>Meeting Number:</strong> {meetingNumber || "Not provided"}
          </div>
          <div>
            <strong>User Name:</strong> {userName || "Not provided"}
          </div>
          <div>
            <strong>Password:</strong> {passWord ? "***" : "Not provided"}
          </div>
          <div>
            <strong>Leave URL:</strong> {customLeaveUrl || "Default"}
          </div>
        </div>
      </div>

      {/* Debug Logs */}
      <div
        style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}
      >
        <h4>Debug Logs</h4>
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            fontSize: "12px",
            fontFamily: "monospace",
            background: "white",
            padding: "10px",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                color:
                  log.type === "error"
                    ? "#dc3545"
                    : log.type === "success"
                    ? "#28a745"
                    : "#495057",
                marginBottom: "2px",
              }}
            >
              [{log.timestamp}] [{log.type.toUpperCase()}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Container */}
      <div
        id="zoom-meeting-container"
        style={{
          width: "100%",
          height: "500px",
          border: "2px dashed #dee2e6",
          borderRadius: "8px",
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        {debugInfo.joinAttempted ? (
          <div>Zoom meeting should appear here</div>
        ) : (
          <div>Waiting for Zoom initialization...</div>
        )}
      </div>
    </div>
  );
}

ZoomMeetingDebug.propTypes = {
  sdkKey: PropTypes.string.isRequired,
  signature: PropTypes.string.isRequired,
  meetingNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  userName: PropTypes.string.isRequired,
  passWord: PropTypes.string,
  customLeaveUrl: PropTypes.string,
  onMeetingEnd: PropTypes.func,
  onError: PropTypes.func,
  onMeetingJoined: PropTypes.func,
};

export default ZoomMeetingDebug;
