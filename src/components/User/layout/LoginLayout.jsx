import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import "../../../assets/css/LoginLayout.style.css";
import logo from "../../../assets/images/logo.png";

const LoginLayoutComponent = (props) => {
  const { children = null } = props;
  const location = useLocation();

  return (
    <div className="login-layout">
      <hearder className="home-page-header">
        <img src={logo} alt="logo" className="logo" />
        <div className="home-page-menu">
          <Link className="home-page-menu-item">Về chúng tôi</Link>
          <Link className="home-page-menu-item">Đăng ký trở thành gia sư</Link>
          <Link className="home-page-menu-item">Trợ giúp</Link>
        </div>
        <div className="home-page-register-login">
          {location.pathname === "/login" ? (
            <Link to="/register" className="home-page-link">
              Đăng ký
            </Link>
          ) : (
            <Link to="/login" className="home-page-link">
              Đăng nhập
            </Link>
          )}
        </div>
      </hearder>
      <div className="gradient-layer"></div>
      <div className="pattern-layer"></div>
      <div className="glow-layer"></div>
      <div className="login-container">{children}</div>
    </div>
  );
};

LoginLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const LoginLayout = React.memo(LoginLayoutComponent);
export default LoginLayout;
