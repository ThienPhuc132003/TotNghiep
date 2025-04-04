// src/routes/AdminPrivateRoutes.jsx

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setAdminProfile } from "../redux/adminSlice"; // <-- Đường dẫn đúng
import Api from "../network/Api"; // <-- Đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // <-- Đường dẫn đúng


function AdminPrivateRoutes() {
  const dispatch = useDispatch();
  const location = useLocation();

  const adminProfile = useSelector((state) => state.admin.profile);
  const token = Cookies.get("token");
  const userRole = Cookies.get("role");

  // State để quản lý việc kiểm tra/load profile ban đầu
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

      // Case 1: Đã có profile + đúng role (sử dụng adminId)
      if (adminProfile?.adminId && userRole === "admin") {
        console.log(
          "AdminPrivateRoutes: Case 1 - Profile in Redux (adminId check) & role OK."
        );
        if (isMounted) {
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
        }
        return;
      }

      // Case 2: Có token + đúng role, nhưng chưa có profile (sử dụng adminId)
      if (token && userRole === "admin" && !adminProfile?.adminId) {
        console.log(
          "AdminPrivateRoutes: Case 2 - Token/Role OK, profile missing (adminId check). Fetching profile..."
        );
        if (!isMounted) return;
        try {
          const response = await Api({
            endpoint: "admin/get-profile",
            method: METHOD_TYPE.GET,
          });

          if (response.success && response.data && isMounted) {
            // Kiểm tra adminId trong data trả về
            if (response.data.adminId) {
              dispatch(setAdminProfile(response.data));
              setIsAuthenticated(true);
              console.log(
                "AdminPrivateRoutes: Case 2 - Profile fetched & dispatched successfully (checked adminId)."
              );
            } else {
              console.error(
                "AdminPrivateRoutes: Case 2 - Fetched profile data missing adminId. Clearing cookies.",
                response.data
              );
              Cookies.remove("token");
              Cookies.remove("role");
              setIsAuthenticated(false);
            }
          } else if (isMounted) {
            console.error(
              "AdminPrivateRoutes: Case 2 - Failed fetch profile, clearing cookies.",
              response?.message
            );
            Cookies.remove("token");
            Cookies.remove("role");
            setIsAuthenticated(false);
          }
        } catch (error) {
          if (isMounted) {
            console.error(
              "AdminPrivateRoutes: Case 2 - Error fetching profile:",
              error
            );
            Cookies.remove("token");
            Cookies.remove("role");
            setIsAuthenticated(false);
          }
        } finally {
          if (isMounted) {
            console.log("AdminPrivateRoutes: Case 2 - Finished fetch attempt.");
            setIsCheckingAuth(false);
          }
        }
        return;
      }

      // Case 3: Không hợp lệ
      console.log("AdminPrivateRoutes: Case 3 - Conditions not met.");
      if (isMounted) {
        if (!token || userRole !== "admin") {
          Cookies.remove("token");
          Cookies.remove("role");
        }
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    // Chỉ bắt đầu kiểm tra nếu isCheckingAuth đang là true
    if (isCheckingAuth) {
      checkAuthentication();
    }

    return () => {
      isMounted = false;
      console.log("AdminPrivateRoutes: Cleanup.");
    };
  }, [token, userRole, adminProfile, dispatch, isCheckingAuth]);

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
        Đang kiểm tra quyền truy cập Admin...
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
    Cookies.remove("token");
    Cookies.remove("role");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
}

// Thêm PropTypes nếu component cha truyền props (hiện tại không có)
// AdminPrivateRoutes.propTypes = {};

export default AdminPrivateRoutes;
