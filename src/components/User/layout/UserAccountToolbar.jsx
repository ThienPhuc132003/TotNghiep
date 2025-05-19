// src/components/User/layout/UserAccountToolbar.jsx
import React from "react";
import PropTypes from "prop-types";
import User from "../User"; // User giờ chỉ để hiển thị
import SettingButton from "../../SettingButton"; // Sử dụng lại SettingButton
import NotifiButton from "../../NotifiButton";
import HelpButton from "../../HelpButton";

const UserAccountToolbarComponent = ({
  currentUserRole,
  isAuthenticated,
  onLogout, // Nhận từ HomePageLayout
}) => {
  return (
    <div className="user-account-toolbar">
      <NotifiButton />
      <HelpButton />
      {/* User component giờ chỉ để hiển thị thông tin, không có dropdown */}
      <User />
      {/* SettingButton sẽ xử lý dropdown quản lý tài khoản và đăng xuất */}
      {isAuthenticated && ( // Chỉ hiển thị SettingButton khi đã đăng nhập
        <SettingButton
          currentUserRole={currentUserRole}
          isAuthenticated={isAuthenticated}
          onLogout={onLogout} // Truyền hàm onLogout xuống
        />
      )}
    </div>
  );
};

UserAccountToolbarComponent.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

const UserAccountToolbar = React.memo(UserAccountToolbarComponent);
export default UserAccountToolbar;
