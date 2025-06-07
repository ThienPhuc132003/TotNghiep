// src/components/Zoom/ZoomMeetingEmbed.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ZoomMtg } from "@zoom/meetingsdk";
import "../../../assets/css/ZoomMeetingEmbed.style.css";

// Global variables to track SDK state
let sdkGloballyPrepared = false;
let isSDKLoading = false;

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

  // Prepare SDK only once globally
  const prepareSDK = useCallback(() => {
    // Bọc logic async vào một hàm async và gọi ngay lập tức
    // Điều này đảm bảo từ khóa 'await' luôn nằm trong một ngữ cảnh 'async' rõ ràng
    return (async () => {
      if (sdkGloballyPrepared || isSDKLoading) {
        return sdkGloballyPrepared;
      }

      isSDKLoading = true;
      try {
        console.log("[ZoomMeetingEmbed] Setting up Zoom SDK...");

        // Configure Zoom SDK for React - This is crucial!
        console.log("[ZoomMeetingEmbed] Setting Zoom JS library...");
        ZoomMtg.setZoomJSLib("https://source.zoom.us/3.13.2/lib", "/av");

        console.log("[ZoomMeetingEmbed] Preparing WebSDK...");
        await ZoomMtg.preLoadWasm(); // <--- DÒNG NÀY SẼ KHÔNG CÒN GÂY LỖI 'await'
        await ZoomMtg.prepareWebSDK();

        // Additional check to ensure SDK is ready
        console.log("[ZoomMeetingEmbed] Verifying SDK readiness...");
        if (typeof ZoomMtg.init !== "function") {
          throw new Error("ZoomMtg.init is not available");
        }

        sdkGloballyPrepared = true;
        console.log("[ZoomMeetingEmbed] SDK prepared successfully");
        return true;
      } catch (error) {
        console.error("[ZoomMeetingEmbed] SDK preparation failed:", error);
        handleSdkError("Không thể chuẩn bị Zoom SDK", null, error);
        return false;
      } finally {
        isSDKLoading = false;
      }
    })(); // <--- Gọi hàm async này ngay lập tức
  }, [handleSdkError]);

  const initAndJoin = useCallback(async () => {
    // Hàm này đã là async và gọi await prepareSDK()
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
      // Prepare SDK first
      const sdkPrepared = await prepareSDK(); // prepareSDK() bây giờ trả về một Promise
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

      ZoomMtg.init({
        leaveUrl:
          customLeaveUrl ||
          `${window.location.origin}/tai-khoan/ho-so/phong-hop-zoom`,
        patchJsMedia: true,
        success: function () {
          console.log(
            "[ZoomMeetingEmbed] ZoomMtg.init success. Joining meeting..."
          );

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
                }
              }, 1000);

              if (typeof ZoomMtg.getEventBus === "function") {
                ZoomMtg.getEventBus().on("meeting.status", (payload) => {
                  console.log(
                    "[ZoomMeetingEmbed] Event: meeting.status",
                    payload
                  );
                  if (
                    payload.status === 3 ||
                    payload.status === "ended" ||
                    payload.status === "left" ||
                    payload.status === 4
                  ) {
                    if (onMeetingEnd) onMeetingEnd(String(payload.status));
                  }
                });
              } else {
                console.warn(
                  "[ZoomMeetingEmbed] ZoomMtg.getEventBus is not available."
                );
              }
            },
            error: function (joinErr) {
              handleSdkError(
                joinErr.reason || "Lỗi khi tham gia phòng họp.",
                joinErr.errorCode,
                joinErr
              );
            },
          });
        },
        error: function (initErr) {
          handleSdkError(
            initErr.reason || "Lỗi khởi tạo Zoom SDK.",
            initErr.errorCode,
            initErr
          );
        },
      });
    } catch (err) {
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
      // Cleanup when component unmounts
      try {
        if (window.ZoomMtg && typeof ZoomMtg.leaveMeeting === "function") {
          ZoomMtg.leaveMeeting({
            success: function () {
              console.log(
                "[ZoomMeetingEmbed] Successfully left meeting on cleanup"
              );
            },
            error: function (error) {
              console.log(
                "[ZoomMeetingEmbed] Error leaving meeting on cleanup:",
                error
              );
            },
          });
        }
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
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Nếu giao diện Zoom không hiển thị, vui lòng kiểm tra:
          </p>
          <ul
            style={{
              textAlign: "left",
              maxWidth: "400px",
              margin: "0 auto",
              color: "#555",
              lineHeight: "1.6",
            }}
          >
            <li>Trình duyệt đã cho phép microphone và camera</li>
            <li>Không có extension nào chặn popup</li>
            <li>Kết nối internet ổn định</li>
            <li>Cho phép tải nội dung từ zoom.us</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
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
