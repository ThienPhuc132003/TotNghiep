import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import "../../assets/css/Admin/AdminDashboard.style.css";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-dashboard-layout">
      <header className="admin-header">
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
      </header>
      <main className="admin-main-content">
        <h2>Welcome to the Admin Dashboard</h2>
        <p>Here you can manage users, view statistics, and configure settings.</p>
        <div className="admin-dashboard-content">
          <div className="admin-card">
            <h3>Statistics</h3>
            <p>No statistics available.</p>
          </div>
          <div className="admin-card">
            <h3>Recent Activities</h3>
            <p>No recent activities.</p>
          </div>
        </div>
      </main>
      <footer className="admin-footer">
        <p>&copy; 2023 Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;