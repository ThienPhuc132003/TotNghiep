import React from "react";
import PropTypes from "prop-types";
import "../../../assets/css/UserDashboardLayout.style.css";
import { METHOD_TYPE } from "../../../network/methodType";
import Api from "../../../network/Api";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../Button";
import Cookies from "js-cookie";
import UserAccountToolbar from "./UserAccountToolbar";
import LoginZoomButton from "../../LoginZoomButton";
const UserDashboardLayoutComponent = (props) => {
  const { children = null } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await Api({
        endpoint: "user/logout",
        method: METHOD_TYPE.POST,
      });
      navigate("/login");
      Cookies.remove("token");
      Cookies.remove("role");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="user-dashboard-layout">
      <header className="header">
        <h1>Online Tutor</h1>
        <nav>
          <ul>
            <li>
              <Button
                onClick={() => navigate("/dashboard")}
                className={`custom-button ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
              >
                Dashboard
              </Button>
            </li>

            <li>
              <Button
                onClick={() => navigate("/register-tutor")}
                className={`custom-button ${
                  location.pathname === "/register-tutor" ? "active" : ""
                }`}
              >
                Register as Tutor
              </Button>
            </li>
            <li>
              <LoginZoomButton />
            </li>
            <UserAccountToolbar
              onEditProfile={() => navigate("/user/profile")}
              onLogout={handleLogout}
            />
          </ul>
        </nav>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>&copy; 2025 Online Tutor. All rights reserved.</p>
      </footer>
    </div>
  );
};

UserDashboardLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const UserDashboardLayout = React.memo(UserDashboardLayoutComponent);
export default UserDashboardLayout;
