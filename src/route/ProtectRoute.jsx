// src/route/ProtectRoute.jsx
import { memo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types"; // Nên thêm PropTypes

// Định nghĩa các vai trò (phải khớp với roleId từ API sau khi toUpperCase)
const ROLES = {
  USER: "USER",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN", // Nếu bạn có vai trò admin
};

const ProtectRoute = ({ role: requiredRole }) => {
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userProfile = useSelector((state) => state.user.userProfile);

  console.log(`[ProtectRoute] Path: ${location.pathname}`);
  console.log(`[ProtectRoute] isAuthenticated (from Redux):`, isAuthenticated);
  console.log(`[ProtectRoute] userProfile (from Redux):`, userProfile);
  console.log(`[ProtectRoute] Required Role for this route:`, requiredRole);

  if (!isAuthenticated) {
    console.log(
      `[ProtectRoute] User NOT Authenticated. Redirecting to /login. Original location state:`,
      { from: location }
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    let currentUserRole = null;
    if (userProfile && userProfile.roleId) {
      const roleIdFromProfile = String(userProfile.roleId).toUpperCase();
      // Kiểm tra xem roleIdFromProfile có phải là một trong các giá trị của ROLES không
      if (Object.values(ROLES).includes(roleIdFromProfile)) {
        currentUserRole = roleIdFromProfile;
      } else {
        console.warn(
          `[ProtectRoute] Unknown roleId from profile: '${userProfile.roleId}'. Treating as no specific role.`
        );
      }
    } else {
      console.warn(
        "[ProtectRoute] UserProfile is missing or does not have a roleId. Cannot verify role."
      );
    }

    console.log(
      "[ProtectRoute] Determined Current User Role:",
      currentUserRole
    );

    if (currentUserRole !== requiredRole) {
      console.warn(
        `[ProtectRoute] Access Denied: User role "${currentUserRole}" does not match required role "${requiredRole}". Redirecting to /trang-chu.`
      );
      return <Navigate to="/trang-chu" replace />;
    }
  }

  console.log("[ProtectRoute] Access GRANTED for path. Rendering <Outlet />.");
  return <Outlet />;
};

ProtectRoute.propTypes = {
  role: PropTypes.oneOf(Object.values(ROLES)), // role có thể là một trong các giá trị của ROLES hoặc undefined
};

export default memo(ProtectRoute);
