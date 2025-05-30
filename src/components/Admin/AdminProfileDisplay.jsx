// src/components/Admin/AdminProfileDisplay.jsx

import React from "react";
import { useSelector } from "react-redux";
import "../../assets/css/Admin/AdminProfileDisplay.style.css"; // Tạo file CSS này

// Một icon placeholder đơn giản nếu không có avatar thật
const DefaultAdminAvatar = () => (
  <div className="admin-profile-avatar-default">
    <i className="fa-solid fa-user-shield"></i> {/* Icon Admin */}
  </div>
);

const AdminProfileDisplayComponent = () => {
  const adminProfile = useSelector((state) => state.admin.adminProfile); // Lấy profile từ Redux
 console.log("Admin Profile:", adminProfile); // Kiểm tra dữ liệu profile
  if (!adminProfile) {
    // Có thể hiển thị một trạng thái loading hoặc null nếu profile chưa có
    // Hoặc một placeholder cho biết chưa đăng nhập (dù toolbar thường chỉ hiện khi đã đăng nhập)
    return <div className="admin-profile-display-placeholder">Đang tải...</div>;
  }

  // Giả sử adminProfile có các trường như name, role, avatarUrl
  // Điều chỉnh các trường này cho phù hợp với cấu trúc dữ liệu của bạn
  const displayName =
    adminProfile.fullName || adminProfile.name || adminProfile.email || "Admin";
  const roleName = "Quản trị viên"; // Hoặc lấy từ adminProfile.role nếu có

  return (
    <div className="admin-profile-display">
      {adminProfile.avatarUrl ? (
        <img
          src={adminProfile.avatarUrl}
          alt="Ảnh đại diện Admin"
          className="admin-profile-avatar"
        />
      ) : (
        <DefaultAdminAvatar />
      )}
      <div className="admin-profile-info">
        <span className="admin-profile-name">{displayName}</span>
        <span className="admin-profile-role">{roleName}</span>
        {/* Bạn không cần hiển thị Coin cho Admin */}
      </div>
    </div>
  );
};

// Không cần PropTypes nếu không nhận props từ bên ngoài
// AdminProfileDisplayComponent.propTypes = {};

const AdminProfileDisplay = React.memo(AdminProfileDisplayComponent);
export default AdminProfileDisplay;
