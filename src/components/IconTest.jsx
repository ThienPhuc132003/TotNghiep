// Simple Icon Test Component
import React from "react";

const IconTest = () => {
  const icons = [
    { class: "fas fa-chart-line", name: "Chart Line" },
    { class: "fas fa-coins", name: "Coins" },
    { class: "fas fa-receipt", name: "Receipt" },
    { class: "fas fa-users", name: "Users" },
    { class: "fas fa-list-alt", name: "List Alt" },
    { class: "fas fa-sync-alt", name: "Sync Alt" },
    { class: "fas fa-file-csv", name: "File CSV" },
    { class: "fas fa-spinner", name: "Spinner" },
    { class: "fas fa-exclamation-triangle", name: "Warning" },
    { class: "fas fa-ban", name: "Ban" },
    { class: "fas fa-info-circle", name: "Info" },
  ];

  const testStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const iconTestStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "10px",
    margin: "5px 0",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
  };

  const iconStyle = {
    fontSize: "1.5rem",
    color: "#007bff",
    width: "30px",
    textAlign: "center",
  };

  return (
    <div style={testStyle}>
      <h1>🧪 FontAwesome Icon Test</h1>
      <p>
        This component tests all FontAwesome icons used in TutorRevenueStable
      </p>

      <div style={{ marginBottom: "20px" }}>
        <h3>Icons Test:</h3>
        {icons.map((icon, index) => (
          <div key={index} style={iconTestStyle}>
            <i className={icon.class} style={iconStyle}></i>
            <span>{icon.name}</span>
            <code style={{ fontSize: "0.8rem", color: "#6c757d" }}>
              {icon.class}
            </code>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#e9ecef",
          borderRadius: "4px",
          marginTop: "20px",
        }}
      >
        <h4>Debug Information:</h4>
        <p>
          If you see boxes or question marks instead of icons, FontAwesome is
          not loading properly.
        </p>
        <p>
          Open browser console and run{" "}
          <code>FontAwesomeDebug.runAllChecks()</code> for detailed analysis.
        </p>
      </div>
    </div>
  );
};

export default IconTest;
