// src/route/TutorRegistrationGuard.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Api from "../network/Api"; // Điều chỉnh đường dẫn nếu cần
import { METHOD_TYPE } from "../network/methodType"; // Điều chỉnh đường dẫn nếu cần
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const TutorRegistrationGuard = () => {
  const [authStatus, setAuthStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();

  const verifyAccess = useCallback(async () => {
    // ... (logic gọi API và kiểm tra response giữ nguyên như phiên bản trước, đã xử lý message 'false') ...
    if (authStatus !== "loading") {
      setAuthStatus("loading");
    }
    setErrorMsg("");
    try {
      const response = await Api({
        endpoint: "test-result/check-pass-test",
        method: METHOD_TYPE.GET,
      });

      if (response?.success) {
        if (typeof response.data === "boolean") {
          if (response.data === true) {
            console.log("Guard: User has passed (from data). Allowing access.");
            setAuthStatus("allowed");
          } else {
            console.log("Guard: User has not passed (from data). Redirecting.");
            setAuthStatus("redirect-to-test");
          }
        } else if (response.message === "false" || response.message === false) {
          console.warn(
            "Guard: API data is not boolean, using message 'false' as fallback. Redirecting."
          );
          setAuthStatus("redirect-to-test");
        } else if (response.message === "true" || response.message === true) {
          console.warn(
            "Guard: API data is not boolean, using message 'true' as fallback. Allowing access."
          );
          setAuthStatus("allowed");
        } else {
          console.error("Guard: Invalid success response structure.", response);
          throw new Error(
            "Kiểm tra điều kiện thành công nhưng cấu trúc dữ liệu trả về không hợp lệ."
          );
        }
      } else {
        console.error("Guard: API call failed or success is false.", response);
        throw new Error(response?.message || "Kiểm tra điều kiện thất bại.");
      }
    } catch (err) {
      console.error("TutorRegistrationGuard Error Catch:", err);
      setErrorMsg(
        err.message || "Không thể kiểm tra điều kiện đăng ký làm gia sư."
      );
      setAuthStatus("error");
    }
  }, [authStatus]);

  useEffect(() => {
    verifyAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Render theo trạng thái ---

  if (authStatus === "loading") {
    // ... (render loading) ...
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
        }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#b41e2d" />
        <p style={{ marginTop: "1rem", color: "#495057" }}>
          Đang kiểm tra điều kiện đăng ký...
        </p>
      </div>
    );
  }

  if (authStatus === "error") {
    // ... (render error) ...
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          size="3x"
          color="#dc3545"
        />
        <p style={{ marginTop: "1rem", color: "#dc3545", fontWeight: "500" }}>
          Lỗi: {errorMsg}
        </p>
        <button
          onClick={verifyAccess}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (authStatus === "redirect-to-test") {
    // *** CẬP NHẬT ĐƯỜNG DẪN ***
    // Chuyển hướng người dùng đến trang làm test
    return (
      <Navigate to="/trac-nghiem-gia-su" replace state={{ from: location }} />
    );
  }

  if (authStatus === "allowed") {
    // Render component con (TutorRegistrationForm)
    return <Outlet />;
  }
  // Fallback
  return <div>Trạng thái không xác định.</div>;
};

export default memo(TutorRegistrationGuard);
