import React from "react";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";

const DashboardPage = () => {
  return (
    <UserDashboardLayout>
      <h2>Welcome to your Dashboard</h2>
      <p>Here you can manage your tutoring sessions, view your profile, and more.</p>
      <div className="dashboard-content">
        <div className="card">
          <h3>Upcoming Sessions</h3>
          <p>No upcoming sessions.</p>
        </div>
        <div className="card">
          <h3>Recent Activities</h3>
          <p>No recent activities.</p>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

const Dashboard = React.memo(DashboardPage);
export default Dashboard;