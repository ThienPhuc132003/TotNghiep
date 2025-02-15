import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { fetchMenuData } from "../../redux/menuAdminSlice";

const AdminSidebarComponent = ({ currentPath, openMenus, handleMenuClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const menuData = useSelector((state) => state.menuAdmin.data);
  const role = Cookies.get("role");
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchMenuData());
  }, [dispatch]);

  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  
  const renderMenuItems = (items) => {
    return items.map((item) => {
      const itemPath = item.name
        ? removeDiacritics(item.name.toLowerCase().replace(/ /g, "-"))
        : "";
      const isActive = location.pathname.includes(itemPath);
  
      const hasActiveChild =
        item.children &&
        item.children.some((child) =>
          location.pathname.includes(
            child.name
              ? removeDiacritics(child.name.toLowerCase().replace(/ /g, "-"))
              : ""
          )
        );
  
      if (item.children) {
        return (
          <React.Fragment key={item.name}>
            <li
              key={`${item.name}-parent`}
              className={`menu-item ${isActive ? "active" : ""} ${
                hasActiveChild ? "parent-active" : ""
              }`}
              onClick={() => handleMenuClick(item.name)}
            >
              <a className="menu-item">
                {item.icon && <i className={item.icon}></i>}
                <p className="menu-name">{item.name}</p>
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
            {item.icon && <i className={item.icon}></i>}
            <p className="menu-name">{item.name}</p>
          </Link>
        </li>
      );
    });
  };

  return (
    <div className="sidebar">
      <h1 className="main-logo">Admin</h1>
      <nav className="primary-navigation">
        <ul>
          <li
            className={`menu-item ${
              currentPath === "/admin/dashboard" ? "active" : ""
            }`}
          >
            <Link to="/admin/dashboard">
              <i className="fa-solid fa-house"></i>{" "}
              <p className="menu-name">{t("menu.dashboard")}</p>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className="secondary-navigation">
        <ul>{role === "admin" && renderMenuItems(menuData)}</ul>
      </nav>
    </div>
  );
};

AdminSidebarComponent.propTypes = {
  currentPath: PropTypes.string.isRequired,
  openMenus: PropTypes.object.isRequired,
  handleMenuClick: PropTypes.func.isRequired,
};

const AdminSidebar = React.memo(AdminSidebarComponent);
export default AdminSidebar;