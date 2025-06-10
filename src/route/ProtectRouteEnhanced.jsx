// Enhanced ProtectRoute that supports both roleId and roles array
import { memo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

// Define roles (must match roleId from API after toUpperCase)
const ROLES = {
  USER: "USER",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN",
};

const ProtectRouteEnhanced = ({ role: requiredRole }) => {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userProfile = useSelector((state) => state.user.userProfile);

  console.log(`[ProtectRouteEnhanced] Path: ${location.pathname}`);
  console.log(`[ProtectRouteEnhanced] isAuthenticated:`, isAuthenticated);
  console.log(`[ProtectRouteEnhanced] userProfile:`, userProfile);
  console.log(`[ProtectRouteEnhanced] Required Role:`, requiredRole);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log(
      `[ProtectRouteEnhanced] Not authenticated. Redirecting to login.`
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no role required, allow access
  if (!requiredRole) {
    console.log(`[ProtectRouteEnhanced] No role required. Access granted.`);
    return <Outlet />;
  }

  // Check user role with enhanced logic
  let hasRequiredRole = false;

  if (userProfile) {
    // Method 1: Check roles array (modern approach)
    if (userProfile.roles && Array.isArray(userProfile.roles)) {
      console.log(
        `[ProtectRouteEnhanced] Checking roles array:`,
        userProfile.roles
      );
      hasRequiredRole = userProfile.roles.some((role) => {
        const roleName = role.name?.toUpperCase();
        return roleName === requiredRole;
      });
      console.log(
        `[ProtectRouteEnhanced] Role found in array:`,
        hasRequiredRole
      );
    }

    // Method 2: Check roleId field (fallback)
    if (!hasRequiredRole && userProfile.roleId) {
      const roleIdFromProfile = String(userProfile.roleId).toUpperCase();
      console.log(`[ProtectRouteEnhanced] Checking roleId:`, roleIdFromProfile);
      hasRequiredRole = roleIdFromProfile === requiredRole;
      console.log(
        `[ProtectRouteEnhanced] Role matches roleId:`,
        hasRequiredRole
      );
    }
  }

  console.log(
    `[ProtectRouteEnhanced] Final role check result:`,
    hasRequiredRole
  );

  if (!hasRequiredRole) {
    console.warn(
      `[ProtectRouteEnhanced] Access Denied: User does not have required role "${requiredRole}". Redirecting to /trang-chu.`
    );
    return <Navigate to="/trang-chu" replace />;
  }

  console.log(`[ProtectRouteEnhanced] Access GRANTED. Rendering component.`);
  return <Outlet />;
};

ProtectRouteEnhanced.propTypes = {
  role: PropTypes.oneOf(Object.values(ROLES)),
};

export default memo(ProtectRouteEnhanced);
