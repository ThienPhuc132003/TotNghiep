// src/components/User/layout/UserAccountToolbar.jsx
import React from "react";
import PropTypes from "prop-types";
import User from "../User";
import SettingButton from "../../SettingButton";
// import NotifiButton from "../../NotifiButton";
// import HelpButton from "../../HelpButton";

// Định nghĩa lại ROLES ở đây hoặc import từ file dùng chung nếu có
const ROLES = {
  USER: "USER",
  TUTOR: "TUTOR",
};

const UserAccountToolbarComponent = ({
  currentUserRole = null,
  isAuthenticated,
  onLogout, // Nhận từ HomePageLayout
}) => {
  const getAccountManagementText = () => {
    if (currentUserRole === ROLES.TUTOR) {
      return "Quản Lý Gia Sư";
    }
    return "Tài Khoản Của Tôi";
  };

  return (
    <div className="user-account-toolbar">
      <User />
      {isAuthenticated && (
        <SettingButton
          isAuthenticated={isAuthenticated}
          onLogout={onLogout} // Truyền hàm onLogout từ HomePageLayout
          accountManagementText={getAccountManagementText()}
          accountManagementPath="/tai-khoan/ho-so"
        />
      )}
    </div>
  );
};

UserAccountToolbarComponent.propTypes = {
  currentUserRole: PropTypes.string, // Có thể null nếu chưa xác thực
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

const UserAccountToolbar = React.memo(UserAccountToolbarComponent);
export default UserAccountToolbar;
