// src/components/User/layout/HomePageLayout.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import logo from "../../../assets/images/logo_white.webp";
import "../../../assets/css/HomePageLayout.style.css";
import { FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import UserAccountToolbar from "./UserAccountToolbar";
import { clearUserProfile } from "../../../redux/userSlice";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";

const ROLES = {
  GUEST: "GUEST",
  USER: "USER",
  TUTOR: "TUTOR",
};

const HomePageLayoutComponent = () => {
  const location = useLocation();
  const userProfileFromState = useSelector((state) => state.user.userProfile);
  const isAuthenticatedFromRedux = useSelector(
    (state) => state.user.isAuthenticated
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const thisYear = today.getFullYear();

  const [isAuthenticated, setIsAuthenticated] = useState(
    isAuthenticatedFromRedux || !!Cookies.get("token")
  );

  useEffect(() => {
    setIsAuthenticated(isAuthenticatedFromRedux);
  }, [isAuthenticatedFromRedux]);

  const getCurrentUserRole = useCallback(() => {
    if (!isAuthenticated || !userProfileFromState) return ROLES.GUEST;
    if (userProfileFromState.roleId) {
      const roleId = String(userProfileFromState.roleId).toUpperCase();
      if (roleId === ROLES.TUTOR) return ROLES.TUTOR;
      if (roleId === ROLES.USER) return ROLES.USER;
    }
    if (userProfileFromState.tutorProfile) return ROLES.TUTOR;
    if (userProfileFromState.userProfile) return ROLES.USER;
    return ROLES.GUEST;
  }, [isAuthenticated, userProfileFromState]);

  const currentUserRole = getCurrentUserRole();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
      setIsScrollingUp(true);
    } else {
      setIsScrollingUp(false);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((prev) => !prev),
    []
  );
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const path = location.pathname;
    const menuItemsNodeList = document.querySelectorAll(
      ".home-page-menu .home-page-menu-item, .mobile-menu-nav .mobile-menu-item"
    );
    menuItemsNodeList.forEach((item) => {
      const linkElement = item.tagName === "A" ? item : item.querySelector("a");
      const linkHref = linkElement ? linkElement.getAttribute("href") : null;
      item.classList.remove("active");
      if (linkHref) {
        if (
          (linkHref === "/" || linkHref === "/trang-chu") &&
          (path === "/" || path === "/trang-chu")
        ) {
          item.classList.add("active");
        } else if (
          linkHref !== "/" &&
          linkHref !== "/trang-chu" &&
          path.startsWith(linkHref)
        ) {
          if (path === linkHref || path.startsWith(linkHref + "/")) {
            item.classList.add("active");
          }
        }
      }
    });
  }, [location]);

  const handleLogout = useCallback(async () => {
    try {
      await Api({ endpoint: "user/logout", method: METHOD_TYPE.POST });
    } catch (error) {
      console.error("Lỗi API đăng xuất (tiếp tục logout client):", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      dispatch(clearUserProfile());
      closeMobileMenu();
      navigate("/login");
    }
  }, [dispatch, navigate, closeMobileMenu]);

  const getHeaderMenuItems = () => {
    let items = [
      {
        id: "home",
        label: "TRANG CHỦ",
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
        <div className="site-container header-content-wrapper">
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
                isAuthenticated={isAuthenticated}
                currentUserRole={currentUserRole}
                onLogout={handleLogout}
              />
            )}
          </div>
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
                isAuthenticated={isAuthenticated}
                currentUserRole={currentUserRole}
                onLogout={handleLogout}
              />
            </div>
          )}
        </nav>
      </div>

      <main className="main-content">
        <Outlet /> {/* Sử dụng Outlet để render route con */}
      </main>

      <footer className="home-page-footer">
        <div className="site-container footer-inner-wrapper">
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
                Đây là nền tảng chuyên biệt dành cho sinh viên Trường Đại học
                Văn Lang...
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
        </div>
      </footer>
    </div>
  );
};

const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;
