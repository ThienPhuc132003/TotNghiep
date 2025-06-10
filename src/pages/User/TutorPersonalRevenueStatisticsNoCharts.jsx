// Tutor Revenue Statistics without Chart.js - to test if charts were the issue
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/User/TutorPersonalRevenueStatistics.style.css";

const TutorPersonalRevenueStatisticsNoCharts = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("month");
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalLessons: 0,
    activeStudents: 0,
    averageRevenuePerLesson: 0,
  });

  // Check if user is a tutor
  const isTutor = useMemo(() => {
    return (
      isAuthenticated &&
      userProfile?.roleId &&
      String(userProfile.roleId).toUpperCase() === "TUTOR"
    );
  }, [isAuthenticated, userProfile]);

  // Get tutor ID
  const tutorId = useMemo(() => {
    return userProfile?.userProfile?.userId;
  }, [userProfile]);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!isTutor || !tutorId) {
      setError("Unauthorized access - only tutors can view this page");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        query: {
          tutorId: tutorId,
          timeType: timeFilter,
          page: 1,
          rpp: 1000, // Get all records for statistics
        },
        requireToken: true,
      });

      if (response && response.data) {
        const payments = response.data;
        setRevenueData(payments);

        // Calculate statistics
        const totalRevenue = payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );
        const totalLessons = payments.length;
        const uniqueStudents = new Set(payments.map((p) => p.studentId)).size;
        const averageRevenuePerLesson =
          totalLessons > 0 ? totalRevenue / totalLessons : 0;

        setStatistics({
          totalRevenue,
          totalLessons,
          activeStudents: uniqueStudents,
          averageRevenuePerLesson,
        });
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to load revenue data. Please try again.");
      toast.error("Failed to load revenue data");
    } finally {
      setIsLoading(false);
    }
  }, [isTutor, tutorId, timeFilter]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Render unauthorized access
  if (!isAuthenticated) {
    return (
      <div className="tutor-revenue-container">
        <div className="error-message">
          <h2>Unauthorized Access</h2>
          <p>Please log in to view your revenue statistics.</p>
        </div>
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="tutor-revenue-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>This page is only available for tutors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-revenue-container">
      <div className="revenue-header">
        <h1>📊 Revenue Statistics (No Charts)</h1>
        <p>Personal revenue analytics and insights</p>
      </div>

      {/* Time Filter Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="timeFilter">Time Period:</label>
          <select
            id="timeFilter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <button
          onClick={fetchRevenueData}
          disabled={isLoading}
          className="refresh-btn"
        >
          {isLoading ? "🔄 Refreshing..." : "🔄 Refresh Data"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">⏳ Loading revenue data...</div>
        </div>
      )}

      {/* Statistics Cards */}
      {!isLoading && !error && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">
                {statistics.totalRevenue.toLocaleString()} VND
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Total Lessons</h3>
              <p className="stat-value">{statistics.totalLessons}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Active Students</h3>
              <p className="stat-value">{statistics.activeStudents}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Avg per Lesson</h3>
              <p className="stat-value">
                {Math.round(
                  statistics.averageRevenuePerLesson
                ).toLocaleString()}{" "}
                VND
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Data Table */}
      {!isLoading && !error && revenueData.length > 0 && (
        <div className="revenue-table-container">
          <h3>📋 Recent Transactions</h3>
          <div className="table-responsive">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.slice(0, 10).map((payment, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(
                        payment.createdAt || payment.date
                      ).toLocaleDateString()}
                    </td>
                    <td>{payment.studentName || payment.studentId || "N/A"}</td>
                    <td>{(payment.amount || 0).toLocaleString()} VND</td>
                    <td>{payment.status || "Completed"}</td>
                    <td>
                      {payment.description || payment.note || "Lesson payment"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && !error && revenueData.length === 0 && (
        <div className="no-data-message">
          <h3>📊 No Data Available</h3>
          <p>No revenue data found for the selected time period.</p>
          <p>Start teaching to see your earnings here!</p>
        </div>
      )}

      {/* Chart Placeholder */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <h3>📈 Charts Coming Soon</h3>
        <p>
          This is the version without Chart.js to test if charts were causing
          the 500 error.
        </p>
        <p>
          If this page loads successfully, the issue was with missing
          react-chartjs-2 dependency.
        </p>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsNoCharts;
