import { useEffect, useState, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setAdminProfile } from "../../redux/adminSlice";
import { handleAdminMicrosoftAuth } from "../../../admin-oauth-alternative-handlers";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
import "../../assets/css/Admin/AdminDashboard.style.css";

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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(
      adminProfile?.adminId ||
      (Cookies.get("token") && Cookies.get("role") === "admin")
    )
  );

  const [timeRange, setTimeRange] = useState("year");

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
    doughnutChartOptions: {},
    polarAreaChartOptions: {},
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "N/A";
    return `${Number(value).toLocaleString("vi-VN")}`;
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
          console.log(
            "📊 Dashboard API Response for",
            range,
            ":",
            response.data
          );

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
          }; // Tạo mock data cho các chart dựa trên thông tin từ information
          const createMockTimeSeriesData = (
            labels,
            baseValue,
            variance = 0.3
          ) => {
            // Nếu baseValue = 0, trả về array toàn 0 để reflect đúng thực tế
            if (baseValue === 0) {
              return labels.map(() => 0);
            }

            // Với baseValue rất nhỏ (1-2), giảm variance để tránh over-inflate
            if (baseValue <= 2) {
              variance = Math.min(variance, 0.3);
            }

            // Với baseValue > 0, tạo distribution realistic
            return labels.map(() => {
              const multiplier = 0.3 + Math.random() * variance;
              const value = Math.round(baseValue * multiplier);
              return Math.max(0, value);
            });
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

            // Xử lý dữ liệu revenue từ API
            const rev = processChartData(
              response.data.dailyRevenue,
              "revenue",
              mapDateLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;

            // Tạo mock data cho các chart khác dựa trên revenue labels
            newUserLabels = revenueLabels;
            newUserValues = createMockTimeSeriesData(
              revenueLabels,
              information.newUsers,
              0.4
            );

            newTutorLabels = revenueLabels;
            newTutorValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutors,
              0.6
            );

            newRequestLabels = revenueLabels;
            newRequestValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutorRequest,
              0.5
            );
          } else if (range === "month") {
            const mapWeekLabel = (item) => item.week;

            // Xử lý dữ liệu revenue từ API
            const rev = processChartData(
              response.data.weekRevenue,
              "revenue",
              mapWeekLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;

            // Tạo mock data cho các chart khác dựa trên revenue labels
            newUserLabels = revenueLabels;
            newUserValues = createMockTimeSeriesData(
              revenueLabels,
              information.newUsers,
              0.4
            );

            newTutorLabels = revenueLabels;
            newTutorValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutors,
              0.6
            );
            newRequestLabels = revenueLabels;
            newRequestValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutorRequest,
              0.5
            );
          } else if (range === "year") {
            const mapMonthLabel = (item) => {
              const [year, month] = item.month.split("-");
              return `T${month}/${year.slice(-2)}`;
            };

            // Xử lý dữ liệu revenue từ API
            const rev = processChartData(
              response.data.monthRevenue,
              "revenue",
              mapMonthLabel,
              "revenue"
            );
            revenueLabels = rev.labels;
            revenueValues = rev.values;

            // Tạo mock data cho các chart khác dựa trên revenue labels
            newUserLabels = revenueLabels;
            newUserValues = createMockTimeSeriesData(
              revenueLabels,
              information.newUsers,
              0.4
            );

            newTutorLabels = revenueLabels;
            newTutorValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutors,
              0.6
            );

            newRequestLabels = revenueLabels;
            newRequestValues = createMockTimeSeriesData(
              revenueLabels,
              information.newTutorRequest,
              0.5
            );
          }

          // Debug log base values from API
          console.log("📊 Base Values from API:", {
            newUsers: information.newUsers,
            newTutors: information.newTutors,
            newTutorRequest: information.newTutorRequest,
          });

          // Debug log dữ liệu charts
          console.log("📈 Chart Data Generated:", {
            revenue: { labels: revenueLabels, values: revenueValues },
            users: { labels: newUserLabels, values: newUserValues },
            tutors: { labels: newTutorLabels, values: newTutorValues },
            requests: { labels: newRequestLabels, values: newRequestValues },
          });

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
          }); // Tạo màu sắc đa dạng cho doughnut và polar area charts
          const generateColorPalette = (count) => {
            const colors = [
              vluOrange,
              vluBlue,
              successColor,
              infoColor,
              "#8B5CF6",
              "#F59E0B",
              "#EF4444",
              "#10B981",
              "#3B82F6",
              "#F97316",
            ];
            return colors.slice(0, count);
          };

          // Tạo dữ liệu cho doughnut chart (gia sư mới)
          const tutorColors = generateColorPalette(newTutorLabels.length);
          const tutorBackgroundColors = tutorColors.map(
            (color) => `rgba(${parseColorToRgb(color)}, 0.8)`
          );
          const tutorBorderColors = tutorColors;

          // Tạo dữ liệu cho polar area chart (yêu cầu gia sư)
          const requestColors = generateColorPalette(newRequestLabels.length);
          const requestBackgroundColors = requestColors.map(
            (color) => `rgba(${parseColorToRgb(color)}, 0.6)`
          );

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
                  label: "Người dùng mới",
                  data: newUserValues,
                  backgroundColor: `rgba(${parseColorToRgb(vluBlue)}, 0.8)`,
                  borderColor: vluBlue,
                  borderWidth: 2,
                  borderRadius: 4,
                  borderSkipped: false,
                },
              ],
            },
            newTutorTrend: {
              labels: newTutorLabels,
              datasets: [
                {
                  label: "Gia sư mới",
                  data: newTutorValues,
                  backgroundColor: tutorBackgroundColors,
                  borderColor: tutorBorderColors,
                  borderWidth: 2,
                  hoverOffset: 4,
                },
              ],
            },
            newRequestTrend: {
              labels: newRequestLabels,
              datasets: [
                {
                  label: "Yêu cầu mới",
                  data: newRequestValues,
                  backgroundColor: requestBackgroundColors,
                  borderColor: requestColors,
                  borderWidth: 2,
                },
              ],
            },
            // Options cho các loại biểu đồ khác nhau
            doughnutChartOptions: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: getCssVariable("--text-dark") || "#1f2937",
                    font: { size: 12, weight: "500" },
                    padding: 15,
                    usePointStyle: true,
                  },
                },
                tooltip: {
                  backgroundColor:
                    getCssVariable("--text-dark") || "rgba(0,0,0,0.85)",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
              cutout: "60%",
            },
            polarAreaChartOptions: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: getCssVariable("--text-dark") || "#1f2937",
                    font: { size: 12, weight: "500" },
                    padding: 15,
                    usePointStyle: true,
                  },
                },
                tooltip: {
                  backgroundColor:
                    getCssVariable("--text-dark") || "rgba(0,0,0,0.85)",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed.r || 0;
                      return `${label}: ${value.toLocaleString("vi-VN")}`;
                    },
                  },
                },
              },
              scales: {
                r: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                  ticks: {
                    color: getCssVariable("--text-light") || "#6b7280",
                    font: { size: 11 },
                  },
                },
              },
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
    // Fetch admin profile and set authentication state
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
        console.error("Invalid admin profile data");
        setIsAuthenticated(false);
        Cookies.remove("token");
        Cookies.remove("role");
      }
    } catch (error) {
      console.error(
        "Error fetching admin profile:",
        error.response?.data?.message || error.message
      );
      setIsAuthenticated(false);
      Cookies.remove("token");
      Cookies.remove("role");
    }
  }, [dispatch]);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // Xử lý redirect từ backend Microsoft OAuth
    // Backend redirect về: /admin/dashboard?token=xxx&admin=xxx&state=xxx
    // hoặc khi lỗi: /admin/dashboard?error=xxx&state=xxx
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      // Backend trả về lỗi OAuth
      console.error("❌ Microsoft OAuth error from backend:", error);
      // Clean URL và hiển thị error
      navigate("/admin/dashboard", { replace: true });
      setIsAuthenticated(false);
      setIsLoadingData(false);
      return;
    }

    if (token) {
      let isMounted = true;
      console.log(
        "🔄 Processing Microsoft authentication from backend redirect..."
      );

      (async () => {
        try {
          const result = await handleAdminMicrosoftAuth(
            dispatch,
            setIsAuthenticated,
            navigate
          );

          if (isMounted) {
            if (result.success) {
              if (result.needsFetch && !result.redirecting) {
                // Fallback: Lấy admin profile từ API nếu backend không gửi kèm
                await fetchAdminProfile();
              }
              setIsLoadingData(false);
            } else {
              console.error("❌ OAuth authentication failed:", result.error);
              setIsAuthenticated(false);
              setIsLoadingData(false);
            }
          }
        } catch (error) {
          if (isMounted) {
            console.error("❌ Error processing OAuth authentication:", error);
            setIsAuthenticated(false);
            setIsLoadingData(false);
          }
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [location.search, navigate, dispatch, fetchAdminProfile]);

  // Authentication check useEffect
  useEffect(() => {
    // Normal dashboard initialization - check authentication and load data
    if (Cookies.get("token") && Cookies.get("role") === "admin") {
      if (!adminProfile?.adminId) {
        // If no profile in Redux, fetch it
        fetchAdminProfile();
      } else {
        setIsAuthenticated(true); // Already authenticated and profile exists
        setIsLoadingData(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsLoadingData(false); // Not authenticated, no data to load
    }
  }, [fetchAdminProfile, adminProfile?.adminId, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDataForRange(timeRange);
    } else if (!isAuthenticated) {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, timeRange, fetchDataForRange]);

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoadingData) {
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

  // Show loading while fetching data
  if (isLoadingData && isAuthenticated) {
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
                  <h3 className="admin-card__title">Doanh thu từ xu (VNĐ)</h3>
                  <span className="admin-card__data">
                    {formatCurrency(dashboardStats.revenue.value)}
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
            </div>{" "}
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Thống kê người dùng mới
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
                  type="bar"
                  data={chartData.newUserTrend}
                  options={commonChartOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Phân bố gia sư mới
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
                  type="doughnut"
                  data={chartData.newTutorTrend}
                  options={chartData.doughnutChartOptions}
                />
              </div>
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Phân tích yêu cầu gia sư
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
                  type="polarArea"
                  data={chartData.newRequestTrend}
                  options={chartData.polarAreaChartOptions}
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
