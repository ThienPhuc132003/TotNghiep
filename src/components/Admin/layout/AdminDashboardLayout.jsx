import React, { useEffect, useMemo } from "react";
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
import { fetchMenuData } from "../../../redux/menuAdminSlice"; // Import fetchMenuData

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        dispatch(setSidebarVisibility(false));
      } else {
        dispatch(setSidebarVisibility(true));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
        >
          {isSidebarVisible ? "⟩" : "⟨"}
        </button>
        <div className="main-layout-header">
          <h1 className="current-page">{currentPage}</h1>
          <AdminAccountToolbar currentPath={currentPath} />
        </div>
        <div className="main-layout-content">
          <div className="main-layout-left">
            {children ? (
              <>
                {children}
                {childrenMiddleContentLower}
              </>
            ) : (
              <p>{t("common.noContent")}</p>
            )}
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

const AdminDashboardLayout = React.memo(AdminDashboardLayoutInner);
export default AdminDashboardLayout;