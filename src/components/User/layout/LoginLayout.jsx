import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import "../../../assets/css/LoginLayout.style.css";
import vanlangBackground from "../../../assets/images/vanlang_background3.webp";

const LoginLayoutComponent = ({ children = null }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminPath ? (
        <div className="login-layout">
          {" "}
          <div className="background-mask"></div>
          <img
            src={vanlangBackground}
            alt="background image"
            className="vanlangBackGround"
          />
          <div className="login-container">{children}</div>
        </div>
      ) : (
        <>
          <div className="login-layout">
            <div className="background-mask"></div>
            <img
              src={vanlangBackground}
              alt="background image"
              className="vanlangBackGround"
            />
            <div className="login-container">{children}</div>
          </div>
        </>
      )}
    </>
  );
};

LoginLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const LoginLayout = React.memo(LoginLayoutComponent);
export default LoginLayout;
