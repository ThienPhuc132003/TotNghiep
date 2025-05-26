// src/pages/User/ZoomCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api"; // Đảm bảo đường dẫn này chính xác
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn này chính xác

const ZoomCallback = () => {
  const location = useLocation(); // Hook để truy cập thông tin của URL hiện tại
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tạo một đối tượng URLSearchParams từ phần search của URL (ví dụ: "?code=abc&state=xyz")
    const queryParams = new URLSearchParams(location.search);
    // Lấy giá trị của query parameter 'code'
    const authorizationCode = queryParams.get("code");
    const zoomError = queryParams.get("error"); // Kiểm tra nếu Zoom trả về lỗi trực tiếp

    if (zoomError) {
      const errorDescription =
        queryParams.get("error_description") || zoomError;
      console.error("Lỗi từ Zoom OAuth Callback:", zoomError, errorDescription);
      setError(`Lỗi từ Zoom: ${errorDescription}. Vui lòng thử lại.`);
      setMessage("Kết nối Zoom không thành công.");
      return; // Dừng xử lý nếu có lỗi từ Zoom
    }

    // Nếu có authorizationCode từ URL
    if (authorizationCode) {
      console.log("Authorization Code lấy từ URL:", authorizationCode); // Log code lấy từ URL
      setMessage("Đã nhận được mã xác thực. Đang gửi đến máy chủ...");

      // Gọi API backend của bạn để đổi authorizationCode lấy access token và refresh token
      Api({
        endpoint: "/meeting/handle", // Endpoint backend để xử lý code
        method: METHOD_TYPE.POST,
        data: { authorizationCode: authorizationCode }, // Gửi code lấy từ URL
      })
        .then((responseData) => {
          console.log("Phản hồi từ API /meeting/handle:", responseData);
          if (
            responseData &&
            responseData.result &&
            responseData.result.accessToken &&
            responseData.result.refreshToken
          ) {
            const { accessToken, refreshToken, userId } = responseData.result;
            localStorage.setItem("zoomAccessToken", accessToken);
            localStorage.setItem("zoomRefreshToken", refreshToken);
            if (userId) {
              localStorage.setItem("zoomUserId", userId);
            }
            setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");
            setTimeout(
              () =>
                navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true }),
              2000
            );
          } else {
            console.error(
              "Cấu trúc dữ liệu token không hợp lệ từ API /meeting/handle:",
              responseData
            );
            throw new Error(
              "Phản hồi từ máy chủ không chứa thông tin token hợp lệ."
            );
          }
        })
        .catch((err) => {
          console.error(
            "Lỗi khi gọi API /meeting/handle để xử lý Zoom token:",
            err
          );
          let errorMessage =
            "Có lỗi xảy ra trong quá trình hoàn tất kết nối Zoom với hệ thống.";
          // (Phần xử lý errorMessage chi tiết hơn như ở phiên bản trước)
          if (typeof err === "string") {
            errorMessage = err;
          } else if (err && err.message) {
            errorMessage = err.message;
          } else if (err && err.error) {
            errorMessage = err.error;
          }
          // ...
          setError(errorMessage);
          setMessage("Kết nối Zoom không thành công.");
        });
    } else if (!zoomError) {
      // Chỉ hiển thị lỗi này nếu không có code VÀ không có lỗi từ Zoom
      setError("Không tìm thấy mã xác thực (code) từ Zoom trên URL callback.");
      setMessage("Kết nối Zoom không thành công. Mã xác thực bị thiếu.");
      console.log("URL search không chứa 'code':", location.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // useEffect sẽ chạy lại nếu location.search thay đổi

  // Phần JSX để hiển thị message và error giữ nguyên như phiên bản trước
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
