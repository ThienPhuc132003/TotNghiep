/* global Intl */
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api"; // Điều chỉnh đường dẫn nếu cần
import { METHOD_TYPE } from "../../network/methodType"; // Điều chỉnh đường dẫn nếu cần
import { setAdminProfile } from "../../redux/adminSlice"; // Điều chỉnh đường dẫn nếu cần
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout"; // Điều chỉnh đường dẫn nếu cần
import ChartComponent from "../../components/Chart"; // Điều chỉnh đường dẫn nếu cần
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
      // Cung cấp giá trị mặc định nếu biến không tìm thấy để tránh lỗi chart
      if (variableName.includes("orange")) return "#F76B1C";
      if (variableName.includes("blue")) return "#003366";
      if (variableName.includes("success")) return "#10B981";
      if (variableName.includes("info")) return "#0dcaf0";
      if (variableName.includes("text-dark")) return "#1f2937";
      if (variableName.includes("text-light")) return "#6b7280";
      return null;
    }
  }
  // Giá trị mặc định nếu window không tồn tại
  if (variableName.includes("orange")) return "#F76B1C";
  if (variableName.includes("blue")) return "#003366";
  if (variableName.includes("success")) return "#10B981";
  if (variableName.includes("info")) return "#0dcaf0";
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
    newUserTrend: { labels: [], datasets: [] },
    newTutorTrend: { labels: [], datasets: [] },
    newRequestTrend: { labels: [], datasets: [] },
  });

  // Helper để tạo options cho biểu đồ
  const createChartOptions = (isRevenueChart = false) => ({
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
          callback: function (value) {
            if (isRevenueChart) {
              // Chỉ format tiền tệ cho biểu đồ doanh thu ở trục Y
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact", // Hiển thị rút gọn: K, M, B
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }).format(value);
            }
            if (Number.isInteger(value)) {
              return value.toLocaleString("vi-VN");
            }
            return value;
          },
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
        displayColors: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (isRevenueChart) {
                label += new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toLocaleString("vi-VN");
              }
            }
            return label;
          },
        },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 3, hoverRadius: 6, hitRadius: 15 },
    },
  });

  const revenueChartOptions = createChartOptions(true); // true for revenue chart
  const commonChartOptions = createChartOptions(false); // false for other charts

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

          const processChartData = (
            timeSeriesData,
            dataKey,
            labelMappingFunc,
            valueKey
          ) => {
            if (!timeSeriesData || !Array.isArray(timeSeriesData[dataKey])) {
              // console.warn(`Dữ liệu ${dataKey} không hợp lệ hoặc thiếu trong API response.`);
              return { labels: [], values: [] };
            }
            const labels = timeSeriesData[dataKey].map(labelMappingFunc);
            const values = timeSeriesData[dataKey].map(
              (item) => item[valueKey] || 0
            );
            return { labels, values };
          };

          let revenueLabels = [],
            revenueValues = [];
          let newUserLabels = [],
            newUserValues = [];
          let newTutorLabels = [],
            newTutorValues = [];
          let newRequestLabels = [],
            newRequestValues = [];

          if (range === "week") {
            const mapDateLabel = (item) => {
              const date = new Date(item.date);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            };
            // Ví dụ: response.data.dailyRevenue = { revenue: [{date: "...", revenue: X}] }
            // Ví dụ: response.data.dailyNewUsers = { newUsers: [{date: "...", newUsers: Y}] }
            const rev = processChartData(
              response.data.dailyRevenue,
              "revenue",
              mapDateLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;
            const usr = processChartData(
              response.data.dailyNewUsers,
              "newUsers",
              mapDateLabel,
              "newUsers"
            );
            newUserLabels = usr.labels;
            newUserValues = usr.values;
            const tut = processChartData(
              response.data.dailyNewTutors,
              "newTutors",
              mapDateLabel,
              "newTutors"
            );
            newTutorLabels = tut.labels;
            newTutorValues = tut.values;
            const req = processChartData(
              response.data.dailyNewTutorRequests,
              "newTutorRequests",
              mapDateLabel,
              "newTutorRequests"
            );
            newRequestLabels = req.labels;
            newRequestValues = req.values;
          } else if (range === "month") {
            const mapWeekLabel = (item) => item.week;
            // Ví dụ: response.data.weekRevenue = { revenue: [{week: "Week 1", revenue: X}] }
            // Ví dụ: response.data.weekNewUsers = { newUsers: [{week: "Week 1", newUsers: Y}] }
            const rev = processChartData(
              response.data.weekRevenue,
              "revenue",
              mapWeekLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;
            const usr = processChartData(
              response.data.weekNewUsers,
              "newUsers",
              mapWeekLabel,
              "newUsers"
            );
            newUserLabels = usr.labels;
            newUserValues = usr.values;
            const tut = processChartData(
              response.data.weekNewTutors,
              "newTutors",
              mapWeekLabel,
              "newTutors"
            );
            newTutorLabels = tut.labels;
            newTutorValues = tut.values;
            const req = processChartData(
              response.data.weekNewTutorRequests,
              "newTutorRequests",
              mapWeekLabel,
              "newTutorRequests"
            );
            newRequestLabels = req.labels;
            newRequestValues = req.values;
          } else if (range === "year") {
            const mapMonthLabel = (item) => {
              const [year, month] = item.month.split("-");
              return `T${month}/${year.slice(-2)}`;
            };
            // Ví dụ: response.data.monthRevenue = { revenue: [{month: "2024-5", revenue: X}] }
            // Ví dụ: response.data.monthNewUsers = { newUsers: [{month: "2024-5", newUsers: Y}] }
            const rev = processChartData(
              response.data.monthRevenue,
              "revenue",
              mapMonthLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;
            const usr = processChartData(
              response.data.monthNewUsers,
              "newUsers",
              mapMonthLabel,
              "newUsers"
            );
            newUserLabels = usr.labels;
            newUserValues = usr.values;
            const tut = processChartData(
              response.data.monthNewTutors,
              "newTutors",
              mapMonthLabel,
              "newTutors"
            );
            newTutorLabels = tut.labels;
            newTutorValues = tut.values;
            const req = processChartData(
              response.data.monthNewTutorRequests,
              "newTutorRequests",
              mapMonthLabel,
              "newTutorRequests"
            );
            newRequestLabels = req.labels;
            newRequestValues = req.values;
          }

          const vluOrange = getCssVariable("--vlu-primary-orange");
          const vluBlue = getCssVariable("--vlu-primary-blue");
          const successColor = getCssVariable("--success-color");
          const infoColor = getCssVariable("--admin-info-color");

          const parseColorToRgb = (hexColor) => {
            if (!hexColor) return "0,0,0"; // Fallback
            if (hexColor.startsWith("#") && hexColor.length >= 7) {
              const r = parseInt(hexColor.slice(1, 3), 16);
              const g = parseInt(hexColor.slice(3, 5), 16);
              const b = parseInt(hexColor.slice(5, 7), 16);
              if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return `${r},${g},${b}`;
            }
            // Fallback for named colors if getCssVariable failed but returned default
            if (hexColor === "#F76B1C") return "247,107,28";
            if (hexColor === "#003366") return "0,51,102";
            if (hexColor === "#10B981") return "16,185,129";
            if (hexColor === "#0dcaf0") return "13,202,240";
            return "0,0,0";
          };

          const chartDatasetDefaults = (borderColor, label) => ({
            label,
            borderColor,
            backgroundColor: `rgba(${parseColorToRgb(borderColor)}, 0.15)`,
            borderWidth: 2.5,
            fill: true,
            pointBackgroundColor: borderColor,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: borderColor,
          });

          setChartData({
            revenueTrend: {
              labels: revenueLabels,
              datasets: [
                {
                  ...chartDatasetDefaults(vluOrange, "Doanh thu"),
                  data: revenueValues,
                },
              ],
            },
            newUserTrend: {
              labels: newUserLabels,
              datasets: [
                {
                  ...chartDatasetDefaults(vluBlue, "Người dùng mới"),
                  data: newUserValues,
                },
              ],
            },
            newTutorTrend: {
              labels: newTutorLabels,
              datasets: [
                {
                  ...chartDatasetDefaults(successColor, "Gia sư mới"),
                  data: newTutorValues,
                },
              ],
            },
            newRequestTrend: {
              labels: newRequestLabels,
              datasets: [
                {
                  ...chartDatasetDefaults(infoColor, "Yêu cầu mới"),
                  data: newRequestValues,
                },
              ],
            },
          });
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
    // ... (giữ nguyên logic fetchAdminProfile)
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
    // ... (giữ nguyên logic xử lý OAuth callback)
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
          await fetchAdminProfile(); // fetchAdminProfile will set isAuthenticated
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
          navigate("/admin/dashboard", { replace: true }); // Clear query params
        }
        return;
      }
      exchangeAdminCodeForToken(code);
    } else if (!code && !state) {
      // Normal page load without OAuth params
      if (Cookies.get("token") && Cookies.get("role") === "admin") {
        if (!adminProfile?.adminId) {
          // If no profile in Redux, fetch it
          fetchAdminProfile();
        } else {
          setIsAuthenticated(true); // Already authenticated and profile exists
        }
      } else {
        setIsAuthenticated(false);
        setIsLoadingData(false); // Not authenticated, no data to load
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
            <h1 className="admin-dashboard__welcome-message">
              Bảng Điều Khiển
            </h1>
            <div className="admin-dashboard__time-range-selector">
              <button
                onClick={() => setTimeRange("week")}
                className={`time-range-button ${
                  timeRange === "week" ? "active" : ""
                }`}
              >
                <span>Tuần</span>
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`time-range-button ${
                  timeRange === "month" ? "active" : ""
                }`}
              >
                <span>Tháng</span>
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`time-range-button ${
                  timeRange === "year" ? "active" : ""
                }`}
              >
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
                  options={revenueChartOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Xu hướng người dùng mới
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
                  data={chartData.newUserTrend}
                  options={commonChartOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Xu hướng gia sư mới
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
                  data={chartData.newTutorTrend}
                  options={commonChartOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Xu hướng yêu cầu gia sư mới
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
                  data={chartData.newRequestTrend}
                  options={commonChartOptions}
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

export default memo(AdminDashboardPage);
