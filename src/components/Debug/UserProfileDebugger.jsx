// Debug User Profile Component
// Thêm component này vào một trang để debug user data

import React from "react";
import { useSelector } from "react-redux";

const UserProfileDebugger = () => {
  const userState = useSelector((state) => state.user);
  const userProfile = useSelector((state) => state.user.userProfile);

  console.log("🔍 DEBUG USER STATE:", userState);
  console.log("🔍 DEBUG USER PROFILE:", userProfile);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        maxWidth: "400px",
        zIndex: 9999,
      }}
    >
      <h4>🔍 User Debug Info</h4>
      <div>
        <strong>Is Authenticated:</strong>{" "}
        {userState?.isAuthenticated ? "Yes" : "No"}
      </div>
      <div>
        <strong>Profile Loading:</strong>{" "}
        {userState?.profileLoading ? "Yes" : "No"}
      </div>
      <div>
        <strong>Profile Error:</strong> {userState?.profileError || "None"}
      </div>
      <div>
        <strong>User ID:</strong> {userProfile?.userId || "Not found"}
      </div>
      <div>
        <strong>Role ID:</strong> {userProfile?.roleId || "Not found"}
      </div>
      <div>
        <strong>Email:</strong> {userProfile?.email || "Not found"}
      </div>
      <div>
        <strong>User Profile Name:</strong>{" "}
        {userProfile?.userProfile?.fullname || "Not found"}
      </div>
      <div>
        <strong>User Profile Avatar:</strong>{" "}
        {userProfile?.userProfile?.avatar || "null"}
      </div>
      <div>
        <strong>Tutor Profile Name:</strong>{" "}
        {userProfile?.tutorProfile?.fullname || "Not found"}
      </div>
      <div>
        <strong>Tutor Profile Avatar:</strong>{" "}
        {userProfile?.tutorProfile?.avatar || "null"}
      </div>

      <details style={{ marginTop: "10px" }}>
        <summary>Full User State (click to expand)</summary>
        <pre style={{ fontSize: "10px", maxHeight: "200px", overflow: "auto" }}>
          {JSON.stringify(userState, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default UserProfileDebugger;
