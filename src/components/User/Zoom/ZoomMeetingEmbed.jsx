// src/components/Zoom/ZoomMeetingEmbed.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ZoomMtg } from "@zoom/meetingsdk";
import "../../../assets/css/ZoomMeetingEmbed.style.css";

// Global variables to track SDK state
let sdkGloballyPrepared = false;
let isSDKLoading = false;
let sdkInitialized = false;

function ZoomMeetingEmbed({
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

  const handleSdkError = useCallback(
    (message, errorCode = null, errorObject = null) => {
      const fullMessage = errorCode
        ? `${message} (Mã lỗi: ${errorCode})`
        : message;
      console.error(
        "[ZoomMeetingEmbed] SDK Error:",
        fullMessage,
        errorObject || ""
      );
      setSdkError(fullMessage);
      if (onError) onError(fullMessage);
      setIsSdkCallInProgress(false);
    },
    [onError]
  );

  // Enhanced SDK preparation to fix critical errors
  const prepareSDK = useCallback(async () => {
    if (sdkGloballyPrepared || isSDKLoading) {
      return sdkGloballyPrepared;
    }

    isSDKLoading = true;
    try {
      console.log("[ZoomMeetingEmbed] Setting up Zoom SDK...");

      // Critical: Set WebAssembly path correctly to avoid mainTaskType errors
      console.log(
        "[ZoomMeetingEmbed] Setting Zoom JS library with WebAssembly..."
      );
      ZoomMtg.setZoomJSLib("https://source.zoom.us/3.13.2/lib", "/av");

      // Configure proxy and network settings to fix WebSocket issues
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      console.log("[ZoomMeetingEmbed] Preloading WebAssembly...");
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("SDK preparation timeout")),
          15000
        );

        // Check if SDK methods are available
        const checkInterval = setInterval(() => {
          if (
            typeof ZoomMtg.init === "function" &&
            typeof ZoomMtg.join === "function"
          ) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      // Additional verification to ensure SDK is truly ready
      console.log("[ZoomMeetingEmbed] Verifying SDK readiness...");
      if (
        typeof ZoomMtg.init !== "function" ||
        typeof ZoomMtg.join !== "function"
      ) {
        throw new Error("SDK methods not available after preparation");
      }

      console.log("[ZoomMeetingEmbed] SDK preparation completed successfully");
      sdkGloballyPrepared = true;
      isSDKLoading = false;
      return true;
    } catch (error) {
      console.error("[ZoomMeetingEmbed] SDK preparation failed:", error);
      isSDKLoading = false;
      return false;
    }
  }, []);

  const initAndJoin = useCallback(async () => {
    console.log("[ZoomMeetingEmbed] Starting initAndJoin process...");

    if (isSdkCallInProgress) {
      console.warn(
        "[ZoomMeetingEmbed] SDK call already in progress. Skipping."
      );
      return;
    }

    if (!sdkKey || !signature || !meetingNumber || !userName) {
      handleSdkError("Thiếu thông tin cần thiết để tham gia phòng họp.");
      return;
    }

    setIsSdkCallInProgress(true);
    setSdkError(null);

    try {
      // Ensure we clean up any previous meeting state
      if (sdkInitialized && typeof ZoomMtg.leaveMeeting === "function") {
        console.log("[ZoomMeetingEmbed] Cleaning up previous meeting state...");
        try {
          ZoomMtg.leaveMeeting({
            success: () => console.log("Previous meeting left successfully"),
            error: (err) => console.log("Previous meeting cleanup error:", err),
          });
        } catch (e) {
          console.log("Non-critical cleanup error:", e);
        }
      }

      // Prepare SDK first
      const sdkPrepared = await prepareSDK();
      if (!sdkPrepared) {
        throw new Error("SDK preparation failed");
      }

      setSdkReady(true);

      console.log("[ZoomMeetingEmbed] Initializing ZoomMtg...");
      console.log("Meeting details:", {
        sdkKey,
        meetingNumber: String(meetingNumber),
        userName,
        userEmail: userEmail || "",
        hasPassword: !!passWord,
      });

      // Initialize with enhanced configuration
      ZoomMtg.init({
        leaveUrl:
          customLeaveUrl ||
          `${window.location.origin}/tai-khoan/ho-so/phong-hop-zoom`,
        patchJsMedia: true,
        // Add configuration to prevent WebSocket issues
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
        isShowJoiningErrorDialog: false,
        success: function () {
          console.log(
            "[ZoomMeetingEmbed] ZoomMtg.init success. Joining meeting..."
          );
          sdkInitialized = true;

          ZoomMtg.join({
            sdkKey: sdkKey,
            signature: signature,
            meetingNumber: String(meetingNumber),
            userName: userName,
            userEmail: userEmail || "",
            passWord: passWord || "",
            tk: "",
            success: function (joinRes) {
              console.log("[ZoomMeetingEmbed] ZoomMtg.join success:", joinRes);
              setIsSdkCallInProgress(false);
              if (onMeetingJoined) onMeetingJoined(joinRes);

              // Ensure Zoom interface is visible and properly positioned
              setTimeout(() => {
                const zoomRoot = document.getElementById("zmmtg-root");
                if (zoomRoot) {
                  console.log(
                    "[ZoomMeetingEmbed] Zoom root element found, ensuring visibility"
                  );
                  zoomRoot.style.display = "block";
                  zoomRoot.style.visibility = "visible";
                  zoomRoot.style.position = "relative";
                  zoomRoot.style.width = "100%";
                  zoomRoot.style.height = "100%";
                  zoomRoot.style.minHeight = "600px";
                  zoomRoot.style.zIndex = "9999";
                }
              }, 1000);

              // Enhanced event handling with proper error checking
              try {
                if (typeof ZoomMtg.getEventBus === "function") {
                  const eventBus = ZoomMtg.getEventBus();
                  if (eventBus && typeof eventBus.on === "function") {
                    console.log(
                      "[ZoomMeetingEmbed] Setting up EventBus listeners..."
                    );
                    eventBus.on("onMeetingEnded", function (data) {
                      console.log(
                        "[ZoomMeetingEmbed] Meeting ended via EventBus:",
                        data
                      );
                      if (onMeetingEnd) onMeetingEnd("meeting_ended_event");
                    });
                  } else {
                    console.warn(
                      "[ZoomMeetingEmbed] EventBus is available but 'on' method is not a function"
                    );
                  }
                } else {
                  console.warn(
                    "[ZoomMeetingEmbed] ZoomMtg.getEventBus is not available - using alternative monitoring"
                  );

                  // Alternative: Monitor meeting state via polling if EventBus is not available
                  const pollMeetingState = setInterval(() => {
                    try {
                      if (typeof ZoomMtg.getCurrentMeetingInfo === "function") {
                        const meetingInfo = ZoomMtg.getCurrentMeetingInfo();
                        if (!meetingInfo || meetingInfo.status === "ended") {
                          clearInterval(pollMeetingState);
                          if (onMeetingEnd)
                            onMeetingEnd("polling_detected_end");
                        }
                      } else
                        (e) => {
                          console.log("Polling error (non-critical):", e);
                        };
                    } catch (e) {
                      console.log("Polling error (non-critical):", e);
                    }
                  }, 5000);

                  // Store interval for cleanup
                  window.zoomMeetingPollInterval = pollMeetingState;
                }
              } catch (eventError) {
                console.warn(
                  "[ZoomMeetingEmbed] Error setting up event listeners:",
                  eventError
                );
              }
            },
            error: function (joinErr) {
              console.error("[ZoomMeetingEmbed] Join error:", joinErr);
              handleSdkError(
                joinErr.reason || "Lỗi khi tham gia phòng họp.",
                joinErr.errorCode,
                joinErr
              );
            },
          });
        },
        error: function (initErr) {
          console.error("[ZoomMeetingEmbed] Init error:", initErr);
          handleSdkError(
            initErr.reason || "Lỗi khi khởi tạo Zoom SDK.",
            initErr.errorCode,
            initErr
          );
        },
      });
    } catch (err) {
      console.error("[ZoomMeetingEmbed] General error:", err);
      handleSdkError(
        err.message ||
          "Lỗi không xác định trong quá trình chuẩn bị hoặc khởi tạo SDK.",
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
  ]);

  useEffect(() => {
    if (sdkKey && signature && meetingNumber && userName) {
      initAndJoin();
    }

    return () => {
      console.log("[ZoomMeetingEmbed] Component unmounted.");
      // Enhanced cleanup when component unmounts
      try {
        // Clear any polling intervals
        if (window.zoomMeetingPollInterval) {
          clearInterval(window.zoomMeetingPollInterval);
          window.zoomMeetingPollInterval = null;
        }

        // Leave meeting if still active
        if (window.ZoomMtg && typeof ZoomMtg.leaveMeeting === "function") {
          ZoomMtg.leaveMeeting({
            success: function () {
              console.log(
                "[ZoomMeetingEmbed] Successfully left meeting on cleanup"
              );
              sdkInitialized = false;
            },
            error: function (error) {
              console.log(
                "[ZoomMeetingEmbed] Error leaving meeting on cleanup:",
                error
              );
            },
          });
        }

        // Reset SDK state on component unmount
        sdkInitialized = false;
      } catch (error) {
        console.log("[ZoomMeetingEmbed] Cleanup error (non-critical):", error);
      }
    };
  }, [initAndJoin, sdkKey, signature, meetingNumber, userName]);

  if (sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-error-state">
        <h4>Lỗi khi tải cuộc họp Zoom</h4>
        <p>{sdkError}</p>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ marginRight: "10px" }}
          >
            Thử lại
          </button>
          {onMeetingEnd && (
            <button
              onClick={() => onMeetingEnd("error_close_button")}
              className="btn btn-secondary"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isSdkCallInProgress && !sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-loading-state">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", marginBottom: "15px" }}>
            🔄 Đang kết nối vào phòng họp Zoom...
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            {!sdkReady ? "Đang chuẩn bị SDK..." : "Đang tham gia phòng họp..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zoom-meeting-embed-container" ref={meetingContainerRef}>
      {/* Div container for Zoom SDK to render into */}
      <div id="zmmtg-root"></div>

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
            🎥 Đang kết nối tới phòng họp Zoom...
          </div>
          <div
            style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}
          >
            Vui lòng đợi trong giây lát...
          </div>
          <button
            onClick={initAndJoin}
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Làm mới trang
          </button>
        </div>
      )}
    </div>
  );
}

ZoomMeetingEmbed.propTypes = {
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

ZoomMeetingEmbed.defaultProps = {
  userEmail: "",
  passWord: "",
  customLeaveUrl:
    typeof window !== "undefined" ? `${window.location.origin}/` : "/",
  onMeetingEnd: () => {},
  onError: () => {},
  onMeetingJoined: () => {},
};

export default ZoomMeetingEmbed;
