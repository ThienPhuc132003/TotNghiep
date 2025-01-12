import React from "react";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
import { useTranslation } from "react-i18next";

const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <UserDashboardLayout>
      <h2>{t("dashboard.welcomeMessage")}</h2>
      <p>{t("dashboard.manageSessions")}</p>
      <div className="dashboard-content">
        <div className="card">
          <h3>{t("dashboard.upcomingSessions")}</h3>
          <p>{t("dashboard.noUpcomingSessions")}</p>
        </div>
        <div className="card">
          <h3>{t("dashboard.recentActivities")}</h3>
          <p>{t("dashboard.noRecentActivities")}</p>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

const Dashboard = React.memo(DashboardPage);
export default Dashboard;