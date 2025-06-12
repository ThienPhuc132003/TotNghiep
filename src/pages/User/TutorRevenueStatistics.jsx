// src/pages/User/TutorRevenueStatistics.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
import Table from "../../components/Table";
import "../../assets/css/Admin/AdminDashboard.style.css";
import "../../assets/css/Admin/TutorRevenueStatistics.style.css";

const TutorRevenueStatistics = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [revenueData, setRevenueData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageRevenue: 0,
    topPerformingTutor: null,
  });

  // Chart data state
  const [chartData, setChartData] = useState({
    revenueOverTime: { labels: [], datasets: [] },
    revenueDistribution: { labels: [], datasets: [] },
    tutorPerformance: { labels: [], datasets: [] },
  });

  // Time range options
  const timeRangeOptions = [
    { value: "day", label: "Hôm nay" },
    { value: "week", label: "7 ngày qua" },
    { value: "month", label: "30 ngày qua" },
    { value: "year", label: "12 tháng qua" },
  ];
  // Chart colors - memoized to prevent re-renders
  const colors = useMemo(
    () => ({
      primary: "#ff6b35",
      secondary: "#004e89",
      success: "#28a745",
      info: "#17a2b8",
      warning: "#ffc107",
      danger: "#dc3545",
    }),
    []
  );
  // Fetch revenue data from API
  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = {
        page: currentPage,
        rpp: itemsPerPage,
        timeRange: timeRange,
        sort: JSON.stringify([
          { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
        ]),
      };

      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        query: query,
        requireToken: true,
      });

      if (response.success && response.data) {
        const data = response.data;
        setRevenueData(data.items || []);
        setTotalItems(data.total || 0);

        // Calculate statistics from new API structure
        calculateStatistics(data);

        // Prepare chart data with new structure
        prepareChartData(data.items || []);
      } else {
        throw new Error(response.message || "Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu doanh thu");
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    timeRange,
    sortConfig,
    calculateStatistics,
    prepareChartData,
  ]);
  // Calculate statistics from data
  const calculateStatistics = useCallback((data) => {
    if (!data || !data.items || data.items.length === 0) {
      setStatistics({
        totalRevenue: 0,
        totalTransactions: 0,
        averageRevenue: 0,
        topPerformingTutor: null,
      });
      return;
    }

    const items = data.items;

    // Use totalRevenue from API if available, otherwise calculate
    const totalRevenue =
      data.totalRevenue ||
      items.reduce((sum, item) => sum + (item.coinOfTutorReceive || 0), 0);

    const totalTransactions = items.length;
    const averageRevenue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Find top performing tutor
    const tutorRevenues = {};
    items.forEach((item) => {
      const tutorId = item.tutor?.userId;
      const tutorName = item.tutor?.fullname || "Unknown";
      if (tutorId) {
        if (!tutorRevenues[tutorId]) {
          tutorRevenues[tutorId] = {
            name: tutorName,
            revenue: 0,
            transactions: 0,
          };
        }
        tutorRevenues[tutorId].revenue += item.coinOfTutorReceive || 0;
        tutorRevenues[tutorId].transactions += 1;
      }
    });

    const topPerformingTutor = Object.values(tutorRevenues).reduce(
      (top, current) => {
        return current.revenue > (top?.revenue || 0) ? current : top;
      },
      null
    );

    setStatistics({
      totalRevenue,
      totalTransactions,
      averageRevenue,
      topPerformingTutor,
    });
  }, []);

  // Prepare chart data
  const prepareChartData = useCallback(
    (data) => {
      if (!data || data.length === 0) {
        setChartData({
          revenueOverTime: { labels: [], datasets: [] },
          revenueDistribution: { labels: [], datasets: [] },
          tutorPerformance: { labels: [], datasets: [] },
        });
        return;
      } // Revenue over time chart
      const revenueByDate = {};
      data.forEach((item) => {
        const date = new Date(item.createdAt).toLocaleDateString("vi-VN");
        if (!revenueByDate[date]) {
          revenueByDate[date] = 0;
        }
        revenueByDate[date] += item.coinOfTutorReceive || 0;
      });

      const sortedDates = Object.keys(revenueByDate).sort(
        (a, b) =>
          new Date(a.split("/").reverse().join("-")) -
          new Date(b.split("/").reverse().join("-"))
      );

      const revenueOverTime = {
        labels: sortedDates,
        datasets: [
          {
            label: "Doanh thu gia sư",
            data: sortedDates.map((date) => revenueByDate[date]),
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}20`,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      }; // Revenue distribution by web vs tutor
      const webRevenue = data.reduce(
        (sum, item) => sum + (item.coinOfWebReceive || 0),
        0
      );
      const tutorRevenue = data.reduce(
        (sum, item) => sum + (item.coinOfTutorReceive || 0),
        0
      );

      const revenueDistribution = {
        labels: ["Doanh thu gia sư", "Doanh thu website"],
        datasets: [
          {
            label: "Phân bổ doanh thu",
            data: [tutorRevenue, webRevenue],
            backgroundColor: [colors.primary, colors.secondary],
            borderWidth: 1,
          },
        ],
      };

      // Top tutors performance
      const tutorRevenues = {};
      data.forEach((item) => {
        const tutorName = item.tutor?.fullname || "Unknown";
        if (!tutorRevenues[tutorName]) {
          tutorRevenues[tutorName] = 0;
        }
        tutorRevenues[tutorName] += item.coinOfTutorReceive || 0;
      });

      const topTutors = Object.entries(tutorRevenues)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const tutorPerformance = {
        labels: topTutors.map(([name]) => name),
        datasets: [
          {
            label: "Doanh thu gia sư",
            data: topTutors.map(([, revenue]) => revenue),
            backgroundColor: colors.secondary,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ],
      };

      setChartData({
        revenueOverTime,
        revenueDistribution,
        tutorPerformance,
      });
    },
    [colors]
  );

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "0 VNĐ";
    }
    return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Table columns configuration
  const columns = [
    {
      title: "STT",
      dataKey: "stt",
      sortable: false,
      renderCell: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: "Mã học viên",
      dataKey: "user.userId",
      sortable: true,
      renderCell: (item) => (
        <span className="user-code">{item.user?.userId || "N/A"}</span>
      ),
    },
    {
      title: "Tên học viên",
      dataKey: "user.fullname",
      sortable: true,
      renderCell: (item) => (
        <div className="user-info">
          <div className="user-name">{item.user?.fullname || "N/A"}</div>
          <div className="user-email">{item.user?.personalEmail || ""}</div>
        </div>
      ),
    },
    {
      title: "Mã gia sư",
      dataKey: "tutor.userId",
      sortable: true,
      renderCell: (item) => (
        <span className="tutor-code">{item.tutor?.userId || "N/A"}</span>
      ),
    },
    {
      title: "Tên gia sư",
      dataKey: "tutor.fullname",
      sortable: true,
      renderCell: (item) => (
        <div className="tutor-info">
          <div className="tutor-name">{item.tutor?.fullname || "N/A"}</div>
          <div className="tutor-subject">
            {item.tutor?.subject?.subjectName || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Tiền học viên đóng",
      dataKey: "coinOfUserPayment",
      sortable: true,
      renderCell: (item) => (
        <span className="payment-amount">
          {formatCurrency(item.coinOfUserPayment)}
        </span>
      ),
    },
    {
      title: "Tiền trả gia sư",
      dataKey: "coinOfTutorReceive",
      sortable: true,
      renderCell: (item) => (
        <span className="tutor-revenue">
          {formatCurrency(item.coinOfTutorReceive)}
        </span>
      ),
    },
    {
      title: "Doanh thu website",
      dataKey: "coinOfWebReceive",
      sortable: true,
      renderCell: (item) => (
        <span className="system-revenue">
          {formatCurrency(item.coinOfWebReceive)}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataKey: "createdAt",
      sortable: true,
      renderCell: (item) => (
        <span className="transaction-date">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: { size: 12, weight: "500" },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.y
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: {
          color: "#666",
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: { size: 12, weight: "500" },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: { size: 12, weight: "500" },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.y
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: {
          color: "#666",
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#666",
          maxTicksLimit: 10,
        },
      },
    },
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSort = (key) => {
    setSortConfig((prevSort) => ({
      key,
      direction:
        prevSort.key === key && prevSort.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Get time range text
  const getTimeRangeText = (range) => {
    const option = timeRangeOptions.find((opt) => opt.value === range);
    return option ? option.label : range;
  };

  // Effects
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Memoized computed values
  const pageCount = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  );

  // Loading state
  if (isLoading && revenueData.length === 0) {
    return (
      <AdminDashboardLayout currentPage="Đang tải...">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu doanh thu...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Error state
  if (error && revenueData.length === 0) {
    return (
      <AdminDashboardLayout currentPage="Lỗi">
        <div className="admin-dashboard-page-content admin-dashboard-page-content--centered">
          <div className="error-indicator">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Đã xảy ra lỗi khi tải dữ liệu</p>
            <button onClick={fetchRevenueData} className="btn btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout currentPage="Thống kê doanh thu gia sư">
      <div className="admin-dashboard-page-content">
        <div className="tutor-revenue-statistics">
          {/* Header */}
          <div className="admin-dashboard__header">
            <h1 className="admin-dashboard__title">
              <i className="fas fa-chart-line"></i>
              Thống kê doanh thu gia sư
            </h1>
            <div className="admin-dashboard__controls">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
                  className={`admin-dashboard__time-btn ${
                    timeRange === option.value ? "active" : ""
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="admin-dashboard__cards-grid">
            <div className="admin-card admin-card--revenue">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-coins admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">
                    Tổng doanh thu ({getTimeRangeText(timeRange)})
                  </h3>
                  <span className="admin-card__data">
                    {formatCurrency(statistics.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--transactions">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-receipt admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Tổng giao dịch</h3>
                  <span className="admin-card__data">
                    {statistics.totalTransactions.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--average">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-calculator admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Doanh thu trung bình</h3>
                  <span className="admin-card__data">
                    {formatCurrency(statistics.averageRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-card admin-card--top-tutor">
              <div className="admin-card__icon-wrapper">
                <i className="fas fa-crown admin-card__icon"></i>
              </div>
              <div className="admin-card__content">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Gia sư xuất sắc nhất</h3>
                  <span className="admin-card__data">
                    {statistics.topPerformingTutor?.name || "N/A"}
                  </span>
                </div>
                {statistics.topPerformingTutor && (
                  <div className="admin-card__subtitle">
                    {formatCurrency(statistics.topPerformingTutor.revenue)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="admin-dashboard__charts-grid">
            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Xu hướng doanh thu
                  <span className="admin-chart-card__subtitle">
                    ({getTimeRangeText(timeRange)})
                  </span>
                </h2>
              </div>
              <div className="admin-chart-card__body">
                <ChartComponent
                  type="line"
                  data={chartData.revenueOverTime}
                  options={lineChartOptions}
                />
              </div>
            </div>

            <div className="admin-chart-card">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Phân bổ doanh thu
                  <span className="admin-chart-card__subtitle">
                    (Theo loại thanh toán)
                  </span>
                </h2>
              </div>
              <div className="admin-chart-card__body">
                <ChartComponent
                  type="doughnut"
                  data={chartData.revenueDistribution}
                  options={doughnutChartOptions}
                />
              </div>
            </div>

            <div className="admin-chart-card admin-chart-card--wide">
              <div className="admin-chart-card__header">
                <h2 className="admin-chart-card__title">
                  Top gia sư theo doanh thu
                  <span className="admin-chart-card__subtitle">
                    (10 gia sư hàng đầu)
                  </span>
                </h2>
              </div>
              <div className="admin-chart-card__body">
                <ChartComponent
                  type="bar"
                  data={chartData.tutorPerformance}
                  options={barChartOptions}
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="admin-chart-card">
            <div className="admin-chart-card__header">
              <h2 className="admin-chart-card__title">
                Chi tiết giao dịch
                <span className="admin-chart-card__subtitle">
                  ({totalItems.toLocaleString("vi-VN")} giao dịch)
                </span>
              </h2>
            </div>
            <div className="admin-chart-card__body">
              <Table
                columns={columns}
                data={revenueData}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={pageCount}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                onSort={handleSort}
                sortConfig={sortConfig}
                emptyMessage="Không có dữ liệu giao dịch"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default TutorRevenueStatistics;
