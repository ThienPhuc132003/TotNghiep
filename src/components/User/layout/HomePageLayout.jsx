import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/images/logo.png";
import "../../../assets/css/LoginLayout.style.css";

const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation();
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  const handleScroll = () => {
    if (window.scrollY < lastScrollY.current) {
      setIsScrollingUp(true);
    } else {
      setIsScrollingUp(false);
    }
    lastScrollY.current = window.scrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="home-page-container">
      <header className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}>
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
      </header>
      {children}
    </div>
  );
};

HomePageLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;