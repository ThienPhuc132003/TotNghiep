import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function AdminPrivateRoutes() {
  const isAuth = Cookies.get("token");
  const userRole = Cookies.get("role"); 

  return isAuth && userRole === "admin" ? <Outlet /> : <Navigate to="/admin/login" />;
}

export default AdminPrivateRoutes;