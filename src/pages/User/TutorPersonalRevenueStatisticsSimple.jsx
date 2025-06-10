// Simple debug version of TutorPersonalRevenueStatistics
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";

const TutorPersonalRevenueStatisticsSimple = () => {
  // Always call hooks at the top level
  const userProfile = useSelector((state) => state?.user?.userProfile || null);
  const isAuthenticated = useSelector(
    (state) => state?.user?.isAuthenticated || false
  );

  const [debugInfo, setDebugInfo] = useState({});
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("✅ Redux state accessed successfully");
    setDebugInfo({
      isAuthenticated,
      userProfile: userProfile
        ? {
            userId: userProfile.userProfile?.userId,
            roleId: userProfile.roleId,
            fullname: userProfile.userProfile?.fullname,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, userProfile]);

  const testApiCall = async () => {
    setIsLoading(true);
    setApiTestResult(null);

    try {
      const tutorId = userProfile?.userProfile?.userId;
      if (!tutorId) {
        throw new Error("No tutor ID found");
      }

      const response = await Api({
        endpoint: "manage-payment/search-with-time-by-tutor",
        method: METHOD_TYPE.GET,
        query: {
          tutorId: tutorId,
          timeType: "month",
          page: 1,
          rpp: 10,
        },
        requireToken: true,
      });

      setApiTestResult({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setApiTestResult({
        success: false,
        error: error.message,
        fullError: error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔧 Debug: Tutor Revenue Statistics</h1>

      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Authentication Status</h2>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div
        style={{
          background: isAuthenticated ? "#d4edda" : "#f8d7da",
          padding: "15px",
          borderRadius: "8px",
          color: isAuthenticated ? "#155724" : "#721c24",
          marginBottom: "20px",
        }}
      >
        <h3>
          Status:{" "}
          {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
        </h3>
        {isAuthenticated && userProfile ? (
          <div>
            <p>
              <strong>User ID:</strong> {userProfile.userProfile?.userId}
            </p>
            <p>
              <strong>Role:</strong> {userProfile.roleId}
            </p>
            <p>
              <strong>Name:</strong> {userProfile.userProfile?.fullname}
            </p>
            <p>
              <strong>Is Tutor:</strong>{" "}
              {String(userProfile.roleId).toUpperCase() === "TUTOR"
                ? "✅ Yes"
                : "❌ No"}
            </p>
          </div>
        ) : (
          <p>User not logged in or profile not available</p>
        )}
      </div>

      {isAuthenticated && userProfile && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={testApiCall}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {isLoading ? "⏳ Testing API..." : "🧪 Test API Call"}
          </button>
        </div>
      )}

      {apiTestResult && (
        <div
          style={{
            background: apiTestResult.success ? "#d4edda" : "#f8d7da",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>
            {apiTestResult.success
              ? "✅ API Test Success"
              : "❌ API Test Failed"}
          </h3>
          <pre
            style={{ fontSize: "12px", overflow: "auto", maxHeight: "300px" }}
          >
            {JSON.stringify(apiTestResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>🔍 Debugging Steps:</h3>
        <ol>
          <li>✅ Component loads successfully</li>
          <li>✅ Check authentication status</li>
          <li>✅ Verify user has TUTOR role</li>
          <li>🧪 Test API endpoint manually (click button above)</li>
          <li>📝 Check browser console for JavaScript errors</li>
          <li>🌐 Check network tab for API responses</li>
        </ol>
      </div>

      <div
        style={{
          background: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h4>⚠️ Common Issues:</h4>{" "}
        <ul>
          <li>
            <strong>500 Server Error:</strong> Backend API issue or endpoint not
            found
          </li>
          <li>
            <strong>401 Unauthorized:</strong> Token expired or invalid
          </li>
          <li>
            <strong>403 Forbidden:</strong> User doesn&apos;t have TUTOR role
          </li>
          <li>
            <strong>CORS Issues:</strong> Frontend-backend communication blocked
          </li>
          <li>
            <strong>Chart.js Errors:</strong> Missing dependencies or import
            issues
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TutorPersonalRevenueStatisticsSimple;
