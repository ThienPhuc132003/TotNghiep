import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/images/logo_white.webp";
import "../../../assets/css/HomePageLayout.style.css";
import {
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa"; // Import icons

const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation();
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const thisYear = today.getFullYear();
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="home-page-container">
      <header
        className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}
      >
        <nav className="home-page-menu">
          <Link to="/" className="logo-link">
            <img src={logo} alt="logo" className="logo" />
          </Link>
          <Link to="/about" className="home-page-menu-item">
            Về chúng tôi
          </Link>
          <Link to="/help" className="home-page-menu-item">
            Trợ giúp
          </Link>
          <Link to="/blog" className="home-page-menu-item">
            Blog
          </Link>
        </nav>
        <div className="home-page-register-login">
          <Link to="/login" className="home-page-link">
            Đăng nhập
          </Link>
          <Link to="/register" className="home-page-link">
            Đăng ký
          </Link>
        </div>

        {/* Mobile menu icon */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Mobile menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-menu-close-button" onClick={toggleMobileMenu}>
          <FaTimes />
        </button>
        <nav className="mobile-menu-nav">
          <Link
            to="/about"
            className="mobile-menu-item"
            onClick={toggleMobileMenu}
          >
            Về chúng tôi
          </Link>
          <Link
            to="/tutor-registration"
            className="mobile-menu-item"
            onClick={toggleMobileMenu}
          >
            Đăng ký trở thành gia sư
          </Link>
          <Link
            to="/help"
            className="mobile-menu-item"
            onClick={toggleMobileMenu}
          >
            Trợ giúp
          </Link>
          <Link
            to="/blog"
            className="mobile-menu-item"
            onClick={toggleMobileMenu}
          >
            Blog
          </Link>
          {location.pathname === "/login" ? (
            <Link
              to="/register"
              className="mobile-menu-item"
              onClick={toggleMobileMenu}
            >
              Đăng ký
            </Link>
          ) : (
            <Link
              to="/login"
              className="mobile-menu-item"
              onClick={toggleMobileMenu}
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
      <main className="main-content">{children}</main>
      <footer className="home-page-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Về Chúng Tôi</h3>
            <p>Gia Sư Văn Lang - Kết nối tri thức, kiến tạo tương lai.</p>
          </div>
          <div className="footer-section">
            <h3>Liên Hệ</h3>
            <p>
              <FaEnvelope /> Email: info@giasuvanlang.com
            </p>
            <p>
              <FaPhone /> Điện thoại: 028 7109 9200
            </p>
          </div>
          <div className="footer-section">
            <h3>Mạng Xã Hội</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {thisYear} - Kết nối sinh viên Văn Lang.</p>
        </div>
      </footer>
    </div>
  );
};

HomePageLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;
