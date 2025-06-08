import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// Enhanced Zoom SDK loading with comprehensive error handling and fallbacks
const loadZoomSDK = () => {
  return new Promise((resolve, reject) => {
    console.log("🔍 Starting comprehensive Zoom SDK loading process...");

    // Check if already loaded
    if (window.ZoomMtg) {
      console.log("✅ Zoom SDK already loaded from previous session");
      resolve({ sdk: window.ZoomMtg, source: "Already Loaded" });
      return;
    }

    // Step 1: Try ES6 import with timeout
    console.log("📦 Attempting ES6 import from @zoom/meetingsdk...");

    const importPromise = import("@zoom/meetingsdk").then((module) => {
      console.log("📦 Package imported successfully:", Object.keys(module));

      if (module.ZoomMtg) {
        window.ZoomMtg = module.ZoomMtg;
        console.log("✅ Zoom SDK loaded via ES6 import");
        console.log(
          "🔧 Available methods:",
          Object.getOwnPropertyNames(module.ZoomMtg).slice(0, 10)
        );
        return { sdk: module.ZoomMtg, source: "ES6 Import" };
      } else if (module.default && module.default.ZoomMtg) {
        window.ZoomMtg = module.default.ZoomMtg;
        console.log("✅ Zoom SDK loaded via ES6 import (default export)");
        return { sdk: module.default.ZoomMtg, source: "ES6 Import (default)" };
      } else {
        console.log("❌ ZoomMtg not found in imported module");
        throw new Error("ZoomMtg not found in package");
      }
    });

    // Step 2: Set timeout for ES6 import
    const timeoutPromise = new Promise((_, timeoutReject) => {
      setTimeout(() => {
        timeoutReject(new Error("ES6 import timeout"));
      }, 10000);
    });

    // Step 3: Race between import and timeout
    Promise.race([importPromise, timeoutPromise])
      .then(resolve)
      .catch((importError) => {
        console.log("❌ ES6 import failed:", importError.message);
        console.log("📡 Falling back to CDN loading...");
        loadFromCDN(resolve, reject);
      });
  });
};

