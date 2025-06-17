// Simple test component to verify routing works
import { useEffect } from "react";

const SimpleWithdrawalTest = () => {
  useEffect(() => {
    console.log("🧪 Simple test component mounted successfully!");
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        background: "#f5f5f5",
        border: "2px solid #007bff",
        borderRadius: "8px",
      }}
    >
      <h1 style={{ color: "#007bff" }}>✅ Test Component Loaded!</h1>
      <p>If you see this, the routing is working correctly.</p>
      <p>
        <strong>Current URL:</strong> {window.location.pathname}
      </p>
      <p>
        <strong>Time:</strong> {new Date().toLocaleString()}
      </p>
      <p>Now we can debug the main component issues...</p>
    </div>
  );
};

export default SimpleWithdrawalTest;
