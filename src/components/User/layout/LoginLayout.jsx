import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import "../../../assets/css/LoginLayout.style.css";
import HomePageLayout from "./HomePageLayout";

const LoginLayoutComponent = (props) => {
  const { children = null } = props;
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminPath ? (
        <div className="login-layout">
          <div className="gradient-layer"></div>
          <div className="pattern-layer"></div>
          <div className="glow-layer"></div>
          <div className="login-container">{children}</div>
        </div>
      ) : (
        <HomePageLayout>
          <div className="login-layout">
            <div className="gradient-layer"></div>
            <div className="pattern-layer"></div>
            <div className="glow-layer"></div>
            <div className="login-container">{children}</div>
          </div>
        </HomePageLayout>
      )}
    </>
  );
};

LoginLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const LoginLayout = React.memo(LoginLayoutComponent);
export default LoginLayout;