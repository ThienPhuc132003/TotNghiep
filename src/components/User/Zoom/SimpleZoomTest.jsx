import { useEffect, useState, useCallback } from "react";

// Simple Zoom SDK Test Component
function SimpleZoomTest() {
  const [status, setStatus] = useState("Initializing...");
  const [logs, setLogs] = useState([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(message);
    setLogs((prev) => [...prev, logEntry].slice(-20)); // Keep last 20 logs
  };

  useEffect(() => {
    addLog("🚀 Starting simple Zoom SDK test...");
    setStatus("Testing network connectivity...");

    // Test 1: Basic connectivity
    fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
    })
      .then(() => {
        addLog("✅ Network connectivity OK");
        setStatus("Testing Zoom CDN accessibility...");

        // Test 2: Zoom CDN accessibility
        return fetch("https://source.zoom.us/3.13.2/lib/ZoomMtg.js", {
          method: "HEAD",
        });
      })
      .then((response) => {
        if (response.ok) {
          addLog("✅ Zoom CDN accessible");
          setStatus("Loading Zoom SDK...");

          // Test 3: Load actual SDK
          return loadZoomSDK();
        } else {
          throw new Error(`CDN returned status: ${response.status}`);
        }
      })
      .then(() => {
        addLog("✅ Zoom SDK loaded successfully!");
        setSdkLoaded(true);
        setStatus("SDK loaded and ready");
      })
      .catch((error) => {
        addLog(`❌ Error: ${error.message}`);
        setStatus(`Error: ${error.message}`);
      });
  }, [addLog, loadZoomSDK]); // Fixed dependencies
  const loadZoomSDK = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.ZoomMtg) {
        addLog("✅ SDK already loaded");
        resolve();
        return;
      }

      addLog("📦 Attempting package import...");

      // Try ES6 import first
      import("@zoom/meetingsdk")
        .then((module) => {
          if (module.ZoomMtg) {
            window.ZoomMtg = module.ZoomMtg;
            addLog("✅ Loaded via package import");
            resolve();
          } else {
            throw new Error("ZoomMtg not found in package");
          }
        })
        .catch(() => {
          addLog("📡 Package import failed, trying CDN...");

          const script = document.createElement("script");
          script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
          script.crossOrigin = "anonymous";

          script.onload = () => {
            if (window.ZoomMtg) {
              addLog("✅ Loaded via CDN");
              resolve();
            } else {
              reject(new Error("CDN loaded but ZoomMtg not found"));
            }
          };

          script.onerror = () => {
            reject(new Error("Failed to load from CDN"));
          };

          setTimeout(() => {
            if (!window.ZoomMtg) {
              reject(new Error("CDN load timeout"));
            }
          }, 15000);

          document.head.appendChild(script);
        });
    });
  }, [addLog]);

  const testDirectZoom = () => {
    const meetingId = prompt("Enter meeting ID to test direct Zoom URL:");
    if (meetingId) {
      window.open(`https://zoom.us/j/${meetingId}`, "_blank");
    }
  };

  const forceReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔧 Simple Zoom SDK Test</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Status:</h3>
        <div
          style={{
            padding: "10px",
            backgroundColor: sdkLoaded ? "#d4edda" : "#fff3cd",
            border: `1px solid ${sdkLoaded ? "#c3e6cb" : "#ffeaa7"}`,
            borderRadius: "4px",
          }}
        >
          {status}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test Results:</h3>
        <ul>
          <li>
            Network:{" "}
            {logs.some((log) => log.includes("Network connectivity OK"))
              ? "✅"
              : "❓"}
          </li>
          <li>
            Zoom CDN:{" "}
            {logs.some((log) => log.includes("Zoom CDN accessible"))
              ? "✅"
              : "❓"}
          </li>
          <li>SDK Loaded: {sdkLoaded ? "✅" : "❓"}</li>
        </ul>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testDirectZoom}
          style={{ marginRight: "10px", padding: "10px 15px" }}
        >
          🔗 Test Direct Zoom URL
        </button>
        <button onClick={forceReload} style={{ padding: "10px 15px" }}>
          🔄 Reload Test
        </button>
      </div>

      <div>
        <h3>Logs:</h3>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "10px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SimpleZoomTest;
