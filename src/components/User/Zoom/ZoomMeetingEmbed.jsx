// src/components/Zoom/ZoomMeetingEmbed.jsx
// import React, { useEffect, useRef, useState, useCallback } from 'react'; // Bỏ 'React' nếu không dùng trực tiếp
import { useEffect, useRef, useState, useCallback } from "react"; // Chỉ import những gì cần
import PropTypes from "prop-types";
import { ZoomMtg } from "@zoom/meetingsdk";

import "../../../assets/css/ZoomMeetingEmbed.style.css";

let sdkPrepared = false;
// let zoomClientForCleanup = null; // Sẽ không dùng biến global này nữa, quản lý trong component

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
  const meetingSDKElementRef = useRef(null); // Có thể dùng ref này nếu SDK cho phép chỉ định target element
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const zoomMtgRef = useRef(null); // Lưu trữ instance ZoomMtg để cleanup

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
      if (onError) {
        onError(fullMessage);
      }
    },
    [onError]
  );

  const initAndJoin = useCallback(async () => {
    if (!sdkKey || !signature || !meetingNumber || !userName) {
      handleSdkError(
        "Thiếu thông tin cần thiết (sdkKey, signature, meetingNumber, hoặc userName)."
      );
      return;
    }

    try {
      // Với @zoom/meetingsdk, ZoomMtg đã được import trực tiếp.
      // Các bước prepare có thể vẫn cần thiết.
      if (!sdkPrepared) {
        console.log(
          "[ZoomMeetingEmbed] Calling ZoomMtg.preLoadWasm() and ZoomMtg.prepareWebSDK()..."
        );
        // Kiểm tra tài liệu @zoom/meetingsdk để xác nhận các hàm này
        // Nếu SDK mới tự động quản lý, các dòng này có thể không cần thiết hoặc gây lỗi.
        // ZoomMtg.setZoomJSLib(ZOOM_JSLIB_PUBLIC_PATH, '/av'); // << XEM XÉT BỎ NẾU SDK MỚI TỰ TẢI TỪ CDN
        await ZoomMtg.preLoadWasm();
        await ZoomMtg.prepareWebSDK(); // Hoặc tên hàm tương đương
        sdkPrepared = true;
        console.log("[ZoomMeetingEmbed] SDK prepared.");
      } else {
        console.log("[ZoomMeetingEmbed] SDK was already prepared.");
      }

      // Gán instance vào ref để có thể truy cập trong cleanup
      zoomMtgRef.current = ZoomMtg;

      console.log("[ZoomMeetingEmbed] Initializing ZoomMtg...");
      ZoomMtg.init({
        leaveUrl: customLeaveUrl || `${window.location.origin}/`,
        patchJsMedia: true, // Theo tài liệu mới cho @zoom/meetingsdk
        // Thay vì truyền element vào init, Client View thường tự tìm #zmmtg-root
        // Hoặc nếu bạn dùng Component View, bạn sẽ truyền element vào client.init({ zoomAppRoot: meetingSDKElementRef.current })
        success: function () {
          console.log(
            "[ZoomMeetingEmbed] ZoomMtg.init success. Joining meeting..."
          );
          setIsSdkInitialized(true);

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

              if (typeof ZoomMtg.getEventBus === "function") {
                ZoomMtg.getEventBus().on("meeting.status", (payload) => {
                  console.log(
                    "[ZoomMeetingEmbed] Event: meeting.status",
                    payload
                  );
                  if (
                    payload.status === "ended" ||
                    payload.status === "left" ||
                    payload.status === 2 ||
                    payload.status === 3 ||
                    payload.status === 4
                  ) {
                    // Kiểm tra nhiều giá trị có thể
                    if (onMeetingEnd) onMeetingEnd(String(payload.status));
                  }
                });
              } else {
                console.warn(
                  "[ZoomMeetingEmbed] ZoomMtg.getEventBus is not a function."
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
        err.message || "Lỗi không xác định khi chuẩn bị SDK.",
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
  ]);

  useEffect(() => {
    if (sdkKey && signature && meetingNumber && userName) {
      initAndJoin();
    }

    return () => {
      // Cleanup khi component unmount
      const currentZoomMtg = zoomMtgRef.current;
      if (currentZoomMtg && typeof currentZoomMtg.leaveMeeting === "function") {
        try {
          console.log(
            "[ZoomMeetingEmbed] Attempting to leave meeting on unmount..."
          );
          // currentZoomMtg.leaveMeeting({}); // Có thể gây lỗi nếu meeting đã kết thúc
          // Một cách an toàn hơn là kiểm tra trạng thái trước khi gọi, hoặc dùng destroyClient nếu có
        } catch (e) {
          console.error(
            "[ZoomMeetingEmbed] Error leaving meeting on unmount:",
            e
          );
        }
      }
      // Nếu SDK mới có hàm destroy client/instance, gọi ở đây
      // Ví dụ: if (currentZoomMtg && typeof currentZoomMtg.destroyClient === 'function') currentZoomMtg.destroyClient();
      sdkPrepared = false; // Reset để lần sau có thể prepare lại
      zoomMtgRef.current = null;
    };
  }, [initAndJoin, sdkKey, signature, meetingNumber, userName]); // Chỉ chạy lại khi các props này thay đổi

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

  if (!isSdkInitialized && !sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-loading-state">
        <p>Đang khởi tạo giao diện cuộc họp Zoom...</p>
      </div>
    );
  }

  return (
    // SDK Client View sẽ tìm div#zmmtg-root để render.
    // Nó thường được SDK tự chèn vào body hoặc một root element được chỉ định.
    // Container này giúp bạn kiểm soát kích thước và vị trí.
    <div className="zoom-meeting-embed-container" ref={meetingSDKElementRef}>
      {/* <div id="zmmtg-root"></div> -- Thông thường không cần tạo thủ công ở đây cho Client View */}
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
