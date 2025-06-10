// Tutor Personal Revenue Statistics - Styled like Admin Revenue Management
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "@mui/material";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import Table from "../../components/Table";
import SearchBar from "../../components/SearchBar";
import { exportToExcel } from "../../utils/excelExport";
import numeral from "numeral";
import "numeral/locales/vi";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/User/TutorPersonalRevenueStatistics.style.css";

// Set Vietnamese locale for numeral
numeral.locale("vi");

// Helper functions
const getSafeNestedValue = (obj, path, defaultValue = "N/A") => {
  if (!obj || !path) return defaultValue;
  const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

const getSearchPlaceholder = (selectedField) => {
  const placeholders = {
    all: "Tìm kiếm trong tất cả các trường...",
    studentName: "Nhập tên học sinh...",
    amount: "Nhập số tiền...",
    status: "Nhập trạng thái...",
    description: "Nhập mô tả...",
  };
  return placeholders[selectedField] || "Nhập từ khóa tìm kiếm...";
};

// Period Type Options
const periodTypeOptions = [
  { value: "DAY", label: "Ngày" },
  { value: "WEEK", label: "Tuần" },
  { value: "MONTH", label: "Tháng" },
  { value: "YEAR", label: "Năm" },
];

const TutorPersonalRevenueStatisticsTempFix = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [periodType, setPeriodType] = useState("MONTH");
  const [periodValue, setPeriodValue] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState("all");
  const [appliedSearchInput, setAppliedSearchInput] = useState("");
  const [appliedSearchField, setAppliedSearchField] = useState("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Search field options
  const searchFieldOptions = [
    { value: "all", label: "Tất cả trường" },
    { value: "studentName", label: "Tên học sinh" },
    { value: "amount", label: "Số tiền" },
    { value: "status", label: "Trạng thái" },
    { value: "description", label: "Mô tả" },
  ];

  // Check if user is a tutor
  const isTutor = useMemo(() => {
    return (
      isAuthenticated &&
      userProfile?.roleId &&
      String(userProfile.roleId).toUpperCase() === "TUTOR"
    );
  }, [isAuthenticated, userProfile]);

  // Get tutor ID
  const tutorId = useMemo(() => {
    return userProfile?.userProfile?.userId;
  }, [userProfile]);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !tutorId) {
      setError("Unauthorized access - only tutors can view this page");
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
          page: currentPage,
          rpp: 10,
          search: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrder,
        },
        requireToken: true,
      });

      if (response && response.data) {
        const {
          data: payments,
          totalPages: total,
          currentPage: current,
        } = response;
        setRevenueData(payments || []);
        setTotalPages(total || 1);
        setCurrentPage(current || 1);

        // Calculate statistics
        const totalRevenue =
          payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) ||
          0;
        const totalLessons = payments?.length || 0;
        const uniqueStudents = new Set(payments?.map((p) => p.studentId) || [])
          .size;
        const averageRevenuePerLesson =
          totalLessons > 0 ? totalRevenue / totalLessons : 0;

        setStatistics({
          totalRevenue,
          totalLessons,
          activeStudents: uniqueStudents,
          averageRevenuePerLesson,
        });

        toast.success("Revenue data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to load revenue data. Please try again.");
      toast.error("Failed to load revenue data");
    } finally {
      setIsLoading(false);
    }
  }, [
    isTutor,
    tutorId,
    timeFilter,
    currentPage,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  // Export data
  const handleExport = async () => {
    try {
      const response = await Api({
        endpoint: "manage-payment/export-tutor-revenue",
        method: METHOD_TYPE.GET,
        query: {
          tutorId: tutorId,
          timeType: timeFilter,
          format: "excel",
        },
        requireToken: true,
      });

      if (response && response.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
        toast.success("Export started - file will download shortly");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  // Render unauthorized access
  if (!isAuthenticated) {
    return (
      <div className="tutor-revenue-container">
        <div className="error-message">
          <h2>Unauthorized Access</h2>
          <p>Please log in to view your revenue statistics.</p>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="tutor-revenue-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>This page is only available for tutors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-revenue-container">
      <div className="revenue-header">
        <h1>📊 Revenue Statistics</h1>
        <p>Personal revenue analytics and insights</p>
        <div className="temp-warning">
          ⚠️ Charts temporarily disabled due to missing react-chartjs-2
          dependency
        </div>
      </div>

      {/* Controls Section */}
      <div className="revenue-controls">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="timeFilter">Time Period:</label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              disabled={isLoading}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={fetchRevenueData}
              disabled={isLoading}
              className="refresh-btn"
            >
              {isLoading ? "🔄 Refreshing..." : "🔄 Refresh"}
            </button>

            <button
              onClick={handleExport}
              disabled={isLoading}
              className="export-btn"
            >
              📥 Export
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">⏳ Loading revenue data...</div>
        </div>
      )}

      {/* Statistics Cards */}
      {!isLoading && !error && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">
                {statistics.totalRevenue.toLocaleString()} VND
              </p>
              <p className="stat-change">From {timeFilter}ly data</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Total Lessons</h3>
              <p className="stat-value">{statistics.totalLessons}</p>
              <p className="stat-change">Completed sessions</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Active Students</h3>
              <p className="stat-value">{statistics.activeStudents}</p>
              <p className="stat-change">Unique students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Avg per Lesson</h3>
              <p className="stat-value">
                {Math.round(
                  statistics.averageRevenuePerLesson
                ).toLocaleString()}{" "}
                VND
              </p>
              <p className="stat-change">Revenue per session</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section - Temporarily Disabled */}
      {!isLoading && !error && (
        <div className="charts-section">
          <div className="chart-placeholder">
            <h3>📈 Revenue Trend Chart</h3>
            <div className="chart-disabled">
              <p>📊 Charts temporarily unavailable</p>
              <p>Installing react-chartjs-2 dependency...</p>
              <div className="install-instructions">
                <code>npm install react-chartjs-2</code>
              </div>
            </div>
          </div>

          <div className="chart-placeholder">
            <h3>🥧 Revenue Distribution</h3>
            <div className="chart-disabled">
              <p>📊 Charts temporarily unavailable</p>
              <p>Will show revenue breakdown by category</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Data Table */}
      {!isLoading && !error && revenueData.length > 0 && (
        <div className="revenue-table-container">
          <div className="table-header">
            <h3>📋 Revenue Transactions</h3>
            <p>Showing {revenueData.length} of total records</p>
          </div>

          <div className="table-responsive">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("date")} className="sortable">
                    Date{" "}
                    {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("student")}
                    className="sortable"
                  >
                    Student{" "}
                    {sortBy === "student" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("amount")} className="sortable">
                    Amount{" "}
                    {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((payment, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(
                        payment.createdAt || payment.date
                      ).toLocaleDateString()}
                    </td>
                    <td>{payment.studentName || payment.studentId || "N/A"}</td>
                    <td className="amount">
                      {(payment.amount || 0).toLocaleString()} VND
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          payment.status?.toLowerCase() || "completed"
                        }`}
                      >
                        {payment.status || "Completed"}
                      </span>
                    </td>
                    <td>
                      {payment.description || payment.note || "Lesson payment"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && !error && revenueData.length === 0 && (
        <div className="no-data-message">
          <h3>📊 No Data Available</h3>
          <p>No revenue data found for the selected time period.</p>
          <p>Start teaching to see your earnings here!</p>
        </div>
      )}
    </div>
  );
};

export default TutorPersonalRevenueStatisticsTempFix;
