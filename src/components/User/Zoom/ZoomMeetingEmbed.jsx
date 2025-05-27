// src/components/Zoom/ZoomMeetingEmbed.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import "../../../assets/css/ZoomMeetingEmbed.style.css"; // Đảm bảo file này tồn tại và có style cơ bản

const ZOOM_JSLIB_PUBLIC_PATH = "/lib"; // Trỏ đến public/lib

let ZoomMtgInstance =
  typeof window !== "undefined" ? window.ZoomMtg : undefined;
let zoomSdkLoadingPromise = null;

const loadZoomSdk = () => {
  if (ZoomMtgInstance) {
    return Promise.resolve(ZoomMtgInstance);
  }
  if (zoomSdkLoadingPromise) {
    return zoomSdkLoadingPromise;
  }
  console.log(
    "[ZoomSDKLoader] Attempting to dynamically import @zoomus/websdk..."
  );
  zoomSdkLoadingPromise = import("@zoomus/websdk")
    .then((module) => {
      console.log("[ZoomSDKLoader] @zoomus/websdk module loaded:", module);
      if (module.ZoomMtg) {
        ZoomMtgInstance = module.ZoomMtg;
      } else if (module.default && module.default.ZoomMtg) {
        ZoomMtgInstance = module.default.ZoomMtg;
      } else if (typeof window !== "undefined" && window.ZoomMtg) {
        ZoomMtgInstance = window.ZoomMtg;
      }

      if (!ZoomMtgInstance) {
        console.error(
          "[ZoomSDKLoader] Failed to obtain ZoomMtg object from the imported module."
        );
        throw new Error("Failed to obtain ZoomMtg object.");
      }

      if (
        typeof window !== "undefined" &&
        typeof window.ZoomMtg === "undefined"
      ) {
        window.ZoomMtg = ZoomMtgInstance;
      }
      console.log("[ZoomSDKLoader] ZoomMtg instance obtained and ready.");
      return ZoomMtgInstance;
    })
    .catch((err) => {
      console.error(
        "[ZoomSDKLoader] Critical error loading @zoomus/websdk:",
        err
      );
      zoomSdkLoadingPromise = null;
      throw err;
    });
  return zoomSdkLoadingPromise;
};

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
  const meetingUiElementContainer = useRef(null); // Ref cho container
  const [isSdkReadyToInit, setIsSdkReadyToInit] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  const handleSdkError = useCallback(
    (message, errorCode = null) => {
      const fullMessage = errorCode
        ? `${message} (Mã lỗi: ${errorCode})`
        : message;
      console.error("[ZoomMeetingEmbed] SDK Error:", fullMessage);
      setSdkError(fullMessage);
      if (onError) {
        onError(fullMessage);
      }
    },
    [onError]
  );

  const initializeAndJoinMeeting = useCallback(
    async (ZoomMtg) => {
      if (!sdkKey || !signature || !meetingNumber || !userName) {
        handleSdkError(
          "Thiếu thông tin cần thiết (sdkKey, signature, meetingNumber, hoặc userName)."
        );
        return;
      }
      console.log("[ZoomMeetingEmbed] Initializing Zoom Web SDK with props:", {
        sdkKey,
        meetingNumber,
        userName,
      });

      ZoomMtg.setZoomJSLib(ZOOM_JSLIB_PUBLIC_PATH, "/av");
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      // Tùy chọn: Tải ngôn ngữ (cần có file lang trong public/lib/lang/vi-VN.json)
      // try {
      //   ZoomMtg.i18n.load('vi-VN');
      //   ZoomMtg.i18n.setLanguage('vi-VN');
      // } catch (langError) {
      //   console.warn("Could not load/set Vietnamese language for Zoom SDK", langError);
      // }

      ZoomMtg.init({
        leaveUrl: customLeaveUrl || `${window.location.origin}/`,
        isSupportAV: true,
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
              if (onMeetingJoined) onMeetingJoined(joinRes);

              ZoomMtg.geteventbus().on("meeting.status", (payload) => {
                console.log(
                  "[ZoomMeetingEmbed] Event: meeting.status",
                  payload
                );
                if (
                  payload.status === 2 ||
                  payload.status === 3 ||
                  payload.status === 4
                ) {
                  // Ended, Left, Failed
                  if (onMeetingEnd) onMeetingEnd(String(payload.status));
                }
              });
            },
            error: function (joinErr) {
              handleSdkError(
                joinErr.errorMessage || "Lỗi khi tham gia phòng họp.",
                joinErr.errorCode
              );
            },
          });
        },
        error: function (initErr) {
          handleSdkError(
            initErr.errorMessage || "Lỗi khởi tạo Zoom SDK.",
            initErr.errorCode
          );
        },
      });
    },
    [
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
    ]
  );

  useEffect(() => {
    loadZoomSdk()
      .then((ZoomMtg) => {
        if (ZoomMtg) {
          setIsSdkReadyToInit(true); // Đánh dấu SDK đã tải xong, sẵn sàng cho init
          initializeAndJoinMeeting(ZoomMtg); // Truyền ZoomMtg vào
        }
      })
      .catch((loadErr) => {
        handleSdkError(loadErr.message || "Không thể tải thư viện Zoom SDK.");
      });

    return () => {
      // Dọn dẹp khi component unmount
      if (
        ZoomMtgInstance &&
        typeof ZoomMtgInstance.leaveMeeting === "function"
      ) {
        // Việc gọi leaveMeeting ở đây có thể không cần thiết hoặc gây lỗi nếu người dùng đã tự rời
        // Test kỹ lưỡng nếu bạn muốn thêm logic này.
        // ZoomMtgInstance.leaveMeeting({});
        // console.log("[ZoomMeetingEmbed] Attempted to leave meeting on unmount.");
      }
    };
    // Chạy lại effect này nếu các props dùng để join thay đổi
    // initializeAndJoinMeeting đã được bọc trong useCallback với các dependency của nó.
  }, [initializeAndJoinMeeting,handleSdkError]);

  if (sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-error-state">
        <h4>Lỗi khi tải cuộc họp Zoom</h4>
        <p>{sdkError}</p>
        {onMeetingEnd && (
          <button
            onClick={() => onMeetingEnd("error_close_button")}
            className="btn btn-secondary"
          >
            Đóng
          </button>
        )}
      </div>
    );
  }

  if (!isSdkReadyToInit) {
    return (
      <div className="zoom-meeting-embed-container zoom-loading-state">
        <p>Đang chuẩn bị giao diện cuộc họp Zoom...</p>
      </div>
    );
  }

  // Zoom SDK sẽ render vào div có id="zmmtg-root" mà nó tự tạo hoặc tìm kiếm.
  // Đảm bảo container này có kích thước.
  return (
    <div
      className="zoom-meeting-embed-container"
      ref={meetingUiElementContainer}
    >
      {/* SDK sẽ chèn #zmmtg-root vào đây hoặc document.body */}
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
