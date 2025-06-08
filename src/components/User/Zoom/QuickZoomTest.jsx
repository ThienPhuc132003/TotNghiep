import { useEffect, useState } from "react";

// Quick Zoom SDK Test Component for integration testing
function QuickZoomTest() {
  const [testResult, setTestResult] = useState({
    status: "initializing",
    message: "Starting Zoom SDK test...",
    sdkLoaded: false,
    error: null,
    details: [],
  });
  useEffect(() => {
    runQuickTest();
  }, [runQuickTest]);

  const addDetail = (detail) => {
    setTestResult((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        `${new Date().toLocaleTimeString()}: ${detail}`,
      ],
    }));
  };

  const runQuickTest = async () => {
    try {
      addDetail("🚀 Starting quick Zoom SDK test");
      setTestResult((prev) => ({
        ...prev,
        status: "testing",
        message: "Testing Zoom SDK...",
      }));

      // Test 1: Basic connectivity
      addDetail("🌐 Testing network connectivity...");
      try {
        await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
        });
        addDetail("✅ Network connectivity OK");
      } catch (error) {
        addDetail("⚠️ Network test failed - continuing anyway");
      }

      // Test 2: Package import
      addDetail("📦 Testing package import...");
      try {
        const module = await import("@zoom/meetingsdk");

        if (module.ZoomMtg) {
          window.ZoomMtg = module.ZoomMtg;
          addDetail("✅ Package imported successfully");
          setTestResult((prev) => ({
            ...prev,
            status: "success",
            message: "Zoom SDK loaded successfully via package import!",
            sdkLoaded: true,
          }));
          return;
        } else if (module.default && module.default.ZoomMtg) {
          window.ZoomMtg = module.default.ZoomMtg;
          addDetail("✅ Package imported successfully (default export)");
          setTestResult((prev) => ({
            ...prev,
            status: "success",
            message: "Zoom SDK loaded successfully via default export!",
            sdkLoaded: true,
          }));
          return;
        } else {
          throw new Error("ZoomMtg not found in package");
        }
      } catch (importError) {
        addDetail(`❌ Package import failed: ${importError.message}`);
        addDetail("📡 Trying CDN fallback...");

        // Test 3: CDN fallback
        try {
          await loadViaCDN();
          addDetail("✅ CDN loading successful");
          setTestResult((prev) => ({
            ...prev,
            status: "success",
            message: "Zoom SDK loaded successfully via CDN!",
            sdkLoaded: true,
          }));
        } catch (cdnError) {
          throw cdnError;
        }
      }
    } catch (error) {
      addDetail(`❌ All loading methods failed: ${error.message}`);
      setTestResult((prev) => ({
        ...prev,
        status: "error",
        message: `Failed to load Zoom SDK: ${error.message}`,
        error: error.message,
      }));
    }
  };

  const loadViaCDN = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
      script.crossOrigin = "anonymous";

      script.onload = () => {
        if (window.ZoomMtg) {
          resolve();
        } else {
          reject(new Error("CDN loaded but ZoomMtg not found"));
        }
      };

      script.onerror = () => {
        reject(new Error("CDN script failed to load"));
      };

      setTimeout(() => {
        if (!window.ZoomMtg) {
          reject(new Error("CDN load timeout"));
        }
      }, 15000);

      document.head.appendChild(script);
    });
  };

  const retryTest = () => {
    // Clear window.ZoomMtg to force fresh load
    if (window.ZoomMtg) {
      delete window.ZoomMtg;
    }

    setTestResult({
      status: "initializing",
      message: "Retrying Zoom SDK test...",
      sdkLoaded: false,
      error: null,
      details: [],
    });

    setTimeout(runQuickTest, 500);
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case "success":
        return "#d4edda";
      case "error":
        return "#f8d7da";
      case "testing":
        return "#fff3cd";
      default:
        return "#d1ecf1";
    }
  };

  const getStatusBorder = () => {
    switch (testResult.status) {
      case "success":
        return "#c3e6cb";
      case "error":
        return "#f5c6cb";
      case "testing":
        return "#ffeaa7";
      default:
        return "#bee5eb";
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2>⚡ Quick Zoom SDK Test</h2>

      <div
        style={{
          padding: "15px",
          backgroundColor: getStatusColor(),
          border: `1px solid ${getStatusBorder()}`,
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h3>Status: {testResult.status.toUpperCase()}</h3>
        <p>{testResult.message}</p>

        <div style={{ marginTop: "10px" }}>
          <strong>Results:</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li>SDK Loaded: {testResult.sdkLoaded ? "✅ Yes" : "❌ No"}</li>
            <li>
              Window.ZoomMtg: {window.ZoomMtg ? "✅ Available" : "❌ Not Found"}
            </li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={retryTest}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔄 Retry Test
        </button>

        <button
          onClick={() => window.open("https://zoom.us/test", "_blank")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔗 Test Zoom Website
        </button>
      </div>

      {testResult.details.length > 0 && (
        <div>
          <h3>📋 Test Details</h3>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #dee2e6",
            }}
          >
            {testResult.details.map((detail, index) => (
              <div key={index}>{detail}</div>
            ))}
          </div>
        </div>
      )}

      {testResult.status === "error" && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "5px",
          }}
        >
          <h3>🔧 Troubleshooting Tips</h3>
          <ul>
            <li>Check your internet connection</li>
            <li>Try disabling browser extensions</li>
            <li>Test in incognito/private mode</li>
            <li>Check if company firewall blocks Zoom domains</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default QuickZoomTest;
