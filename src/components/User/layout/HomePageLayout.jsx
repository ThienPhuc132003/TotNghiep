// src/components/User/layout/HomePageLayout.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import logo from "../../../assets/images/logo_white.webp";
import "../../../assets/css/HomePageLayout.style.css"; // Đảm bảo file này tồn tại và đúng
import { FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import UserAccountToolbar from "./UserAccountToolbar"; // Đảm bảo đường dẫn đúng

// Định nghĩa ROLES (nên đặt trong một file constants chung nếu có nhiều nơi dùng)
const ROLES = {
  GUEST: "GUEST",
  USER: "USER",
  TUTOR: "TUTOR",
};

const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation();
  const userProfile = useSelector((state) => state.user.userProfile);

  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const thisYear = today.getFullYear();

  const checkAuthentication = useCallback(() => !!Cookies.get("token"), []);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthentication());

  useEffect(() => {
    const currentAuthStatus = checkAuthentication();
    if (currentAuthStatus !== isAuthenticated) {
      setIsAuthenticated(currentAuthStatus);
    }
  }, [location, checkAuthentication, isAuthenticated]);

  const getCurrentUserRole = useCallback(() => {
    if (!isAuthenticated || !userProfile) return ROLES.GUEST;
    // Giả sử userProfile.roleId là chuỗi 'USER' hoặc 'TUTOR'
    if (userProfile.roleId?.toUpperCase() === ROLES.TUTOR) return ROLES.TUTOR;
    if (userProfile.roleId?.toUpperCase() === ROLES.USER) return ROLES.USER;
    return ROLES.GUEST; // Fallback
  }, [isAuthenticated, userProfile]);

  const currentUserRole = getCurrentUserRole();

  // --- Xử lý Scroll Header ---
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
      setIsScrollingUp(true);
    } else {
      setIsScrollingUp(false);
    }
    lastScrollY.current = currentScrollY;
  }, []); // Dependencies: setIsScrollingUp là stable, lastScrollY là ref.

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // --- Xử lý Mobile Menu ---
  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((prev) => !prev),
    []
  );
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // --- Xử lý Active Menu Item ---
  useEffect(() => {
    const path = location.pathname;
    // Áp dụng cho cả desktop và mobile menu items
    const menuItemsNodeList = document.querySelectorAll(
      ".home-page-menu .home-page-menu-item, .mobile-menu-nav .mobile-menu-item"
    );

    menuItemsNodeList.forEach((item) => {
      // Item có thể là Link hoặc thẻ li chứa Link, nên tìm thẻ 'a' gần nhất
      const linkElement = item.tagName === "A" ? item : item.querySelector("a"); // Hoặc item.closest("a")
      const linkHref = linkElement ? linkElement.getAttribute("href") : null;

      item.classList.remove("active");

      if (linkHref) {
        // Trang chủ
        if (
          (linkHref === "/" || linkHref === "/trang-chu") &&
          (path === "/" || path === "/trang-chu")
        ) {
          item.classList.add("active");
        }
        // Các trang khác
        else if (
          linkHref !== "/" &&
          linkHref !== "/trang-chu" &&
          path.startsWith(linkHref)
        ) {
          // Đảm bảo khớp chính xác hoặc là trang con trực tiếp
          if (path === linkHref || path.startsWith(linkHref + "/")) {
            item.classList.add("active");
          }
        }
      }
    });
  }, [location]); // Chỉ phụ thuộc vào location

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    closeMobileMenu();
  }, [closeMobileMenu]);

  // --- Định nghĩa các mục menu cho Header/Mobile (đã bỏ "Blog") ---
  const getHeaderMenuItems = () => {
    let items = [
      {
        id: "home",
        label: "Trang chủ",
        path: "/trang-chu",
        roles: [ROLES.GUEST, ROLES.USER, ROLES.TUTOR],
      },
      {
        id: "about",
        label: "Về chúng tôi",
        path: "/about",
        roles: [ROLES.GUEST, ROLES.USER, ROLES.TUTOR],
      },
      {
        id: "rules",
        label: "Quy định",
        path: "/quy-dinh-noi-quy-huong-dan",
        roles: [ROLES.GUEST, ROLES.USER, ROLES.TUTOR],
      },
    ];

    if (currentUserRole === ROLES.GUEST || currentUserRole === ROLES.USER) {
      items.push({
        id: "searchTutor",
        label: "Tìm kiếm gia sư",
        path: "/tim-kiem-gia-su",
        roles: [ROLES.GUEST, ROLES.USER],
      });
    }

    if (currentUserRole === ROLES.USER) {
      items.push({
        id: "tutorRegistrationLink",
        label: "Đăng ký làm gia sư",
        path: "/trac-nghiem-gia-su",
        roles: [ROLES.USER],
      });
    }
    return items.filter((item) => item.roles.includes(currentUserRole));
  };

  const headerMenuItems = getHeaderMenuItems();

  return (
    <div className="home-page-container">
      <header
        className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}
      >
        <nav className="home-page-menu">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Gia Sư VLU Logo" className="logo" />
          </Link>
          {headerMenuItems.map((item) => (
            <Link
              key={`header-${item.id}`}
              to={item.path}
              className="home-page-menu-item"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-auth-section">
          {!isAuthenticated ? (
            <div className="home-page-register-login">
              <Link to="/login" className="home-page-link login-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="home-page-link register-link">
                Đăng ký
              </Link>
            </div>
          ) : (
            <UserAccountToolbar
              onLogout={handleLogout} // Để HomePageLayout cập nhật isAuthenticated
              currentUserRole={currentUserRole}
              userProfile={userProfile} // SettingButton có thể cần userProfile cho 1 số logic (hiện tại thì không)
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button
          className="mobile-menu-close-button"
          onClick={toggleMobileMenu}
          aria-label="Đóng menu"
        >
          <FaTimes />
        </button>
        <nav className="mobile-menu-nav">
          {headerMenuItems.map((item) => (
            <Link
              key={`mobile-${item.id}`}
              to={item.path}
              className="mobile-menu-item"
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
          <hr className="mobile-menu-divider" />
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="mobile-menu-item auth-link"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="mobile-menu-item auth-link"
                onClick={closeMobileMenu}
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="mobile-user-toolbar-wrapper">
              <UserAccountToolbar
                onLogout={handleLogout}
                currentUserRole={currentUserRole}
                userProfile={userProfile}
                isAuthenticated={isAuthenticated}
              />
            </div>
          )}
        </nav>
      </div>

      <main className="main-content">{children}</main>

      <footer className="home-page-footer">
        <div className="footer-content">
          <div className="footer-section footer-brand-section">
            <div className="footer-logo-container">
              <img
                src={logo}
                alt="Gia Sư Văn Lang Logo Footer"
                className="footer-logo-large"
              />
              <span className="footer-brand-text">GiaSuVLU</span>
            </div>
            <p className="footer-brand-description">
              Đây là nền tảng chuyên biệt dành cho sinh viên Trường Đại học Văn
              Lang...
            </p>
          </div>
          <div className="footer-section footer-map-section">
            <h3>Bản đồ</h3>
            <div className="map-responsive-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7877999948746!2d106.69745087573634!3d10.827544858247297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyBjaMOtbmg!5e0!3m2!1svi!2sus!4v1743440267185!5m2!1svi!2sus"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ vị trí Đại học Văn Lang"
              ></iframe>
            </div>
          </div>
          <div className="footer-section footer-contact-section">
            <h3>Thông tin liên hệ</h3>
            <p>
              <FaEnvelope className="footer-icon-svg" aria-hidden="true" />{" "}
              Email:{" "}
              <a href="mailto:info@giasuvanlang.com">info@giasuvanlang.com</a>
            </p>
            <p>
              <FaPhone className="footer-icon-svg" aria-hidden="true" /> Điện
              thoại: <a href="tel:01221099200">012 2109 9200</a>
            </p>
            <p>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="footer-icon"
                aria-hidden="true"
              />{" "}
              Cơ sở chính: 69/68 Đặng Thùy Trâm, P. 13, Q. Bình Thạnh, TP. HCM
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {thisYear} - Bản quyền thuộc về Trường Đại Học Văn Lang</p>
          <p>
            <Link to="/privacy-policy" className="footer-policy-link">
              Chính sách riêng tư
            </Link>
          </p>
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
