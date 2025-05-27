// src/pages/User/ZoomCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn đúng
// import './ZoomCallback.style.css'; // Tạo file CSS nếu bạn có

const ZoomCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authorizationCode = queryParams.get("code");
    const zoomError = queryParams.get("error");

    if (zoomError) {
      const errorDescription =
        queryParams.get("error_description") || zoomError;
      console.error("Lỗi từ Zoom OAuth Callback:", zoomError, errorDescription);
      setError(`Lỗi từ Zoom: ${errorDescription}. Vui lòng thử lại.`);
      setMessage("Kết nối Zoom không thành công.");
      return;
    }

    if (authorizationCode) {
      console.log("Authorization Code lấy từ URL:", authorizationCode);
      setMessage("Đã nhận được mã xác thực. Đang gửi đến máy chủ...");

      Api({
        endpoint: "meeting/handle", // Endpoint không có / ở đầu
        method: METHOD_TYPE.POST,
        data: { authorizationCode: authorizationCode },
      })
        .then((response) => {
          console.log("Phản hồi từ API meeting/handle:", response);
          const backendResponse = response.data; // {status, code, success, message, data, errors}

          if (
            backendResponse &&
            backendResponse.success &&
            backendResponse.data
          ) {
            const tokenResult = backendResponse.data.result; // Dữ liệu token trong data.result
            if (
              tokenResult &&
              tokenResult.accessToken &&
              tokenResult.refreshToken
            ) {
              const { accessToken, refreshToken, userId } = tokenResult;
              localStorage.setItem("zoomAccessToken", accessToken);
              localStorage.setItem("zoomRefreshToken", refreshToken);
              if (userId) {
                localStorage.setItem("zoomUserId", userId);
              }
              setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");
              setTimeout(
                () =>
                  navigate("/tai-khoan/ho-so/phong-hop-zoom", {
                    replace: true,
                  }),
                2000
              );
            } else {
              console.error(
                "Dữ liệu token không hợp lệ trong backendResponse.data.result:",
                tokenResult
              );
              throw new Error(
                backendResponse.message ||
                  "Phản hồi từ máy chủ không chứa thông tin token hợp lệ trong 'result'."
              );
            }
          } else {
            console.error(
              "Lỗi hoặc dữ liệu không hợp lệ từ API meeting/handle:",
              backendResponse
            );
            const errorMessage =
              backendResponse?.message ||
              backendResponse?.errors?.join(", ") ||
              "Máy chủ trả về lỗi hoặc dữ liệu không đúng định dạng.";
            throw new Error(errorMessage);
          }
        })
        .catch((err) => {
          console.error(
            "Lỗi khi gọi API meeting/handle:",
            err.response?.data || err.message || err
          );
          let errorMessage =
            "Có lỗi xảy ra trong quá trình hoàn tất kết nối Zoom.";
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (
            err.response &&
            err.response.data &&
            err.response.data.errors
          ) {
            errorMessage = Array.isArray(err.response.data.errors)
              ? err.response.data.errors.join(", ")
              : JSON.stringify(err.response.data.errors);
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setMessage("Kết nối Zoom không thành công.");
        });
    } else if (!zoomError) {
      setError("Không tìm thấy mã xác thực (code) từ Zoom trên URL callback.");
      setMessage("Kết nối Zoom không thành công. Mã xác thực bị thiếu.");
      console.log("URL search không chứa 'code':", location.search);
    }
  }, [location.search, navigate]);

  // JSX giữ nguyên
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
          color: error ? "#d9534f" : "#0275d8",
          marginBottom: "20px",
        }}
      >
        {message}
      </h2>
      {error && (
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
          <strong>Lỗi:</strong> {error}
        </p>
      )}
      <p style={{ color: "#555", fontSize: "1rem" }}>
        {error
          ? "Vui lòng thử lại thao tác kết nối Zoom."
          : "Bạn sẽ được tự động chuyển hướng sau giây lát..."}
      </p>
      {(error || (message && message.includes("không thành công"))) && (
        <button
          onClick={() =>
            navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true })
          }
          style={{
            padding: "12px 25px",
            marginTop: "30px",
            cursor: "pointer",
            backgroundColor: "#0275d8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#025aa5")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#0275d8")
          }
        >
          Quay lại trang Phòng Họp
        </button>
      )}
    </div>
  );
};
export default ZoomCallback;
