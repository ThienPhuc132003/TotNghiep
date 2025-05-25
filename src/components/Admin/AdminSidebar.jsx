import React, { useCallback, useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import "../../assets/css/Admin/AdminSidebar.style.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuData } from "../../redux/menuAdminSlice"; // Import fetchMenuData
import { setSidebarVisibility, toggleSubmenu } from "../../redux/uiAdminSlice";
import SideBarBackGround from "../../assets/images/vanlang_background5.jpg";
import Logo from "../../assets/images/logo_white.webp";

const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const MenuItem = React.memo(function MenuItem({ item, pathname }) {
  const itemPath = useMemo(() => {
    return item.name
      ? removeDiacritics(item.name.toLowerCase().replace(/ /g, "-"))
      : "";
  }, [item.name]);

  const isActive = useMemo(
    () => pathname === `/admin/${itemPath}`, // Thay đổi logic kiểm tra active
    [pathname, itemPath]
  );
  const dispatch = useDispatch();
  const openMenus = useSelector((state) => state.ui.openMenus);
  const isSubmenuOpen = openMenus[item.name] || false;
  const navigate = useNavigate();

  const navigatePage = useCallback(
    (e) => {
      e.preventDefault();
      navigate(`/admin/${itemPath}`);
    },
    [navigate, itemPath]
  );

  const hasActiveChild = useMemo(() => {
    if (!item.children) return false;
    return item.children.some((child) => {
      const childPath = child.name
        ? removeDiacritics(child.name.toLowerCase().replace(/ /g, "-"))
        : "";
      return pathname === `/admin/${childPath}`; // Thay đổi logic kiểm tra active
    });
  }, [item.children, pathname]);

  const toggleThisSubMenu = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(toggleSubmenu({ menuName: item.name }));
    },
    [dispatch, item.name]
  );

  if (item.children) {
    return (
      <React.Fragment key={item.name}>
        <li
          className={`menu-item ${isActive ? "active" : ""} ${
            hasActiveChild ? "parent-active" : ""
          }`}
          onClick={(e) => toggleThisSubMenu(e)}
        >
          <a className="menu-item" href="#">
            <div className="menu-item-content">
              {item.icon && <i className={item.icon}></i>}
              <p className="menu-name">{item.name}</p>
            </div>
            <span className={`submenu-arrow ${isSubmenuOpen ? "open" : ""}`}>
              ▲
            </span>
          </a>
        </li>
        <ul className={`submenu ${isSubmenuOpen ? "open" : ""}`}>
          {item.children.map((child) => (
            <MenuItem key={child.name} item={child} pathname={pathname} />
          ))}
        </ul>
      </React.Fragment>
    );
  }

  return (
    <li key={item.name} className={`menu-item ${isActive ? "active" : ""}`}>
      <a onClick={navigatePage}>
        {" "}
        {/* Chỉnh sửa lại đường link */}
        <div className="menu-item-content">
          {item.icon && <i className={item.icon}></i>}
          <p className="menu-name">{item.name}</p>
        </div>
      </a>
    </li>
  );
});

MenuItem.propTypes = {
  item: PropTypes.object.isRequired,
  pathname: PropTypes.string.isRequired,
};

const AdminSidebarComponent = ({ currentPath }) => {
  const dispatch = useDispatch();
  const menuStatus = useSelector((state) => state.menuAdmin.status);
  const menuData = useSelector((state) => state.menuAdmin.data);
  const isSidebarVisible = useSelector((state) => state.ui.isSidebarVisible);
  const { t } = useTranslation();
  const role = Cookies.get("role");
  const location = useLocation();
  const pathname = useMemo(() => location.pathname, [location.pathname]);
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

  const toggleSidebar = () => {
    dispatch(setSidebarVisibility(!isSidebarVisible));
  };

  const menuItems = useMemo(() => {
    return menuData.map((item) => (
      <MenuItem key={item.name} item={item} pathname={pathname} />
    ));
  }, [menuData, pathname]);

  return (
    <div className={`sidebar ${!isSidebarVisible ? "sidebar-hidden" : ""}`}>
      {" "}
      <img className="SideBarBackGround" src={SideBarBackGround} />
      <div className="BlurMask" />
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="sidebar-logo" />
        <h1 className="main-logo">GiaSuVLU</h1>
      </div>{" "}
      <nav className="primary-navigation">
        <ul>
          <li
            className={`menu-item ${
              currentPath === "/admin/dashboard" ? "active" : ""
            }`}
          >
            <Link to="/admin/dashboard">
              <div className="menu-item-content">
                <i className="fa-solid fa-house"></i>
                <p className="menu-name">{t("menu.dashboard")}</p>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className="secondary-navigation">
        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <ul>{role === "admin" && menuItems}</ul>
        )}
      </nav>
      <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
        {isSidebarVisible ? "⟩" : "⟨"}
      </button>
    </div>
  );
};

AdminSidebarComponent.propTypes = {
  currentPath: PropTypes.string.isRequired,
};

const AdminSidebar = React.memo(AdminSidebarComponent);
export default AdminSidebar;
