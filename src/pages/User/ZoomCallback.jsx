// src/pages/User/ZoomCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../../network/Api"; // Đảm bảo đường dẫn này chính xác
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn này chính xác

const ZoomCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý xác thực Zoom...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authorizationCode = queryParams.get("code");
    const zoomError = queryParams.get("error"); // Kiểm tra nếu Zoom trả về lỗi trực tiếp

    if (zoomError) {
      // Các mã lỗi có thể từ Zoom: access_denied, unsupported_response_type, invalid_scope, server_error, temporarily_unavailable
      const errorDescription =
        queryParams.get("error_description") || zoomError;
      console.error("Lỗi từ Zoom OAuth Callback:", zoomError, errorDescription);
      setError(`Lỗi từ Zoom: ${errorDescription}. Vui lòng thử lại.`);
      setMessage("Kết nối Zoom không thành công.");
      // Không cần return ngay, có thể để UI hiển thị nút quay lại
      return; // Thêm return để dừng xử lý nếu có lỗi từ Zoom
    }

    if (authorizationCode) {
      console.log(
        "Authorization Code nhận được trên Frontend:",
        authorizationCode
      );
      // Gọi API backend của bạn để đổi authorizationCode lấy access token và refresh token
      Api({
        endpoint: "/meeting/handle", // Endpoint backend để xử lý code và lấy token từ Zoom
        method: METHOD_TYPE.POST,
        data: { authorizationCode },
      })
        .then((responseData) => {
          // responseData là dữ liệu mà hàm Api.js trả về (thường là response.data từ axios)
          console.log("Phản hồi từ API /meeting/handle:", responseData);

          // Dựa trên API spec của bạn, tokens nằm trong responseData.result
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
              // Lưu userId của Zoom nếu backend trả về
              localStorage.setItem("zoomUserId", userId);
            }
            setMessage("Kết nối Zoom thành công! Đang chuyển hướng...");
            // Chuyển hướng về trang quản lý phòng họp hoặc trang dashboard của gia sư
            setTimeout(
              () =>
                navigate("/tai-khoan/ho-so/phong-hop-zoom", { replace: true }),
              2000
            );
          } else {
            // Nếu cấu trúc dữ liệu không như mong đợi
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
          if (typeof err === "string") {
            errorMessage = err;
          } else if (err && err.message) {
            errorMessage = err.message; // Lỗi từ throw new Error hoặc lỗi mạng
          } else if (err && err.error) {
            // Cấu trúc lỗi { error: "message" }
            errorMessage = err.error;
          } else if (
            err &&
            err.errors &&
            Array.isArray(err.errors) &&
            err.errors.length > 0
          ) {
            // Mảng lỗi
            errorMessage = err.errors
              .map((e) => e.msg || e.message || e)
              .join(", ");
          }
          // Nếu err là một object response lỗi từ axios (đã được axiosClient xử lý và trả về error.response.data)
          // thì err.message có thể đã chứa thông điệp lỗi rồi.
          setError(errorMessage);
          setMessage("Kết nối Zoom không thành công.");
        });
    } else if (!zoomError) {
      // Chỉ hiển thị lỗi này nếu không có authorizationCode VÀ không có lỗi trực tiếp từ Zoom
      setError(
        "Không tìm thấy mã xác thực từ Zoom trên URL callback. Quá trình có thể đã bị gián đoạn."
      );
      setMessage("Kết nối Zoom không thành công.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Chỉ chạy lại khi location.search thay đổi (chứa code hoặc error)
  // Không cần navigate trong dependencies của useEffect này.

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh", // Chiều cao tối thiểu để căn giữa trên màn hình
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7f6", // Màu nền nhẹ nhàng
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          color: error ? "#d9534f" : "#0275d8", // Màu đỏ nếu lỗi, xanh nếu đang xử lý/thành công
          marginBottom: "20px",
        }}
      >
        {message}
      </h2>
      {error && (
        <p
          style={{
            color: "#d9534f", // Màu đỏ cho thông báo lỗi
            backgroundColor: "#f2dede", // Nền đỏ nhạt
            border: "1px solid #ebccd1",
            padding: "15px",
            borderRadius: "4px",
            maxWidth: "600px",
            wordWrap: "break-word", // Để message dài không vỡ layout
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
      {(error || message.includes("không thành công")) && ( // Hiển thị nút nếu có lỗi hoặc message thất bại
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
