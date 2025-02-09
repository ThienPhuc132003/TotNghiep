// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
import "../../assets/css/Admin/AdminDashboard.style.css";

const AdminDashboardPage = () => {
  const userData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Users",
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const sessionData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sessions",
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AdminDashboardLayout>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>Here you can manage users, view statistics, and configure settings.</p>
      <div className="admin-dashboard-content">
        <div className="admin-card">
          <h3>User Statistics</h3>
          <ChartComponent type="bar" data={userData} options={options} />
        </div>
        <div className="admin-card">
          <h3>Session Statistics</h3>
          <ChartComponent type="line" data={sessionData} options={options} />
        </div>
        <div className="admin-card">
          <h3>Notifications</h3>
          <ul>
            <li>New tutor application from John Doe</li>
            <li>Session request from Jane Smith</li>
            <li>Payment issue reported by Mark Johnson</li>
          </ul>
        </div>
        <div className="admin-card">
          <h3>Financial Management</h3>
          <p>Manage payments and transactions.</p>
        </div>
        <div className="admin-card">
          <h3>Content Management</h3>
          <p>Manage website content and media files.</p>
        </div>
        <div className="admin-card">
          <h3>Support and Feedback</h3>
          <p>View and respond to support tickets.</p>
        </div>
        <div className="admin-card">
          <h3>Settings and Configurations</h3>
          <p>Configure system settings and localization.</p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;