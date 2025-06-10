// Emergency backup component to prevent white screen
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Alert, CircularProgress } from "@mui/material";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TutorRevenueEmergency = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // State for revenue data
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  console.log("🚨 Emergency component loaded", {
    isAuthenticated,
    userProfile,
  });

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="warning">
          <h3>⚠️ Chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để xem thống kê doanh thu.</p>
        </Alert>
      </div>
    );
  }
  // Check if user is tutor
  let isTutor = false;
  if (userProfile?.roles && Array.isArray(userProfile.roles)) {
    isTutor = userProfile.roles.some(
      (role) =>
        role.name === "TUTOR" ||
        role.name === "Tutor" ||
        role.name?.toLowerCase() === "tutor"
    );
  } else if (userProfile?.roleId) {
    isTutor = String(userProfile.roleId).toUpperCase() === "TUTOR";
  }

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("📊 Fetching revenue data...");

      // Mock API call - replace with actual endpoint
      const response = await Api({
        endpoint: "tutor/revenue-statistics",
        method: METHOD_TYPE.GET,
        query: {
          periodType: "MONTH",
          periodValue: 1,
        },
      });

      if (response?.success) {
        setRevenueData(response.data?.items || []);
        setTotalRevenue(response.data?.totalRevenue || 0);
        console.log("✅ Revenue data loaded:", response.data);
      } else {
        throw new Error(response?.message || "Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("❌ Error fetching revenue data:", err);
      setError(err.message);
      // Don't show error toast for now to avoid disrupting the page
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, userProfile]);

  // Load data when component mounts and user is tutor
  useEffect(() => {
    if (isTutor && userProfile) {
      fetchRevenueData();
    }
  }, [fetchRevenueData, isTutor, userProfile]);

  if (!isTutor) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="error">
          <h3>🚫 Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <p>
            <strong>Thông tin tài khoản:</strong>
          </p>
          <p>Role: {userProfile?.roleId}</p>
          <p>Roles: {JSON.stringify(userProfile?.roles)}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          backgroundColor: "#d4edda",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #c3e6cb",
        }}
      >
        <h1>💰 Thống kê Doanh thu Gia sư</h1>
        <p>
          Chào mừng gia sư:{" "}
          <strong>{userProfile?.name || userProfile?.username || "N/A"}</strong>
        </p>
        <p>
          ID: <strong>{userProfile?.id || userProfile?.userId || "N/A"}</strong>
        </p>
      </div>

      <Alert severity="info" style={{ marginTop: "20px" }}>
        <h3>🚧 Trang đang được phát triển</h3>
        <p>Tính năng thống kê doanh thu chi tiết đang được hoàn thiện.</p>
        <p>Hiện tại trang này chỉ để xác nhận quyền truy cập của gia sư.</p>
      </Alert>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <h4>📊 Thông tin debug:</h4>
        <ul>
          <li>Authenticated: {isAuthenticated ? "✅" : "❌"}</li>
          <li>Is Tutor: {isTutor ? "✅" : "❌"}</li>
          <li>User ID: {userProfile?.id || userProfile?.userId || "N/A"}</li>
          <li>Role ID: {userProfile?.roleId || "N/A"}</li>
          <li>Timestamp: {new Date().toLocaleString("vi-VN")}</li>
        </ul>
      </div>
    </div>
  );
};

export default TutorRevenueEmergency;
