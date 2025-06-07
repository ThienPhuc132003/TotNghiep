import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

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

    // Check if Zoom SDK is loaded
    if (typeof ZoomMtg === "undefined") {
      const error = "Zoom SDK not loaded";
      setDebugInfo(prev => ({ ...prev, error }));
      if (onError) onError(error);
      return;
    }

    setDebugInfo(prev => ({ ...prev, sdkLoaded: true }));

    // Simple test without actual meeting join
    try {
      // Test basic SDK functions
      if (typeof ZoomMtg.init === "function") {
        console.log("✅ ZoomMtg.init is available");
      } else {
        throw new Error("ZoomMtg.init is not a function");
      }

      if (typeof ZoomMtg.join === "function") {
        console.log("✅ ZoomMtg.join is available");
      } else {
        throw new Error("ZoomMtg.join is not a function");
      }

      setDebugInfo(prev => ({ ...prev, initSuccess: true }));

    } catch (error) {
      console.error("❌ Zoom SDK test failed:", error);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
      if (onError) onError(error.message);
    }

  }, [sdkKey, signature, meetingNumber, userName, passWord, onError]);

  const testDirectZoomURL = () => {
    const zoomURL = `https://zoom.us/j/${meetingNumber}${passWord ? `?pwd=${passWord}` : ''}`;
    window.open(zoomURL, '_blank');
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔍 Zoom Integration Debug</h2>
      
      <div style={{ background: "#f5f5f5", padding: "15px", marginBottom: "20px", borderRadius: "8px" }}>
        <h3>Debug Information:</h3>
        <ul>
          <li>SDK Key: {debugInfo.sdkKey ? "✅ Present" : "❌ Missing"}</li>
          <li>Signature: {debugInfo.signature ? "✅ Present" : "❌ Missing"}</li>
          <li>Meeting Number: {debugInfo.meetingNumber ? "✅ Present" : "❌ Missing"}</li>
          <li>User Name: {debugInfo.userName ? "✅ Present" : "❌ Missing"}</li>
          <li>SDK Loaded: {debugInfo.sdkLoaded ? "✅ Yes" : "❌ No"}</li>
          <li>Init Success: {debugInfo.initSuccess ? "✅ Yes" : "❌ No"}</li>
          <li>Join Success: {debugInfo.joinSuccess ? "✅ Yes" : "❌ No"}</li>
          {debugInfo.error && <li style={{color: "red"}}>Error: {debugInfo.error}</li>}
        </ul>
      </div>

      <div style={{ background: "#e3f2fd", padding: "15px", marginBottom: "20px", borderRadius: "8px" }}>
        <h3>Zoom Free Account Information:</h3>
        <p><strong>⚠️ Lưu ý về Zoom Free Account:</strong></p>
        <ul>
          <li>Zoom Free có thể hạn chế SDK usage</li>
          <li>Một số tính năng embedded có thể không hoạt động</li>
          <li>Recommended: Test với external Zoom URL trước</li>
        </ul>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test Options:</h3>
        <button
          onClick={testDirectZoomURL}
          style={{
            padding: "12px 24px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          🔗 Test External Zoom URL
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            background: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🔄 Reload Page
        </button>
      </div>

      <div style={{ background: "#fff3cd", padding: "15px", borderRadius: "8px" }}>
        <h3>🚨 Possible Issues:</h3>
        <ol>
          <li><strong>Zoom Free Account Limitation:</strong> SDK features might be restricted</li>
          <li><strong>CORS Issues:</strong> Zoom SDK might be blocked by browser</li>
          <li><strong>Signature Generation:</strong> Backend might not generate valid signature</li>
          <li><strong>Meeting Access:</strong> Meeting might require paid account features</li>
        </ol>
      </div>

      {/* Zoom Container */}
      <div 
        ref={meetingContainerRef}
        id="zoom-meeting-container"
        style={{
          width: "100%",
          height: "600px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          marginTop: "20px",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎥</div>
          <div>Zoom Meeting Container</div>
          <div style={{ fontSize: "12px" }}>
            {debugInfo.error ? `Error: ${debugInfo.error}` : "Waiting for Zoom to load..."}
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
