import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function UserPrivateRoutes() {
  const isAuth = Cookies.get("token");
  const userRole = Cookies.get("role");
  return isAuth && userRole === "user" ? <Outlet /> : <Navigate to="/login" />;
}

export default UserPrivateRoutes;
