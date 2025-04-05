// src/components/Admin/layout/AdminDashboardLayout.jsx

import  { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css"; // <-- Đường dẫn đúng
import AdminAccountToolbar from "./AdminAccountToolbar"; // <-- Đường dẫn đúng
import AdminSidebar from "../AdminSidebar"; // <-- Đường dẫn đúng
import { useTranslation } from "react-i18next"; // Nếu dùng
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice"; // <-- Đường dẫn đúng
import { fetchMenuData } from "../../../redux/menuAdminSlice"; // <-- Đường dẫn đúng

// Bỏ React.memo để debug
const AdminDashboardLayoutInner = (props) => {
  const { children = null, currentPage } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const location = useLocation();
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Lấy profile và kiểm tra adminId
  const adminProfile = useSelector((state) => state.admin.profile);
  const adminIdFromProfile = adminProfile?.adminId; // <<< Sử dụng adminId >>>
  const isAdminAuthenticated = !!adminIdFromProfile;

  console.log(
    "AdminDashboardLayout Rendering - isAdminAuthenticated:",
    isAdminAuthenticated,
    "Profile:",
    adminProfile
  );

  // Các useEffect khác giữ nguyên
  useEffect(() => {
    /* resize */
    const handleResize = () =>
      dispatch(setSidebarVisibility(window.innerWidth > 1024));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);
  useEffect(() => {
    /* mobile path change */ if (window.innerWidth <= 1024)
      dispatch(setSidebarVisibility(false));
  }, [location.pathname, dispatch]);
  useEffect(() => {
    /* fetch menu */ dispatch(fetchMenuData());
  }, [dispatch]);

  return (
    <div
      className={`admin-dashboard-layout ${
        isSidebarVisible ? "" : "sidebar-hidden"
      }`}
    >
      <AdminSidebar currentPath={currentPath} />
      <div className="content-area">
        <button
          className="toggle-sidebar-btn"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={isSidebarVisible ? "Ẩn" : "Hiện"}
        >
          <i
            className={`fa-solid ${
              isSidebarVisible ? "fa-chevron-left" : "fa-chevron-right"
            }`}
          ></i>
        </button>
        <div className="main-layout-header">
          <h1 className="current-page">
            {currentPage || t("common.dashboard", "Dashboard")}
          </h1>
          {isAdminAuthenticated ? (
            <AdminAccountToolbar currentPath={currentPath} />
          ) : (
            (console.log(
              "AdminDashboardLayout: Toolbar NOT rendered (checked adminId)."
            ),
            null)
          )}
        </div>
        <div className="main-layout-content">
          {children || <p>{t("common.noContent", "Không có nội dung")}</p>}
        </div>
      </div>
    </div>
  );
};

AdminDashboardLayoutInner.propTypes = {
  children: PropTypes.node,
  currentPage: PropTypes.string,
};

export default AdminDashboardLayoutInner;
