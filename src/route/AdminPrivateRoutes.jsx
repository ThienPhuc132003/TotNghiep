// src/routes/AdminPrivateRoutes.jsx (Hoặc đường dẫn tương ứng)

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setAdminProfile } from "../redux/adminSlice"; // <-- Đảm bảo đường dẫn đúng
import Api from "../network/Api"; // <-- Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // <-- Đảm bảo đường dẫn đún

function AdminPrivateRoutes() {
  const dispatch = useDispatch();
  const location = useLocation(); // Để dùng trong state của Navigate nếu cần

  // Lấy thông tin từ Redux và Cookies
  const adminProfile = useSelector((state) => state.admin.profile); // Lấy profile từ Redux
  const token = Cookies.get("token");
  const userRole = Cookies.get("role");

  // State để quản lý việc kiểm tra/load profile ban đầu
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Ban đầu luôn kiểm tra
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái xác thực cuối cùng

  useEffect(() => {
    let isMounted = true; // Cờ để tránh cập nhật state nếu component unmount

    const checkAuthentication = async () => {
      // Không cần set isCheckingAuth(true) ở đây nữa vì đã set ở ngoài
      console.log("AdminPrivateRoutes: Starting auth check...");

      // Trường hợp 1: Đã có profile trong Redux VÀ role là admin
      if (adminProfile && userRole === "admin") {
        console.log("AdminPrivateRoutes: Case 1 - Profile in Redux & role OK.");
        if (isMounted) {
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
        }
        return;
      }

      // Trường hợp 2: Có token và role admin trong cookie, nhưng chưa có profile trong Redux
      if (token && userRole === "admin" && !adminProfile) {
        console.log(
          "AdminPrivateRoutes: Case 2 - Token/Role OK, profile missing. Fetching..."
        );
        try {
          const response = await Api({
            endpoint: "admin/get-profile",
            method: METHOD_TYPE.GET,
          });

          if (response.success && response.data && isMounted) {
            dispatch(setAdminProfile(response.data));
            setIsAuthenticated(true);
            console.log(
              "AdminPrivateRoutes: Case 2 - Profile fetched & dispatched."
            );
          } else {
            console.error(
              "AdminPrivateRoutes: Case 2 - Failed fetch, clearing cookies.",
              response?.message
            );
            Cookies.remove("token");
            Cookies.remove("role");
            if (isMounted) setIsAuthenticated(false);
          }
        } catch (error) {
          console.error(
            "AdminPrivateRoutes: Case 2 - Error fetching profile:",
            error
          );
          Cookies.remove("token");
          Cookies.remove("role");
          if (isMounted) setIsAuthenticated(false);
        } finally {
          // Luôn kết thúc kiểm tra sau khi fetch xong
          if (isMounted) setIsCheckingAuth(false);
        }
        return;
      }

      // Trường hợp 3: Không có token hoặc role không phải admin (hoặc các điều kiện trên ko thỏa)
      console.log(
        "AdminPrivateRoutes: Case 3 - No token, wrong role, or other conditions not met."
      );
      if (isMounted) {
        // Đảm bảo xóa cookie nếu chúng không hợp lệ (ví dụ: có token nhưng sai role)
        if (!token || userRole !== "admin") {
          Cookies.remove("token");
          Cookies.remove("role");
        }
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();

    return () => {
      isMounted = false; // Cleanup khi component unmount
      console.log("AdminPrivateRoutes: Unmounting.");
    };

    // Chạy lại khi các giá trị này thay đổi. Quan trọng là adminProfile
    // để nó nhận biết khi profile được dispatch từ nơi khác (login/oauth callback)
  }, [token, userRole, adminProfile, dispatch]);

  // --- Logic Render ---

  if (isCheckingAuth) {
    console.log("AdminPrivateRoutes: Rendering loading state...");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2em",
        }}
      >
        Đang tải và kiểm tra quyền truy cập Admin...
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("AdminPrivateRoutes: Rendering Outlet (Authenticated).");
    return <Outlet />;
  } else {
    console.log(
      "AdminPrivateRoutes: Rendering Navigate to login (Not Authenticated)."
    );
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
}

// Thêm PropTypes nếu component cha truyền props vào (hiện tại không có)
// AdminPrivateRoutes.propTypes = { ... };

export default AdminPrivateRoutes;
