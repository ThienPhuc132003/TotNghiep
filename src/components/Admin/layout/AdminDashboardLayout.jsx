// src/components/Admin/layout/AdminDashboardLayout.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { fetchMenuData } from "../../../redux/menuAdminSlice";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "./AdminAccountToolbar";
import PropTypes from "prop-types";
const AdminDashboardPage = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const menuData = useSelector((state) => state.menuAdmin.data);
  const menuStatus = useSelector((state) => state.menuAdmin.status);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    if (menuStatus === "idle") {
      dispatch(fetchMenuData());
    }
  }, [menuStatus, dispatch]);

  useEffect(() => {
    const savedOpenMenus = JSON.parse(localStorage.getItem("openMenus"));
    if (savedOpenMenus) {
      setOpenMenus(savedOpenMenus);
    } else {
      const initialOpenMenus = {};
      menuData.forEach((menu) => {
        initialOpenMenus[menu.name] = false;
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
  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const renderMenuItems = (items) => {
    return items.map((item) => {
      const itemName = item.name;
      const itemPath = removeDiacritics(
        item.name?.toLowerCase().replace(/ /g, "-")
      );
      const isActive = location.pathname.includes(itemPath);

      const hasActiveChild =
        item.children &&
        item.children.some((child) =>
          location.pathname.includes(
            child.name?.toLowerCase().replace(/ /g, "-")
          )
        );

      if (item.children && item.isCollapsed) {
        return (
          <React.Fragment key={item.name}>
            <li
              key={item.name}
              className={`menu-item ${
                isActive || hasActiveChild ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item.name)}
            >
              <a className="menu-item">
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
            <p className="menu-name">{itemName}</p>
          </Link>
        </li>
      );
    });
  };

  return (
    <div className="admin-dashboard-layout">
      <div className="sidebar">
        <h1 className="main-logo">Admin</h1>
        <nav className="primary-navigation">
          <ul>{renderMenuItems(menuData)}</ul>
        </nav>
      </div>
      <div className="admin-dashboard-content">
        <header className="admin-header">
          <h2>Welcome to the Admin Dashboard</h2>
          <AdminAccountToolbar />
        </header>
        <main className="admin-main-content">{children}</main>
      </div>
    </div>
  );
};

AdminDashboardPage.propTypes = {  
  children: PropTypes.node.isRequired,
};
const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;
