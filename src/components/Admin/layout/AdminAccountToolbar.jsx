// src/components/Admin/layout/AdminAccountToolbar.jsx
import React from "react";
import PropTypes from "prop-types";
import SettingButton from "../../SettingButton";
import AdminProfileDisplay from "../AdminProfileDisplay"; // <-- Import component mới
import "../../../assets/css/Admin/Admin.style.css"; // Đảm bảo CSS được import
const AdminAccountToolbarComponent = ({ onLogout }) => {
  return (
    <div className="admin-account-toolbar">
      <AdminProfileDisplay />{" "}
      <SettingButton
        isAuthenticated={true}
        onLogout={onLogout}
        accountManagementText="Tài khoản Quản trị"
        accountManagementPath="/admin/profile" // Đảm bảo đường dẫn này tồn tại
      />
    </div>
  );
};

AdminAccountToolbarComponent.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

const AdminAccountToolbar = React.memo(AdminAccountToolbarComponent);
export default AdminAccountToolbar;
