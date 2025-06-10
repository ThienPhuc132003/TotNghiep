// Temporary fix for TutorPersonalRevenueStatistics with conditional Chart.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/User/TutorPersonalRevenueStatistics.style.css";

const TutorPersonalRevenueStatisticsWithFallback = () => {
  // Redux selectors
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("month");
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [chartComponents, setChartComponents] = useState({});
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalLessons: 0,
    activeStudents: 0,
    averageRevenuePerLesson: 0,
  });

  // Try to load Chart.js components dynamically
  useEffect(() => {
    const loadChartComponents = async () => {
      try {
        const [chartModule, reactChartModule] = await Promise.all([
          import("chart.js"),
          import("react-chartjs-2"),
        ]);

        // Register Chart.js components
        const {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          BarElement,
          LineElement,
          Title,
          Tooltip,
          Legend,
          ArcElement,
          PointElement,
        } = chartModule;
        ChartJS.register(
          CategoryScale,
          LinearScale,
          BarElement,
          LineElement,
          Title,
          Tooltip,
          Legend,
          ArcElement,
          PointElement
        );

        setChartComponents({
          Line: reactChartModule.Line,
          Doughnut: reactChartModule.Doughnut,
          Bar: reactChartModule.Bar,
        });
        setChartsLoaded(true);
        console.log("✅ Chart.js components loaded successfully");
      } catch (error) {
        console.warn("⚠️ Chart.js components not available:", error.message);
        setChartsLoaded(false);
      }
    };

    loadChartComponents();
  }, []);

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
          rpp: 1000,
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

  // Load data on component mount
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Render chart or fallback
  const renderChart = (type, data, options, fallbackContent) => {
    if (!chartComponentsAvailable) {
      return (
        <div className="chart-fallback">
          <h4>📊 Chart Preview</h4>
          <p>{fallbackContent}</p>
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "2px dashed #dee2e6",
            }}
          >
            <p>⚠️ Charts require react-chartjs-2 package</p>
            <p>Run: npm install react-chartjs-2</p>
          </div>
        </div>
      );
    }

    switch (type) {
      case "line":
        return Line ? <Line data={data} options={options} /> : null;
      case "doughnut":
        return Doughnut ? <Doughnut data={data} options={options} /> : null;
      case "bar":
        return Bar ? <Bar data={data} options={options} /> : null;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Unauthorized access
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
        <h1>📊 Revenue Statistics</h1>
        <p>Personal revenue analytics and insights</p>
        {!chartComponentsAvailable && (
          <div className="warning-banner">
            ⚠️ Charts not available - install react-chartjs-2 for full
            functionality
          </div>
        )}
      </div>

      {/* Rest of the component content similar to the no-charts version */}
      {/* This ensures the page loads even without charts */}

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
        {/* Add other stat cards */}
      </div>

      {/* Chart placeholders */}
      <div className="charts-section">
        {renderChart("line", {}, {}, "Revenue trend over time")}
        {renderChart("doughnut", {}, {}, "Revenue distribution by category")}
        {renderChart("bar", {}, {}, "Monthly revenue comparison")}
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsWithFallback;
