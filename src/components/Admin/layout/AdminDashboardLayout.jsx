import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../Button";
import "../../../assets/css/Admin/AdminDashboardLayout.style.css";
import AdminAccountToolbar from "../../Admin/layout/AdminAccountToolbar";
import { METHOD_TYPE } from "../../../network/methodType";
import Api from "../../../network/Api";

const AdminDashboardLayoutComponent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await Api({
          endpoint: "menu/me",
          method: METHOD_TYPE.GET,
        });
        if (response.success === true) {
          setMenuItems(response.data);
        } else {
          console.error("Failed to fetch menu data:", response.message);
        }
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <h1 className="logo-side-bar">GiaSuVLU</h1>
        <nav className="admin-sidebar-nav">
          <ul>
            <li>
              <Button
                onClick={() => navigate("/admin/dashboard")}
                className={`admin-custom-button ${
                  location.pathname === "/admin/dashboard" ? "active" : ""
                }`}
              >
                Dashboard
              </Button>
            </li>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Button
                  onClick={() => navigate(item.path)}
                  className={`admin-custom-button ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="main-layout">
        <div className="content-area">
          <nav className="admin-navbar">
            <h1>Current path</h1>
            <AdminAccountToolbar
              onEditProfile={() => navigate("/admin/profile")}
              onLogout={() => navigate("/admin/login")}
            />
          </nav>
          <main className="admin-main-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

AdminDashboardLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const AdminDashboardLayout = React.memo(AdminDashboardLayoutComponent);
export default AdminDashboardLayout;