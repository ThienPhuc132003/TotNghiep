// Simplified TutorRevenueDashboard for debugging
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Alert } from "@mui/material";
import TutorRevenueMonitor from "../../components/Debug/TutorRevenueMonitor";

const TutorRevenueDashboardSimple = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Check if user is a tutor
  const isTutor = useMemo(() => {
    console.log("🔍 Checking tutor status...", {
      isAuthenticated,
      userProfile,
    });

    if (!isAuthenticated || !userProfile) {
      console.log("❌ Not authenticated or no profile");
      return false;
    }

    // Check if user has roles array
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      const hasRole = userProfile.roles.some(
        (role) =>
          role.name === "TUTOR" ||
          role.name === "Tutor" ||
          role.name?.toLowerCase() === "tutor"
      );
      console.log(
        "🔍 Roles array check:",
        userProfile.roles,
        "-> isTutor:",
        hasRole
      );
      if (hasRole) return true;
    }

    // Fallback to roleId check
    if (userProfile.roleId) {
      const isTutorById = String(userProfile.roleId).toUpperCase() === "TUTOR";
      console.log(
        "🔍 RoleId check:",
        userProfile.roleId,
        "-> isTutor:",
        isTutorById
      );
      return isTutorById;
    }

    console.log("❌ No role found");
    return false;
  }, [isAuthenticated, userProfile]);

  useEffect(() => {
    console.log("🟢 TutorRevenueDashboardSimple mounted");
    console.log("🔍 Current state:", {
      isAuthenticated,
      userProfile,
      isTutor,
      pathname: window.location.pathname,
    });
  }, [isAuthenticated, userProfile, isTutor]);

  // Early return for unauthenticated users
  if (!isAuthenticated) {
    console.log("❌ Rendering unauthenticated view");
    return (
      <div style={{ padding: "20px" }}>
        <TutorRevenueMonitor />
        <Alert severity="error">
          <h3>Chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để truy cập trang này.</p>
        </Alert>
      </div>
    );
  }

  // Early return for users without profile
  if (!userProfile) {
    console.log("❌ Rendering no profile view");
    return (
      <div style={{ padding: "20px" }}>
        <TutorRevenueMonitor />
        <Alert severity="error">
          <h3>Không tìm thấy thông tin người dùng</h3>
          <p>Vui lòng thử đăng nhập lại.</p>
        </Alert>
      </div>
    );
  }

  // Early return for non-tutors
  if (!isTutor) {
    console.log("❌ Rendering non-tutor view");
    return (
      <div style={{ padding: "20px" }}>
        <TutorRevenueMonitor />
        <Alert severity="warning">
          <h3>Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <p>
            <strong>Thông tin tài khoản:</strong>
          </p>
          <ul>
            <li>ID: {userProfile.id || userProfile.userId || "N/A"}</li>
            <li>Tên: {userProfile.name || userProfile.username || "N/A"}</li>
            <li>Role ID: {userProfile.roleId || "N/A"}</li>
            <li>Roles: {JSON.stringify(userProfile.roles || [])}</li>
          </ul>
        </Alert>
      </div>
    );
  }

  // Success view for tutors
  console.log("✅ Rendering tutor view");
  return (
    <div style={{ padding: "20px" }}>
      <TutorRevenueMonitor />

      <div
        style={{
          backgroundColor: "#d4edda",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h1>🎉 Thống kê Doanh thu Gia sư</h1>
        <p>
          Chào mừng gia sư:{" "}
          <strong>{userProfile.name || userProfile.username}</strong>
        </p>
        <p>
          ID: <strong>{userProfile.id || userProfile.userId}</strong>
        </p>
      </div>

      <Alert severity="info">
        <h3>🚧 Đang phát triển</h3>
        <p>Tính năng thống kê doanh thu đang được phát triển.</p>
        <p>Trang này hiện tại chỉ để kiểm tra xác thực và phân quyền.</p>
      </Alert>

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <h4>🔍 Debug Information:</h4>
        <pre>
          {JSON.stringify(
            {
              isAuthenticated,
              isTutor,
              userId: userProfile.id || userProfile.userId,
              roleId: userProfile.roleId,
              roles: userProfile.roles,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default TutorRevenueDashboardSimple;
