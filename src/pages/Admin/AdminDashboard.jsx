import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";

import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
import AdminCard from "../../components/Admin/AdminCard";
import "../../assets/css/Admin/AdminDashboard.style.css";

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const oauthProcessingRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // Cờ unmount
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      // Chỉ set loading nếu component còn mounted
      if (isMounted) {
        setIsProcessingOAuth(true);
        setOauthError(null);
      }
      window.scrollTo(0, 0);

      // Đặt focus sau khi DOM cập nhật
      const focusTimeout = setTimeout(() => {
        if (isMounted) oauthProcessingRef.current?.focus();
      }, 0);

      const storedState = Cookies.get("microsoft_auth_state");

      if (!storedState || state !== storedState) {
        console.error("AdminDashboard OAuth Error: State mismatch.");
        if (isMounted)
          setOauthError(
            "Lỗi bảo mật xác thực (state). Vui lòng đăng nhập lại."
          );
        Cookies.remove("microsoft_auth_state");
        if (isMounted) navigate("/admin/dashboard", { replace: true }); // Chỉ làm sạch URL
        if (isMounted) setIsProcessingOAuth(false);
        return; // Dừng sớm
      }

      Cookies.remove("microsoft_auth_state");

      const exchangeAdminCodeForToken = async (authCode) => {
        try {
          const response = await Api({
            endpoint: "admin/auth/callback",
            method: METHOD_TYPE.POST,
            data: { code: authCode },
          });

          if (response.success && response.data?.token) {
            const { token } = response.data;
            // Set cookie trước khi fetch profile
            Cookies.set("token", token);
            Cookies.set("role", "admin");

            try {
              const adminInfoResponse = await Api({
                endpoint: "admin/get-profile",
                method: METHOD_TYPE.GET,
              });

              if (
                adminInfoResponse.success &&
                adminInfoResponse.data &&
                isMounted
              ) {
                dispatch(setAdminProfile(adminInfoResponse.data));
                console.log(
                  "AdminDashboard OAuth: Profile fetched & dispatched."
                );
              } else if (isMounted) {
                console.error(
                  "AdminDashboard OAuth: Failed fetch profile.",
                  adminInfoResponse?.message
                );
                setOauthError("Đăng nhập thành công, lỗi tải thông tin Admin.");
                // Không xóa token ở đây, để PrivateRoute xử lý nếu cần
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
                // Không xóa token ở đây
              }
            }
          } else {
            // Nếu callback API thất bại
            throw new Error(response?.message || "Lỗi đổi mã xác thực Admin.");
          }
        } catch (err) {
          if (isMounted) {
            console.error("AdminDashboard OAuth Callback Error:", err);
            setOauthError(err.message || "Lỗi xử lý đăng nhập Admin.");
            // Xóa cookie nếu callback thất bại hoàn toàn
            Cookies.remove("token");
            Cookies.remove("role");
          }
        } finally {
          if (isMounted) {
            // Luôn làm sạch URL và kết thúc loading ở đây
            navigate("/admin/dashboard", { replace: true });
            setIsProcessingOAuth(false);
          }
        }
      };

      exchangeAdminCodeForToken(code);

      // Cleanup timeout khi unmount
      return () => {
        clearTimeout(focusTimeout);
        isMounted = false;
        console.log(
          "AdminDashboardPage unmounting or dependencies changed during OAuth process."
        );
      };
    } else {
      // Nếu vào dashboard mà không có code/state, không làm gì cả ở đây
      // PrivateRoute sẽ xử lý việc kiểm tra token/profile
      console.log("AdminDashboardPage loaded without OAuth code/state.");
    }
    // Chỉ chạy lại khi search params thay đổi
  }, [location.search, navigate, dispatch]);

  // --- Dữ liệu và options cho charts (Giữ nguyên hoặc fetch) ---
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
      {/* Overlay xử lý OAuth */}
      {isProcessingOAuth && (
        <div
          ref={oauthProcessingRef}
          className="oauth-processing-overlay admin-overlay"
          tabIndex="-1"
          role="status" // Role status phù hợp hơn cho loading
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

      {/* Nội dung chính của Dashboard (Ẩn khi đang xử lý OAuth) */}
      {!isProcessingOAuth && (
        <>
          <div className="admin-dashboard-content">
            <AdminCard
              title="Gia sư"
              iconAdminCard={<i className="fa-solid fa-graduation-cap"></i>}
            >
              <p className="data-card">150</p>
            </AdminCard>
            <AdminCard
              title="Học viên"
              iconAdminCard={<i className="fa-solid fa-user-group"></i>}
            >
              <p className="data-card">1200</p>
            </AdminCard>
            <AdminCard
              title="Lớp hoạt động"
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
          {/* ... các phần khác của dashboard ... */}
        </>
      )}
    </AdminDashboardLayout>
  );
};

// Bỏ React.memo để debug dễ hơn
// const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboardPage;
