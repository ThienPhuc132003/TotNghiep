// src/components/Admin/layout/AdminDashboardLayout.jsx
import React from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../Button";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";

const AdminDashboardLayoutComponent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <h1>Admin Dashboard</h1>
        <nav>
          <ul>
            <li>
              <Button
                onClick={() => navigate("/admin/dashboard")}
                className={`admin-custom-button ${
                  location.pathname === "/admin/dashboard" ? "active" : ""
                }`}
              >
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                onClick={() => navigate("/admin/users")}
                className={`admin-custom-button ${
                  location.pathname === "/admin/users" ? "active" : ""
                }`}
              >
                Users
              </Button>
            </li>
            <li>
              <Button
                onClick={() => navigate("/admin/settings")}
                className={`admin-custom-button ${
                  location.pathname === "/admin/settings" ? "active" : ""
                }`}
              >
                Settings
              </Button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main-content">{children}</main>
    </div>
  );
};

AdminDashboardLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const AdminDashboardLayout = React.memo(AdminDashboardLayoutComponent);
export default AdminDashboardLayout;