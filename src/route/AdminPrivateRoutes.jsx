// src/route/AdminPrivateRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function AdminPrivateRoutes() {
  const isAuth = Cookies.get("token");
  const userRole = Cookies.get("role");

  // Kiểm tra đơn giản: Có token VÀ role là 'admin' không?
  if (isAuth && userRole === "admin") {
    // Nếu có, cho phép truy cập các route con được bọc bởi component này
    return <Outlet />;
  } else {
    // Nếu không, chuyển hướng về trang đăng nhập admin
    console.log(
      "AdminPrivateRoutes: Access denied. Redirecting to /admin/login. Token:",
      !!isAuth,
      "Role:",
      userRole
    );
    // Thêm state để trang login có thể hiển thị thông báo (tùy chọn)
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          message: "Bạn cần đăng nhập với quyền Admin để truy cập trang này.",
        }}
      />
    );
  }
}

export default AdminPrivateRoutes;
