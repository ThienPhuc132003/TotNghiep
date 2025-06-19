import { useEffect } from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";

const WithdrawalTestComponent = () => {
  useEffect(() => {
    console.log("🧪 WITHDRAWAL TEST COMPONENT MOUNTED SUCCESSFULLY!");
    console.log("🔄 This confirms routing works - main component has issues");
  }, []);

  const childrenMiddleContentLower = (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        background: "#e8f5e8",
        border: "2px solid #28a745",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ color: "#28a745" }}>
        ✅ Withdrawal Test Component Working!
      </h2>
      <p>
        <strong>Route:</strong> /admin/rut-tien
      </p>
      <p>
        <strong>Time:</strong> {new Date().toLocaleString()}
      </p>
      <p>
        <strong>Status:</strong> Component loads successfully
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "4px",
        }}
      >
        <h3>🔍 Debug Results:</h3>
        <ul>
          <li>✅ Route configuration is correct</li>
          <li>✅ AdminDashboardLayout renders properly</li>
          <li>✅ Component mounting works</li>
          <li>❌ Main ListOfWithdrawalRequests has internal issues</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          borderRadius: "4px",
        }}
      >
        <h3>🔧 Next Steps:</h3>
        <ol>
          <li>Temporarily replace main component with this test</li>
          <li>Verify all console logs appear properly</li>
          <li>Gradually restore main component functionality</li>
          <li>Identify specific issue causing white screen</li>
        </ol>
      </div>
    </div>
  );

  return (
    <AdminDashboardLayout
      currentPath="/admin/rut-tien"
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

export default WithdrawalTestComponent;
