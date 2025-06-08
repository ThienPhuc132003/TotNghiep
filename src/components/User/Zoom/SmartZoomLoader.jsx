/* eslint-disable no-undef */
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

// Lazy load components
import { lazy, Suspense } from "react";

const ProductionZoomSDK = lazy(() => import("./ProductionZoomSDK"));
const ZoomDebugComponent = lazy(() => import("./ZoomDebugComponent"));
const ZoomMeetingEmbed = lazy(() => import("./ZoomMeetingEmbed"));

/**
 * Smart Zoom Loader - Automatically detects environment and loads appropriate component
 */
const SmartZoomLoader = (props) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState({});
  const [forceComponent, setForceComponent] = useState(null);

  // Comprehensive environment detection
  const detectEnvironment = useMemo(() => {
    const info = {
      // Basic environment (with safe access)
      nodeEnv:
        typeof process !== "undefined" ? process.env.NODE_ENV : "unknown",
      isDevelopment:
        typeof process !== "undefined"
          ? process.env.NODE_ENV === "development"
          : false,
      isProduction:
        typeof process !== "undefined"
          ? process.env.NODE_ENV === "production"
          : false,

      // Build detection
      isViteBuild: import.meta.env?.MODE === "production",
      isWebpackBuild: typeof __webpack_require__ !== "undefined",

      // Code characteristics (detect minification)
      isMinified: (function test() {
        return test.toString().length < 30;
      })(), // URL analysis
      isLocalhost:
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("localhost"),
      isFileProtocol: window.location.protocol === "file:",

      // Production domain detection
      isProductionDomain:
        window.location.hostname === "giasuvlu.click" ||
        window.location.hostname.includes("giasuvlu.click") ||
        (window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" &&
          !window.location.hostname.includes("localhost")),

      // Full URL info for debugging
      currentURL: window.location.href,
      currentHostname: window.location.hostname,
      currentProtocol: window.location.protocol,

      // Performance API
      hasPerformanceAPI: typeof performance !== "undefined",
      hasNavigationTiming: typeof performance.navigation !== "undefined",

      // Error stack analysis (detect production build)
      hasOriginalStackTrace: (() => {
        try {
          throw new Error("test");
        } catch (e) {
          return (
            e.stack.includes("SmartZoomLoader") && !e.stack.includes(".js:1:")
          );
        }
      })(),
      // Feature detection
      hasImportMeta: typeof import.meta !== "undefined",
      hasModuleHotUpdate:
        typeof module !== "undefined" &&
        typeof module.hot !== "undefined" &&
        module.hot,

      // User agent analysis
      userAgent: navigator.userAgent,

      // Timing (production builds typically load faster)
      loadStartTime: Date.now(),
    }; // Advanced production detection
    info.isLikelyProduction =
      (info.isMinified ||
        !info.hasOriginalStackTrace ||
        info.isProductionDomain ||
        (!info.isLocalhost && !info.isFileProtocol) ||
        info.nodeEnv === "production") &&
      !info.isLocalhost; // Never treat localhost as production

    // Advanced development detection (localhost gets priority)
    info.isLikelyDevelopment =
      info.isLocalhost ||
      info.hasModuleHotUpdate ||
      (info.isLocalhost && info.hasOriginalStackTrace) ||
      (info.nodeEnv === "development" && info.isLocalhost);

    return info;
  }, []);

  // Component selection logic
  const selectComponent = useMemo(() => {
    const env = detectEnvironment;
    // Force component if set via URL params, props, or state
    const urlParams = new URLSearchParams(window.location.search);
    const forceParam =
      urlParams.get("zoomComponent") || props.forceComponent || forceComponent;

    if (forceParam) {
      console.log("🎯 [SmartZoomLoader] Forcing component:", forceParam);
      return forceParam;
    }

    // Auto-selection based on environment
    if (env.isLikelyProduction) {
      console.log(
        "🚀 [SmartZoomLoader] Production environment detected, using ProductionZoomSDK"
      );
      return "production";
    } else if (env.isLikelyDevelopment) {
      console.log(
        "🔧 [SmartZoomLoader] Development environment detected, using ZoomDebugComponent"
      );
      return "debug";
    } else {
      console.log(
        "❓ [SmartZoomLoader] Unknown environment, using fallback ZoomMeetingEmbed"
      );
      return "embed";
    }
  }, [detectEnvironment, props.forceComponent, forceComponent]);

  // Set environment info and selected component
  useEffect(() => {
    setEnvironmentInfo(detectEnvironment);
    setSelectedComponent(selectComponent);
    console.log("🌍 [SmartZoomLoader] Environment Analysis:", {
      selected: selectComponent,
      currentURL: detectEnvironment.currentURL,
      currentHostname: detectEnvironment.currentHostname,
      isProductionDomain: detectEnvironment.isProductionDomain,
      isLocalhost: detectEnvironment.isLocalhost,
      isLikelyProduction: detectEnvironment.isLikelyProduction,
      isLikelyDevelopment: detectEnvironment.isLikelyDevelopment,
      environment: detectEnvironment,
      recommendation: detectEnvironment.isLikelyProduction
        ? "Use ProductionZoomSDK"
        : detectEnvironment.isLikelyDevelopment
        ? "Use ZoomDebugComponent"
        : "Use ZoomMeetingEmbed",
    });
  }, [detectEnvironment, selectComponent]);

  // Component renderer
  const renderComponent = () => {
    const commonProps = {
      ...props,
      environmentInfo,
      onComponentSwitch: setForceComponent,
    };

    switch (selectedComponent) {
      case "production":
        return <ProductionZoomSDK {...commonProps} />;
      case "debug":
        return <ZoomDebugComponent {...commonProps} />;
      case "embed":
        return <ZoomMeetingEmbed {...commonProps} />;
      default:
        return <ProductionZoomSDK {...commonProps} />; // Safe fallback
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "200px",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #007bff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <div>Loading Zoom SDK...</div>
      <div style={{ fontSize: "12px", color: "#666" }}>
        Environment:{" "}
        {environmentInfo.isLikelyProduction ? "Production" : "Development"}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="smart-zoom-loader">
      {/* Component Switcher (Development Only) */}
      {environmentInfo.isLikelyDevelopment && (
        <div
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderBottom: "1px solid #dee2e6",
            fontSize: "14px",
          }}
        >
          <strong>🔧 Development Controls:</strong>
          <div style={{ marginTop: "5px" }}>
            <button
              onClick={() => setForceComponent("production")}
              style={{
                margin: "0 5px",
                background:
                  selectedComponent === "production" ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              🚀 Production
            </button>
            <button
              onClick={() => setForceComponent("debug")}
              style={{
                margin: "0 5px",
                background:
                  selectedComponent === "debug" ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              🔧 Debug
            </button>
            <button
              onClick={() => setForceComponent("embed")}
              style={{
                margin: "0 5px",
                background:
                  selectedComponent === "embed" ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              📦 Embed
            </button>
            <button
              onClick={() => setForceComponent(null)}
              style={{
                margin: "0 5px",
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              🤖 Auto
            </button>
          </div>
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Selected: <strong>{selectedComponent}</strong> | Detected:{" "}
            <strong>
              {environmentInfo.isLikelyProduction
                ? "Production"
                : "Development"}
            </strong>{" "}
            | Minified:{" "}
            <strong>{environmentInfo.isMinified ? "Yes" : "No"}</strong>
          </div>
        </div>
      )}

      {/* Main Component */}
      <Suspense fallback={<LoadingSpinner />}>
        {selectedComponent ? renderComponent() : <LoadingSpinner />}
      </Suspense>

      {/* Environment Info (Hidden in Production) */}
      {!environmentInfo.isLikelyProduction && (
        <details
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderTop: "1px solid #dee2e6",
            fontSize: "12px",
          }}
        >
          <summary>🌍 Environment Details</summary>
          <pre
            style={{
              background: "#fff",
              padding: "10px",
              border: "1px solid #dee2e6",
              borderRadius: "3px",
              marginTop: "10px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(environmentInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

SmartZoomLoader.propTypes = {
  forceComponent: PropTypes.oneOf(["production", "debug", "embed"]),
  meetingConfig: PropTypes.object,
  onJoinMeeting: PropTypes.func,
  onLeaveMeeting: PropTypes.func,
  onError: PropTypes.func,
  onSDKReady: PropTypes.func,
};

export default SmartZoomLoader;
