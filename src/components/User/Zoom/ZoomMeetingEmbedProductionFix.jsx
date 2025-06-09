// src/components/Zoom/ZoomMeetingEmbedProductionFix.jsx
// Production-ready fix for black screen issue on https://giasuvlu.click
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import "../../../assets/css/ZoomMeetingEmbed.style.css";

// Enhanced global state management
let sdkGloballyPrepared = false;
let isSDKLoading = false;
let sdkInitialized = false;
let ZoomMtg = null;
const MAX_RETRIES = 3;

function ZoomMeetingEmbedProductionFix({
  sdkKey,
  signature,
  meetingNumber,
  userName,
  userEmail,
  passWord,
  customLeaveUrl,
  onMeetingEnd,
  onError,
  onMeetingJoined,
}) {
  const meetingContainerRef = useRef(null);
  const [isSdkCallInProgress, setIsSdkCallInProgress] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [meetingJoined, setMeetingJoined] = useState(false); // Track successful join

  const handleSdkError = useCallback(
    (message, errorCode = null, errorObject = null) => {
      const fullMessage = errorCode
        ? `${message} (Mã lỗi: ${errorCode})`
        : message;

      console.error("[ZoomMeetingEmbedProductionFix] SDK Error:", {
        message: fullMessage,
        errorCode,
        errorObject,
        retryCount,
        timestamp: new Date().toISOString(),
      });

      setSdkError(fullMessage);
      if (onError) onError(fullMessage);
      setIsSdkCallInProgress(false);
    },
    [onError, retryCount]
  );

  // Critical fix: Enhanced SDK preparation with better error handling
  const prepareSDK = useCallback(async () => {
    if (sdkGloballyPrepared && ZoomMtg) {
      console.log("[ZoomMeetingEmbedProductionFix] SDK already prepared");
      return true;
    }

    if (isSDKLoading) {
      console.log(
        "[ZoomMeetingEmbedProductionFix] SDK loading in progress, waiting..."
      );
      // Wait for current loading to complete
      let waitCount = 0;
      while (isSDKLoading && waitCount < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitCount++;
      }
      return sdkGloballyPrepared;
    }

    isSDKLoading = true;
    console.log("[ZoomMeetingEmbedProductionFix] Starting SDK preparation...");

    try {
      // Step 1: Load ZoomMtg with multiple fallback methods
      if (!ZoomMtg) {
        console.log("[ZoomMeetingEmbedProductionFix] Loading Zoom SDK...");

        // Method 1: Try dynamic import
        try {
          console.log(
            "[ZoomMeetingEmbedProductionFix] Attempting dynamic import..."
          );
          const module = await import("@zoom/meetingsdk");

          if (module.ZoomMtg) {
            ZoomMtg = module.ZoomMtg;
            window.ZoomMtg = module.ZoomMtg;
            console.log(
              "[ZoomMeetingEmbedProductionFix] ✅ SDK loaded via import (ZoomMtg)"
            );
          } else if (module.default && module.default.ZoomMtg) {
            ZoomMtg = module.default.ZoomMtg;
            window.ZoomMtg = module.default.ZoomMtg;
            console.log(
              "[ZoomMeetingEmbedProductionFix] ✅ SDK loaded via import (default.ZoomMtg)"
            );
          } else if (module.default) {
            ZoomMtg = module.default;
            window.ZoomMtg = module.default;
            console.log(
              "[ZoomMeetingEmbedProductionFix] ✅ SDK loaded via import (default)"
            );
          } else {
            throw new Error("ZoomMtg not found in package");
          }
        } catch (importError) {
          console.log(
            "[ZoomMeetingEmbedProductionFix] Import failed, trying CDN...",
            importError.message
          );

          // Method 2: CDN fallback with enhanced loading
          await new Promise((resolve, reject) => {
            // Check if already loaded by CDN
            if (window.ZoomMtg) {
              ZoomMtg = window.ZoomMtg;
              console.log(
                "[ZoomMeetingEmbedProductionFix] ✅ Found existing CDN ZoomMtg"
              );
              resolve();
              return;
            }

            const script = document.createElement("script");
            script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
            script.crossOrigin = "anonymous";
            script.async = true;

            script.onload = () => {
              if (window.ZoomMtg) {
                ZoomMtg = window.ZoomMtg;
                console.log(
                  "[ZoomMeetingEmbedProductionFix] ✅ SDK loaded via CDN"
                );
                resolve();
              } else {
                reject(new Error("CDN loaded but ZoomMtg not available"));
              }
            };

            script.onerror = (error) => {
              console.error(
                "[ZoomMeetingEmbedProductionFix] CDN loading error:",
                error
              );
              reject(new Error("Failed to load Zoom SDK from CDN"));
            };

            // Enhanced timeout handling
            const timeout = setTimeout(() => {
              script.remove();
              reject(new Error("CDN load timeout after 20 seconds"));
            }, 20000);

            script.onload = () => {
              clearTimeout(timeout);
              if (window.ZoomMtg) {
                ZoomMtg = window.ZoomMtg;
                console.log(
                  "[ZoomMeetingEmbedProductionFix] ✅ SDK loaded via CDN"
                );
                resolve();
              } else {
                reject(new Error("CDN loaded but ZoomMtg not available"));
              }
            };

            // Check if script already exists
            const existingScript = document.querySelector(
              'script[src*="ZoomMtg.js"]'
            );
            if (existingScript) {
              console.log(
                "[ZoomMeetingEmbedProductionFix] CDN script already exists, waiting for load..."
              );
              if (window.ZoomMtg) {
                ZoomMtg = window.ZoomMtg;
                resolve();
              } else {
                // Wait a bit more for existing script to load
                setTimeout(() => {
                  if (window.ZoomMtg) {
                    ZoomMtg = window.ZoomMtg;
                    resolve();
                  } else {
                    reject(
                      new Error("Existing CDN script failed to provide ZoomMtg")
                    );
                  }
                }, 3000);
              }
            } else {
              document.head.appendChild(script);
            }
          });
        }
      }

      // Step 2: Configure SDK with production-ready settings
      console.log("[ZoomMeetingEmbedProductionFix] Configuring Zoom SDK...");

      // Critical fix: Set the correct WebAssembly library path
      ZoomMtg.setZoomJSLib("https://source.zoom.us/3.13.2/lib", "/av");

      // Preload WebAssembly modules
      console.log("[ZoomMeetingEmbedProductionFix] Preloading WebAssembly...");
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      // Enhanced readiness check with timeout
      console.log(
        "[ZoomMeetingEmbedProductionFix] Waiting for SDK readiness..."
      );
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("SDK preparation timeout after 20 seconds"));
        }, 20000);

        const checkInterval = setInterval(() => {
          if (
            ZoomMtg &&
            typeof ZoomMtg.init === "function" &&
            typeof ZoomMtg.join === "function"
          ) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            console.log(
              "[ZoomMeetingEmbedProductionFix] ✅ SDK methods verified"
            );
            resolve();
          }
        }, 200);
      });

      // Final verification
      if (
        !ZoomMtg ||
        typeof ZoomMtg.init !== "function" ||
        typeof ZoomMtg.join !== "function"
      ) {
        throw new Error("SDK methods not available after preparation");
      }

      console.log(
        "[ZoomMeetingEmbedProductionFix] ✅ SDK preparation completed successfully"
      );
      sdkGloballyPrepared = true;
      isSDKLoading = false;
      return true;
    } catch (error) {
      console.error(
        "[ZoomMeetingEmbedProductionFix] ❌ SDK preparation failed:",
        error
      );
      isSDKLoading = false;
      sdkGloballyPrepared = false;
      throw error;
    }
  }, []);

  // Enhanced meeting initialization with retry logic
  const initAndJoin = useCallback(async () => {
    console.log(
      "[ZoomMeetingEmbedProductionFix] Starting initAndJoin process..."
    );

    if (isSdkCallInProgress) {
      console.warn(
        "[ZoomMeetingEmbedProductionFix] SDK call already in progress. Skipping."
      );
      return;
    }

    // Validate required parameters
    if (!sdkKey || !signature || !meetingNumber || !userName) {
      const missingParams = [];
      if (!sdkKey) missingParams.push("sdkKey");
      if (!signature) missingParams.push("signature");
      if (!meetingNumber) missingParams.push("meetingNumber");
      if (!userName) missingParams.push("userName");

      handleSdkError(`Thiếu thông tin cần thiết: ${missingParams.join(", ")}`);
      return;
    }

    setIsSdkCallInProgress(true);
    setSdkError(null);

    try {
      // Clean up any previous meeting state
      if (
        sdkInitialized &&
        ZoomMtg &&
        typeof ZoomMtg.leaveMeeting === "function"
      ) {
        console.log(
          "[ZoomMeetingEmbedProductionFix] Cleaning up previous meeting state..."
        );
        try {
          await new Promise((resolve) => {
            ZoomMtg.leaveMeeting({
              success: () => {
                console.log(
                  "[ZoomMeetingEmbedProductionFix] Previous meeting left successfully"
                );
                resolve();
              },
              error: (err) => {
                console.log(
                  "[ZoomMeetingEmbedProductionFix] Previous meeting cleanup error:",
                  err
                );
                resolve(); // Continue anyway
              },
            });
            // Don't wait forever for cleanup
            setTimeout(resolve, 2000);
          });
        } catch (e) {
          console.log(
            "[ZoomMeetingEmbedProductionFix] Non-critical cleanup error:",
            e
          );
        }
      }

      // Prepare SDK
      const sdkPrepared = await prepareSDK();
      if (!sdkPrepared) {
        throw new Error("SDK preparation failed");
      }

      setSdkReady(true);
      console.log(
        "[ZoomMeetingEmbedProductionFix] Initializing ZoomMtg with config:",
        {
          sdkKey: `${sdkKey.substring(0, 8)}...`,
          meetingNumber: String(meetingNumber),
          userName,
          hasPassword: !!passWord,
          timestamp: new Date().toISOString(),
        }
      );

      // CRITICAL DEBUG: Log signature details for stuck join issue
      try {
        if (signature) {
          const parts = signature.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(
              atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
            );
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = payload.exp - now;
            console.log(
              "[ZoomMeetingEmbedProductionFix] 🔐 Signature Analysis:",
              {
                hasSignature: true,
                expiresAt: new Date(payload.exp * 1000).toISOString(),
                timeLeftSeconds: timeLeft,
                isExpired: timeLeft <= 0,
                meetingNumberInToken: payload.mn,
                role: payload.role,
              }
            );

            if (timeLeft <= 0) {
              console.error(
                "[ZoomMeetingEmbedProductionFix] ❌ SIGNATURE EXPIRED! This will cause join to fail."
              );
            } else if (timeLeft < 300) {
              console.warn(
                "[ZoomMeetingEmbedProductionFix] ⚠️ Signature expires in less than 5 minutes"
              );
            }
          }
        }
      } catch (e) {
        console.warn(
          "[ZoomMeetingEmbedProductionFix] Could not decode signature:",
          e.message
        );
      }

      // Critical fix: Enhanced initialization configuration
      const initConfig = {
        leaveUrl:
          customLeaveUrl ||
          `${window.location.origin}/tai-khoan/ho-so/phong-hoc`,
        patchJsMedia: true,
        // Production-ready configuration
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
        isShowJoiningErrorDialog: false, // Critical: Prevent modal dialogs that can cause black screen
        disablePreview: false,
        disableSetting: false,
        audioPanelAlwaysOpen: false,
        showMeetingTime: true,
        enableLoggerSync: false,
        success: function () {
          console.log(
            "[ZoomMeetingEmbedProductionFix] ✅ ZoomMtg.init success. Joining meeting..."
          );
          sdkInitialized = true;

          // Add timeout for join process to prevent infinite loading
          const joinTimeout = setTimeout(() => {
            console.error(
              "[ZoomMeetingEmbedProductionFix] ❌ Join timeout after 30 seconds"
            );
            setIsSdkCallInProgress(false);
            handleSdkError(
              "Timeout khi tham gia phòng họp. Vui lòng thử lại.",
              "JOIN_TIMEOUT"
            );
          }, 30000);

          // Critical fix: Enhanced join configuration with timeout
          const joinConfig = {
            sdkKey: sdkKey,
            signature: signature,
            meetingNumber: String(meetingNumber),
            userName: userName,
            userEmail: userEmail || "",
            passWord: passWord || "",
            tk: "",
            success: function (joinRes) {
              clearTimeout(joinTimeout); // Clear timeout on success
              console.log(
                "[ZoomMeetingEmbedProductionFix] ✅ Meeting joined successfully:",
                {
                  result: joinRes,
                  timestamp: new Date().toISOString(),
                }
              );

              setIsSdkCallInProgress(false);
              setMeetingJoined(true); // Mark meeting as successfully joined
              if (onMeetingJoined) onMeetingJoined(joinRes);

              // Critical fix: Show Zoom container when join is successful
              setTimeout(() => {
                const zoomRoot = document.getElementById("zmmtg-root");
                if (zoomRoot) {
                  console.log(
                    "[ZoomMeetingEmbedProductionFix] Showing Zoom container after successful join..."
                  );

                  // Show the Zoom container with proper styling
                  zoomRoot.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 600px !important;
                    z-index: 9999 !important;
                    background: transparent !important;
                    overflow: visible !important;
                  `;

                  console.log(
                    "[ZoomMeetingEmbedProductionFix] ✅ Zoom container configured successfully"
                  );
                } else {
                  console.warn(
                    "[ZoomMeetingEmbedProductionFix] ⚠️ Zoom root element not found"
                  );
                }

                // Additional fix: Check for common black screen causes
                setTimeout(() => {
                  const zoomContent = zoomRoot?.firstChild;
                  if (zoomContent) {
                    console.log(
                      "[ZoomMeetingEmbedProductionFix] ✅ Zoom content detected:",
                      {
                        hasChildren: zoomRoot.children.length > 0,
                        contentType: zoomContent.tagName,
                        visible:
                          window.getComputedStyle(zoomContent).display !==
                          "none",
                      }
                    );
                  } else {
                    console.warn(
                      "[ZoomMeetingEmbedProductionFix] ⚠️ No Zoom content detected after 3 seconds"
                    );
                  }
                }, 3000);
              }, 1000);

              // Enhanced event handling
              try {
                if (ZoomMtg && typeof ZoomMtg.getEventBus === "function") {
                  const eventBus = ZoomMtg.getEventBus();
                  if (eventBus && typeof eventBus.on === "function") {
                    console.log(
                      "[ZoomMeetingEmbedProductionFix] Setting up EventBus listeners..."
                    );

                    eventBus.on("onMeetingEnded", function (data) {
                      console.log(
                        "[ZoomMeetingEmbedProductionFix] Meeting ended via EventBus:",
                        data
                      );
                      if (onMeetingEnd) onMeetingEnd("meeting_ended_event");
                    });

                    eventBus.on("onMeetingStatus", function (data) {
                      console.log(
                        "[ZoomMeetingEmbedProductionFix] Meeting status update:",
                        data
                      );
                    });
                  }
                }
              } catch (eventError) {
                console.warn(
                  "[ZoomMeetingEmbedProductionFix] Event setup error (non-critical):",
                  eventError
                );
              }
            },
            error: function (joinErr) {
              clearTimeout(joinTimeout); // Clear timeout on error
              console.error(
                "[ZoomMeetingEmbedProductionFix] ❌ Join error:",
                joinErr
              );

              // Enhanced error handling with retry logic
              if (retryCount < MAX_RETRIES) {
                console.log(
                  `[ZoomMeetingEmbedProductionFix] Retrying join (${
                    retryCount + 1
                  }/${MAX_RETRIES})...`
                );
                setRetryCount((prev) => prev + 1);
                setIsSdkCallInProgress(false);
                setTimeout(() => initAndJoin(), 2000);
              } else {
                handleSdkError(
                  joinErr.reason ||
                    "Lỗi khi tham gia phòng họp sau nhiều lần thử.",
                  joinErr.errorCode,
                  joinErr
                );
              }
            },
          };

          console.log(
            "[ZoomMeetingEmbedProductionFix] Executing ZoomMtg.join..."
          );
          ZoomMtg.join(joinConfig);
        },
        error: function (initErr) {
          console.error(
            "[ZoomMeetingEmbedProductionFix] ❌ Init error:",
            initErr
          );

          // Enhanced init error handling
          if (retryCount < MAX_RETRIES) {
            console.log(
              `[ZoomMeetingEmbedProductionFix] Retrying init (${
                retryCount + 1
              }/${MAX_RETRIES})...`
            );
            setRetryCount((prev) => prev + 1);
            setIsSdkCallInProgress(false);
            setTimeout(() => initAndJoin(), 3000);
          } else {
            handleSdkError(
              initErr.reason || "Lỗi khi khởi tạo Zoom SDK sau nhiều lần thử.",
              initErr.errorCode,
              initErr
            );
          }
        },
      };

      console.log("[ZoomMeetingEmbedProductionFix] Executing ZoomMtg.init...");
      ZoomMtg.init(initConfig);
    } catch (err) {
      console.error("[ZoomMeetingEmbedProductionFix] ❌ General error:", err);
      handleSdkError(
        err.message || "Lỗi không xác định trong quá trình khởi tạo.",
        err.code,
        err
      );
    }
  }, [
    sdkKey,
    signature,
    meetingNumber,
    userName,
    userEmail,
    passWord,
    customLeaveUrl,
    onMeetingJoined,
    onMeetingEnd,
    handleSdkError,
    isSdkCallInProgress,
    prepareSDK,
    retryCount,
  ]);

  // Auto-start when props are available
  useEffect(() => {
    if (sdkKey && signature && meetingNumber && userName) {
      console.log(
        "[ZoomMeetingEmbedProductionFix] Props available, starting meeting join..."
      );
      initAndJoin();
    }

    return () => {
      console.log(
        "[ZoomMeetingEmbedProductionFix] Component unmounting, cleaning up..."
      );
      try {
        // Clear any polling intervals
        if (window.zoomMeetingPollInterval) {
          clearInterval(window.zoomMeetingPollInterval);
          window.zoomMeetingPollInterval = null;
        }

        // Leave meeting if still active
        if (ZoomMtg && typeof ZoomMtg.leaveMeeting === "function") {
          ZoomMtg.leaveMeeting({
            success: () =>
              console.log(
                "[ZoomMeetingEmbedProductionFix] Successfully left meeting on cleanup"
              ),
            error: (error) =>
              console.log(
                "[ZoomMeetingEmbedProductionFix] Error leaving meeting on cleanup:",
                error
              ),
          });
        }

        // Reset SDK state
        sdkInitialized = false;
      } catch (error) {
        console.log(
          "[ZoomMeetingEmbedProductionFix] Cleanup error (non-critical):",
          error
        );
      }
    };
  }, [initAndJoin, sdkKey, signature, meetingNumber, userName]);

  // Enhanced retry function
  const handleRetry = useCallback(() => {
    console.log("[ZoomMeetingEmbedProductionFix] Manual retry requested");
    setSdkError(null);
    setRetryCount(0);
    setIsSdkCallInProgress(false);
    initAndJoin();
  }, [initAndJoin]);

  // Error state UI
  if (sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-error-state">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h4 style={{ color: "#dc3545", marginBottom: "20px" }}>
            ❌ Lỗi khi tải cuộc họp Zoom
          </h4>
          <p style={{ marginBottom: "20px", color: "#666" }}>{sdkError}</p>

          {retryCount < MAX_RETRIES && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#fff3cd",
                borderRadius: "4px",
              }}
            >
              <strong>💡 Gợi ý khắc phục:</strong>
              <ul style={{ textAlign: "left", marginTop: "10px" }}>
                <li>Kiểm tra kết nối mạng</li>
                <li>Tắt phần mềm chặn quảng cáo</li>
                <li>Thử lại với trình duyệt khác</li>
                <li>Làm mới trang nếu vẫn gặp lỗi</li>
              </ul>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleRetry}
              className="btn btn-primary"
              disabled={retryCount >= MAX_RETRIES}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  retryCount >= MAX_RETRIES ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: retryCount >= MAX_RETRIES ? "not-allowed" : "pointer",
              }}
            >
              {retryCount >= MAX_RETRIES ? "Đã thử tối đa" : "Thử lại"}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Làm mới trang
            </button>

            {onMeetingEnd && (
              <button
                onClick={() => onMeetingEnd("error_close_button")}
                className="btn btn-outline-secondary"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "#6c757d",
                  border: "1px solid #6c757d",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state UI
  if (isSdkCallInProgress && !sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-loading-state">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{ fontSize: "18px", color: "#0066cc", marginBottom: "15px" }}
          >
            🔄 Đang kết nối vào phòng họp Zoom...
          </div>
          <div
            style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}
          >
            {!sdkReady
              ? "Đang chuẩn bị SDK..."
              : retryCount > 0
              ? `Đang thử lại (${retryCount}/${MAX_RETRIES})...`
              : "Đang tham gia phòng họp..."}
          </div>

          {retryCount > 0 && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#1976d2",
              }}
            >
              Lần thử: {retryCount}/{MAX_RETRIES}
            </div>
          )}
        </div>
      </div>
    );
  }
  // Main container UI
  return (
    <div className="zoom-meeting-embed-container" ref={meetingContainerRef}>
      {/* Critical: Zoom SDK render target */}{" "}
      <div
        id="zmmtg-root"
        style={{
          width: "100%",
          height: meetingJoined ? "100%" : "auto", // Only use 100% when meeting is joined
          minHeight: "600px",
          position: "relative",
          display: meetingJoined ? "block" : "none", // Only show when meeting successfully joined
        }}
      ></div>
      {/* Fallback content when Zoom is not loading */}
      {!isSdkCallInProgress && !sdkError && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
            borderRadius: "8px",
            margin: "20px",
          }}
        >
          <div
            style={{ fontSize: "18px", color: "#0066cc", marginBottom: "15px" }}
          >
            🎥 Sẵn sàng tham gia phòng họp Zoom
          </div>
          <div
            style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}
          >
            Nhấn nút bên dưới để bắt đầu...
          </div>
          <button
            onClick={initAndJoin}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Tham gia phòng họp
          </button>
        </div>
      )}
    </div>
  );
}

ZoomMeetingEmbedProductionFix.propTypes = {
  sdkKey: PropTypes.string.isRequired,
  signature: PropTypes.string.isRequired,
  meetingNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  userName: PropTypes.string.isRequired,
  userEmail: PropTypes.string,
  passWord: PropTypes.string,
  customLeaveUrl: PropTypes.string,
  onMeetingEnd: PropTypes.func,
  onError: PropTypes.func,
  onMeetingJoined: PropTypes.func,
};

ZoomMeetingEmbedProductionFix.defaultProps = {
  userEmail: "",
  passWord: "",
  customLeaveUrl:
    typeof window !== "undefined"
      ? `${window.location.origin}/tai-khoan/ho-so/phong-hoc`
      : "/",
  onMeetingEnd: () => {},
  onError: () => {},
  onMeetingJoined: () => {},
};

export default ZoomMeetingEmbedProductionFix;
