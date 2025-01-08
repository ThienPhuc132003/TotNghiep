// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";

const AdminDashboardPage = () => {
  return (
    <AdminDashboardLayout>
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
    </AdminDashboardLayout>
  );
};

const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;