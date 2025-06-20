// src/pages/User/TutorPersonalRevenueStatistics.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { exportToExcel as exportExcelUtil } from "../../utils/excelExport";
import "../../assets/css/User/TutorPersonalRevenueStatistics.style.css";
import "react-toastify/dist/ReactToastify.css";

const TutorPersonalRevenueStatistics = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    uniqueStudents: 0,
    averageRevenuePerTransaction: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Check if user is a tutor
  const isTutor = useMemo(() => {
    return (
      userProfile?.roleId === "TUTOR" ||
      (Array.isArray(userProfile?.roles) &&
        userProfile.roles.some(
          (role) => role === "TUTOR" || role.name === "TUTOR"
        ))
    );
  }, [userProfile]);

  // Get current tutor ID
  const getCurrentTutorId = useCallback(() => {
    if (!isAuthenticated || !userProfile?.userProfile?.userId) {
      return null;
    }
    return userProfile.userProfile.userId;
  }, [isAuthenticated, userProfile]);

  // Format currency for display
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined) return "0 Coin";
    return `${Number(amount).toLocaleString("vi-VN")} Coin`;
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  }, []);

  // Fetch revenue data using new API endpoint
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
        params: {
          tutorId: tutorId,
        },
        requireToken: true,
      });

      console.log("📊 API Response:", response);

      if (response?.success || response?.data) {
        const data = response.data || response;
        const items = data.items || [];

        // Transform data to match our component structure
        const transformedData = items.map((item, index) => ({
          id: item.managePaymentId || index,
          managePaymentId: item.managePaymentId,
          studentName:
            item.user?.userDisplayName || item.user?.fullname || "N/A",
          studentId: item.userId,
          tutorReceive: item.coinOfTutorReceive,
          userPayment: item.coinOfUserPayment,
          webReceive: item.coinOfWebReceive,
          status: "COMPLETED", // All payments in this endpoint are completed
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          user: item.user,
          tutor: item.tutor,
        }));
        setRevenueData(transformedData);
        setFilteredData(transformedData);

        // Calculate statistics
        const uniqueStudents = new Set(
          transformedData.map((item) => item.user?.userId).filter(Boolean)
        ).size;

        const totalRevenue =
          data.totalRevenue ||
          transformedData.reduce(
            (sum, item) => sum + (item.tutorReceive || 0),
            0
          );
        const averageRevenuePerTransaction =
          transformedData.length > 0
            ? totalRevenue / transformedData.length
            : 0;

        setStatistics({
          totalRevenue,
          totalTransactions: transformedData.length,
          uniqueStudents,
          averageRevenuePerTransaction,
        });

        toast.success(`Đã tải ${transformedData.length} giao dịch thành công!`);
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentTutorId]);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle search and filtering
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...revenueData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.managePaymentId?.toString().includes(searchTerm)
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return (b.tutorReceive || 0) - (a.tutorReceive || 0);
        case "lowest":
          return (a.tutorReceive || 0) - (b.tutorReceive || 0);
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  }, [revenueData, searchTerm, sortBy, statusFilter, dateRange]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Export to Excel functionality
  const exportToExcel = useCallback(async () => {
    if (!revenueData.length) {
      toast.warning("Không có dữ liệu để xuất Excel");
      return;
    }

    const toastId = toast.loading("Đang xuất dữ liệu Excel...");

    try {
      // Prepare Excel data
      const excelData = filteredData.map((item, index) => ({
        STT: index + 1,
        "Mã giao dịch": item.managePaymentId || "N/A",
        "Tên học viên": item.studentName,
        "ID học viên": item.studentId || "N/A",
        "Ngày tạo": formatDate(item.createdAt),
        "Tiền học viên đóng": item.userPayment || 0,
        "Tiền gia sư nhận": item.tutorReceive || 0,
        "Phí website": item.webReceive || 0,
        "Trạng thái": item.status || "COMPLETED",
      }));

      // Summary data
      const summaryData = [
        ["THỐNG KÊ TỔNG QUAN"],
        ["Tổng doanh thu", `${formatCurrency(statistics.totalRevenue)}`],
        ["Tổng giao dịch", statistics.totalTransactions],
        ["Số học viên", statistics.uniqueStudents],
        [
          "TB/giao dịch",
          `${formatCurrency(statistics.averageRevenuePerTransaction)}`,
        ],
        ["Thời gian xuất", new Date().toLocaleString("vi-VN")],
        ["Người xuất", userProfile?.userProfile?.fullname || "N/A"],
        [],
      ];

      await exportExcelUtil(
        excelData,
        `Thong_ke_doanh_thu_ca_nhan_${new Date().toISOString().split("T")[0]}`,
        "Thống kê doanh thu cá nhân",
        summaryData
      );

      toast.update(toastId, {
        render: "Xuất Excel thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi xuất dữ liệu Excel",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [
    filteredData,
    userProfile,
    statistics,
    formatCurrency,
    formatDate,
    revenueData.length,
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "e":
            event.preventDefault();
            exportToExcel();
            break;
          case "r":
            event.preventDefault();
            fetchRevenueData();
            break;
          case "f":
            event.preventDefault();
            document.querySelector(".search-input")?.focus();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [exportToExcel, fetchRevenueData]);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && isTutor) {
      fetchRevenueData();
    }
  }, [isAuthenticated, isTutor, fetchRevenueData]);

  // Early returns for authentication
  if (!isAuthenticated) {
    return (
      <div className="revenue-dashboard">
        <div className="auth-warning">
          <h3>⚠️ Chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để xem thống kê doanh thu.</p>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="revenue-dashboard">
        <div className="auth-warning">
          <h3>🚫 Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <p>Role hiện tại: {userProfile?.roleId || "N/A"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-dashboard">
      <ToastContainer /> {/* Header */}
      <div className="revenue-header">
        <div className="header-content">
          <h1 className="revenue-title">
            <i className="fas fa-chart-line"></i>
            Thống Kê Doanh Thu Cá Nhân
          </h1>
          <p className="revenue-subtitle">
            Theo dõi và phân tích chi tiết doanh thu từ hoạt động giảng dạy của
            bạn
          </p>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={fetchRevenueData}
            disabled={isLoading}
            title="Làm mới dữ liệu (Ctrl+R)"
          >
            <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i>
            Làm mới
          </button>
          <button
            className="export-excel-btn"
            onClick={exportToExcel}
            disabled={isLoading || !filteredData.length}
            title="Xuất Excel (Ctrl+E)"
          >
            <i className="fas fa-file-excel"></i>
            Xuất Excel
          </button>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Tổng doanh thu</h3>
            <div className="stat-value">
              {formatCurrency(statistics.totalRevenue)}
            </div>
            <p className="stat-description">Tổng coin nhận được</p>
          </div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Tổng giao dịch</h3>
            <div className="stat-value">
              {statistics.totalTransactions.toLocaleString("vi-VN")}
            </div>
            <p className="stat-description">Giao dịch hoàn thành</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Học viên</h3>
            <div className="stat-value">{statistics.uniqueStudents}</div>
            <p className="stat-description">Học viên đã thanh toán</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <i className="fas fa-calculator"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">TB/giao dịch</h3>
            <div className="stat-value">
              {formatCurrency(statistics.averageRevenuePerTransaction)}
            </div>
            <p className="stat-description">Doanh thu trung bình</p>
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên học viên, ID hoặc mã giao dịch (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Doanh thu cao nhất</option>
            <option value="lowest">Doanh thu thấp nhất</option>
          </select>

          <input
            type="date"
            className="date-input"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            placeholder="Từ ngày"
          />

          <input
            type="date"
            className="date-input"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            placeholder="Đến ngày"
          />

          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setSortBy("newest");
              setStatusFilter("all");
              setDateRange({ start: "", end: "" });
            }}
          >
            <i className="fas fa-times"></i>
            Xóa bộ lọc
          </button>
        </div>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Không thể tải dữ liệu</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchRevenueData}>
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      )}
      {/* Data Table */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="table-section">
          <div className="table-header">
            <h3 className="table-title">
              <i className="fas fa-table"></i>
              Danh sách giao dịch
              <span className="table-count">
                ({filteredData.length} giao dịch)
              </span>
            </h3>
            <div className="table-info">
              Hiển thị {currentPage * itemsPerPage + 1} -{" "}
              {Math.min((currentPage + 1) * itemsPerPage, filteredData.length)}{" "}
              / {filteredData.length}
            </div>
          </div>

          <div className="table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã giao dịch</th>
                  <th>Học viên</th>
                  <th>Ngày tạo</th>
                  <th>Tiền học viên đóng</th>
                  <th>Tiền gia sư nhận</th>
                  <th>Phí website</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={`${item.managePaymentId}-${index}`}>
                    <td>{currentPage * itemsPerPage + index + 1}</td>
                    <td className="transaction-id">
                      {item.managePaymentId || "N/A"}
                    </td>
                    <td>
                      <div className="student-info">
                        <img
                          src={item.user?.avatar || "/default-avatar.png"}
                          alt={item.studentName}
                          className="student-avatar"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="student-details">
                          <span className="student-name">
                            {item.studentName}
                          </span>
                          <span className="student-id">
                            {item.studentId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td className="revenue-cell">
                      {formatCurrency(item.userPayment)}
                    </td>
                    <td className="revenue-cell revenue-highlight">
                      {formatCurrency(item.tutorReceive)}
                    </td>
                    <td className="revenue-cell">
                      {formatCurrency(item.webReceive)}
                    </td>
                    <td>
                      <span className="status-badge status-completed">
                        <i className="fas fa-check-circle"></i>
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {Math.ceil(filteredData.length / itemsPerPage) > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
                Trang trước
              </button>

              <div className="pagination-numbers">
                {Array.from(
                  { length: Math.ceil(filteredData.length / itemsPerPage) },
                  (_, index) => (
                    <button
                      key={index}
                      className={`pagination-number ${
                        currentPage === index ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(index)}
                    >
                      {index + 1}
                    </button>
                  )
                )}
              </div>

              <span className="pagination-info">
                Trang {currentPage + 1} /{" "}
                {Math.ceil(filteredData.length / itemsPerPage)}
              </span>

              <button
                className="pagination-btn"
                disabled={
                  currentPage >=
                  Math.ceil(filteredData.length / itemsPerPage) - 1
                }
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Trang sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
      {/* Empty State */}
      {!isLoading && !error && filteredData.length === 0 && (
        <div className="empty-container">
          <div className="empty-icon">
            <i className="fas fa-table"></i>
          </div>
          <h3>Không có dữ liệu</h3>
          <p>
            {searchTerm || dateRange.start || dateRange.end
              ? "Không tìm thấy giao dịch nào phù hợp với bộ lọc."
              : "Bạn chưa có giao dịch thanh toán nào từ học viên."}
          </p>
          <p>
            {searchTerm || dateRange.start || dateRange.end
              ? "Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm."
              : "Khi học viên thanh toán cho các buổi học, thông tin sẽ hiển thị tại đây."}
          </p>
        </div>
      )}
      {/* Keyboard shortcuts help */}
      <div className="shortcuts-help">
        <small>
          💡 Phím tắt: <kbd>Ctrl+E</kbd> Xuất Excel, <kbd>Ctrl+R</kbd> Làm mới,{" "}
          <kbd>Ctrl+F</kbd> Tìm kiếm
        </small>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatistics;
