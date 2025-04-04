// src/pages/Admin/AdminDashboardPage.jsx

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api"; // <-- Đường dẫn đúng
import { METHOD_TYPE } from "../../network/methodType"; // <-- Đường dẫn đúng
import { setAdminProfile } from "../../redux/adminSlice"; // <-- Đường dẫn đúng

import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout"; // <-- Đường dẫn đúng
import ChartComponent from "../../components/Chart"; // <-- Đường dẫn đúng
import AdminCard from "../../components/Admin/AdminCard"; // <-- Đường dẫn đúng
import "../../assets/css/Admin/AdminDashboard.style.css"; // <-- Đường dẫn đúng
import "../../assets/css/Admin/AdminOAuthOverlay.style.css"; // <-- Đường dẫn đúng

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const oauthProcessingRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      if (isMounted) {
        setIsProcessingOAuth(true);
        setOauthError(null);
      }
      window.scrollTo(0, 0);
      const focusTimeout = setTimeout(() => {
        if (isMounted) oauthProcessingRef.current?.focus();
      }, 0);
      const storedState = Cookies.get("microsoft_auth_state");

      if (!storedState || state !== storedState) {
        if (isMounted) {
          setOauthError("Lỗi bảo mật (state).");
          Cookies.remove("microsoft_auth_state");
          navigate("/admin/dashboard", { replace: true });
          setIsProcessingOAuth(false);
        }
        return;
      }
      Cookies.remove("microsoft_auth_state");

      const exchangeAdminCodeForToken = async (authCode) => {
        try {
          console.log("AdminDashboard OAuth: Exchanging code for token...");
          const response = await Api({
            endpoint: "admin/auth/callback",
            method: METHOD_TYPE.POST,
            data: { code: authCode },
          });

          if (response.success && response.data?.token) {
            const { token, adminId: callbackAdminId } = response.data;
            Cookies.set("token", token, { secure: true, sameSite: "Lax" }); // Set cookie an toàn
            Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
            console.log(
              "AdminDashboard OAuth: Token received. Callback adminId:",
              callbackAdminId
            );

            // Fetch full profile sau khi có token
            try {
              console.log("AdminDashboard OAuth: Fetching full profile...");
              const adminInfoResponse = await Api({
                endpoint: "admin/get-profile",
                method: METHOD_TYPE.GET,
              });

              if (
                adminInfoResponse.success &&
                adminInfoResponse.data &&
                isMounted
              ) {
                // Kiểm tra adminId trong profile trả về
                if (adminInfoResponse.data.adminId) {
                  console.log(
                    "AdminDashboard OAuth: Full profile received:",
                    adminInfoResponse.data
                  );
                  dispatch(setAdminProfile(adminInfoResponse.data));
                } else {
                  console.error(
                    "AdminDashboard OAuth: Full profile missing adminId!",
                    adminInfoResponse.data
                  );
                  setOauthError("Dữ liệu profile Admin không hợp lệ.");
                  Cookies.remove("token");
                  Cookies.remove("role"); // Xóa token nếu profile không hợp lệ
                }
              } else if (isMounted) {
                console.error(
                  "AdminDashboard OAuth: Failed fetch profile.",
                  adminInfoResponse?.message
                );
                setOauthError("Đăng nhập thành công, lỗi tải thông tin Admin.");
                // Vẫn giữ token để PrivateRoute kiểm tra lại
              }
            } catch (profileError) {
              if (isMounted) {
                console.error(
                  "AdminDashboard OAuth: Error fetching profile:",
                  profileError
                );
                setOauthError(
                  profileError.response?.data?.message ||
                    "Lỗi mạng khi tải thông tin Admin."
                );
                // Vẫn giữ token
              }
            }
          } else {
            throw new Error(response?.message || "Lỗi đổi mã xác thực Admin.");
          }
        } catch (err) {
          if (isMounted) {
            console.error("AdminDashboard OAuth Callback Error:", err);
            setOauthError(err.message || "Lỗi xử lý đăng nhập Admin.");
            Cookies.remove("token");
            Cookies.remove("role"); // Xóa token nếu callback lỗi
          }
        } finally {
          if (isMounted) {
            navigate("/admin/dashboard", { replace: true }); // Luôn làm sạch URL
            setIsProcessingOAuth(false); // Luôn kết thúc loading
            console.log("AdminDashboard OAuth: Finished processing.");
          }
        }
      };
      exchangeAdminCodeForToken(code);
      return () => {
        clearTimeout(focusTimeout);
        isMounted = false;
      };
    } else {
      console.log("AdminDashboardPage loaded without OAuth params.");
    }
  }, [location.search, navigate, dispatch]);

  // --- Dữ liệu charts (Placeholder) ---
  const userData = {
    labels: ["T1", "T2", "T3"],
    datasets: [{ label: "Users", data: [10, 20, 15] }],
  };
  const classData = {
    labels: ["T1", "T2", "T3"],
    datasets: [{ label: "Classes", data: [5, 8, 6] }],
  };
  const revenueData = {
    labels: ["T1", "T2", "T3"],
    datasets: [{ label: "Revenue", data: [100, 150, 130] }],
  };
  const options = { scales: { y: { beginAtZero: true } } };

  return (
    <AdminDashboardLayout currentPage="Bảng Điều Khiển">
      {isProcessingOAuth && (
        <div
          ref={oauthProcessingRef}
          className="oauth-processing-overlay admin-overlay"
          tabIndex="-1"
          role="status"
          aria-live="assertive"
          aria-label="Đang xử lý đăng nhập Admin"
        >
          <p>Đang xử lý đăng nhập Admin...</p>
        </div>
      )}
      {oauthError && (
        <div
          className="oauth-error-message admin-error"
          style={{
            color: "darkred",
            border: "1px solid darkred",
            background: "#ffebee",
            padding: "10px",
            margin: "10px",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <strong>Lỗi đăng nhập OAuth Admin:</strong> {oauthError}
        </div>
      )}
      {!isProcessingOAuth && (
        <>
          <div className="admin-dashboard-content">
            <AdminCard
              title="Gia sư"
              iconAdminCard={<i className="fa-solid fa-graduation-cap"></i>}
            >
              <p className="data-card">...</p>
            </AdminCard>
            <AdminCard
              title="Học viên"
              iconAdminCard={<i className="fa-solid fa-user-group"></i>}
            >
              <p className="data-card">...</p>
            </AdminCard>
            <AdminCard
              title="Lớp hoạt động"
              iconAdminCard={<i className="fa-solid fa-chalkboard-user"></i>}
            >
              <p className="data-card">...</p>
            </AdminCard>
            <AdminCard
              title="Giao dịch"
              iconAdminCard={
                <i className="fa-solid fa-money-bill-transfer"></i>
              }
            >
              <p className="data-card">...</p>
            </AdminCard>
          </div>
          <div className="admin-dashboard-charts">
            <AdminCard title="Người dùng mới">
              <ChartComponent type="bar" data={userData} options={options} />
            </AdminCard>
            <AdminCard title="Lớp học">
              <ChartComponent type="line" data={classData} options={options} />
            </AdminCard>
            <AdminCard title="Doanh thu">
              <ChartComponent
                type="line"
                data={revenueData}
                options={options}
              />
            </AdminCard>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;
