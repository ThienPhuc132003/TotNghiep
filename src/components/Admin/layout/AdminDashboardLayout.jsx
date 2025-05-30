// src/components/Admin/layout/AdminDashboardLayout.jsx
import { useMemo, useCallback } from "react"; // Thêm useCallback
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "./AdminAccountToolbar";
import AdminSidebar from "../AdminSidebar";
import { useTranslation } from "react-i18next";
import { toggleSidebar } from "../../../redux/uiAdminSlice";
// import { clearAdminProfile } from "../../../redux/adminSlice"; // Nếu có action này

const AdminDashboardLayoutInner = (props) => {
  const {
    children = null,
    childrenMiddleContentLower = null,
    rightChildren = null,
    currentPage,
  } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate(); // Thêm useNavigate

  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const adminProfile = useSelector((state) => state.admin.profile);
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  const adminIdFromProfile = adminProfile?.adminId;
  const hasValidCookies =
    !!Cookies.get("token") && Cookies.get("role") === "admin";
  const isAdminAuthenticated = !!adminIdFromProfile || hasValidCookies;

  // ... (các useEffect khác) ...

  const handleAdminLogout = useCallback(async () => {
    try {
      // Ví dụ: Gọi API logout cho admin
      // await Api({ endpoint: "admin/auth/logout", method: METHOD_TYPE.POST });
      console.log("Admin logout initiated..."); // Placeholder
    } catch (error) {
      console.error("Lỗi API đăng xuất Admin (tiếp tục logout client):", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      // dispatch(clearAdminProfile()); // Nếu có, để xóa thông tin admin khỏi Redux
      navigate("/admin/login"); // Chuyển hướng về trang login của Admin
    }
  }, [navigate]); // Thêm dispatch nếu dùng

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
          {isAdminAuthenticated ? (
            <AdminAccountToolbar
              onLogout={handleAdminLogout} // Truyền hàm logout vào toolbar
              // onEditProfile={() => navigate('/admin/profile')} // Ví dụ nếu có chức năng này
            />
          ) : (
            (console.log("AdminDashboardLayout: Toolbar NOT rendered."), null)
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

export default AdminDashboardLayoutInner; // Không dùng React.memo nếu đang debug, nếu không thì có thể thêm lại
