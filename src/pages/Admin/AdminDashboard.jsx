// src/pages/Admin/AdminDashboardPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
// Link is now used in the JSX below
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";

import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
// import LoadingSpinner from "../../components/LoadingSpinner"; // Removed
import "../../assets/css/Admin/AdminDashboard.style.css"; // Ensure CSS is imported

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminProfile = useSelector((state) => state.admin.profile);

  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(
      adminProfile?.adminId ||
      (Cookies.get("token") && Cookies.get("role") === "admin")
    )
  );
  const oauthProcessingRef = useRef(false);

  // --- States for Mock Data ---
  const [dashboardStats, setDashboardStats] = useState({
    totalTutors: { value: 0, change: null },
    pendingTutors: { value: 0, change: null },
    totalStudents: { value: 0, change: null },
    activeClasses: { value: 0, change: null },
    pendingRequests: { value: 0, change: null },
    monthlyRevenue: { value: 0, currency: "VNĐ", change: null },
  });
  const [chartData, setChartData] = useState({
    userGrowth: { labels: [], datasets: [] },
    revenueSource: { labels: [], datasets: [] },
    revenueTrend: { labels: [], datasets: [] },
  });

  // --- Chart Options ---
  const chartLineOptions = {
    scales: {
      y: { beginAtZero: true, grid: { color: "#e3e6f0", borderDash: [2, 2] } },
      x: { grid: { display: false } },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
  };
  const chartDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    cutout: "70%",
  };
  const chartBarOptions = {
    scales: {
      y: { beginAtZero: true, grid: { color: "#e3e6f0", borderDash: [2, 2] } },
      x: { grid: { display: false } },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  // --- Helper Functions ---
  const formatCurrency = (value, currency = "VNĐ") => {
    if (value === null || value === undefined) return "N/A";
    return `${value.toLocaleString("vi-VN")} ${currency}`;
  };
  const renderChange = (change, isPercent = false) => {
    if (change === null || change === undefined || change === 0) {
      return (
        <span style={{ color: "gray" }}>
          <i className="fa-solid fa-minus"></i> Không đổi
        </span>
      );
    }
    const isIncrease = change > 0;
    const absChange = Math.abs(change);
    const displayValue = isPercent
      ? `${absChange}%`
      : absChange.toLocaleString
      ? absChange.toLocaleString("vi-VN")
      : absChange;
    return (
      <span className={isIncrease ? "increase" : "decrease"}>
        <i
          className={`fa-solid ${isIncrease ? "fa-arrow-up" : "fa-arrow-down"}`}
        ></i>{" "}
        {displayValue}
      </span>
    );
  };

  // --- Fetch Admin Profile and Data Function ---
  const fetchAdminProfileAndData = useCallback(async () => {
    if (!Cookies.get("token") || Cookies.get("role") !== "admin") {
      setIsAuthenticated(false);
      setIsLoadingData(false);
      return;
    }
    console.log("Fetch Profile: Attempting...");
    setIsLoadingData(true);
    // Removed unused 'success' variable
    try {
      const adminInfoResponse = await Api({
        endpoint: "admin/get-profile",
        method: METHOD_TYPE.GET,
      });
      if (Cookies.get("token")) {
        if (adminInfoResponse.success && adminInfoResponse.data?.adminId) {
          console.log(
            "Fetch Profile: Success, dispatching:",
            adminInfoResponse.data
          );
          dispatch(setAdminProfile(adminInfoResponse.data));
          setIsAuthenticated(true);
          // --- SET MOCK DATA ---
          setDashboardStats({
            totalTutors: { value: 152, change: 5 },
            pendingTutors: { value: 15, change: 2 },
            totalStudents: { value: 325, change: -2 },
            activeClasses: { value: 85, change: 10 },
            pendingRequests: { value: 12, change: 0 },
            monthlyRevenue: { value: 25000000, currency: "VNĐ", change: 15 },
          });
          setChartData({
            /* ... mock chart data ... */
          });
          // --- END MOCK DATA ---
        } else {
          console.error(
            "Fetch Profile: API success but data invalid:",
            adminInfoResponse
          );
          setOauthError("Dữ liệu profile Admin không hợp lệ từ API.");
          setIsAuthenticated(false);
          Cookies.remove("token");
          Cookies.remove("role");
        }
      }
    } catch (error) {
      console.error("Fetch Profile: API Error:", error);
      if (Cookies.get("token")) {
        setOauthError(
          error.response?.data?.message || "Lỗi mạng khi tải thông tin."
        );
        setIsAuthenticated(false);
        Cookies.remove("token");
        Cookies.remove("role");
      }
    } finally {
      if (Cookies.get("token")) {
        setIsLoadingData(false);
        console.log("Fetch Profile: Attempt finished.");
      }
    }
  }, [dispatch]);

  // --- Effect 1: Handle OAuth Callback & Initial Token/Profile Check ---
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const exchangeAdminCodeForToken = async (authCode) => {
      if (!isMounted) return;
      setIsProcessingOAuth(true);
      setOauthError(null);
      setIsLoadingData(true);
      console.log("OAuth: Exchanging code...");
      let response = null;
      try {
        response = await Api({
          endpoint: "admin/auth/callback",
          method: METHOD_TYPE.POST,
          data: { code: authCode },
        });
        if (response && response.success && response.data?.token && isMounted) {
          const { token } = response.data;
          Cookies.set("token", token, { secure: true, sameSite: "Lax" });
          Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
          console.log("OAuth: Token received. Fetching profile...");
          fetchAdminProfileAndData(); // Call fetch
        } else if (isMounted) {
          throw new Error(response?.message || "Lỗi đổi mã xác thực.");
        }
      } catch (err) {
        if (isMounted) {
          setOauthError(err.message || "Lỗi xử lý đăng nhập.");
          Cookies.remove("token");
          Cookies.remove("role");
          setIsAuthenticated(false);
          setIsLoadingData(false);
        }
      } finally {
        if (isMounted) {
          setIsProcessingOAuth(false);
          navigate("/admin/dashboard", { replace: true });
        }
      }
    };

    const profileAlreadyExists = !!adminProfile?.adminId;
    console.log("useEffect running. Profile in Redux?", profileAlreadyExists);

    if (code && state && !oauthProcessingRef.current) {
      oauthProcessingRef.current = true;
      const storedState = Cookies.get("microsoft_auth_state");
      Cookies.remove("microsoft_auth_state");
      if (!storedState || state !== storedState) {
        if (isMounted) {
          setOauthError("Lỗi bảo mật (state).");
          setIsLoadingData(false);
          navigate("/admin/dashboard", { replace: true });
        }
        return;
      }
      exchangeAdminCodeForToken(code);
    } else if (!code && !state) {
      const existingToken = Cookies.get("token");
      const existingRole = Cookies.get("role");
      if (existingToken && existingRole === "admin") {
        if (!profileAlreadyExists) {
          console.log("useEffect: Token found, profile missing. Fetching...");
          fetchAdminProfileAndData();
        } else {
          console.log(
            "useEffect: Token and profile exist. Ensuring auth state."
          );
          if (isMounted) {
            setIsAuthenticated(true);
            setIsLoadingData(false);
          }
        }
      } else {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoadingData(false);
        }
      }
    } else {
      if (!oauthProcessingRef.current && isMounted) {
        setIsLoadingData(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [
    location.search,
    navigate,
    dispatch,
    fetchAdminProfileAndData,
    adminProfile,
  ]);

  // --- Render Logic ---
  if (isProcessingOAuth) {
    return (
      <AdminDashboardLayout currentPage="Đang xác thực...">
        <div
          className="oauth-processing-overlay"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p>Đang xử lý đăng nhập với Microsoft...</p>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (oauthError) {
    return (
      <AdminDashboardLayout currentPage="Lỗi">
        <div className="admin-dashboard-page-content">
          <div className="oauth-error-message">
            <strong>Lỗi:</strong> {oauthError}
            <button onClick={() => navigate("/admin/login", { replace: true })}>
              Đăng nhập lại
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (!isAuthenticated && !isLoadingData) {
    return (
      <AdminDashboardLayout currentPage="Yêu Cầu Đăng Nhập">
        <div className="admin-dashboard-page-content">
          <div className="auth-required-message">
            <p>Vui lòng đăng nhập.</p>
            <button onClick={() => navigate("/admin/login", { replace: true })}>
              Đăng nhập
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (isLoadingData) {
    return (
      <AdminDashboardLayout currentPage="Bảng Điều Khiển">
        <div
          className="loading-data-overlay"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p>Đang tải dữ liệu...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  // --- Main Render ---
  if (isAuthenticated && !isLoadingData) {
    return (
      <AdminDashboardLayout currentPage="Bảng Điều Khiển">
        <div className="admin-dashboard-page-content">
          {adminProfile && (
            <h2 style={{ marginBottom: "1.5rem", fontWeight: "600" }}>
              Chào mừng, {adminProfile.fullName || adminProfile.email}!
            </h2>
          )}
          {/* Cards Section */}
          <div className="admin-dashboard-content">
            {/* Card Tổng Gia sư */}
            <div className="admin-card tutors">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Tổng Gia sư</div>
                  <div className="admin-card-data">
                    {dashboardStats.totalTutors.value?.toLocaleString(
                      "vi-VN"
                    ) || "..."}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.totalTutors.change)}
                  </div>
                </div>
                <i className="fas fa-chalkboard-teacher admin-card-icon"></i>
              </div>
              {/* Footer with Link */}
              <div className="admin-card-footer">
                <Link to="/admin/gia-su">Xem chi tiết</Link>
              </div>
            </div>
            {/* Card Gia sư chờ duyệt */}
            <div className="admin-card requests">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Gia sư chờ duyệt</div>
                  <div className="admin-card-data">
                    {dashboardStats.pendingTutors.value?.toLocaleString(
                      "vi-VN"
                    ) || "..."}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.pendingTutors.change)}
                  </div>
                </div>
                <i className="fas fa-user-clock admin-card-icon"></i>
              </div>
              {/* Footer with Link */}
              <div className="admin-card-footer">
                <Link to="/admin/gia-su?status=pending">Xem chi tiết</Link>
              </div>
            </div>
            {/* Card Tổng Học viên */}
            <div className="admin-card students">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Tổng Học viên</div>
                  <div className="admin-card-data">
                    {dashboardStats.totalStudents.value?.toLocaleString(
                      "vi-VN"
                    ) || "..."}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.totalStudents.change)}
                  </div>
                </div>
                <i className="fas fa-user-graduate admin-card-icon"></i>
              </div>
              {/* Footer with Link */}
              <div className="admin-card-footer">
                <Link to="/admin/nguoi-hoc">Xem chi tiết</Link>
              </div>
            </div>
            {/* Card Lớp hoạt động */}
            <div className="admin-card classes">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Lớp hoạt động</div>
                  <div className="admin-card-data">
                    {dashboardStats.activeClasses.value?.toLocaleString(
                      "vi-VN"
                    ) || "..."}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.activeClasses.change)}
                  </div>
                </div>
                <i className="fas fa-school admin-card-icon"></i>
              </div>
              {/* Optional Footer Link */}
              {/* <div className="admin-card-footer"><Link to="/admin/lop-hoc">Xem chi tiết</Link></div> */}
            </div>
            {/* Card Yêu cầu mới */}
            <div className="admin-card requests">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Yêu cầu mới</div>
                  <div className="admin-card-data">
                    {dashboardStats.pendingRequests.value?.toLocaleString(
                      "vi-VN"
                    ) || "..."}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.pendingRequests.change)}
                  </div>
                </div>
                <i className="fas fa-file-alt admin-card-icon"></i>
              </div>
              {/* Footer with Link */}
              <div className="admin-card-footer">
                <Link to="/admin/yeu-cau">Xem chi tiết</Link>
              </div>
            </div>
            {/* Card Doanh thu tháng */}
            <div className="admin-card revenue">
              <div className="admin-card-body">
                <div className="admin-card-info">
                  <div className="admin-card-title">Doanh thu tháng</div>
                  <div className="admin-card-data">
                    {formatCurrency(
                      dashboardStats.monthlyRevenue.value,
                      dashboardStats.monthlyRevenue.currency
                    )}
                  </div>
                  <div className="admin-card-change">
                    {renderChange(dashboardStats.monthlyRevenue.change, true)}
                  </div>
                </div>
                <i className="fas fa-dollar-sign admin-card-icon"></i>
              </div>
              {/* Optional Footer Link */}
              {/* <div className="admin-card-footer"><Link to="/admin/bao-cao">Xem báo cáo</Link></div> */}
            </div>
          </div>
          {/* Charts Section */}
          <div className="admin-dashboard-charts">
            <div className="admin-chart-card" style={{ gridColumn: "span 2" }}>
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">
                  Tăng trưởng người dùng (6 tháng)
                </h3>
              </div>
              <div className="admin-chart-body">
                <ChartComponent
                  type="line"
                  data={chartData.userGrowth}
                  options={chartLineOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Phân bổ doanh thu</h3>
              </div>
              <div className="admin-chart-body">
                <ChartComponent
                  type="doughnut"
                  data={chartData.revenueSource}
                  options={chartDoughnutOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card" style={{ gridColumn: "span 3" }}>
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">
                  Xu hướng doanh thu (6 tháng)
                </h3>
              </div>
              <div className="admin-chart-body">
                <ChartComponent
                  type="bar"
                  data={chartData.revenueTrend}
                  options={chartBarOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return <AdminDashboardLayout currentPage="Đang tải..." />; // Fallback
};

export default AdminDashboardPage;
