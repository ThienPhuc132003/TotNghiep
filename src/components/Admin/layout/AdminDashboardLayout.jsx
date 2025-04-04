import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "./AdminAccountToolbar";
import AdminSidebar from "../AdminSidebar";
import { useTranslation } from "react-i18next";
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice";
import { fetchMenuData } from "../../../redux/menuAdminSlice";

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

  // --- Lấy và Log Profile ---
  const adminProfile = useSelector((state) => state.admin.profile);
  // <<< !!! QUAN TRỌNG: Thay 'id' bằng key định danh thực tế (vd: _id, adminId, email) !!! >>>
  const adminIdFromProfile = adminProfile?.id;
  const isAdminAuthenticated = !!adminIdFromProfile;

  console.log(
    "AdminDashboardLayout Rendering - isAdminAuthenticated:",
    isAdminAuthenticated,
    "- Profile from Redux:",
    adminProfile,
    "- Extracted ID:",
    adminIdFromProfile
  );
  // ---

  useEffect(() => {
    const handleResize = () => {
      dispatch(setSidebarVisibility(window.innerWidth > 1024));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      dispatch(setSidebarVisibility(false));
    }
  }, [location.pathname, dispatch]);

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

          {/* Render AdminAccountToolbar dựa trên state Redux */}
          {isAdminAuthenticated ? (
            <AdminAccountToolbar currentPath={currentPath} />
          ) : (
            // Thêm log ở đây để biết tại sao không render
            (console.log(
              "AdminDashboardLayout: Toolbar NOT rendered because isAdminAuthenticated is false."
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

// Xuất trực tiếp component (không dùng memo để debug)
export default AdminDashboardLayoutInner;
