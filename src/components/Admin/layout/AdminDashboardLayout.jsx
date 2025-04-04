import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom"; // Thêm Link nếu cần
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css"; // Đảm bảo CSS tồn tại
import AdminAccountToolbar from "./AdminAccountToolbar"; // Đảm bảo component này tồn tại
import AdminSidebar from "../AdminSidebar"; // Đảm bảo component này tồn tại
import { useTranslation } from "react-i18next"; // Nếu dùng i18n
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice"; // Đảm bảo slice này tồn tại
import { fetchMenuData } from "../../../redux/menuAdminSlice"; // Đảm bảo slice này tồn tại

const AdminDashboardLayoutInner = (props) => {
  const {
    children = null,
    childrenMiddleContentLower = null,
    rightChildren = null,
    currentPage, // Nhận currentPage từ props
  } = props;

  const { t } = useTranslation(); // Nếu dùng i18n
  const dispatch = useDispatch();
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const location = useLocation();
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // --- Lấy trạng thái xác thực Admin từ Redux store ---
  // Đảm bảo state.admin.profile là đường dẫn đúng trong store của bạn
  const adminProfile = useSelector((state) => state.admin.profile);
  // Kiểm tra một trường cụ thể trong profile, ví dụ: id, adminId, email
  const isAdminAuthenticated = !!adminProfile?.id; // Thay 'id' bằng trường định danh thực tế

  useEffect(() => {
    const handleResize = () => {
      dispatch(setSidebarVisibility(window.innerWidth > 1024));
    };
    handleResize(); // Gọi lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    // Tự động ẩn sidebar trên mobile khi chuyển trang
    if (window.innerWidth <= 1024) {
      dispatch(setSidebarVisibility(false));
    }
  }, [location.pathname, dispatch]);

  useEffect(() => {
    // Fetch menu data nếu cần
    dispatch(fetchMenuData());
  }, [dispatch]);

  return (
    <div
      className={`admin-dashboard-layout ${
        isSidebarVisible ? "" : "sidebar-hidden"
      }`}
    >
      {/* Sidebar luôn hiển thị trên desktop nếu isSidebarVisible, ẩn hoàn toàn trên mobile nếu false */}
      <AdminSidebar currentPath={currentPath} />

      <div className="content-area">
        {/* Nút toggle sidebar chỉ hiển thị trên mobile hoặc khi sidebar ẩn */}
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
          {/* Hiển thị currentPage được truyền vào */}
          <h1 className="current-page">
            {currentPage || t("common.dashboard", "Dashboard")}
          </h1>

          {/* Render AdminAccountToolbar dựa trên state Redux */}
          {
            isAdminAuthenticated ? (
              <AdminAccountToolbar currentPath={currentPath} />
            ) : null // Không hiển thị gì nếu chưa đăng nhập trên dashboard
          }
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
  currentPage: PropTypes.string, // Thêm propType
};

const AdminDashboardLayout = React.memo(AdminDashboardLayoutInner);
export default AdminDashboardLayout;
