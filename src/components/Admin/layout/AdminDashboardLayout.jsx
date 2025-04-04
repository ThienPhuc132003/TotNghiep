import { useEffect, useMemo } from "react";
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

// Không dùng React.memo ở đây nữa để đảm bảo nó luôn re-render khi Redux thay đổi
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

  // Lấy trạng thái xác thực Admin CHỈ từ Redux store
  const adminProfile = useSelector((state) => state.admin.profile);
  // Kiểm tra trường định danh thực tế trong profile của bạn (ví dụ: id, adminId, email)
  const isAdminAuthenticated = !!adminProfile?.id; // <<< !!! QUAN TRỌNG: Thay 'id' bằng key đúng !!!

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

  // Log trạng thái xác thực mỗi khi layout render lại
  console.log(
    "AdminDashboardLayout Rendering - isAdminAuthenticated:",
    isAdminAuthenticated,
    "Profile:",
    adminProfile
  );

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
          {
            isAdminAuthenticated ? (
              <AdminAccountToolbar currentPath={currentPath} />
            ) : null // Không hiển thị gì nếu chưa đăng nhập
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
  currentPage: PropTypes.string,
};

// Bỏ React.memo để đảm bảo re-render khi Redux thay đổi trong quá trình debug
// const AdminDashboardLayout = React.memo(AdminDashboardLayoutInner);
export default AdminDashboardLayoutInner; // Xuất trực tiếp component
