// src/pages/User/ZoomCallback.jsx
import { useEffect, useState, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
// import './ZoomCallback.style.css';

const ZoomCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [internalError, setInternalError] = useState(null); // Đổi tên để không trùng với prop 'error' nếu có

  useEffect(() => {
    console.log("ZoomCallback mounted. location.search:", location.search);
    const queryParams = new URLSearchParams(location.search);
    const authorizationCode = queryParams.get("code");
    const zoomErrorFromUrl = queryParams.get("error"); // Lỗi từ Zoom trên URL

    if (zoomErrorFromUrl) {
      const errorDescription =
        queryParams.get("error_description") || zoomErrorFromUrl;
      setInternalError(`Lỗi từ Zoom: ${errorDescription}.`);
      setMessage("Kết nối Zoom không thành công.");

      // Check if user came from classroom page
      const returnPath = sessionStorage.getItem("zoomReturnPath");
      const returnState = sessionStorage.getItem("zoomReturnState");

      setTimeout(() => {
        if (returnPath) {
          // Clear stored return info
          sessionStorage.removeItem("zoomReturnPath");
          sessionStorage.removeItem("zoomReturnState");

          // Return to original page with error state
          navigate(returnPath, {
            replace: true,
            state: {
              zoomAuthError: `Lỗi từ Zoom: ${errorDescription}.`,
              ...(returnState ? JSON.parse(returnState) : {}),
            },
          });
        } else {
          // Default return to meeting room page with error
          navigate("/tai-khoan/ho-so/phong-hoc", {
            replace: true,
            state: { zoomAuthError: `Lỗi từ Zoom: ${errorDescription}.` },
          });
        }
      }, 3000);
      return;
    }

    if (authorizationCode) {
      setMessage("Đã nhận mã xác thực. Đang gửi đến máy chủ...");
      Api({
        endpoint: "meeting/handle", // Endpoint không có / ở đầu
        method: METHOD_TYPE.POST,
        data: { authorizationCode: authorizationCode },
      })
        .then((backendResponse) => {
          // backendResponse là data từ axiosClient
          if (
            backendResponse &&
            backendResponse.success &&
            backendResponse.data &&
            backendResponse.data.result
          ) {
            const { accessToken, refreshToken, userId } =
              backendResponse.data.result;
            localStorage.setItem("zoomAccessToken", accessToken);
            localStorage.setItem("zoomRefreshToken", refreshToken);
            if (userId) localStorage.setItem("zoomUserId", userId);
            setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");

            // Check if user came from classroom page for Zoom connection
            const returnPath = sessionStorage.getItem("zoomReturnPath");
            const returnState = sessionStorage.getItem("zoomReturnState");
            setTimeout(() => {
              if (returnPath) {
                // Clear stored return info
                sessionStorage.removeItem("zoomReturnPath");
                const returnStateData = returnState
                  ? JSON.parse(returnState)
                  : {};
                sessionStorage.removeItem("zoomReturnState");

                // If returning to classroom page with classroom info, add URL params
                if (
                  returnPath.includes("quan-ly-lop-hoc") &&
                  returnStateData.classroomId
                ) {
                  const params = new URLSearchParams({
                    fromZoomConnection: "true",
                    classroomId: encodeURIComponent(
                      returnStateData.classroomId
                    ),
                    classroomName: encodeURIComponent(
                      returnStateData.classroomName || "Lớp học"
                    ),
                  });
                  navigate(`${returnPath}?${params.toString()}`, {
                    replace: true,
                  });
                } else {
                  // Navigate back to the original page with state
                  navigate(returnPath, {
                    replace: true,
                    state: returnStateData,
                  });
                }
              } else {
                // Default return to meeting room page
                navigate("/tai-khoan/ho-so/phong-hoc", { replace: true });
              }
            }, 2000);
          } else {
            const errMsg =
              backendResponse?.message ||
              "Phản hồi từ máy chủ không chứa token hợp lệ.";
            setInternalError(errMsg);
            setMessage("Kết nối Zoom không thành công.");

            // Use returnPath if available, otherwise default to meeting room
            const returnPath = sessionStorage.getItem("zoomReturnPath");
            const returnState = sessionStorage.getItem("zoomReturnState");

            setTimeout(() => {
              if (returnPath) {
                sessionStorage.removeItem("zoomReturnPath");
                sessionStorage.removeItem("zoomReturnState");
                navigate(returnPath, {
                  replace: true,
                  state: {
                    zoomAuthError: errMsg,
                    ...(returnState ? JSON.parse(returnState) : {}),
                  },
                });
              } else {
                navigate("/tai-khoan/ho-so/phong-hoc", {
                  replace: true,
                  state: { zoomAuthError: errMsg },
                });
              }
            }, 3000);
          }
        })
        .catch((err) => {
          const errMsg =
            err.response?.data?.message ||
            err.message ||
            "Lỗi kết nối đến máy chủ khi xử lý Zoom token.";
          setInternalError(errMsg);
          setMessage("Kết nối Zoom không thành công.");

          // Use returnPath if available, otherwise default to meeting room
          const returnPath = sessionStorage.getItem("zoomReturnPath");
          const returnState = sessionStorage.getItem("zoomReturnState");

          setTimeout(() => {
            if (returnPath) {
              sessionStorage.removeItem("zoomReturnPath");
              sessionStorage.removeItem("zoomReturnState");
              navigate(returnPath, {
                replace: true,
                state: {
                  zoomAuthError: errMsg,
                  ...(returnState ? JSON.parse(returnState) : {}),
                },
              });
            } else {
              navigate("/tai-khoan/ho-so/phong-hoc", {
                replace: true,
                state: { zoomAuthError: errMsg },
              });
            }
          }, 3000);
        });
    } else {
      // Không có code và cũng không có zoomErrorFromUrl
      const errMsg =
        "Không tìm thấy mã xác thực (code) từ Zoom trên URL callback.";
      setInternalError(errMsg);
      setMessage("Kết nối Zoom không thành công. Mã xác thực bị thiếu.");

      // Use returnPath if available, otherwise default to meeting room
      const returnPath = sessionStorage.getItem("zoomReturnPath");
      const returnState = sessionStorage.getItem("zoomReturnState");

      setTimeout(() => {
        if (returnPath) {
          sessionStorage.removeItem("zoomReturnPath");
          sessionStorage.removeItem("zoomReturnState");
          navigate(returnPath, {
            replace: true,
            state: {
              zoomAuthError: errMsg,
              ...(returnState ? JSON.parse(returnState) : {}),
            },
          });
        } else {
          navigate("/tai-khoan/ho-so/phong-hoc", {
            replace: true,
            state: { zoomAuthError: errMsg },
          });
        }
      }, 3000);
    }
  }, [location.search, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7f6",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          color: internalError ? "#d9534f" : "#0275d8",
          marginBottom: "20px",
        }}
      >
        {message}
      </h2>
      {internalError && (
        <p
          style={{
            color: "#d9534f",
            backgroundColor: "#f2dede",
            border: "1px solid #ebccd1",
            padding: "15px",
            borderRadius: "4px",
            maxWidth: "600px",
            wordWrap: "break-word",
            marginBottom: "20px",
          }}
        >
          <strong>Lỗi:</strong> {internalError}
        </p>
      )}
      <p style={{ color: "#555", fontSize: "1rem" }}>
        {internalError
          ? "Vui lòng thử lại thao tác kết nối Zoom."
          : "Bạn sẽ được tự động chuyển hướng sau giây lát..."}
      </p>
      {/* Nút quay lại có thể không cần nếu luôn tự động redirect */}{" "}
    </div>
  );
};
export default memo(ZoomCallback);
