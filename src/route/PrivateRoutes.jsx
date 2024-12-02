// import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function PrivateRoutes() {
  const isAuth = Cookies.get("token");
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoutes;
