// src/routes/AdminPrivateRoutes.jsx

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setAdminProfile } from "../redux/adminSlice"; // <-- Đảm bảo đường dẫn đúng
import Api from "../network/Api"; // <-- Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // <-- Đảm bảo đường dẫn đúng

function AdminPrivateRoutes() {
  const dispatch = useDispatch();
  const location = useLocation();

  const adminProfile = useSelector((state) => state.admin.profile);
  const token = Cookies.get("token");
  const userRole = Cookies.get("role");

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Log trạng thái đầu vào mỗi khi component render hoặc state/props thay đổi
  console.log(
    "AdminPrivateRoutes Render - Token:",
    token,
    "Role:",
    userRole,
    "Profile in Redux:",
    adminProfile
  );

  useEffect(() => {
    let isMounted = true;
    console.log("AdminPrivateRoutes Effect Triggered - Dependencies:", {
      token,
      userRole,
      adminProfile,
    });

    const checkAuthentication = async () => {
      console.log("AdminPrivateRoutes: Starting auth check...");

      // Case 1: Đã có profile + đúng role
      // <<< !!! QUAN TRỌNG: Thay 'id' bằng key định danh thực tế trong profile admin của bạn (vd: _id, adminId, email) !!! >>>
      if (adminProfile?.id && userRole === "admin") {
        console.log("AdminPrivateRoutes: Case 1 - Profile in Redux & role OK.");
        if (isMounted) {
          setIsAuthenticated(true);
          setIsCheckingAuth(false); // Kết thúc kiểm tra ngay
        }
        return;
      }

      // Case 2: Có token + đúng role, nhưng chưa có profile
      // <<< !!! QUAN TRỌNG: Thay 'id' bằng key định danh thực tế !!! >>>
      if (token && userRole === "admin" && !adminProfile?.id) {
        console.log(
          "AdminPrivateRoutes: Case 2 - Token/Role OK, profile missing. Fetching profile..."
        );
        // Chỉ fetch nếu component còn mounted
        if (!isMounted) {
          console.log(
            "AdminPrivateRoutes: Component unmounted before fetching profile."
          );
          return;
        }
        try {
          const response = await Api({
            endpoint: "admin/get-profile",
            method: METHOD_TYPE.GET,
          });

          if (response.success && response.data && isMounted) {
            // <<< !!! QUAN TRỌNG: Thay 'id' bằng key định danh thực tế !!! >>>
            // Kiểm tra xem data trả về có key định danh không
            if (response.data.id) {
              dispatch(setAdminProfile(response.data));
              setIsAuthenticated(true); // Xác thực thành công sau khi fetch
              console.log(
                "AdminPrivateRoutes: Case 2 - Profile fetched & dispatched successfully."
              );
            } else {
              // Dữ liệu profile trả về không hợp lệ
              console.error(
                "AdminPrivateRoutes: Case 2 - Fetched profile data is invalid (missing ID). Clearing cookies.",
                response.data
              );
              Cookies.remove("token");
              Cookies.remove("role");
              setIsAuthenticated(false);
            }
          } else if (isMounted) {
            // Fetch thất bại (vd: token hết hạn)
            console.error(
              "AdminPrivateRoutes: Case 2 - Failed to fetch profile, clearing cookies.",
              response?.message
            );
            Cookies.remove("token");
            Cookies.remove("role");
            setIsAuthenticated(false);
          }
        } catch (error) {
          if (isMounted) {
            console.error(
              "AdminPrivateRoutes: Case 2 - Network/other error fetching profile:",
              error
            );
            Cookies.remove("token");
            Cookies.remove("role");
            setIsAuthenticated(false);
          }
        } finally {
          if (isMounted) {
            console.log("AdminPrivateRoutes: Case 2 - Finished fetch attempt.");
            setIsCheckingAuth(false); // Kết thúc kiểm tra sau khi fetch
          }
        }
        return;
      }

      // Case 3: Không có token / sai role / profile đã fetch nhưng không hợp lệ
      console.log(
        "AdminPrivateRoutes: Case 3 - No token, wrong role, or invalid fetched profile."
      );
      if (isMounted) {
        // Đảm bảo xóa cookie nếu không hợp lệ
        if (!token || userRole !== "admin") {
          Cookies.remove("token");
          Cookies.remove("role");
        }
        setIsAuthenticated(false); // Không xác thực
        setIsCheckingAuth(false); // Kết thúc kiểm tra
      }
    };

    // Chỉ bắt đầu kiểm tra nếu isCheckingAuth đang là true (tránh gọi lại liên tục)
    if (isCheckingAuth) {
      checkAuthentication();
    }

    return () => {
      isMounted = false;
      console.log(
        "AdminPrivateRoutes: Cleanup - Component unmounting or dependencies changed."
      );
    };
    // Chạy lại khi các giá trị cốt lõi thay đổi.
    // Việc thêm adminProfile vào đây là then chốt để nó phản ứng khi Redux cập nhật.
  }, [token, userRole, adminProfile, dispatch, isCheckingAuth]); // Thêm isCheckingAuth để tránh gọi lại checkAuthentication không cần thiết

  // --- Logic Render ---
  if (isCheckingAuth) {
    console.log("AdminPrivateRoutes: Rendering Loading State...");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2em",
          color: "#555",
        }}
      >
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("AdminPrivateRoutes: Rendering Outlet (Authenticated).");
    return <Outlet />;
  } else {
    console.log(
      "AdminPrivateRoutes: Rendering Navigate to /admin/login (Not Authenticated)."
    );
    // Xóa cookie lần nữa cho chắc chắn trước khi redirect
    Cookies.remove("token");
    Cookies.remove("role");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
}

// AdminPrivateRoutes.propTypes = { ... }; // Thêm propTypes nếu cần

export default AdminPrivateRoutes;
