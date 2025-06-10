// Tutor revenue statistics component with website design integration
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/TutorRevenueStable.style.css";

const TutorRevenueStable = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for revenue data
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
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

      // Try the actual API endpoint
      const response = await Api({
        endpoint: "tutor-revenue-statistics/get-statistics",
        method: METHOD_TYPE.POST,
        body: {
          tutorId: userProfile.id || userProfile.userId,
          periodType: "MONTH",
          periodValue: 1,
          page: 1,
          rpp: 10,
        },
      });

      console.log("📊 API Response:", response);

      if (response?.success) {
        setRevenueData(response.data?.items || []);
        setTotalRevenue(response.data?.totalRevenue || 0);
        console.log("✅ Revenue data loaded:", response.data);
        toast.success("Dữ liệu thống kê đã được tải!");
      } else {
        throw new Error(response?.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("❌ Error fetching revenue data:", err);
      setError(err.message);
      // Show a subtle error message
      toast.error("Không thể tải dữ liệu. Hiển thị chế độ demo.");

      // Set mock data for demo
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
  // Early returns after all hooks
  if (!isAuthenticated) {
    return (
      <div className="trs-container">
        <ToastContainer />
        <div className="trs-alert trs-alert-warning">
          <div className="trs-alert-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="trs-alert-content">
            <h3>Chưa đăng nhập</h3>
            <p>Vui lòng đăng nhập để xem thống kê doanh thu.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="trs-container">
        <ToastContainer />
        <div className="trs-alert trs-alert-error">
          <div className="trs-alert-icon">
            <i className="fas fa-ban"></i>
          </div>
          <div className="trs-alert-content">
            <h3>Truy cập bị từ chối</h3>
            <p>Trang này chỉ dành cho gia sư.</p>
            <details className="trs-debug-info">
              <summary>
                <strong>Thông tin tài khoản:</strong>
              </summary>
              <p>User ID: {userProfile?.id || userProfile?.userId || "N/A"}</p>
              <p>Role ID: {userProfile?.roleId || "N/A"}</p>
              <p>Roles: {JSON.stringify(userProfile?.roles || [])}</p>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Main tutor content
  return (
    <div className="trs-container">
      <ToastContainer position="top-right" />

      {/* Page Header */}
      <div className="trs-page-header">
        <h1 className="trs-page-title">
          <i className="fas fa-chart-line trs-title-icon"></i>
          Thống kê Doanh thu
        </h1>
        <p className="trs-page-subtitle">
          Chào mừng gia sư:{" "}
          <strong>{userProfile?.name || userProfile?.username || "N/A"}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="trs-stats-grid">
        <div className="trs-stats-card trs-stats-card-primary">
          <div className="trs-stats-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="trs-stats-content">
            <h3 className="trs-stats-label">Tổng doanh thu</h3>
            <div className="trs-stats-value">
              {totalRevenue.toLocaleString("vi-VN")} VNĐ
              {isLoading && (
                <i className="fas fa-spinner fa-spin trs-loading-inline"></i>
              )}
            </div>
            <p className="trs-stats-description">Tháng hiện tại</p>
          </div>
        </div>

        <div className="trs-stats-card trs-stats-card-secondary">
          <div className="trs-stats-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="trs-stats-content">
            <h3 className="trs-stats-label">Số giao dịch</h3>
            <div className="trs-stats-value">{revenueData.length}</div>
            <p className="trs-stats-description">Giao dịch hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Error/Demo Message */}
      {error && (
        <div className="trs-alert trs-alert-demo">
          <div className="trs-alert-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="trs-alert-content">
            <strong>Chế độ Demo:</strong> {error}
          </div>
        </div>
      )}

      {/* Revenue Data Table */}
      <div className="trs-section">
        <div className="trs-section-header">
          <h2 className="trs-section-title">
            <i className="fas fa-list-alt"></i>
            Chi tiết Giao dịch
          </h2>
          <button
            className="trs-refresh-btn"
            onClick={fetchRevenueData}
            disabled={isLoading}
          >
            <i
              className={`fas ${
                isLoading ? "fa-spinner fa-spin" : "fa-sync-alt"
              }`}
            ></i>
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {isLoading ? (
          <div className="trs-loading">
            <div className="trs-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : revenueData.length > 0 ? (
          <div className="trs-table-container">
            <table className="trs-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học sinh</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="trs-td-center">{index + 1}</td>
                    <td className="trs-td-name">{item.studentName}</td>
                    <td className="trs-td-amount">
                      {item.amount.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="trs-td-center">
                      <span
                        className={`trs-status-badge trs-status-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.description}</td>
                    <td className="trs-td-date">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="trs-empty-state">
            <div className="trs-empty-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Chưa có dữ liệu</h3>
            <p>Bạn chưa có giao dịch nào trong tháng này.</p>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="trs-debug-section">
        <details className="trs-debug-details">
          <summary className="trs-debug-summary">
            <i className="fas fa-bug"></i>
            Thông tin Debug
          </summary>
          <div className="trs-debug-content">
            <p>
              <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </p>
            <p>
              <strong>Is Tutor:</strong> {isTutor ? "Yes" : "No"}
            </p>
            <p>
              <strong>User ID:</strong>{" "}
              {userProfile?.id || userProfile?.userId || "N/A"}
            </p>
            <p>
              <strong>Role ID:</strong> {userProfile?.roleId || "N/A"}
            </p>
            <p>
              <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Error:</strong> {error || "None"}
            </p>
            <p>
              <strong>Data Count:</strong> {revenueData.length}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TutorRevenueStable;
