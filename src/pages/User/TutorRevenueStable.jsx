// Tutor revenue statistics component with modern design integration
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast, ToastContainer } from "react-toastify";
import { exportToExcel as exportExcelUtil } from "../../utils/excelExport";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/User/ModernRevenueStatistics.style.css";

const TutorRevenueStable = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated); // State for revenue data
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Check if user is tutor
  const isTutor = useMemo(() => {
    if (!isAuthenticated || !userProfile) return false;

    // Method 1: Check roles array
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      return userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
    }

    // Method 2: Check roleId field
    if (userProfile.roleId) {
      return String(userProfile.roleId).toUpperCase() === "TUTOR";
    }

    return false;
  }, [isAuthenticated, userProfile]);
  // Fetch revenue data using new endpoint
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "📊 Fetching revenue data for tutor:",
        userProfile.id || userProfile.userId
      );

      // Use the new endpoint: manage-payment/search-with-time-by-tutor
      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        params: {
          tutorId: userProfile.id || userProfile.userId,
        },
      });

      console.log("📊 API Response:", response);

      if (response?.success || response?.data) {
        const data = response.data || response;
        const items = data.items || [];
        const totalRevenue = data.totalRevenue || 0;

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
        setTotalRevenue(totalRevenue);
        console.log("✅ Revenue data loaded:", {
          total: data.total,
          totalRevenue,
          itemsCount: transformedData.length,
        });
        toast.success(`Đã tải ${transformedData.length} giao dịch thành công!`);
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("❌ Error fetching revenue data:", err);
      setError(err.message);
      toast.error("Không thể tải dữ liệu thống kê từ server");

      // Set empty data on error
      setRevenueData([]);
      setTotalRevenue(0);
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile]);
  // Load data when component mounts and user is tutor
  useEffect(() => {
    console.log("🔍 TutorRevenueStable effect:", {
      isTutor,
      userProfile: !!userProfile,
    });
    if (isTutor && userProfile) {
      fetchRevenueData();
    }
  }, [fetchRevenueData, isTutor, userProfile]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = revenueData.filter(
      (item) =>
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => b.tutorReceive - a.tutorReceive);
        break;
      case "lowest":
        filtered.sort((a, b) => a.tutorReceive - b.tutorReceive);
        break;
      default:
        break;
    }

    return filtered;
  }, [revenueData, searchTerm, sortBy]);
  // Export to Excel function with Van Lang logo and professional formatting
  const exportToExcel = useCallback(async () => {
    if (filteredAndSortedData.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    const toastId = toast.loading("Đang tạo file Excel...");

    try {
      // Define columns for export
      const exportColumns = [
        { title: "STT", dataKey: "stt" },
        { title: "Tên học sinh", dataKey: "studentName" },
        { title: "ID học sinh", dataKey: "studentId" },
        { title: "Xu gia sư nhận", dataKey: "tutorReceive" },
        { title: "Ngày tạo", dataKey: "createdAt" },
      ];

      // Prepare data for Excel export
      const exportData = filteredAndSortedData.map((item, index) => ({
        stt: index + 1,
        studentName: item.studentName || "N/A",
        studentId: item.studentId || "N/A",
        tutorReceive: `${(item.tutorReceive || 0).toLocaleString("vi-VN")} Xu`,
        createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
      }));

      // Calculate summary statistics
      const totalTransactions = filteredAndSortedData.length;
      const uniqueStudents = new Set(
        filteredAndSortedData.map((item) => item.studentId)
      ).size;
      const averageRevenue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const summaryStats = {
        "Tổng số giao dịch": totalTransactions,
        "Tổng doanh thu": `${totalRevenue.toLocaleString("vi-VN")} Xu`,
        "Số học sinh": uniqueStudents,
        "Doanh thu TB/GD": `${Math.round(averageRevenue).toLocaleString(
          "vi-VN"
        )} Xu`,
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `thong-ke-doanh-thu-gia-su-${timestamp}.xlsx`; // Export to Excel with logo and professional formatting
      await exportExcelUtil({
        data: exportData,
        columns: exportColumns,
        title: "THỐNG KÊ DOANH THU GIA SƯ",
        filename: filename,
        summaryStats: summaryStats,
        period: `Tổng cộng: ${totalTransactions} giao dịch`,
        currentPage: 0,
        itemsPerPage: exportData.length,
      });

      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success(`Đã xuất ${exportData.length} giao dịch thành công!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss(toastId);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu Excel");
    }
  }, [filteredAndSortedData, totalRevenue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl + E: Export Excel
      if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        exportToExcel();
        return;
      }

      // Ctrl + R: Refresh data
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        fetchRevenueData();
        return;
      }

      // Ctrl + F: Focus search
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        const searchInput = document.querySelector(".tprs-search-input");
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [exportToExcel, fetchRevenueData]);

  // Early returns after all hooks
  if (!isAuthenticated) {
    return (
      <div className="tprs-container">
        <ToastContainer />
        <div className="auth-warning">
          <h3>⚠️ Chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để xem thống kê doanh thu.</p>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="tprs-container">
        <ToastContainer />
        <div className="auth-warning">
          <h3>🚫 Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <details style={{ marginTop: "16px", color: "#6b7280" }}>
            <summary>
              <strong>Thông tin tài khoản:</strong>
            </summary>
            <p>User ID: {userProfile?.id || userProfile?.userId || "N/A"}</p>
            <p>Role ID: {userProfile?.roleId || "N/A"}</p>
            <p>Roles: {JSON.stringify(userProfile?.roles || [])}</p>
          </details>
        </div>
      </div>
    );
  } // Main tutor content
  return (
    <div className="tprs-container">
      <ToastContainer position="top-right" /> {/* Header */}
      <div className="tprs-header">
        <h1 className="tprs-title">
          <i className="fas fa-chart-line"></i>
          Thống kê Doanh thu
        </h1>
      </div>
      {/* Statistics Cards */}
      <div className="tprs-stats-grid">
        {" "}
        <div className="tprs-stats-card tprs-stats-card-primary">
          <div className="tprs-stats-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="tprs-stats-content">
            <h3 className="tprs-stats-label">Nhận Xu</h3>
            <div className="tprs-stats-value">
              {totalRevenue.toLocaleString("vi-VN")} Xu
              {isLoading && (
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginLeft: "8px" }}
                ></i>
              )}
            </div>
          </div>
        </div>
        <div className="tprs-stats-card tprs-stats-card-secondary">
          <div className="tprs-stats-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="tprs-stats-content">
            <h3 className="tprs-stats-label">Số giao dịch</h3>
            <div className="tprs-stats-value">{revenueData.length}</div>
          </div>
        </div>
        <div className="tprs-stats-card tprs-stats-card-success">
          <div className="tprs-stats-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="tprs-stats-content">
            <h3 className="tprs-stats-label">Học sinh</h3>
            <div className="tprs-stats-value">
              {new Set(revenueData.map((item) => item.studentId)).size}
            </div>
          </div>
        </div>
      </div>
      {/* Error/Demo Message */}
      {error && (
        <div className="tprs-error">
          <div className="tprs-error-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <h3>Chế độ Demo</h3>
          <p>{error}</p>
          <button className="tprs-retry-btn" onClick={fetchRevenueData}>
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      )}{" "}
      {/* Revenue Data Table */}
      <div className="tprs-table-section">
        <div className="tprs-table-header">
          {" "}
          <h3 className="tprs-table-title">
            <span className="tprs-table-title-left">
              <i className="fas fa-list-alt"></i>
              Chi tiết Giao dịch
            </span>
            <span className="tprs-table-count-badge">
              {filteredAndSortedData.length} giao dịch
            </span>
          </h3>
          <div className="tprs-table-controls">
            <div className="tprs-search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                className="tprs-search-input"
                placeholder="Tìm học sinh theo tên hoặc ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="tprs-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Cao nhất</option>
              <option value="lowest">Thấp nhất</option>
            </select>
            <button
              className="tprs-action-btn tprs-refresh-btn"
              onClick={fetchRevenueData}
              disabled={isLoading}
            >
              <i
                className={`fas ${
                  isLoading ? "fa-spinner fa-spin" : "fa-sync-alt"
                }`}
              ></i>
              {isLoading ? "Đang tải..." : "Làm mới"}
            </button>{" "}
            <button
              className="tprs-action-btn tprs-export-btn"
              onClick={exportToExcel}
              disabled={isLoading || filteredAndSortedData.length === 0}
              title="Xuất Excel với logo Van Lang (Ctrl+E)"
            >
              <i className="fas fa-file-excel"></i>
              Xuất Excel
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="tprs-loading">
            <div className="tprs-loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : revenueData.length > 0 ? (
          <div className="tprs-table-container">
            <table className="tprs-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học sinh</th>
                  <th>Xu gia sư nhận</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((item, index) => (
                  <tr key={item.managePaymentId || item.id}>
                    <td className="tprs-table-index">{index + 1}</td>{" "}
                    <td>
                      <span className="tprs-student-name-simple">
                        {item.studentName}
                      </span>
                    </td>
                    <td className="tprs-revenue-cell tprs-revenue-highlight">
                      {item.tutorReceive?.toLocaleString("vi-VN")} Xu
                    </td>
                    <td>
                      <span className="tprs-status-badge tprs-status-completed">
                        <i className="fas fa-check-circle"></i>
                        Hoàn thành
                      </span>
                    </td>
                    <td className="tprs-date-cell">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tprs-empty-state">
            <div className="tprs-empty-icon">
              <i className="fas fa-coins"></i>
            </div>
            <h3>Chưa có dữ liệu thanh toán</h3>
            <p>Bạn chưa có giao dịch thanh toán nào từ học sinh.</p>
            <p>
              Khi học sinh thanh toán cho các buổi học, thông tin sẽ hiển thị
              tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorRevenueStable;
