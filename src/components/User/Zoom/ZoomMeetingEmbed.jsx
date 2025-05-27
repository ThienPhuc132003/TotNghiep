// src/components/Zoom/ZoomMeetingEmbed.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ZoomMtg } from "@zoom/meetingsdk"; // SỬ DỤNG IMPORT TỪ GÓI MỚI
import "../../../assets/css/ZoomMeetingEmbed.style.css"; // Đảm bảo file CSS này tồn tại

// Biến cờ để theo dõi trạng thái chuẩn bị SDK, tránh gọi prepare nhiều lần nếu component re-render
let sdkGloballyPrepared = false;

function ZoomMeetingEmbed({
  sdkKey, // Client ID của Zoom App (từ API /meeting/signature)
  signature, // SDK JWT từ API /meeting/signature
  meetingNumber,
  userName,
  userEmail,
  passWord, // Mật khẩu của meeting (nếu có)
  customLeaveUrl,
  onMeetingEnd,
  onError,
  onMeetingJoined,
}) {
  const meetingContainerRef = useRef(null); // Ref cho div container của bạn
  const [isSdkCallInProgress, setIsSdkCallInProgress] = useState(false); // Cờ để tránh gọi init/join nhiều lần
  const [sdkError, setSdkError] = useState(null);

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
      setIsSdkCallInProgress(false); // Reset cờ khi có lỗi
    },
    [onError]
  );

  // Sử dụng useCallback để initAndJoin chỉ được tạo lại khi các dependency của nó thay đổi
  const initAndJoin = useCallback(async () => {
    if (isSdkCallInProgress) {
      console.warn(
        "[ZoomMeetingEmbed] SDK call is already in progress. Skipping."
      );
      return;
    }
    if (!sdkKey || !signature || !meetingNumber || !userName) {
      handleSdkError(
        "Thiếu thông tin cần thiết (sdkKey, signature, meetingNumber, hoặc userName)."
      );
      return;
    }

    setIsSdkCallInProgress(true);
    setSdkError(null); // Xóa lỗi cũ

    try {
      if (!sdkGloballyPrepared) {
        console.log(
          "[ZoomMeetingEmbed] Preparing SDK: preLoadWasm & prepareWebSDK..."
        );
        // Theo tài liệu @zoom/meetingsdk (Client View), các hàm này vẫn được gọi.
        // SDK mới NÊN tự động tải tài nguyên từ CDN.
        // Không cần setZoomJSLib nếu SDK tự quản lý.
        await ZoomMtg.preLoadWasm();
        await ZoomMtg.prepareWebSDK();
        sdkGloballyPrepared = true;
        console.log("[ZoomMeetingEmbed] SDK prepared.");
      } else {
        console.log("[ZoomMeetingEmbed] SDK was already prepared globally.");
      }

      console.log("[ZoomMeetingEmbed] Initializing ZoomMtg...");
      ZoomMtg.init({
        leaveUrl:
          customLeaveUrl ||
          `${window.location.origin}/tai-khoan/ho-so/phong-hop-zoom`, // Quay về trang quản lý
        patchJsMedia: true, // Theo tài liệu mới (thay cho isSupportAV)
        // webEndpoint: 'zoom.us', // Thường không cần
        // `meetingInfo` có thể không cần thiết nếu dùng join trực tiếp với signature
        success: function () {
          console.log(
            "[ZoomMeetingEmbed] ZoomMtg.init success. Joining meeting..."
          );
          ZoomMtg.join({
            sdkKey: sdkKey,
            signature: signature, // SDK JWT
            meetingNumber: String(meetingNumber),
            userName: userName,
            userEmail: userEmail || "",
            passWord: passWord || "",
            tk: "", // Registration token (thường cho webinar)
            success: function (joinRes) {
              console.log("[ZoomMeetingEmbed] ZoomMtg.join success:", joinRes);
              setIsSdkCallInProgress(false); // Reset cờ
              if (onMeetingJoined) onMeetingJoined(joinRes);

              if (typeof ZoomMtg.getEventBus === "function") {
                ZoomMtg.getEventBus().on("meeting.status", (payload) => {
                  console.log(
                    "[ZoomMeetingEmbed] Event: meeting.status",
                    payload
                  );
                  // payload.status có thể là số hoặc chuỗi tùy phiên bản/sự kiện
                  // Ví dụ: 1 (Connecting), 2 (Connected), 3 (Disconnected), 'ended', 'left'
                  if (
                    payload.status === 3 ||
                    payload.status === "ended" ||
                    payload.status === "left" ||
                    payload.status === 4 /*Failed*/
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
    isSdkCallInProgress, // Thêm isSdkCallInProgress
  ]);

  useEffect(() => {
    // Chỉ gọi initAndJoin nếu các props cần thiết đã có giá trị
    if (sdkKey && signature && meetingNumber && userName) {
      initAndJoin();
    }

    return () => {
      // Cleanup khi component unmount
      // "Client View" thường tự quản lý DOM của nó (#zmmtg-root).
      // Việc gọi leaveMeeting hoặc destroyClient ở đây cần cẩn thận.
      // Nếu người dùng đã tự rời, gọi leaveMeeting có thể gây lỗi.
      // ZoomMtg.leaveMeeting({}); // Cân nhắc kỹ
      console.log("[ZoomMeetingEmbed] Component unmounted.");
      // sdkGloballyPrepared có thể không cần reset nếu bạn muốn giữ trạng thái đã prepare cho lần mount sau.
      // Nhưng nếu mỗi lần mount là một phiên mới hoàn toàn thì có thể reset.
      // sdkGloballyPrepared = false;
    };
  }, [initAndJoin, sdkKey, signature, meetingNumber, userName]); // useEffect này sẽ chạy lại khi initAndJoin thay đổi (do props thay đổi)

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

  // Không cần isSdkInitialized nữa nếu isSdkCallInProgress quản lý việc hiển thị loading
  if (isSdkCallInProgress && !sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-loading-state">
        <p>Đang kết nối vào phòng họp Zoom...</p>
      </div>
    );
  }

  // Nếu không loading và không có lỗi, giả định SDK sẽ render.
  // Container này giúp bạn style kích thước và vị trí của vùng nhúng Zoom.
  return (
    <div className="zoom-meeting-embed-container" ref={meetingContainerRef}>
      {/* 
        Với Client View, Zoom SDK thường sẽ tìm hoặc tự tạo một div với id="zmmtg-root" 
        trong document.body để render giao diện cuộc họp.
        Bạn không cần phải tự tạo div#zmmtg-root ở đây.
        CSS của bạn cho .zoom-meeting-embed-container sẽ quyết định kích thước của vùng hiển thị.
      */}
      {!isSdkCallInProgress && !sdkError && (
        <p style={{ padding: "20px", textAlign: "center" }}>
          Giao diện Zoom sẽ được hiển thị ở đây.
        </p>
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
