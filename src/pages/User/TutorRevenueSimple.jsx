// Simple test component for tutor revenue page
import { useSelector } from "react-redux";
import { Alert } from "@mui/material";
import { useState, useEffect } from "react";

const TutorRevenueSimple = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [renderTime, setRenderTime] = useState(Date.now());
  useEffect(() => {
    console.log("🟢 TutorRevenueSimple mounted at:", new Date().toISOString());
    const startTime = Date.now();
    setRenderTime(startTime);

    return () => {
      console.log(
        "🔴 TutorRevenueSimple unmounted at:",
        new Date().toISOString()
      );
      console.log("⏱️ Component lifetime:", Date.now() - startTime, "ms");
    };
  }, []);

  useEffect(() => {
    console.log("🟢 TutorRevenueSimple Redux Debug:", {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      userProfile,
      roles: userProfile?.roles,
      roleId: userProfile?.roleId,
    });
  }, [isAuthenticated, userProfile]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="error">Bạn chưa đăng nhập</Alert>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="error">Không tìm thấy thông tin người dùng</Alert>
      </div>
    );
  }

  // Check if user is tutor
  let isTutor = false;

  // Check roles array
  if (userProfile.roles && Array.isArray(userProfile.roles)) {
    isTutor = userProfile.roles.some(
      (role) =>
        role.name === "TUTOR" ||
        role.name === "Tutor" ||
        role.name?.toLowerCase() === "tutor"
    );
  }

  // Fallback to roleId
  if (!isTutor && userProfile.roleId) {
    isTutor = String(userProfile.roleId).toUpperCase() === "TUTOR";
  }

  console.log("🔍 Role check result:", { isTutor });

  if (!isTutor) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert severity="warning">
          <h3>Truy cập bị từ chối</h3>
          <p>Trang này chỉ dành cho gia sư.</p>
          <p>
            Vai trò hiện tại:{" "}
            {JSON.stringify(userProfile.roles || userProfile.roleId)}
          </p>
        </Alert>
      </div>
    );
  }
  return (
    <div style={{ padding: "20px" }}>
      <h1>🎉 Trang Thống kê Doanh thu Gia sư</h1>
      <Alert severity="success">
        <p>
          Chào mừng gia sư:{" "}
          {userProfile.name || userProfile.username || "Unknown"}
        </p>
        <p>ID: {userProfile.id || userProfile.userId}</p>
        <p>
          Vai trò: {JSON.stringify(userProfile.roles || userProfile.roleId)}
        </p>
        <p>Thời gian render: {new Date(renderTime).toLocaleString("vi-VN")}</p>
      </Alert>

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>Debug Info:</h3>
        <pre>{JSON.stringify(userProfile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TutorRevenueSimple;
