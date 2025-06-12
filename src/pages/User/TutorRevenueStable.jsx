// Tutor revenue statistics component with modern design integration
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/TutorRevenueStable.style.css";

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

  // Export to CSV function
  const exportToCSV = useCallback(() => {
    if (filteredAndSortedData.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }
    const csvContent = [
      // Header
      ["STT", "Tên học sinh", "ID học sinh", "Coin gia sư nhận", "Ngày tạo"],
      // Data rows
      ...filteredAndSortedData.map((item, index) => [
        index + 1,
        item.studentName,
        item.studentId,
        item.tutorReceive,
        new Date(item.createdAt).toLocaleString("vi-VN"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `thong-ke-doanh-thu-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Đã xuất file CSV thành công!");
  }, [filteredAndSortedData]);

  // Early returns after all hooks
  if (!isAuthenticated) {
    return (
      <div className="trs-container">
        <ToastContainer />{" "}
        <div className="trs-alert trs-alert-warning">
          <div className="trs-alert-icon">
            <i className="fas fa-exclamation-triangle" aria-hidden="true">
              ⚠️
            </i>
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
        <ToastContainer />{" "}
        <div className="trs-alert trs-alert-error">
          <div className="trs-alert-icon">
            <i className="fas fa-ban" aria-hidden="true">
              🚫
            </i>
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
    <div
      className="trs-container"
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        color: "#1a202c",
        minHeight: "100vh",
      }}
    >
      <ToastContainer position="top-right" /> {/* Page Header */}
      <div className="trs-page-header">
        <h1 className="trs-page-title">
          <i className="fas fa-chart-line trs-title-icon" aria-hidden="true">
            📊
          </i>
          Thống kê Doanh thu
        </h1>
        <p className="trs-page-subtitle">
          Chào mừng gia sư:{" "}
          <strong>{userProfile?.name || userProfile?.username || "N/A"}</strong>
        </p>
      </div>
      {/* Stats Cards */}
      <div className="trs-stats-grid">
        <div
          className="trs-stats-card trs-stats-card-primary"
          style={{ backgroundColor: "#ffffff", color: "#1a202c" }}
        >
          <div className="trs-stats-icon">
            <i className="fas fa-coins" aria-hidden="true">
              🪙
            </i>
          </div>
          <div className="trs-stats-content">
            <h3 className="trs-stats-label" style={{ color: "#4a5568" }}>
              Tổng doanh thu nhận
            </h3>
            <div className="trs-stats-value" style={{ color: "#1a202c" }}>
              {totalRevenue.toLocaleString("vi-VN")} Coin
              {isLoading && (
                <i className="fas fa-spinner fa-spin trs-loading-inline"></i>
              )}
            </div>
            <p className="trs-stats-description" style={{ color: "#4a5568" }}>
              Số coin gia sư nhận được
            </p>
          </div>
        </div>

        <div
          className="trs-stats-card trs-stats-card-secondary"
          style={{ backgroundColor: "#ffffff", color: "#1a202c" }}
        >
          <div className="trs-stats-icon">
            <i className="fas fa-receipt" aria-hidden="true">
              🧾
            </i>
          </div>{" "}
          <div className="trs-stats-content">
            <h3 className="trs-stats-label" style={{ color: "#4a5568" }}>
              Số giao dịch
            </h3>
            <div className="trs-stats-value" style={{ color: "#1a202c" }}>
              {revenueData.length}
            </div>
            <p className="trs-stats-description" style={{ color: "#4a5568" }}>
              Giao dịch hoàn thành
            </p>
          </div>
        </div>

        <div
          className="trs-stats-card trs-stats-card-success"
          style={{ backgroundColor: "#ffffff", color: "#1a202c" }}
        >
          <div className="trs-stats-icon">
            <i className="fas fa-users" aria-hidden="true">
              👥
            </i>
          </div>
          <div className="trs-stats-content">
            <h3 className="trs-stats-label" style={{ color: "#4a5568" }}>
              Học sinh
            </h3>
            <div className="trs-stats-value" style={{ color: "#1a202c" }}>
              {new Set(revenueData.map((item) => item.studentId)).size}
            </div>
            <p className="trs-stats-description" style={{ color: "#4a5568" }}>
              Học sinh đã thanh toán
            </p>
          </div>
        </div>
      </div>
      {/* Error/Demo Message */}
      {error && (
        <div className="trs-alert trs-alert-demo">
          {" "}
          <div className="trs-alert-icon">
            <i className="fas fa-info-circle" aria-hidden="true">
              ℹ️
            </i>
          </div>
          <div className="trs-alert-content">
            <strong>Chế độ Demo:</strong> {error}
          </div>
        </div>
      )}{" "}
      {/* Revenue Data Table */}
      <div
        className="trs-section"
        style={{ backgroundColor: "#ffffff", color: "#1a202c" }}
      >
        {" "}
        <div className="trs-section-header">
          <h2 className="trs-section-title" style={{ color: "#1a202c" }}>
            <i className="fas fa-list-alt" aria-hidden="true">
              📋
            </i>
            Chi tiết Giao dịch
          </h2>
          <div className="trs-filter-sort">
            <input
              type="text"
              className="trs-search-input"
              placeholder="Tìm học sinh theo tên hoặc ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="trs-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Cao nhất</option>
              <option value="lowest">Thấp nhất</option>
            </select>
          </div>{" "}
          <button
            className="trs-refresh-btn"
            onClick={fetchRevenueData}
            disabled={isLoading}
          >
            <i
              className={`fas ${
                isLoading ? "fa-spinner fa-spin" : "fa-sync-alt"
              }`}
              aria-hidden="true"
            >
              {isLoading ? "⏳" : "🔄"}
            </i>
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
          <button
            className="trs-export-btn"
            onClick={exportToCSV}
            disabled={isLoading}
          >
            <i className="fas fa-file-csv" aria-hidden="true">
              📊
            </i>
            Xuất CSV
          </button>
        </div>{" "}
        {isLoading ? (
          <div className="trs-loading">
            <div className="trs-spinner"></div>
            <p style={{ color: "#4a5568" }}>Đang tải dữ liệu...</p>
          </div>
        ) : revenueData.length > 0 ? (
          <div
            className="trs-table-container"
            style={{ backgroundColor: "#ffffff" }}
          >
            <table
              className="trs-table"
              style={{ backgroundColor: "#ffffff", color: "#1a202c" }}
            >
              {" "}
              <thead>
                <tr style={{ backgroundColor: "#f7fafc" }}>
                  <th style={{ color: "#2d3748" }}>STT</th>
                  <th style={{ color: "#2d3748" }}>Học sinh</th>
                  <th style={{ color: "#2d3748" }}>Coin gia sư nhận</th>
                  <th style={{ color: "#2d3748" }}>Trạng thái</th>
                  <th style={{ color: "#2d3748" }}>Ngày tạo</th>
                </tr>
              </thead>{" "}
              <tbody>
                {filteredAndSortedData.map((item, index) => (
                  <tr
                    key={item.managePaymentId || item.id}
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <td className="trs-td-center" style={{ color: "#1a202c" }}>
                      {index + 1}
                    </td>
                    <td className="trs-td-name">
                      <div className="trs-student-info">
                        {" "}
                        <div
                          className="trs-student-name"
                          style={{ color: "#1a202c" }}
                        >
                          {item.studentName}
                        </div>
                        <div
                          className="trs-student-id"
                          style={{ color: "#4a5568" }}
                        >
                          ID: {item.studentId}
                        </div>{" "}
                      </div>
                    </td>{" "}
                    <td className="trs-td-amount trs-td-center">
                      <span className="trs-coin-amount trs-coin-receive">
                        {item.tutorReceive?.toLocaleString("vi-VN")} Coin
                      </span>
                    </td>
                    <td className="trs-td-center">
                      <span className="trs-status-badge trs-status-completed">
                        <i className="fas fa-check-circle"></i>
                        Hoàn thành
                      </span>
                    </td>{" "}
                    <td className="trs-td-date" style={{ color: "#4a5568" }}>
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="trs-empty-state" style={{ color: "#4a5568" }}>
            <div className="trs-empty-icon" style={{ color: "#cbd5e0" }}>
              <i className="fas fa-coins"></i>
            </div>
            <h3 style={{ color: "#2d3748" }}>Chưa có dữ liệu thanh toán</h3>
            <p style={{ color: "#4a5568" }}>
              Bạn chưa có giao dịch thanh toán nào từ học sinh.
            </p>{" "}
            <p className="trs-empty-help" style={{ color: "#718096" }}>
              Khi học sinh thanh toán cho các buổi học, thông tin sẽ hiển thị
              tại đây.
            </p>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorRevenueStable;
