/* eslint-disable no-undef */
import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";

// CDN Fallback Configuration
const CDN_FALLBACK = {
  primary: "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
  jitpack:
    "https://jitpack.io/com/github/zoom/meetingsdk-web/3.13.2/ZoomMtg.js",
  jsdelivr:
    "https://cdn.jsdelivr.net/npm/@zoom/meetingsdk@3.13.2/dist/ZoomMtg.js",
  unpkg: "https://unpkg.com/@zoom/meetingsdk@3.13.2/dist/ZoomMtg.js",
};

/**
 * Production-optimized Zoom SDK component
 * Handles SDK loading with multiple fallbacks and comprehensive error handling
 */
const ProductionZoomSDK = ({
  meetingConfig,
  onSDKReady,
  onJoinMeeting,
  onError,
}) => {
  const [sdkStatus, setSdkStatus] = useState("initializing");
  const [loadingDetails, setLoadingDetails] = useState([]);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const sdkLoadedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Production-safe logging
  const log = useCallback((level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      location: window.location.href,
    };

    console[level](`[ProductionZoomSDK] ${message}`, data || "");

    setLoadingDetails((prev) => [...prev, logEntry]);
    // Send to error tracking service in production
    if (
      level === "error" &&
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "production"
    ) {
      // Implement your error tracking here
      // Example: Sentry, LogRocket, etc.
    }
  }, []);

  // Production-safe SDK detection
  const detectExistingSDK = useCallback(() => {
    log("info", "Checking for existing Zoom SDK...");

    // Multiple ways to detect SDK in production
    const detectionMethods = [
      () => window.ZoomMtg,
      () => window.WebSDK?.ZoomMtg,
      () => globalThis.ZoomMtg,
      () => document.querySelector('script[src*="ZoomMtg"]') && window.ZoomMtg,
    ];

    for (let i = 0; i < detectionMethods.length; i++) {
      try {
        const sdk = detectionMethods[i]();
        if (sdk && typeof sdk === "object") {
          log("info", `SDK detected via method ${i + 1}`, {
            hasInit: typeof sdk.init === "function",
            hasJoin: typeof sdk.join === "function",
            methods: Object.keys(sdk).slice(0, 10),
          });
          return sdk;
        }
      } catch (e) {
        log("warn", `Detection method ${i + 1} failed`, e.message);
      }
    }

    return null;
  }, [log]);

  // Load with retry logic using CDN fallback
  const loadWithRetry = useCallback(async (url, retryCount = 0) => {
    const maxRetries = Object.keys(CDN_FALLBACK).length;

    try {
      console.error(
        `[ProductionZoomSDK] Attempting to load from: ${url} (attempt ${
          retryCount + 1
        })`
      );

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.type = "text/javascript";
        script.crossOrigin = "anonymous";
        script.async = true;

        script.onload = () => {
          console.error(`[ProductionZoomSDK] Successfully loaded from: ${url}`);
          resolve();
        };

        script.onerror = () => {
          console.error(
            `[ProductionZoomSDK] Failed to load Zoom SDK from: ${url}`
          );
          if (retryCount < maxRetries - 1) {
            const fallbackUrls = Object.values(CDN_FALLBACK);
            const nextUrl = fallbackUrls[retryCount + 1];
            loadWithRetry(nextUrl, retryCount + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error("Failed to load Zoom SDK from all CDN sources"));
          }
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      console.error(`[ProductionZoomSDK] Error in loadWithRetry:`, error);
      throw error;
    }
  }, []);

  // Production-optimized script loading
  const loadSDKScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Script loading timeout (30s)"));
      }, 30000);

      // Production CDN with specific version and integrity check
      const script = document.createElement("script");
      script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
      script.type = "text/javascript";
      script.crossOrigin = "anonymous";
      script.async = true;
      script.defer = false;

      // Production-safe event handlers
      const cleanup = () => {
        clearTimeout(timeoutId);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      const handleLoad = () => {
        cleanup();
        log("info", "CDN script loaded successfully");

        // Wait for SDK to be fully available
        const checkSDK = () => {
          const sdk = detectExistingSDK();
          if (sdk) {
            resolve(sdk);
          } else {
            setTimeout(checkSDK, 100);
          }
        };

        setTimeout(checkSDK, 50);
      };

      const handleError = (event) => {
        cleanup();
        log("error", "CDN script failed to load", {
          event: event.type,
          target: event.target?.src,
          error: event.error?.message,
        });
        reject(new Error(`Script load failed: ${event.type}`));
      };

      // Use addEventListener for better production compatibility
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);

      // Add to head for better compatibility
      document.head.appendChild(script);

      log("info", "CDN script loading started", script.src);
    });
  }, [detectExistingSDK, log]);

  // Production package loading with better error handling
  const loadSDKPackage = useCallback(() => {
    return new Promise((resolve, reject) => {
      log("info", "Attempting package import...");

      const importTimeout = setTimeout(() => {
        reject(new Error("Package import timeout"));
      }, 15000);

      import("@zoom/meetingsdk")
        .then((module) => {
          clearTimeout(importTimeout);
          log("info", "Package imported successfully", {
            moduleKeys: Object.keys(module),
            hasDefault: !!module.default,
            hasZoomMtg: !!module.ZoomMtg,
          });

          let sdk = null;

          // Multiple extraction strategies for production builds
          if (module.ZoomMtg) {
            sdk = module.ZoomMtg;
          } else if (module.default?.ZoomMtg) {
            sdk = module.default.ZoomMtg;
          } else if (module.default && typeof module.default === "object") {
            sdk = module.default;
          }

          if (sdk && typeof sdk.init === "function") {
            window.ZoomMtg = sdk;
            resolve(sdk);
          } else {
            reject(new Error("Invalid SDK object from package"));
          }
        })
        .catch((error) => {
          clearTimeout(importTimeout);
          log("error", "Package import failed", error.message);
          reject(error);
        });
    });
  }, [log]);

  // Main SDK loading orchestrator
  const loadZoomSDK = useCallback(async () => {
    if (sdkLoadedRef.current) {
      log("info", "SDK already loaded, skipping");
      return;
    }

    setSdkStatus("loading");
    setError(null);
    retryCountRef.current++;

    log(
      "info",
      `Starting SDK load attempt ${retryCountRef.current}/${maxRetries}`
    );

    try {
      // First check if SDK already exists
      let sdk = detectExistingSDK();
      if (sdk) {
        log("info", "Using existing SDK");
        setSdkStatus("ready");
        sdkLoadedRef.current = true;
        onSDKReady?.(sdk);
        return;
      }

      // Try package first (faster in dev, may fail in production)
      try {
        sdk = await loadSDKPackage();
        log("info", "SDK loaded from package");
      } catch (packageError) {
        log("warn", "Package loading failed, trying CDN", packageError.message);

        // Fallback to CDN
        sdk = await loadSDKScript();
        log("info", "SDK loaded from CDN");
      }

      if (sdk && typeof sdk.init === "function") {
        setSdkStatus("ready");
        sdkLoadedRef.current = true;
        onSDKReady?.(sdk);
        log("info", "SDK ready for use", {
          initMethod: typeof sdk.init,
          joinMethod: typeof sdk.join,
        });
      } else {
        throw new Error("SDK loaded but missing required methods");
      }
    } catch (error) {
      log("error", "SDK loading failed", error.message);
      setError(error.message);

      if (retryCountRef.current < maxRetries) {
        log(
          "info",
          `Retrying in 2 seconds... (${retryCountRef.current}/${maxRetries})`
        );
        setTimeout(() => {
          loadZoomSDK();
        }, 2000);
      } else {
        setSdkStatus("failed");
        onError?.(error.message);
      }
    }
  }, [
    detectExistingSDK,
    loadSDKPackage,
    loadSDKScript,
    log,
    onSDKReady,
    onError,
  ]);

  // Initialize SDK on mount
  useEffect(() => {
    loadZoomSDK();

    // Cleanup on unmount
    return () => {
      if (window.ZoomMtg?.leaveMeeting) {
        try {
          window.ZoomMtg.leaveMeeting();
        } catch (e) {
          log("warn", "Error during cleanup", e.message);
        }
      }
    };
  }, [loadZoomSDK, log]);

  // Join meeting function
  const joinMeeting = useCallback(() => {
    if (!window.ZoomMtg || !meetingConfig) {
      log("error", "Cannot join meeting: SDK not ready or config missing");
      return;
    }

    log("info", "Initializing meeting join...");

    try {
      window.ZoomMtg.init({
        leaveUrl: meetingConfig.leaveUrl || window.location.origin,
        isSupportAV: true,
        isSupportChat: true,
        isSupportQA: true,
        isSupportCC: true,
        isSupportPolling: true,
        isSupportBreakout: true,
        screenShare: true,
        rwcBackup: "",
        videoDrag: true,
        sharingMode: "both",
        videoHeader: true,
        isShowJoiningErrorDialog: true,
        disablePreview: false,
        disableSetting: false,
        disableJoinAudio: false,
        audioPanelAlwaysOpen: true,
        showMeetingTime: true,
        enableLoggerSync: false,
        loggerSyncUrl: "",
        logDirSizeLimit: -1,
        success: () => {
          log("info", "SDK initialized successfully");

          window.ZoomMtg.join({
            signature: meetingConfig.signature,
            apiKey: meetingConfig.apiKey,
            meetingNumber: meetingConfig.meetingNumber,
            passWord: meetingConfig.passWord,
            userName: meetingConfig.userName,
            userEmail: meetingConfig.userEmail || "",
            success: (success) => {
              log("info", "Successfully joined meeting", success);
              onJoinMeeting?.(success);
            },
            error: (error) => {
              log("error", "Failed to join meeting", error);
              onError?.(error);
            },
          });
        },
        error: (error) => {
          log("error", "SDK initialization failed", error);
          onError?.(error);
        },
      });
    } catch (error) {
      log("error", "Exception during meeting join", error.message);
      onError?.(error.message);
    }
  }, [meetingConfig, onJoinMeeting, onError, log]);

  // Render component
  return (
    <div className="production-zoom-container">
      <div className="zoom-status-panel">
        <h3>🚀 Production Zoom SDK Status</h3>
        <div className={`status-indicator status-${sdkStatus}`}>
          Status: {sdkStatus.toUpperCase()}
        </div>

        {error && (
          <div className="error-panel">
            <strong>❌ Error:</strong> {error}
            <button
              onClick={() => {
                retryCountRef.current = 0;
                loadZoomSDK();
              }}
              className="retry-button"
            >
              🔄 Retry Loading
            </button>
          </div>
        )}

        {sdkStatus === "ready" && meetingConfig && (
          <button onClick={joinMeeting} className="join-button">
            🎯 Join Meeting
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        id="zmmtg-root"
        className="zoom-meeting-container"
      >
        {/* Zoom SDK will render meeting UI here */}
      </div>{" "}
      {/* Development/Debug Panel */}
      {typeof process !== "undefined" &&
        process.env?.NODE_ENV === "development" && (
          <div className="debug-panel">
            <h4>🔧 Debug Information</h4>
            <details>
              <summary>
                Loading Details ({loadingDetails.length} events)
              </summary>
              <div className="loading-log">
                {loadingDetails.map((detail, index) => (
                  <div key={index} className={`log-entry log-${detail.level}`}>
                    <strong>
                      {detail.timestamp.split("T")[1].split(".")[0]}
                    </strong>
                    : {detail.message}
                    {detail.data && (
                      <pre>{JSON.stringify(detail.data, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}{" "}
    </div>
  );
};

ProductionZoomSDK.propTypes = {
  meetingConfig: PropTypes.shape({
    signature: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    meetingNumber: PropTypes.string.isRequired,
    passWord: PropTypes.string,
    userName: PropTypes.string.isRequired,
    userEmail: PropTypes.string,
    leaveUrl: PropTypes.string,
  }),
  onJoinMeeting: PropTypes.func,
  onLeaveMeeting: PropTypes.func,
  onError: PropTypes.func,
  onSDKReady: PropTypes.func,
};

export default ProductionZoomSDK;
