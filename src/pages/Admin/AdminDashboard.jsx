import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";

import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart"; // Đảm bảo component này tồn tại
import AdminCard from "../../components/Admin/AdminCard"; // Đảm bảo component này tồn tại
import "../../assets/css/Admin/AdminDashboard.style.css";
// Import CSS cho overlay (tạo file này nếu chưa có)

const AdminDashboardPage = () => {
  // Hooks và State cho Callback OAuth
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const oauthProcessingRef = useRef(null); // Ref cho div loading/focus

  // Logic xử lý OAuth Callback cho Admin
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      setIsProcessingOAuth(true);
      setOauthError(null);
      window.scrollTo(0, 0); // Cuộn lên đầu trang

      setTimeout(() => {
        // Đặt focus vào vùng xử lý
        oauthProcessingRef.current?.focus();
      }, 0);

      const storedState = Cookies.get("microsoft_auth_state"); // Key state từ trang login

      if (!storedState || state !== storedState) {
        console.error("Lỗi bảo mật OAuth Admin: State không khớp.");
        setOauthError("Lỗi bảo mật xác thực. Vui lòng thử đăng nhập lại.");
        Cookies.remove("microsoft_auth_state");
        navigate("/admin/dashboard", { replace: true }); // Làm sạch URL
        setIsProcessingOAuth(false);
        return;
      }

      Cookies.remove("microsoft_auth_state");

      const exchangeAdminCodeForToken = async (authCode) => {
        try {
          const response = await Api({
            endpoint: "admin/auth/callback", // Endpoint callback cho Admin
            method: METHOD_TYPE.POST,
            data: { code: authCode },
          });

          if (response.success && response.data?.token) {
            const { token } = response.data;
            Cookies.set("token", token);
            Cookies.set("role", "admin"); // Lưu đúng role 'admin'

            try {
              const adminInfoResponse = await Api({
                endpoint: "admin/get-profile", // Endpoint lấy profile Admin
                method: METHOD_TYPE.GET,
              });

              if (adminInfoResponse.success && adminInfoResponse.data) {
                dispatch(setAdminProfile(adminInfoResponse.data)); // Dispatch action cho Admin
                console.log("Admin OAuth: Profile dispatched to Redux.");
              } else {
                console.error(
                  "Admin OAuth: Failed to fetch admin profile:",
                  adminInfoResponse.message
                );
                setOauthError(
                  "Đăng nhập thành công nhưng lỗi tải thông tin Admin."
                );
              }
            } catch (profileError) {
              console.error(
                "Admin OAuth: Error fetching admin profile:",
                profileError
              );
              setOauthError(
                profileError.response?.data?.message ||
                  "Lỗi tải thông tin Admin sau OAuth."
              );
            }
          } else {
            throw new Error(
              response.message || "Không thể đổi mã xác thực lấy token Admin."
            );
          }
        } catch (err) {
          console.error("Lỗi callback OAuth Admin:", err);
          setOauthError(
            err.message || "Đã có lỗi xảy ra trong quá trình đăng nhập Admin."
          );
        } finally {
          navigate("/admin/dashboard", { replace: true }); // Luôn làm sạch URL
          setIsProcessingOAuth(false); // Kết thúc xử lý
        }
      };

      exchangeAdminCodeForToken(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, dispatch]);

  // Dữ liệu mẫu cho charts (Giữ nguyên hoặc thay thế bằng API call thực tế)
  const userData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
    datasets: [{ label: "Đăng ký mới", data: [12, 19, 3, 5, 2, 3] /*...*/ }],
  };
  const classData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
    datasets: [{ label: "Lớp hoạt động", data: [5, 8, 6, 7, 9, 10] /*...*/ }],
  };
  const revenueData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
    datasets: [
      { label: "Doanh thu (k)", data: [10, 15, 13, 18, 22, 25] /*...*/ },
    ],
  };
  const options = { scales: { y: { beginAtZero: true } } };

  return (
    <AdminDashboardLayout currentPage="Bảng Điều Khiển">
      {/* Overlay xử lý OAuth */}
      {isProcessingOAuth && (
        <div
          ref={oauthProcessingRef}
          className="oauth-processing-overlay admin-overlay"
          tabIndex="-1"
          role="region"
          aria-live="assertive"
          aria-label="Đang xử lý đăng nhập Admin"
        >
          <p>Đang xử lý đăng nhập Admin...</p>
          {/* Thêm Spinner component nếu có */}
        </div>
      )}

      {/* Thông báo lỗi OAuth */}
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

      {/* Nội dung chính của Dashboard (ẨN khi đang xử lý OAuth) */}
      {!isProcessingOAuth && (
        <>
          <div className="admin-dashboard-content">
            {/* Các AdminCard thống kê */}
            <AdminCard
              title="Tổng số gia sư"
              iconAdminCard={<i className="fa-solid fa-graduation-cap"></i>}
            >
              <p className="data-card">150</p>
            </AdminCard>
            <AdminCard
              title="Tổng số học viên"
              iconAdminCard={<i className="fa-solid fa-user-group"></i>}
            >
              <p className="data-card">1200</p>
            </AdminCard>
            <AdminCard
              title="Lớp đang hoạt động"
              iconAdminCard={<i className="fa-solid fa-chalkboard-user"></i>}
            >
              <p className="data-card">75</p>
            </AdminCard>
            <AdminCard
              title="Giao dịch"
              iconAdminCard={
                <i className="fa-solid fa-money-bill-transfer"></i>
              }
            >
              <p className="data-card">500</p>
            </AdminCard>
            <AdminCard
              title="Doanh thu"
              iconAdminCard={<i className="fa-solid fa-coins"></i>}
            >
              <p className="data-card">$50,000</p>
            </AdminCard>
            <AdminCard
              title="Yêu cầu chờ duyệt"
              iconAdminCard={<i className="fa-solid fa-user-check"></i>}
            >
              <p className="data-card">10</p>
            </AdminCard>
          </div>
          <div className="admin-dashboard-charts">
            {/* Các Chart */}
            <AdminCard title="Đăng ký mới">
              <ChartComponent type="bar" data={userData} options={options} />
            </AdminCard>
            <AdminCard title="Lớp học đang hoạt động">
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
          <div className="admin-dashboard-lists">
            {/* Các danh sách Top */}
            <AdminCard title="Top gia sư">
              <ul className="top-list">
                <li>GS. A (4.9*)</li>
                <li>GS. B (4.8*)</li>
              </ul>
            </AdminCard>
            <AdminCard title="Top học viên">
              <ul className="top-list">
                <li>HV. X (20 lớp)</li>
                <li>HV. Y (18 lớp)</li>
              </ul>
            </AdminCard>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
};

const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;
