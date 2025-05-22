/* global Intl */
import { useEffect, useState, useRef, useCallback } from "react";
import {  useLocation, useNavigate } from "react-router-dom"; // Link có thể không dùng trực tiếp trong file này nữa
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";

import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart"; // Đảm bảo đường dẫn đúng
import "../../assets/css/Admin/AdminDashboard.style.css"; // CSS cho trang này

// Helper để lấy giá trị CSS Variable trong JS
const getCssVariable = (variableName) => {
  if (typeof window !== "undefined") {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      return value;
    } catch (error) {
      // console.warn(`CSS variable ${variableName} not found. Defaulting.`, error);
      // Cung cấp giá trị mặc định nếu biến không tìm thấy để tránh lỗi chart
      if (variableName.includes("orange")) return "#F76B1C";
      if (variableName.includes("text-dark")) return "#1f2937";
      if (variableName.includes("text-light")) return "#6b7280";
      return null;
    }
  }
  // Giá trị mặc định nếu window không tồn tại (SSR, etc.)
  if (variableName.includes("orange")) return "#F76B1C";
  if (variableName.includes("text-dark")) return "#1f2937";
  if (variableName.includes("text-light")) return "#6b7280";
  return null;
};

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminProfile = useSelector((state) => state.admin.profile);

  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(
      adminProfile?.adminId ||
      (Cookies.get("token") && Cookies.get("role") === "admin")
    )
  );
  const oauthProcessingRef = useRef(false);

  const [timeRange, setTimeRange] = useState("month");

  const [dashboardStats, setDashboardStats] = useState({
    revenue: { value: 0, currency: "VNĐ", change: null },
    newUsers: { value: 0, change: null },
    newTutors: { value: 0, change: null },
    newTutorRequest: { value: 0, change: null },
    newClassActive: { value: 0, change: null },
  });

  const [chartData, setChartData] = useState({
    revenueTrend: { labels: [], datasets: [] },
  });

  const chartLineOptions = {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          borderDash: [2, 2],
          drawBorder: false,
        },
        ticks: {
          color: getCssVariable("--text-light") || "#6b7280",
          padding: 10,
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: getCssVariable("--text-light") || "#6b7280",
          padding: 10,
          font: { size: 11 },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        labels: {
          color: getCssVariable("--text-dark") || "#1f2937",
          font: { size: 12, weight: "500" },
          boxWidth: 12,
          boxHeight: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: getCssVariable("--text-dark") || "rgba(0,0,0,0.85)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: { top: 10, bottom: 10, left: 12, right: 12 },
        cornerRadius: 6,
        titleFont: { weight: "600", size: 13 },
        bodyFont: { size: 12 },
        displayColors: false, // Không hiển thị ô màu trong tooltip nếu chỉ có 1 dataset
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    elements: {
      line: {
        tension: 0.4, // Làm cho đường cong mượt hơn
      },
      point: {
        radius: 3, // Bán kính điểm
        hoverRadius: 6, // Bán kính điểm khi hover
        hitRadius: 15, // Vùng nhận diện click/hover cho điểm
      },
    },
  };

  const formatCurrency = (value, currency = "VNĐ") => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "N/A";
    return `${Number(value).toLocaleString("vi-VN")} ${currency}`;
  };

  const renderChange = (change, isPercent = false) => {
    if (change === null || change === undefined || isNaN(Number(change))) {
      return <span className="admin-card__change-value no-change">N/A</span>;
    }
    const numChange = Number(change);
    if (numChange === 0 && isPercent) {
      // Nếu là % và bằng 0, vẫn hiển thị 0%
      return (
        <span className="admin-card__change-value no-change">
          <i className="fa-solid fa-minus"></i> 0.0%
        </span>
      );
    }
    if (numChange === 0) {
      return (
        <span className="admin-card__change-value no-change">
          <i className="fa-solid fa-minus"></i> Không đổi
        </span>
      );
    }
    const isIncrease = numChange > 0;
    const absChange = Math.abs(numChange);
    const displayValue = isPercent
      ? `${absChange.toFixed(1)}%`
      : absChange.toLocaleString("vi-VN");
    return (
      <span
        className={`admin-card__change-value ${
          isIncrease ? "increase" : "decrease"
        }`}
      >
        <i
          className={`fa-solid ${
            isIncrease ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
          }`}
        ></i>{" "}
        {displayValue}
      </span>
    );
  };

  const getTimeRangeText = (range) => {
    if (range === "week") return "Tuần";
    if (range === "year") return "Năm";
    return "Tháng";
  };

  const fetchDataForRange = useCallback(
    async (range) => {
      if (!isAuthenticated) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      let endpoint = "";
      switch (range) {
        case "week":
          endpoint = "statistical/week";
          break;
        case "year":
          endpoint = "statistical/year";
          break;
        case "month":
        default:
          endpoint = "statistical/month";
          break;
      }

      try {
        const response = await Api({ endpoint, method: METHOD_TYPE.GET });
        if (response.success && response.data) {
          const { information } = response.data;
          setDashboardStats({
            revenue: {
              value: information.revenue,
              currency: "VNĐ",
              change: information.revenuePercentage,
            },
            newUsers: {
              value: information.newUsers,
              change: information.newUserPercentage,
            },
            newTutors: {
              value: information.newTutors,
              change: information.newTutorPercentage,
            },
            newTutorRequest: {
              value: information.newTutorRequest,
              change: information.newTutorRequestPercentage,
            },
            newClassActive: {
              value: information.newClassActive,
              change: information.newClassActivePercentage,
            },
          });

          let revenueLabels = [];
          let revenueValues = [];

          if (range === "week" && response.data.dailyRevenue?.revenue) {
            revenueLabels = response.data.dailyRevenue.revenue.map((item) => {
              const date = new Date(item.date);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            });
            revenueValues = response.data.dailyRevenue.revenue.map(
              (item) => item.revenue
            );
          } else if (range === "month" && response.data.weekRevenue?.revenue) {
            revenueLabels = response.data.weekRevenue.revenue.map(
              (item) => item.week
            );
            revenueValues = response.data.weekRevenue.revenue.map(
              (item) => item.revenue
            );
          } else if (range === "year" && response.data.monthRevenue?.revenue) {
            revenueLabels = response.data.monthRevenue.revenue.map((item) => {
              const [year, month] = item.month.split("-");
              return `T${month}/${year.slice(-2)}`;
            });
            revenueValues = response.data.monthRevenue.revenue.map(
              (item) => item.revenue
            );
          }

          const vluOrange = getCssVariable("--vlu-primary-orange") || "#F76B1C";
          let vluOrangeRgb = "247,107,28";
          if (vluOrange.startsWith("#") && vluOrange.length >= 7) {
            const r = parseInt(vluOrange.slice(1, 3), 16);
            const g = parseInt(vluOrange.slice(3, 5), 16);
            const b = parseInt(vluOrange.slice(5, 7), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
              vluOrangeRgb = `${r},${g},${b}`;
            }
          }

          setChartData((prev) => ({
            ...prev,
            revenueTrend: {
              labels: revenueLabels,
              datasets: [
                {
                  label: "Doanh thu",
                  data: revenueValues,
                  borderColor: vluOrange,
                  backgroundColor: `rgba(${vluOrangeRgb}, 0.15)`, // Giảm độ đậm của vùng fill
                  borderWidth: 2.5, // Tăng độ dày đường line
                  fill: true,
                  pointBackgroundColor: vluOrange,
                  pointBorderColor: "#fff", // Màu viền của điểm
                  pointBorderWidth: 2, // Độ dày viền điểm
                  pointHoverBackgroundColor: "#fff", // Màu nền điểm khi hover
                  pointHoverBorderColor: vluOrange, // Màu viền điểm khi hover
                },
              ],
            },
          }));
        } else {
          console.error("Failed to fetch statistical data:", response);
        }
      } catch (error) {
        console.error("Error fetching statistical data:", error);
      } finally {
        setIsLoadingData(false);
      }
    },
    [isAuthenticated]
  );

  const fetchAdminProfile = useCallback(async () => {
    if (!Cookies.get("token") || Cookies.get("role") !== "admin") {
      setIsAuthenticated(false);
      setIsLoadingData(false);
      return;
    }
    try {
      const adminInfoResponse = await Api({
        endpoint: "admin/get-profile",
        method: METHOD_TYPE.GET,
      });
      if (adminInfoResponse.success && adminInfoResponse.data?.adminId) {
        dispatch(setAdminProfile(adminInfoResponse.data));
        setIsAuthenticated(true);
      } else {
        setOauthError("Dữ liệu profile Admin không hợp lệ.");
        setIsAuthenticated(false);
        Cookies.remove("token");
        Cookies.remove("role");
      }
    } catch (error) {
      setOauthError(
        error.response?.data?.message || "Lỗi tải thông tin Admin."
      );
      setIsAuthenticated(false);
      Cookies.remove("token");
      Cookies.remove("role");
    }
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const exchangeAdminCodeForToken = async (authCode) => {
      if (!isMounted) return;
      setIsProcessingOAuth(true);
      setOauthError(null);
      try {
        const response = await Api({
          endpoint: "admin/auth/callback",
          method: METHOD_TYPE.POST,
          data: { code: authCode },
        });
        if (response?.success && response.data?.token && isMounted) {
          Cookies.set("token", response.data.token, {
            secure: true,
            sameSite: "Lax",
          });
          Cookies.set("role", "admin", { secure: true, sameSite: "Lax" });
          await fetchAdminProfile();
        } else if (isMounted) {
          throw new Error(response?.message || "Lỗi đổi mã xác thực.");
        }
      } catch (err) {
        if (isMounted) {
          setOauthError(err.message || "Lỗi xử lý đăng nhập.");
          Cookies.remove("token");
          Cookies.remove("role");
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsProcessingOAuth(false);
          navigate("/admin/dashboard", { replace: true });
        }
      }
    };

    if (code && state && !oauthProcessingRef.current) {
      oauthProcessingRef.current = true;
      const storedState = Cookies.get("microsoft_auth_state");
      Cookies.remove("microsoft_auth_state");
      if (!storedState || state !== storedState) {
        if (isMounted) {
          setOauthError("Lỗi bảo mật (state).");
          navigate("/admin/dashboard", { replace: true });
        }
        return;
      }
      exchangeAdminCodeForToken(code);
    } else if (!code && !state) {
      if (Cookies.get("token") && Cookies.get("role") === "admin") {
        if (!adminProfile?.adminId) {
          fetchAdminProfile();
        } else {
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setIsLoadingData(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [location.search, navigate, fetchAdminProfile, adminProfile?.adminId]);

  useEffect(() => {
    if (isAuthenticated && !isProcessingOAuth) {
      fetchDataForRange(timeRange);
    } else if (!isAuthenticated && !isProcessingOAuth) {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, timeRange, fetchDataForRange, isProcessingOAuth]);

  if (isProcessingOAuth) {
    return (
      <AdminDashboardLayout currentPage="Đang xác thực...">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Đang xử lý đăng nhập với Microsoft...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (oauthError) {
    return (
      <AdminDashboardLayout currentPage="Lỗi">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="status-message error-message">
            <strong>Lỗi:</strong> {oauthError}
            <button
              onClick={() => navigate("/admin/login", { replace: true })}
              className="status-button"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (!isAuthenticated && !isLoadingData && !isProcessingOAuth) {
    return (
      <AdminDashboardLayout currentPage="Yêu Cầu Đăng Nhập">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="status-message auth-required-message">
            <p>Vui lòng đăng nhập để truy cập bảng điều khiển.</p>
            <button
              onClick={() => navigate("/admin/login", { replace: true })}
              className="status-button"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }
  if (isLoadingData && !oauthError && isAuthenticated) {
    return (
      <AdminDashboardLayout currentPage="Bảng Điều Khiển">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (isAuthenticated && !isLoadingData) {
    return (
      <AdminDashboardLayout currentPage="Bảng Điều Khiển">
        <div className="admin-dashboard-page-content">
          <div className="admin-dashboard__header">
            {adminProfile && (
              <h1 className="admin-dashboard__welcome-message">
                {" "}
                {/* Sử dụng h1 cho tiêu đề chính của trang */}
                Bảng Điều Khiển
                {/* Chào mừng, {adminProfile.fullName || adminProfile.email}!  */}
                {/* Tạm ẩn lời chào để giống các ví dụ */}
              </h1>
            )}
            <div className="admin-dashboard__time-range-selector">
              <button
                onClick={() => setTimeRange("week")}
                className={`time-range-button ${
                  timeRange === "week" ? "active" : ""
                }`}
              >
                {/* <i className="far fa-calendar-alt"></i>  */}
                <span>Tuần</span>
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`time-range-button ${
                  timeRange === "month" ? "active" : ""
                }`}
              >
                {/* <i className="far fa-calendar"></i>  */}
                <span>Tháng</span>
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`time-range-button ${
                  timeRange === "year" ? "active" : ""
                }`}
              >
                {/* <i className="far fa-calendar-check"></i>  */}
                <span>Năm</span>
              </button>
            </div>
          </div>

          <div className="admin-dashboard__cards-grid">
            <div className="admin-card admin-card--revenue">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-wallet admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">
                    Doanh thu ({getTimeRangeText(timeRange)})
                  </h3>
                  <span className="admin-card__data">
                    {formatCurrency(
                      dashboardStats.revenue.value,
                      dashboardStats.revenue.currency
                    )}
                  </span>
                </div>
                <div className="admin-card__change">
                  {renderChange(dashboardStats.revenue.change, true)}
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--new-users">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-users admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Người dùng mới</h3>
                  <span className="admin-card__data">
                    {dashboardStats.newUsers.value?.toLocaleString("vi-VN") ||
                      "N/A"}
                  </span>
                </div>
                <div className="admin-card__change">
                  {renderChange(dashboardStats.newUsers.change, true)}
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--new-tutors">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-user-tie admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Gia sư mới</h3>
                  <span className="admin-card__data">
                    {dashboardStats.newTutors.value?.toLocaleString("vi-VN") ||
                      "N/A"}
                  </span>
                </div>
                <div className="admin-card__change">
                  {renderChange(dashboardStats.newTutors.change, true)}
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--tutor-requests">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-file-signature admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Yêu cầu gia sư mới</h3>
                  <span className="admin-card__data">
                    {dashboardStats.newTutorRequest.value?.toLocaleString(
                      "vi-VN"
                    ) || "N/A"}
                  </span>
                </div>
                <div className="admin-card__change">
                  {renderChange(dashboardStats.newTutorRequest.change, true)}
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--active-classes">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-chalkboard-user admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Lớp mới hoạt động</h3>
                  <span className="admin-card__data">
                    {dashboardStats.newClassActive.value?.toLocaleString(
                      "vi-VN"
                    ) || "N/A"}
                  </span>
                </div>
                <div className="admin-card__change">
                  {renderChange(dashboardStats.newClassActive.change, true)}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-dashboard__charts-grid">
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  {" "}
                  {/* Sử dụng h2 cho tiêu đề chart */}
                  Xu hướng doanh thu
                  <span className="admin-chart-card__subtitle">
                    (
                    {timeRange === "week"
                      ? "7 ngày qua"
                      : timeRange === "month"
                      ? "4 tuần qua"
                      : "12 tháng qua"}
                    )
                  </span>
                </h2>
              </div>
              <div className="admin-chart-card__body">
                <ChartComponent
                  type="line"
                  data={chartData.revenueTrend}
                  options={chartLineOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout currentPage="Đang tải...">
      <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang chuẩn bị bảng điều khiển...</p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;
