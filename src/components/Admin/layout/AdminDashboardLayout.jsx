import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "./AdminAccountToolbar";
import { fetchMenuData } from "../../../redux/menuAdminSlice";
import { useTranslation } from "react-i18next";
import {
  setSidebarVisibility,
  toggleSidebar,
} from "../../../redux/uiAdminSlice";
import Cookies from "js-cookie";

const AdminDashboardLayoutComponent = (props) => {
  const {
    children = null,
    childrenMiddleContentLower = null,
    rightChildren = null,
    currentPath,
    currentPage,
  } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const menuData = useSelector((state) => state.menuAdmin.data);
  const menuStatus = useSelector((state) => state.menuAdmin.status);
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const location = useLocation();
  const role = Cookies.get("role");

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

  useEffect(() => {
    const savedOpenMenus = JSON.parse(localStorage.getItem("openMenus"));
    if (savedOpenMenus) {
      setOpenMenus(savedOpenMenus);
    } else {
      const initialOpenMenus = {};
      menuData.forEach((menu) => {
        initialOpenMenus[menu.name_en] = false;
      });
      setOpenMenus(initialOpenMenus);
    }
  }, [menuData]);

  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const renderMenuItems = (items) => {
    return items.map((item) => {
      const itemName = item.name;
      const itemPath = item.name
        ? removeDiacritics(item.name.toLowerCase().replace(/ /g, "-"))
        : "";
      const isActive = location.pathname.includes(itemPath);

      const hasActiveChild =
        item.children &&
        item.children.some((child) =>
          location.pathname.includes(
            child.name ? child.name.toLowerCase().replace(/ /g, "-") : ""
          )
        );

      if (item.children && item.isCollapsed) {
        return (
          <React.Fragment key={item.name}>
            <li
              key={`${item.name}-parent`}
              className={`menu-item ${
                isActive || hasActiveChild ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item.name)}
            >
              <a className="menu-item">
                {item.icon && (
                  <img src={item.icon} alt={itemName} className="menu-icon" />
                )}
                <p className="menu-name">{itemName}</p>
              </a>
            </li>
            {openMenus[item.name] && (
              <ul className="submenu">{renderMenuItems(item.children)}</ul>
            )}
          </React.Fragment>
        );
      }

      return (
        <li key={item.name} className={`menu-item ${isActive ? "active" : ""}`}>
          <Link to={`/${itemPath}`}>
            {item.icon && (
              <img src={item.icon} alt={itemName} className="menu-icon" />
            )}
            <p className="menu-name">{itemName}</p>
          </Link>
        </li>
      );
    });
  };

  return (
    <div
      className={`admin-dashboard-layout ${
        isSidebarVisible ? "" : "sidebar-hidden"
      }`}
    >
      {/* Sidebar */}
      <div className="sidebar">
        <h1 className="main-logo">Admin</h1>
        <nav className="primary-navigation">
          <ul>
            <li className={currentPath === "/admin/dashboard" ? "active" : ""}>
              <Link to="/admin/dashboard">
                <i className="fa-solid fa-house"></i>{" "}
                <p className="menu-name">{t("menu.dashboard")}</p>
              </Link>
            </li>
          </ul>
        </nav>
        <hr className="main-layout-divider" />
        <nav className="secondary-navigation">
          <ul>{role === "admin" && renderMenuItems(menuData)}</ul>
        </nav>
      </div>
      {/* Content Area */}
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
          {rightChildren && (
            <div className="main-layout-right">{rightChildren}</div>
          )}
        </div>
      </div>
    </div>
  );
};

AdminDashboardLayoutComponent.propTypes = {
  children: PropTypes.node,
  childrenMiddleContentLower: PropTypes.node,
  rightChildren: PropTypes.node,
  currentPath: PropTypes.string,
  currentPage: PropTypes.string,
};

const AdminDashboardLayout = React.memo(AdminDashboardLayoutComponent);
export default AdminDashboardLayout;