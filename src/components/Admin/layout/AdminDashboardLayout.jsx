// src/components/Admin/layout/AdminDashboardLayout.jsx

import { useEffect, useMemo } from "react"; // Giữ lại React nếu dùng Fragment hoặc các tính năng khác
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie"; // Import Cookies để kiểm tra xác thực
import "../../../assets/css/Admin/AdminDashboardLayout.style.css"; // <-- Import CSS cho layout này
import AdminAccountToolbar from "./AdminAccountToolbar"; // <-- Toolbar tài khoản
import AdminSidebar from "../AdminSidebar"; // <-- Sidebar
import { useTranslation } from "react-i18next"; // Nếu dùng đa ngôn ngữ
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice"; // <-- Action cho UI Redux
import { fetchMenuData } from "../../../redux/menuAdminSlice"; // <-- Action cho Menu Redux

const AdminDashboardLayoutInner = (props) => {
  // Destructure props
  const {
    children = null, // Nội dung chính (ví dụ: trang DashboardPage)
    childrenMiddleContentLower = null, // Nội dung phụ dưới nội dung chính (trong cột trái)
    rightChildren = null, // Nội dung cho cột phải (nếu có)
    currentPage, // Tiêu đề trang hiện tại
  } = props;

  // Hooks
  const { t } = useTranslation(); // Hook đa ngôn ngữ
  const dispatch = useDispatch(); // Hook để gửi action Redux
  const location = useLocation(); // Hook lấy thông tin route hiện tại

  // Lấy state từ Redux
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible); // Trạng thái ẩn/hiện sidebar
  const adminProfile = useSelector((state) => state.admin.profile); // Thông tin profile admin

  // Tính toán giá trị memoized
  const currentPath = useMemo(() => location.pathname, [location.pathname]); // Lấy path hiện tại, chỉ tính lại khi path thay đổi

  // --- Logic kiểm tra Authentication ---
  const adminIdFromProfile = adminProfile?.adminId; // Lấy adminId từ profile trong Redux
  const hasValidCookies =
    !!Cookies.get("token") && Cookies.get("role") === "admin"; // Kiểm tra cookie
  const isAdminAuthenticated = !!adminIdFromProfile || hasValidCookies; // Xác thực nếu có profile ID hoặc cookie hợp lệ

  // Log để debug (có thể xóa/comment sau)
  console.log(
    "AdminDashboardLayout Rendering:",
    "- adminIdFromProfile:",
    adminIdFromProfile,
    "- hasValidCookies:",
    hasValidCookies,
    "- isAdminAuthenticated (final):",
    isAdminAuthenticated
  );

  // --- Side Effects ---

  // Effect xử lý thay đổi kích thước cửa sổ để ẩn/hiện sidebar tự động
  useEffect(() => {
    const handleResize = () =>
      dispatch(setSidebarVisibility(window.innerWidth > 1024));
    handleResize(); // Gọi lần đầu khi component mount
    window.addEventListener("resize", handleResize);
    // Cleanup: Gỡ bỏ event listener khi component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]); // Chỉ chạy lại nếu dispatch thay đổi (thường là không đổi)

  // Effect ẩn sidebar trên mobile khi chuyển trang
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      dispatch(setSidebarVisibility(false));
    }
  }, [location.pathname, dispatch]); // Chạy lại khi location.pathname hoặc dispatch thay đổi

  // Effect fetch dữ liệu menu cho sidebar (chỉ chạy 1 lần)
  useEffect(() => {
    dispatch(fetchMenuData());
  }, [dispatch]); // Chỉ chạy lại nếu dispatch thay đổi

  // --- Render JSX ---
  return (
    // Container layout chính, thêm class khi sidebar ẩn
    <div
      className={`admin-dashboard-layout ${
        isSidebarVisible ? "" : "sidebar-hidden"
      }`}
    >
      {/* Component Sidebar */}
      <AdminSidebar currentPath={currentPath} />
      {/* Khu vực nội dung chính (bên phải sidebar) */}
      <div className="content-area">
        {/* Nút để toggle sidebar (hiện/ẩn) */}
        <button
          className="toggle-sidebar-btn"
          onClick={() => dispatch(toggleSidebar())} // Gọi action toggle
          aria-label={isSidebarVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}
        >
          {/* Icon thay đổi dựa trên trạng thái sidebar */}
          <i
            className={`fa-solid ${
              isSidebarVisible ? "fa-chevron-left" : "fa-chevron-right"
            }`}
          ></i>
        </button>

        {/* Header của khu vực nội dung */}
        <div className="main-layout-header">
          {/* Tiêu đề trang hiện tại */}
          <h1 className="current-page">
            {currentPage || t("common.dashboard", "Dashboard")}
          </h1>

          {/* Toolbar tài khoản, chỉ hiển thị nếu đã xác thực */}
          {isAdminAuthenticated ? (
            <AdminAccountToolbar currentPath={currentPath} />
          ) : (
            // Log khi không hiển thị toolbar (có thể xóa)
            (console.log("AdminDashboardLayout: Toolbar NOT rendered."), null)
          )}
        </div>

        {/* Phần thân chứa nội dung chính */}
        <div className="main-layout-content">
          {/* Cột nội dung bên trái */}
          <div className="main-layout-left">
            {/* Render nội dung chính được truyền vào qua prop 'children' */}
            {children || <p>{t("common.noContent", "Không có nội dung")}</p>}
            {/* Render nội dung phụ (nếu có) được truyền qua prop 'childrenMiddleContentLower' */}
            {childrenMiddleContentLower}
          </div>

          {/* Cột nội dung bên phải (chỉ render nếu có prop 'rightChildren') */}
          {rightChildren && (
            <div className="main-layout-right">{rightChildren}</div>
          )}
        </div>
      </div>{" "}
      {/* Kết thúc .content-area */}
    </div> // Kết thúc .admin-dashboard-layout
  );
};

// Định nghĩa PropTypes để kiểm tra kiểu dữ liệu của props
AdminDashboardLayoutInner.propTypes = {
  children: PropTypes.node, // Nội dung chính
  childrenMiddleContentLower: PropTypes.node, // Nội dung phụ dưới
  rightChildren: PropTypes.node, // Nội dung cột phải
  currentPage: PropTypes.string, // Tiêu đề trang
};

// Export component (không dùng React.memo nếu đang debug)
export default AdminDashboardLayoutInner;
