import { Navigate, Outlet } from "react-router-dom";

function OtpProtectedRoute() {
  const isOtpVerified = localStorage.getItem("otpVerified") === "true";
  return isOtpVerified ? <Outlet /> : <Navigate to="/forgot-password" />;
}

export default OtpProtectedRoute;
