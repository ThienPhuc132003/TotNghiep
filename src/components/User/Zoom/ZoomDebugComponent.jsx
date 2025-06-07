import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// Dynamically load Zoom SDK for debugging
const loadZoomSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ZoomMtg) {
      resolve(window.ZoomMtg);
      return;
    }

    // Create script tag to load Zoom SDK
    const script = document.createElement("script");
    script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
    script.onload = () => {
      console.log("✅ Zoom SDK loaded via script tag");
      resolve(window.ZoomMtg);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Zoom SDK"));
    };
    document.head.appendChild(script);
  });
};

// Simplified Zoom Debug Component
function ZoomDebugComponent({
  sdkKey,
  signature,
  meetingNumber,
  userName,
  passWord,
  onError,
}) {
  const [debugInfo, setDebugInfo] = useState({
    sdkKey: !!sdkKey,
    signature: !!signature,
    meetingNumber: !!meetingNumber,
    userName: !!userName,
    sdkLoaded: false,
    initSuccess: false,
    joinSuccess: false,
    error: null,
    loading: true,
  });

  const meetingContainerRef = useRef(null);

  useEffect(() => {
    console.log("🔍 Zoom Debug Info:", {
      sdkKey: sdkKey ? `${sdkKey.substring(0, 10)}...` : "Missing",
      signature: signature ? `${signature.substring(0, 20)}...` : "Missing",
      meetingNumber,
      userName,
      passWord: passWord ? "Present" : "Missing",
    });

    // Load Zoom SDK dynamically
    loadZoomSDK()
      .then((ZoomMtg) => {
        console.log("✅ Zoom SDK loaded successfully");
        setDebugInfo((prev) => ({ ...prev, sdkLoaded: true, loading: false }));

        // Test basic SDK functionality
        if (typeof ZoomMtg.init === "function") {
          console.log("✅ ZoomMtg.init is available");
          setDebugInfo((prev) => ({ ...prev, initSuccess: true }));
        } else {
          throw new Error("ZoomMtg.init is not a function");
        }
      })
      .catch((error) => {
        console.error("❌ Failed to load Zoom SDK:", error);
        const errorMessage = error.message || "Zoom SDK loading failed";
        setDebugInfo((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        if (onError) onError(errorMessage);
      });
  }, [sdkKey, signature, meetingNumber, userName, passWord, onError]);

  const testDirectZoomURL = () => {
    if (!meetingNumber) {
      alert("Meeting number is required for direct URL test");
      return;
    }

    const directURL = `https://zoom.us/j/${meetingNumber}`;
    console.log(`🔗 Testing direct Zoom URL: ${directURL}`);
    window.open(directURL, "_blank");
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔧 Zoom Integration Debug</h2>

      {/* Debug Information */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "5px",
        }}
      >
        <h3>Debug Information:</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
          }}
        >
          <span>SDK Key:</span>
          <span style={{ color: debugInfo.sdkKey ? "#28a745" : "#dc3545" }}>
            {debugInfo.sdkKey ? "✅ Present" : "❌ Missing"}
          </span>

          <span>Signature:</span>
          <span style={{ color: debugInfo.signature ? "#28a745" : "#dc3545" }}>
            {debugInfo.signature ? "✅ Present" : "❌ Missing"}
          </span>

          <span>Meeting Number:</span>
          <span
            style={{ color: debugInfo.meetingNumber ? "#28a745" : "#dc3545" }}
          >
            {debugInfo.meetingNumber ? "✅ Present" : "❌ Missing"}
          </span>

          <span>User Name:</span>
          <span style={{ color: debugInfo.userName ? "#28a745" : "#dc3545" }}>
            {debugInfo.userName ? "✅ Present" : "❌ Missing"}
          </span>

          <span>SDK Loaded:</span>
          <span style={{ color: debugInfo.sdkLoaded ? "#28a745" : "#dc3545" }}>
            {debugInfo.loading
              ? "⏳ Loading..."
              : debugInfo.sdkLoaded
              ? "✅ Yes"
              : "❌ No"}
          </span>

          <span>Init Success:</span>
          <span
            style={{ color: debugInfo.initSuccess ? "#28a745" : "#dc3545" }}
          >
            {debugInfo.initSuccess ? "✅ Yes" : "❌ No"}
          </span>

          <span>Join Success:</span>
          <span
            style={{ color: debugInfo.joinSuccess ? "#28a745" : "#dc3545" }}
          >
            {debugInfo.joinSuccess ? "✅ Yes" : "❌ No"}
          </span>

          {debugInfo.error && (
            <>
              <span>Error:</span>
              <span style={{ color: "#dc3545" }}>{debugInfo.error}</span>
            </>
          )}
        </div>
      </div>

      {/* Zoom Free Account Information */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "5px",
        }}
      >
        <h3>Zoom Free Account Information:</h3>
        <p>
          <strong>⚠️ Lưu ý về Zoom Free Account:</strong>
        </p>
        <ul>
          <li>Zoom Free có thể hạn chế SDK usage</li>
          <li>Một số tính năng embedded có thể không hoạt động</li>
          <li>Recommended: Test với external Zoom URL trước</li>
        </ul>
      </div>

      {/* Test Options */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Test Options:</h3>
        <button
          onClick={testDirectZoomURL}
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔗 Test External Zoom URL
        </button>

        <button
          onClick={reloadPage}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Reload Page
        </button>
      </div>

      {/* Troubleshooting */}
      <div
        style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <h3>🚨 Possible Issues:</h3>
        <ul>
          <li>
            <strong>Zoom Free Account Limitation:</strong> SDK features might be
            restricted
          </li>
          <li>
            <strong>CORS Issues:</strong> Zoom SDK might be blocked by browser
          </li>
          <li>
            <strong>Signature Generation:</strong> Backend might not generate
            valid signature
          </li>
          <li>
            <strong>Meeting Access:</strong> Meeting might require paid account
            features
          </li>
        </ul>
      </div>

      {/* Meeting Container for potential SDK embedding */}
      <div
        ref={meetingContainerRef}
        id="zmmtg-root"
        style={{
          width: "100%",
          height: "400px",
          backgroundColor: "#f0f0f0",
          border: "2px dashed #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
          borderRadius: "5px",
        }}
      >
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📹</div>
          <div>Zoom Meeting Container</div>
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
            {debugInfo.loading
              ? "Loading SDK..."
              : debugInfo.error
              ? `Error: ${debugInfo.error}`
              : "Ready for debugging"}
          </div>
        </div>
      </div>
    </div>
  );
}

ZoomDebugComponent.propTypes = {
  sdkKey: PropTypes.string,
  signature: PropTypes.string,
  meetingNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userName: PropTypes.string,
  passWord: PropTypes.string,
  onError: PropTypes.func,
};

export default ZoomDebugComponent;
