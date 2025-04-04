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
  const {
    children = null,
    childrenMiddleContentLower = null,
    rightChildren = null,
    currentPage,
  } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const location = useLocation();
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Lấy và Log Profile (sử dụng adminId)
  const adminProfile = useSelector((state) => state.admin.profile);
  const adminIdFromProfile = adminProfile?.adminId; // <<< SỬA Ở ĐÂY >>>
  const isAdminAuthenticated = !!adminIdFromProfile;

  console.log(
    "AdminDashboardLayout Rendering - isAdminAuthenticated:",
    isAdminAuthenticated,
    "- Profile from Redux:",
    adminProfile,
    "- Extracted adminId:",
    adminIdFromProfile
  );

  // Effect xử lý resize
  useEffect(() => {
    const handleResize = () =>
      dispatch(setSidebarVisibility(window.innerWidth > 1024));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // Effect ẩn sidebar mobile khi chuyển trang
  useEffect(() => {
    if (window.innerWidth <= 1024) dispatch(setSidebarVisibility(false));
  }, [location.pathname, dispatch]);

  // Effect fetch menu data
  useEffect(() => {
    dispatch(fetchMenuData());
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
          aria-label={isSidebarVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}
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

          {/* Render Toolbar dựa trên state Redux (đã kiểm tra adminId) */}
          {isAdminAuthenticated ? (
            <AdminAccountToolbar currentPath={currentPath} />
          ) : (
            (console.log(
              "AdminDashboardLayout: Toolbar NOT rendered because isAdminAuthenticated is false (checked adminId)."
            ),
            null)
          )}
        </div>
        <div className="main-layout-content">
          <div className="main-layout-left">
            {children || <p>{t("common.noContent", "Không có nội dung")}</p>}
            {childrenMiddleContentLower}
          </div>
          {rightChildren && (
            <div className="main-layout-right">{rightChildren}</div>
          )}
        </div>
      </div>
    </div>
  );
};

AdminDashboardLayoutInner.propTypes = {
  children: PropTypes.node,
  childrenMiddleContentLower: PropTypes.node,
  rightChildren: PropTypes.node,
  currentPage: PropTypes.string,
};

export default AdminDashboardLayoutInner;
