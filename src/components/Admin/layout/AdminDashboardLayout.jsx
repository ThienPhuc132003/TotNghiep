// src/components/Admin/layout/AdminDashboardLayout.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "./AdminAccountToolbar";
import AdminSidebar from "../AdminSidebar";
import { fetchMenuData } from "../../../redux/menuAdminSlice";
import { useTranslation } from "react-i18next";
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice";

const AdminDashboardLayoutComponent = (props) => {
  const {
    children = null,
    childrenMiddleContentLower = null,
    rightChildren = null,
    currentPage,
  } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const menuStatus = useSelector((state) => state.menuAdmin.status);
  const menuData = useSelector((state) => state.menuAdmin.data);
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const location = useLocation();
  const currentPath = location.pathname;

  const [openMenus, setOpenMenus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (menuStatus === "idle") {
      setIsLoading(true);
      dispatch(fetchMenuData())
        .then(() => setIsLoading(false))
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [menuStatus, dispatch]);

  useEffect(() => {
    const savedOpenMenus = JSON.parse(localStorage.getItem("openMenus"));
    if (savedOpenMenus) {
      setOpenMenus(savedOpenMenus);
    } else {
      const initialOpenMenus = {};
      menuData?.forEach((menu) => {
        initialOpenMenus[menu.name_en] = false;
      });
      setOpenMenus(initialOpenMenus);
    }
  }, [menuData]);

  const handleMenuClick = (menuName) => {
    setOpenMenus((prevOpenMenus) => {
      const newOpenMenus = { ...prevOpenMenus };
      if (newOpenMenus[menuName]) {
        delete newOpenMenus[menuName];
      } else {
        newOpenMenus[menuName] = true;
      }
      localStorage.setItem("openMenus", JSON.stringify(newOpenMenus));
      return newOpenMenus;
    });
  };

  return (
    <div
      className={`admin-dashboard-layout ${
        isSidebarVisible ? "" : "sidebar-hidden"
      }`}
    >
      <AdminSidebar currentPath={currentPath} openMenus={openMenus} handleMenuClick={handleMenuClick} />
      <div className="content-area">
        <button
          className="toggle-sidebar-btn"
          onClick={() => dispatch(toggleSidebar())}
        >
          {isSidebarVisible ? "⟨" : "⟩"}
        </button>
        <div className="main-layout-header">
          <h1 className="current-page">{currentPage}</h1>
          <AdminAccountToolbar currentPath={currentPath} />
        </div>
        <div className="main-layout-content">
          <div className="main-layout-left">
            {isLoading ? (
              <p>{t("common.loading")}</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <>
                {children}
                {childrenMiddleContentLower}
              </>
            )}
          </div>
          <div className="main-layout-right">{rightChildren}</div>
        </div>
      </div>
    </div>
  );
};

AdminDashboardLayoutComponent.propTypes = {
  children: PropTypes.node,
  childrenMiddleContentLower: PropTypes.node,
  rightChildren: PropTypes.node,
  currentPage: PropTypes.string,
};

const AdminDashboardLayout = React.memo(AdminDashboardLayoutComponent);
export default AdminDashboardLayout;