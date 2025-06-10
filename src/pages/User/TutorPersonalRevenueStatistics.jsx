// src/pages/User/TutorPersonalRevenueStatistics.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/User/TutorPersonalRevenueStatistics.style.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

const TutorPersonalRevenueStatistics = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("month");
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalLessons: 0,
    activeStudents: 0,
    averageRevenuePerLesson: 0,
  });

  // Memoized colors for charts
  const chartColors = useMemo(
    () => ({
      primary: "#d71921",
      secondary: "#f8f9fa",
      success: "#28a745",
      info: "#17a2b8",
      warning: "#ffc107",
      danger: "#dc3545",
      purple: "#6f42c1",
      orange: "#fd7e14",
      gradient: [
        "#d71921",
        "#e6394a",
        "#f05973",
        "#fa799c",
        "#ff99c5",
        "#ffb9ee",
      ],
    }),
    []
  );

  // Get current tutor ID
  const getCurrentTutorId = useCallback(() => {
    if (!isAuthenticated || !userProfile?.userProfile?.userId) {
      return null;
    }
    return userProfile.userProfile.userId;
  }, [isAuthenticated, userProfile]);
  // Format currency
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined) return "0 VNĐ";
    return new window.Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    const tutorId = getCurrentTutorId();
    if (!tutorId) {
      setError("Không thể xác định thông tin gia sư");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        query: {
          tutorId: tutorId,
          timeType: timeFilter,
          page: 1,
          rpp: 100, // Get more data for better analytics
        },
        requireToken: true,
      });

      if (response.success && response.data) {
        setRevenueData(response.data.items || []);

        // Calculate statistics
        const items = response.data.items || [];
        const totalRevenue = items.reduce(
          (sum, item) => sum + (item.totalcoins || 0),
          0
        );
        const totalLessons = items.reduce(
          (sum, item) => sum + (item.totalLessons || 0),
          0
        );
        const uniqueStudents = new Set(items.map((item) => item.user?.userId))
          .size;
        const averageRevenuePerLesson =
          totalLessons > 0 ? totalRevenue / totalLessons : 0;

        setStatistics({
          totalRevenue,
          totalLessons,
          activeStudents: uniqueStudents,
          averageRevenuePerLesson,
        });
      } else {
        throw new Error(response.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(err.message || "Lỗi khi tải dữ liệu thống kê");
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentTutorId, timeFilter]);

  // Load data on component mount and filter change
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Handle time filter change
  const handleTimeFilterChange = useCallback((newFilter) => {
    setTimeFilter(newFilter);
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!revenueData.length) return null;

    // Group data by time period
    const groupedData = revenueData.reduce((acc, item) => {
      let dateKey;
      const createdDate = new Date(item.createdAt);
      switch (timeFilter) {
        case "day":
          dateKey = createdDate.toLocaleDateString("vi-VN");
          break;
        case "week": {
          const weekStart = new Date(createdDate);
          weekStart.setDate(createdDate.getDate() - createdDate.getDay());
          dateKey = `Tuần ${weekStart.toLocaleDateString("vi-VN")}`;
          break;
        }
        case "month":
          dateKey = `${
            createdDate.getMonth() + 1
          }/${createdDate.getFullYear()}`;
          break;
        case "year":
          dateKey = createdDate.getFullYear().toString();
          break;
        default:
          dateKey = createdDate.toLocaleDateString("vi-VN");
      }

      if (!acc[dateKey]) {
        acc[dateKey] = { revenue: 0, lessons: 0, students: new Set() };
      }

      acc[dateKey].revenue += item.totalcoins || 0;
      acc[dateKey].lessons += item.totalLessons || 0;
      if (item.user?.userId) {
        acc[dateKey].students.add(item.user.userId);
      }

      return acc;
    }, {});

    const labels = Object.keys(groupedData).sort();
    const revenueValues = labels.map((label) => groupedData[label].revenue);
    const lessonValues = labels.map((label) => groupedData[label].lessons);

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueValues,
          borderColor: chartColors.primary,
          backgroundColor: `${chartColors.primary}20`,
          tension: 0.4,
          fill: true,
        },
      ],
      barData: {
        labels,
        datasets: [
          {
            label: "Số buổi học",
            data: lessonValues,
            backgroundColor: chartColors.primary,
            borderColor: chartColors.primary,
            borderWidth: 1,
          },
        ],
      },
    };
  }, [revenueData, timeFilter, chartColors]);

  // Student distribution chart data
  const studentDistributionData = useMemo(() => {
    if (!revenueData.length) return null;

    const studentRevenue = revenueData.reduce((acc, item) => {
      const studentName =
        item.user?.userProfile?.fullname ||
        item.user?.fullname ||
        "Học viên không tên";
      acc[studentName] = (acc[studentName] || 0) + (item.totalcoins || 0);
      return acc;
    }, {});

    const labels = Object.keys(studentRevenue);
    const data = Object.values(studentRevenue);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: chartColors.gradient.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  }, [revenueData, chartColors]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Biểu đồ doanh thu theo ${
            timeFilter === "day"
              ? "ngày"
              : timeFilter === "week"
              ? "tuần"
              : timeFilter === "month"
              ? "tháng"
              : "năm"
          }`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return (
                new window.Intl.NumberFormat("vi-VN").format(value) + " VNĐ"
              );
            },
          },
        },
      },
    }),
    [timeFilter]
  );

  const barChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Số buổi học theo thời gian",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    }),
    []
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: true,
          text: "Phân bổ doanh thu theo học viên",
        },
      },
    }),
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="tprs-container">
        <div className="tprs-loading">
          <div className="tprs-spinner"></div>
          <p>Đang tải thống kê doanh thu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="tprs-container">
        <div className="tprs-error">
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchRevenueData} className="tprs-retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tprs-container">
      <div className="tprs-header">
        <h1 className="tprs-title">Thống kê doanh thu cá nhân</h1>
        <p className="tprs-subtitle">
          Xem thống kê chi tiết về doanh thu và hoạt động dạy học của bạn
        </p>
      </div>

      {/* Time Filter */}
      <div className="tprs-filters">
        <div className="tprs-filter-group">
          <label htmlFor="timeFilter" className="tprs-filter-label">
            Thời gian:
          </label>
          <select
            id="timeFilter"
            value={timeFilter}
            onChange={(e) => handleTimeFilterChange(e.target.value)}
            className="tprs-filter-select"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="tprs-stats-grid">
        <div className="tprs-stat-card">
          <div className="tprs-stat-icon revenue">
            <i className="fas fa-coins"></i>
          </div>
          <div className="tprs-stat-content">
            <h3>Tổng doanh thu</h3>
            <p className="tprs-stat-value">
              {formatCurrency(statistics.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="tprs-stat-card">
          <div className="tprs-stat-icon lessons">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="tprs-stat-content">
            <h3>Tổng buổi học</h3>
            <p className="tprs-stat-value">{statistics.totalLessons}</p>
          </div>
        </div>

        <div className="tprs-stat-card">
          <div className="tprs-stat-icon students">
            <i className="fas fa-users"></i>
          </div>
          <div className="tprs-stat-content">
            <h3>Học viên đang học</h3>
            <p className="tprs-stat-value">{statistics.activeStudents}</p>
          </div>
        </div>

        <div className="tprs-stat-card">
          <div className="tprs-stat-icon average">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="tprs-stat-content">
            <h3>TB doanh thu/buổi</h3>
            <p className="tprs-stat-value">
              {formatCurrency(statistics.averageRevenuePerLesson)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <div className="tprs-charts-grid">
          {/* Revenue Line Chart */}
          <div className="tprs-chart-container">
            <div className="tprs-chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Lessons Bar Chart */}
          <div className="tprs-chart-container">
            <div className="tprs-chart-wrapper">
              <Bar data={chartData.barData} options={barChartOptions} />
            </div>
          </div>

          {/* Student Distribution Doughnut Chart */}
          {studentDistributionData && (
            <div className="tprs-chart-container">
              <div className="tprs-chart-wrapper">
                <Doughnut
                  data={studentDistributionData}
                  options={doughnutOptions}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions Table */}
      {revenueData.length > 0 && (
        <div className="tprs-table-section">
          <h2 className="tprs-section-title">Giao dịch gần đây</h2>
          <div className="tprs-table-container">
            <table className="tprs-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Ngày tạo</th>
                  <th>Số buổi học</th>
                  <th>Doanh thu</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.slice(0, 10).map((item, index) => (
                  <tr key={`${item.bookingRequestId}-${index}`}>
                    <td>
                      <div className="tprs-student-info">
                        <img
                          src={
                            item.user?.userProfile?.avatar ||
                            "/default-avatar.png"
                          }
                          alt={item.user?.userProfile?.fullname || "Học viên"}
                          className="tprs-student-avatar"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <span>
                          {item.user?.userProfile?.fullname ||
                            item.user?.fullname ||
                            "Học viên không tên"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{item.totalLessons || 0}</td>
                    <td className="tprs-revenue-cell">
                      {formatCurrency(item.totalcoins)}
                    </td>
                    <td>
                      <span
                        className={`tprs-status-badge ${
                          item.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {item.status === "COMPLETED"
                          ? "Hoàn thành"
                          : item.status === "IN_PROGRESS"
                          ? "Đang học"
                          : "Chờ xử lý"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {revenueData.length === 0 && !isLoading && !error && (
        <div className="tprs-empty-state">
          <div className="tprs-empty-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3>Chưa có dữ liệu thống kê</h3>
          <p>Bạn chưa có giao dịch nào trong khoảng thời gian này.</p>
        </div>
      )}
    </div>
  );
};

export default TutorPersonalRevenueStatistics;
