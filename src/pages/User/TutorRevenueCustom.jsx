// Tutor Revenue Statistics - Customized for website design
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/TutorRevenueCustom.style.css";

const TutorRevenueCustom = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State management
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [periodType, setPeriodType] = useState("MONTH");

  // Check if user is tutor
  const isTutor = useState(() => {
    if (!isAuthenticated || !userProfile) return false;

    if (userProfile?.roles && Array.isArray(userProfile.roles)) {
      return userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
    } else if (userProfile?.roleId) {
      return String(userProfile.roleId).toUpperCase() === "TUTOR";
    }
    return false;
  })[0];

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "📊 Fetching revenue data for tutor:",
        userProfile.id || userProfile.userId
      );

      const response = await Api({
        endpoint: "tutor-revenue-statistics/get-statistics",
        method: METHOD_TYPE.POST,
        body: {
          tutorId: userProfile.id || userProfile.userId,
          periodType: periodType,
          periodValue: 1,
          page: 1,
          rpp: 10,
        },
      });

      if (response?.success) {
        setRevenueData(response.data?.items || []);
        setTotalRevenue(response.data?.totalRevenue || 0);
        toast.success("Dữ liệu đã được tải thành công!");
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("❌ Error fetching revenue data:", err);
      setError(err.message);

      // Set demo data for development
      setRevenueData([
        {
          id: 1,
          studentName: "Nguyễn Văn A",
          amount: 500000,
          status: "COMPLETED",
          description: "Học phí tháng 12/2024",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          studentName: "Trần Thị B",
          amount: 750000,
          status: "COMPLETED",
          description: "Học phí tháng 12/2024",
          createdAt: new Date().toISOString(),
        },
      ]);
      setTotalRevenue(1250000);
      toast.warning("Hiển thị dữ liệu demo do không thể kết nối API");
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile, periodType]);

  // Load data when component mounts
  useEffect(() => {
    if (isTutor && userProfile) {
      fetchRevenueData();
    }
  }, [fetchRevenueData, isTutor, userProfile]);

  // Early returns for authentication
  if (!isAuthenticated) {
    return (
      <div className="tutor-revenue-container">
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
      <div className="tutor-revenue-container">
        <ToastContainer />
        <div className="access-denied">
          <h3>🚫 Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <details className="user-info-details">
            <summary>Thông tin tài khoản</summary>
            <p>User ID: {userProfile?.id || userProfile?.userId || "N/A"}</p>
            <p>Role ID: {userProfile?.roleId || "N/A"}</p>
            <p>Roles: {JSON.stringify(userProfile?.roles || [])}</p>
          </details>
        </div>
      </div>
    );
  }

  // Main tutor content
  return (
    <div className="tutor-revenue-container">
      <ToastContainer position="top-right" />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-chart-line"></i>
          Thống kê Doanh thu
        </h1>
        <p className="page-subtitle">
          Quản lý và theo dõi doanh thu từ hoạt động giảng dạy
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="revenue-summary-grid">
        <div className="summary-card primary">
          <div className="card-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="card-content">
            <h3>Tổng doanh thu</h3>
            <p className="revenue-amount">
              {totalRevenue.toLocaleString("vi-VN")} Coin
            </p>
            <span className="period-label">Tháng hiện tại</span>
          </div>
          {isLoading && (
            <div className="loading-overlay">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          )}
        </div>

        <div className="summary-card secondary">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <h3>Số giao dịch</h3>
            <p className="transaction-count">{revenueData.length}</p>
            <span className="period-label">Giao dịch thành công</span>
          </div>
        </div>

        <div className="summary-card tertiary">
          <div className="card-icon">
            <i className="fas fa-chart-trending-up"></i>
          </div>
          <div className="card-content">
            <h3>Trung bình</h3>
            <p className="average-amount">
              {revenueData.length > 0
                ? Math.round(totalRevenue / revenueData.length).toLocaleString(
                    "vi-VN"
                  )
                : "0"}{" "}
              Coin
            </p>
            <span className="period-label">Mỗi giao dịch</span>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="period-select">Thời kỳ thống kê:</label>
          <select
            id="period-select"
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="period-select"
          >
            <option value="DAY">Ngày</option>
            <option value="WEEK">Tuần</option>
            <option value="MONTH">Tháng</option>
            <option value="YEAR">Năm</option>
          </select>
        </div>
        <button
          onClick={fetchRevenueData}
          disabled={isLoading}
          className="refresh-btn"
        >
          <i
            className={`fas ${
              isLoading ? "fa-spinner fa-spin" : "fa-sync-alt"
            }`}
          ></i>
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Error Warning */}
      {error && (
        <div className="error-notice">
          <i className="fas fa-exclamation-triangle"></i>
          <strong>Chế độ Demo:</strong> {error}
        </div>
      )}

      {/* Revenue Data Table */}
      <div className="revenue-table-section">
        <div className="table-header">
          <h3>
            <i className="fas fa-list"></i>
            Chi tiết Giao dịch
          </h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : revenueData.length > 0 ? (
          <div className="table-responsive">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học sinh</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="text-center">{index + 1}</td>
                    <td className="student-name">
                      <i className="fas fa-user-graduate"></i>
                      {item.studentName || "N/A"}
                    </td>
                    <td className="amount">
                      <span className="coin-amount">
                        {(item.amount || 0).toLocaleString("vi-VN")} Coin
                      </span>
                    </td>
                    <td className="status">
                      <span
                        className={`status-badge ${
                          item.status?.toLowerCase() || "unknown"
                        }`}
                      >
                        {item.status === "COMPLETED"
                          ? "Hoàn thành"
                          : item.status || "N/A"}
                      </span>
                    </td>
                    <td className="description">{item.description || "N/A"}</td>
                    <td className="date">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-chart-line-down"></i>
            <h4>Chưa có dữ liệu</h4>
            <p>Chưa có giao dịch nào trong thời kỳ được chọn.</p>
          </div>
        )}
      </div>

      {/* Additional Actions */}
      <div className="action-section">
        <button
          className="action-btn export-btn"
          disabled={revenueData.length === 0}
        >
          <i className="fas fa-download"></i>
          Xuất Excel
        </button>
        <button
          className="action-btn print-btn"
          disabled={revenueData.length === 0}
        >
          <i className="fas fa-print"></i>
          In báo cáo
        </button>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="debug-section">
          <details>
            <summary>🔍 Thông tin Debug</summary>
            <div className="debug-content">
              <p>Authenticated: {isAuthenticated ? "✅" : "❌"}</p>
              <p>Is Tutor: {isTutor ? "✅" : "❌"}</p>
              <p>User ID: {userProfile?.id || userProfile?.userId || "N/A"}</p>
              <p>Role ID: {userProfile?.roleId || "N/A"}</p>
              <p>Data Items: {revenueData.length}</p>
              <p>Loading: {isLoading ? "Yes" : "No"}</p>
              <p>Error: {error || "None"}</p>
              <p>Period: {periodType}</p>
              <p>Timestamp: {new Date().toLocaleString("vi-VN")}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default TutorRevenueCustom;