// Enhanced CDN loading with comprehensive debugging
const loadFromCDN = (resolve, reject) => {
  console.log("📡 Starting CDN loading process...");

  // Enhanced CDN URLs with more fallbacks
  const cdnUrls = [
    "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
    "https://source.zoom.us/lib/ZoomMtg.js",
    "https://dmogdx0jrul3u.cloudfront.net/3.13.2/lib/ZoomMtg.js",
    "https://source.zoom.us/2.18.0/lib/ZoomMtg.js", // Fallback to older version
  ];

  let currentUrlIndex = 0;
  let attemptResults = [];

  const tryNextUrl = () => {
    if (currentUrlIndex >= cdnUrls.length) {
      console.error("❌ All CDN sources failed");
      console.log("📊 Attempt results:", attemptResults);

      // Provide detailed error information
      const detailedError = new Error(
        `Failed to load Zoom SDK from all CDN sources. Attempts: ${attemptResults.length}`
      );
      detailedError.attempts = attemptResults;
      reject(detailedError);
      return;
    }

    const currentUrl = cdnUrls[currentUrlIndex];
    console.log(
      `📡 Attempting CDN ${currentUrlIndex + 1}/${
        cdnUrls.length
      }: ${currentUrl}`
    );

    const script = document.createElement("script");
    script.src = currentUrl;
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";

    const startTime = Date.now();

    script.onload = () => {
      const loadTime = Date.now() - startTime;
      console.log(
        `✅ Script loaded successfully from: ${currentUrl} (${loadTime}ms)`
      );

      // Check if ZoomMtg is actually available
      if (window.ZoomMtg) {
        console.log("✅ ZoomMtg confirmed available on window");
        console.log("🔧 ZoomMtg type:", typeof window.ZoomMtg);
        console.log(
          "📋 Available methods:",
          Object.getOwnPropertyNames(window.ZoomMtg)
        );

        attemptResults.push({
          url: currentUrl,
          status: "success",
          loadTime: loadTime,
        });

        resolve({
          sdk: window.ZoomMtg,
          source: `CDN: ${currentUrl}`,
          attempts: attemptResults,
        });
      } else {
        console.log("❌ Script loaded but ZoomMtg not found on window");
        attemptResults.push({
          url: currentUrl,
          status: "loaded_but_no_zoom",
          loadTime: loadTime,
          error: "ZoomMtg not found after load",
        });
        currentUrlIndex++;
        tryNextUrl();
      }
    };

    script.onerror = (error) => {
      const loadTime = Date.now() - startTime;
      console.warn(
        `❌ Failed to load from: ${currentUrl} (${loadTime}ms)`,
        error
      );

      attemptResults.push({
        url: currentUrl,
        status: "failed",
        loadTime: loadTime,
        error: error.message || "Script load error",
      });

      currentUrlIndex++;
      tryNextUrl();
    };

    // Enhanced timeout handling
    const timeoutId = setTimeout(() => {
      const loadTime = Date.now() - startTime;
      if (!window.ZoomMtg) {
        console.warn(`⏱️ Timeout loading from: ${currentUrl} (${loadTime}ms)`);

        attemptResults.push({
          url: currentUrl,
          status: "timeout",
          loadTime: loadTime,
          error: "Load timeout",
        });

        // Remove the script element
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        currentUrlIndex++;
        tryNextUrl();
      }
    }, 12000); // 12 second timeout per URL

    // Clear timeout if script loads successfully
    script.addEventListener("load", () => clearTimeout(timeoutId));
    script.addEventListener("error", () => clearTimeout(timeoutId));

    console.log(`📎 Appending script to document head...`);
    document.head.appendChild(script);
  };

  // Test basic connectivity first
  console.log("🌐 Testing basic connectivity...");
  fetch("https://www.google.com", { method: "HEAD", mode: "no-cors" })
    .then(() => {
      console.log("✅ Basic connectivity confirmed");
      tryNextUrl();
    })
    .catch(() => {
      console.log("⚠️ Basic connectivity test failed, but continuing anyway");
      tryNextUrl();
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
    loadingStatus: "Initializing...",
    sdkSource: null,
    loadAttempts: [],
    networkStatus: "unknown",
    debugLog: [],
  });

  const meetingContainerRef = useRef(null);
  useEffect(() => {
    console.log("🔍 ZoomDebugComponent mounted with props:", {
      sdkKey: sdkKey ? `${sdkKey.substring(0, 10)}...` : "Missing",
      signature: signature ? `${signature.substring(0, 20)}...` : "Missing",
      meetingNumber,
      userName,
      passWord: passWord ? "Present" : "Missing",
    });

    // Add to debug log
    const addToDebugLog = (message) => {
      console.log(message);
      setDebugInfo((prev) => ({
        ...prev,
        debugLog: [
          ...prev.debugLog,
          `${new Date().toLocaleTimeString()}: ${message}`,
        ].slice(-10),
      }));
    };

    addToDebugLog("🚀 Starting Zoom SDK loading...");
    setDebugInfo((prev) => ({
      ...prev,
      loadingStatus: "Checking network connectivity...",
    }));

    // Test basic network connectivity first
    fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
    })
      .then(() => {
        addToDebugLog("✅ Network connectivity confirmed");
        setDebugInfo((prev) => ({ ...prev, networkStatus: "connected" }));
      })
      .catch(() => {
        addToDebugLog("⚠️ Network connectivity test failed");
        setDebugInfo((prev) => ({ ...prev, networkStatus: "disconnected" }));
      })
      .finally(() => {
        setDebugInfo((prev) => ({
          ...prev,
          loadingStatus: "Loading Zoom SDK...",
        }));

        // Load Zoom SDK
        loadZoomSDK()
          .then((result) => {
            addToDebugLog(
              `✅ Zoom SDK loaded successfully from: ${result.source}`
            );

            setDebugInfo((prev) => ({
              ...prev,
              sdkLoaded: true,
              loading: false,
              loadingStatus: "SDK loaded successfully",
              sdkSource: result.source,
              loadAttempts: result.attempts || [],
            }));

            // Validate SDK functionality
            if (typeof result.sdk.init === "function") {
              addToDebugLog("✅ ZoomMtg.init is available");
              setDebugInfo((prev) => ({ ...prev, initSuccess: true }));

              // Test more SDK methods
              const availableMethods = {
                init: typeof result.sdk.init === "function",
                join: typeof result.sdk.join === "function",
                setZoomJSLib: typeof result.sdk.setZoomJSLib === "function",
                preLoadWasm: typeof result.sdk.preLoadWasm === "function",
                prepareWebSDK: typeof result.sdk.prepareWebSDK === "function",
              };

              const methodCount =
                Object.values(availableMethods).filter(Boolean).length;
              addToDebugLog(`🔧 SDK Methods available: ${methodCount}/5`);
              console.log("🔧 Available SDK methods:", availableMethods);
            } else {
              throw new Error("ZoomMtg.init is not a function");
            }
          })
          .catch((error) => {
            console.error("❌ Failed to load Zoom SDK:", error);
            const errorMessage = error.message || "Zoom SDK loading failed";

            addToDebugLog(`❌ SDK Loading failed: ${errorMessage}`);

            setDebugInfo((prev) => ({
              ...prev,
              error: errorMessage,
              loading: false,
              loadingStatus: `Error: ${errorMessage}`,
              loadAttempts: error.attempts || [],
            }));

            if (onError) onError(errorMessage);
          });
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
  const testWithProductionComponent = () => {
    if (!sdkKey || !signature || !meetingNumber || !userName) {
      alert("All props are required for production component test");
      return;
    }

    console.log("🚀 Switching to production ZoomMeetingEmbed component...");
    alert(
      "This would switch to ZoomMeetingEmbed component. Check console for details."
    );

    // Log what would be passed to production component
    console.log("📋 Production component props:", {
      sdkKey,
      signature,
      meetingNumber,
      userName,
      passWord,
    });
  };

  const forceReloadSDK = () => {
    console.log("🔄 Force reloading Zoom SDK...");

    // Clear existing SDK
    window.ZoomMtg = undefined;

    // Remove any existing script tags
    const existingScripts = document.querySelectorAll('script[src*="zoom"]');
    existingScripts.forEach((script) => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });

    // Reset state
    setDebugInfo((prev) => ({
      ...prev,
      sdkLoaded: false,
      initSuccess: false,
      joinSuccess: false,
      error: null,
      loading: true,
      loadingStatus: "Force reloading SDK...",
      sdkSource: null,
      loadAttempts: [],
      debugLog: [],
    }));

    // Reload the component
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearDebugLog = () => {
    setDebugInfo((prev) => ({ ...prev, debugLog: [] }));
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
          </span>{" "}
          <span>User Name:</span>
          <span style={{ color: debugInfo.userName ? "#28a745" : "#dc3545" }}>
            {debugInfo.userName ? "✅ Present" : "❌ Missing"}
          </span>
          <span>Network Status:</span>
          <span
            style={{
              color:
                debugInfo.networkStatus === "connected" ? "#28a745" : "#dc3545",
            }}
          >
            {debugInfo.networkStatus === "connected"
              ? "✅ Connected"
              : debugInfo.networkStatus === "disconnected"
              ? "❌ Disconnected"
              : "⏳ Testing..."}
          </span>
          <span>SDK Loaded:</span>
          <span style={{ color: debugInfo.sdkLoaded ? "#28a745" : "#dc3545" }}>
            {debugInfo.loading
              ? `⏳ ${debugInfo.loadingStatus}`
              : debugInfo.sdkLoaded
              ? `✅ Yes (${debugInfo.sdkSource})`
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
      {/* Debug Log Section */}
      {debugInfo.debugLog.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
          }}
        >
          <h3>📋 Debug Log:</h3>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "#000",
              color: "#00ff00",
              padding: "10px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {debugInfo.debugLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}
      {/* Load Attempts Section */}
      {debugInfo.loadAttempts.length > 0 && (
        <div
          style={{
            backgroundColor: "#e9ecef",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ced4da",
          }}
        >
          <h3>🔄 Load Attempts:</h3>
          {debugInfo.loadAttempts.map((attempt, index) => (
            <div
              key={index}
              style={{
                marginBottom: "8px",
                padding: "8px",
                backgroundColor:
                  attempt.status === "success" ? "#d4edda" : "#f8d7da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <strong>Attempt {index + 1}:</strong> {attempt.url}
              <br />
              <span
                style={{
                  color: attempt.status === "success" ? "#155724" : "#721c24",
                }}
              >
                Status: {attempt.status} ({attempt.loadTime}ms)
                {attempt.error && ` - ${attempt.error}`}
              </span>
            </div>
          ))}
        </div>
      )}
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
        </button>{" "}
        <button
          onClick={reloadPage}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔄 Reload Page
        </button>{" "}
        <button
          onClick={testWithProductionComponent}
          style={{
            padding: "10px 15px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🚀 Test Production Component
        </button>
        <button
          onClick={forceReloadSDK}
          style={{
            padding: "10px 15px",
            backgroundColor: "#fd7e14",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔄 Force Reload SDK
        </button>
        <button
          onClick={clearDebugLog}
          style={{
            padding: "10px 15px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🗑️ Clear Log
        </button>
      </div>{" "}
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
            <strong>SDK Loading Failed:</strong> Network issues or CDN blocked.
            <br />
            <em>
              Solution: Check network connection, try VPN, or use production
              component
            </em>
          </li>
          <li>
            <strong>Zoom Free Account Limitation:</strong> SDK features might be
            restricted
            <br />
            <em>
              Solution: Test with external Zoom URL first, consider paid account
            </em>
          </li>
          <li>
            <strong>CORS Issues:</strong> Browser blocking cross-origin requests
            <br />
            <em>
              Solution: Check browser console, disable strict CORS in dev mode
            </em>
          </li>
          <li>
            <strong>Signature Generation:</strong> Backend might not generate
            valid signature
            <br />
            <em>Solution: Check API response, verify Zoom app credentials</em>
          </li>
          <li>
            <strong>Meeting Access:</strong> Meeting might require paid account
            features
            <br />
            <em>
              Solution: Verify meeting settings, check Zoom plan limitations
            </em>
          </li>
        </ul>

        {debugInfo.error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fff",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
          >
            <strong>Current Error:</strong> {debugInfo.error}
            <br />
            <em>Try reloading the page or switching to production component</em>
          </div>
        )}
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
