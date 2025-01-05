import React from "react";
import PropTypes from "prop-types";
import "../../../assets/css/LoginLayout.style.css";

const LoginLayoutComponent = (props) => {
  const { children = null } = props;
  return (
    <div className="login-layout">
      <div className="login-container">
        <img src="/logo.png" alt="logo" className="logo" />
        {children}
      </div>
    </div>
  );
};

LoginLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const LoginLayout = React.memo(LoginLayoutComponent);
export default LoginLayout;