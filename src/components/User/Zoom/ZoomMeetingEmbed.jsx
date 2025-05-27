// src/components/Zoom/ZoomMeetingEmbed.jsx
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // << THÊM IMPORT NÀY
// import { ZoomMtg } from '@zoomus/websdk'; // Cân nhắc dynamic import
import "../../../assets/css/ZoomMeetingEmbed.style.css";

const ZOOM_JSLIB_URL = "/lib"; // Giả sử bạn đã copy thư mục lib vào public

function ZoomMeetingEmbed({
  sdkKey,
  signature,
  meetingNumber,
  userName,
  userEmail,
  passWord,
  role, // role từ signature, nhưng SDK thường tự xác định dựa trên signature của host/attendee
  leaveUrl,
  onMeetingEnd, // Callback khi meeting kết thúc (cần tự xử lý dựa trên sự kiện SDK)
  onError, // Callback khi có lỗi từ SDK
}) {
  const meetingUiElement = useRef(null);
  const [zoomMtgLoaded, setZoomMtgLoaded] = useState(
    typeof window.ZoomMtg !== "undefined"
  );
  const [sdkError, setSdkError] = useState(null);

  useEffect(() => {
    if (typeof window.ZoomMtg === "undefined") {
      import("@zoomus/websdk")
        .then(({ ZoomMtg: ZoomMtgModule }) => {
          // Đổi tên để tránh xung đột
          if (typeof window.ZoomMtg === "undefined")
            window.ZoomMtg = ZoomMtgModule;
          setZoomMtgLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load ZoomMtg dynamically", err);
          setSdkError("Không thể tải thư viện Zoom. Vui lòng thử lại.");
          if (onError) onError("Không thể tải thư viện Zoom.");
        });
    }
  }, [onError]);

  useEffect(() => {
    if (!zoomMtgLoaded) {
      console.log("ZoomMeetingEmbed: ZoomMtg library not loaded yet.");
      return;
    }
    if (!sdkKey || !signature || !meetingNumber || !userName) {
      console.warn("ZoomMeetingEmbed: Missing required props.", {
        sdkKey,
        signature,
        meetingNumber,
        userName,
      });
      setSdkError("Thiếu thông tin cần thiết để bắt đầu cuộc họp.");
      if (onError) onError("Thiếu thông tin cần thiết để bắt đầu cuộc họp.");
      return;
    }

    setSdkError(null); // Xóa lỗi cũ
    const ZoomMtg = window.ZoomMtg;

    ZoomMtg.setZoomJSLib(ZOOM_JSLIB_URL, "/av");
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    ZoomMtg.init({
      leaveUrl: leaveUrl || window.location.origin,
      isSupportAV: true,
      success: function (res) {
        console.log("ZoomMtg.init success:", res);
        ZoomMtg.join({
          sdkKey: sdkKey,
          signature: signature,
          meetingNumber: String(meetingNumber),
          userName: userName,
          userEmail: userEmail || "",
          passWord: passWord || "",
          tk: "", // Regis token for attendees, can be empty
          // role: parseInt(role, 10), // The signature itself should define the role
          success: function (joinRes) {
            console.log("ZoomMtg.join success:", joinRes);
            // Lắng nghe sự kiện người dùng rời cuộc họp hoặc cuộc họp kết thúc
            ZoomMtg.geteventbus().on(" reunião.ended", () => {
              // 'meeting.ended' có thể là tên sự kiện
              console.log("Event: meeting.ended");
              if (onMeetingEnd) onMeetingEnd();
            });
            ZoomMtg.geteventbus().on("meeting.leave", () => {
              console.log("Event: meeting.leave");
              if (onMeetingEnd) onMeetingEnd(); // Coi như kết thúc nếu người dùng rời
            });
          },
          error: function (joinErr) {
            console.error("ZoomMtg.join error:", joinErr);
            const errMsg =
              joinErr.errorMessage || "Lỗi khi tham gia phòng họp Zoom.";
            setSdkError(`Lỗi tham gia: ${errMsg} (Mã: ${joinErr.errorCode})`);
            if (onError)
              onError(`Lỗi tham gia: ${errMsg} (Mã: ${joinErr.errorCode})`);
          },
        });
      },
      error: function (initErr) {
        console.error("ZoomMtg.init error:", initErr);
        const errMsg = initErr.errorMessage || "Lỗi khởi tạo Zoom SDK.";
        setSdkError(`Lỗi khởi tạo: ${errMsg} (Mã: ${initErr.errorCode})`);
        if (onError)
          onError(`Lỗi khởi tạo: ${errMsg} (Mã: ${initErr.errorCode})`);
      },
    });

    return () => {
      // Cố gắng dọn dẹp khi component unmount hoặc các prop thay đổi
      // if (ZoomMtg && typeof ZoomMtg.leaveMeeting === 'function') {
      //   try {
      //     ZoomMtg.leaveMeeting({});
      //     console.log("ZoomMtg.leaveMeeting called on unmount/prop change.");
      //   } catch (e) {
      //     console.error("Error calling ZoomMtg.leaveMeeting on unmount/prop change", e);
      //   }
      // }
      // ZoomMtg.destroyMeeting({}); // Cân nhắc dùng destroyMeeting
    };
  }, [
    zoomMtgLoaded,
    sdkKey,
    signature,
    meetingNumber,
    userName,
    userEmail,
    passWord,
    role,
    leaveUrl,
    onMeetingEnd,
    onError,
  ]);

  if (sdkError) {
    return (
      <div className="zoom-meeting-embed-container zoom-error-state">
        <p>
          <strong>Đã xảy ra lỗi với Zoom:</strong>
        </p>
        <p>{sdkError}</p>
        <button
          onClick={() => {
            if (onMeetingEnd) onMeetingEnd();
          }}
          className="btn btn-secondary"
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="zoom-meeting-embed-container" ref={meetingUiElement}>
      <div id="zmmtg-root" style={{ width: "100%", height: "100%" }}></div>
      {!zoomMtgLoaded && <p>Đang tải thư viện Zoom...</p>}
    </div>
  );
}

// << THÊM PHẦN PROPTYPES >>
ZoomMeetingEmbed.propTypes = {
  sdkKey: PropTypes.string.isRequired,
  signature: PropTypes.string.isRequired,
  meetingNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  userName: PropTypes.string.isRequired,
  userEmail: PropTypes.string,
  passWord: PropTypes.string,
  role: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Thường là "0" hoặc "1"
  leaveUrl: PropTypes.string,
  onMeetingEnd: PropTypes.func,
  onError: PropTypes.func,
};

ZoomMeetingEmbed.defaultProps = {
  userEmail: "",
  passWord: "",
  role: "1", // Mặc định là attendee nếu không có role từ signature
  leaveUrl: window.location.origin,
  onMeetingEnd: () => {},
  onError: () => {},
};

export default ZoomMeetingEmbed;
