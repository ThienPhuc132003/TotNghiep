import React from "react";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
import { useTranslation } from "react-i18next";


const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <UserDashboardLayout>
      <div className="dashboard-container">
        <section className="welcome-section">
          <h2>{t("dashboard.welcomeMessage")}</h2>
          <p>{t("dashboard.manageSessions")}</p>
        </section>

        <div className="dashboard-content">
          <section className="card upcoming-sessions">
            <h3>{t("dashboard.upcomingSessions")}</h3>
            Replace placeholder with actual upcoming sessions data
            <p>{t("dashboard.noUpcomingSessions")}</p>
            Example of how you might list sessions:
            <ul>
              <li>Session with John - Math - Tomorrow at 3 PM</li>
              <li>Session with Jane - English - Next Week at 5 PM</li>
            </ul>
            <button>{t("dashboard.viewAllSessions")}</button>
          </section>

          <section className="card tutor-list">
            <h3>{t("dashboard.myTutors")}</h3>
            Replace placeholder with actual list of tutors
            <p>{t("dashboard.noTutorsYet")}</p>
            Example of how you might list tutors:
            <ul>
              <li>John Doe - Math Tutor</li>
              <li>Jane Smith - English Tutor</li>
            </ul>
            <button>{t("dashboard.findNewTutor")}</button>
          </section>

          <section className="card recent-activities">
            <h3>{t("dashboard.recentActivities")}</h3>
            <p>{t("dashboard.noRecentActivities")}</p>
            Example of how you might list recent activities:
            <ul>
              <li>Booked session with John</li>
              <li>Reviewed Janes profile</li>
            </ul>
          </section>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

const Dashboard = React.memo(DashboardPage);
export default Dashboard;