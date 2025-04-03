import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
// import Cookies from "js-cookie"; // Không cần import Cookies ở đây nữa
import { useSelector } from "react-redux"; // <-- Import useSelector
import logo from "../../../assets/images/logo_white.webp";
import "../../../assets/css/HomePageLayout.style.css";
import { FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import UserAccountToolbar from "./UserAccountToolbar";

const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation();
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const thisYear = today.getFullYear();

  // --- START: Lấy trạng thái xác thực từ Redux store ---
  // Giả sử state user profile của bạn nằm trong state.user.profile
  // và có trường userId (hoặc email, id, ...) để xác định đã đăng nhập
  const userProfile = useSelector((state) => state.user.profile); // <-- Sử dụng useSelector
  const isAuthenticated = !!userProfile?.userId; // <-- Xác định đăng nhập dựa trên profile từ Redux
  // (Hoặc dùng userProfile?.id, userProfile?.email tùy cấu trúc data)

  // Bỏ useEffect kiểm tra cookie ở đây
  // useEffect(() => {
  //   const token = Cookies.get("token");
  //   setIsAuthenticated(!!token);
  // }, []);
  // --- END: Lấy trạng thái xác thực từ Redux store ---

  const handleScroll = () => {
    // ... (code xử lý scroll giữ nguyên)
    if (window.scrollY < lastScrollY.current || window.scrollY < 50) {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    // ... (code xử lý active menu item giữ nguyên)
    const path = location.pathname;
    const menuItems = document.querySelectorAll(".home-page-menu-item");

    menuItems.forEach((item) => {
      const link = item.getAttribute("href");
      // So sánh chính xác hoặc bắt đầu bằng (nếu có route con)
      if (link && (path === link || (link !== "/" && path.startsWith(link)))) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }, [location]);

  return (
    <div className="home-page-container">
      {/* ==================== Header ==================== */}
      <header
        className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}
      >
        {/* Menu Desktop */}
        <nav className="home-page-menu">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Gia Sư VLU Logo" className="logo" />
          </Link>
          <Link
            to="/trang-chu"
            className="home-page-menu-item"
            href="/trang-chu"
          >
            Trang chủ
          </Link>
          <Link to="/about" className="home-page-menu-item" href="/about">
            Về chúng tôi
          </Link>
          {/* --- Hiển thị link dựa trên isAuthenticated từ Redux --- */}
          {isAuthenticated && (
            <Link
              to="/dang-ky-gia-su" // Đảm bảo route này tồn tại
              className="home-page-menu-item"
              href="/dang-ky-gia-su"
            >
              Đăng ký làm gia sư
            </Link>
          )}
          {/* --- END: Thêm link --- */}
          <Link to="/help" className="home-page-menu-item" href="/help">
            Trợ giúp
          </Link>
          <Link to="/blog" className="home-page-menu-item" href="/blog">
            Blog
          </Link>
        </nav>

        {/* --- Render có điều kiện dựa trên isAuthenticated từ Redux --- */}
        {!isAuthenticated ? (
          // Hiển thị khi chưa đăng nhập
          <div className="home-page-register-login">
            <Link to="/login" className="home-page-link login-link">
              Đăng nhập
            </Link>
            <Link to="/register" className="home-page-link register-link">
              Đăng ký
            </Link>
          </div>
        ) : (
          // Hiển thị khi đã đăng nhập
          <UserAccountToolbar /> // <-- Component UserAccountToolbar
        )}
        {/* --- END: Render có điều kiện --- */}

        {/* Nút mở Mobile Menu */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Mở menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* ==================== Mobile Menu ==================== */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button
          className="mobile-menu-close-button"
          onClick={toggleMobileMenu}
          aria-label="Đóng menu"
        >
          <FaTimes />
        </button>
        <nav className="mobile-menu-nav">
          <Link
            to="/trang-chu"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Trang chủ
          </Link>
          <Link
            to="/about"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Về chúng tôi
          </Link>
          {/* --- Render có điều kiện dựa trên isAuthenticated từ Redux - Mobile --- */}
          {isAuthenticated && (
            <Link
              to="/dang-ky-gia-su" // Đảm bảo route này tồn tại
              className="mobile-menu-item"
              onClick={closeMobileMenu}
            >
              Đăng ký gia sư
            </Link>
          )}
          {/* --- END: Thêm link - Mobile --- */}
          <Link
            to="/help"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Trợ giúp
          </Link>
          <Link
            to="/blog"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Blog
          </Link>
          <hr className="mobile-menu-divider" />

          {/* --- Render có điều kiện dựa trên isAuthenticated từ Redux - Mobile --- */}
          {!isAuthenticated ? (
            // Hiển thị khi chưa đăng nhập - Mobile
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
            // Hiển thị khi đã đăng nhập - Mobile
            <div className="mobile-user-toolbar-wrapper">
              <UserAccountToolbar />
            </div>
          )}
          {/* --- END: Render có điều kiện - Mobile --- */}
        </nav>
      </div>

      {/* ==================== Main Content ==================== */}
      <main className="main-content">{children}</main>

      {/* ==================== Footer ==================== */}
      {/* ... (code Footer giữ nguyên) ... */}
      <footer className="home-page-footer">
        {/* Nội dung chính của Footer */}
        <div className="footer-content">
          {/* --- Cột 1: Logo & Mô tả --- */}
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
              Kết nối tri thức, kiến tạo tương lai cho sinh viên Văn Lang.
            </p>
          </div>

          {/* --- Cột 3: Bản đồ --- */}
          <div className="footer-section footer-map-section">
            <h3>Bản đồ</h3>
            {/* Container để giữ tỷ lệ khung hình cho iframe */}
            <div className="map-responsive-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7877999948746!2d106.69745087573634!3d10.827544858247297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyBjaMOtbmg!5e0!3m2!1svi!2sus!4v1743440267185!5m2!1svi!2sus"
                style={{ border: 0 }} // Chỉ cần style border ở đây
                allowFullScreen=""
                loading="lazy" // Tải lazy
                referrerPolicy="no-referrer-when-downgrade" // Chính sách referrer
                title="Bản đồ vị trí Đại học Văn Lang" // Title cho iframe
              ></iframe>
            </div>
          </div>

          {/* --- Cột 2: Thông tin liên hệ --- */}
          <div className="footer-section footer-contact-section">
            <h3>Thông tin liên hệ</h3>
            <p>
              <FaEnvelope className="footer-icon-svg" /> Email:
              info@giasuvanlang.com
            </p>
            <p>
              <FaPhone className="footer-icon-svg" /> Điện thoại: 012 2109 9200
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />{" "}
              Cơ sở chính: 69/68 Đặng Thùy Trâm, P. 13, Q. Bình Thạnh, TP. HCM
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />{" "}
              Cơ sở 1: 45 Nguyễn Khắc Nhu, P. Cô Giang, Q.1, TP. HCM
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />{" "}
              Cơ sở 2: 233A Phan Văn Trị, P.11, Q. Bình Thạnh, TP. HCM
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />{" "}
              Ký túc xá: 160/63A-B Phan Huy Ích, P. 12, Q. Gò Vấp, TP. HCM
            </p>
          </div>
        </div>

        {/* --- Phần dưới cùng của Footer --- */}
        <div className="footer-bottom">
          <p>© {thisYear} - Bản quyền thuộc về Trường Đại Học Văn Lang</p>
          {/* Link đến trang chính sách, đảm bảo có route tương ứng */}
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

// Sử dụng React.memo nếu bạn muốn tối ưu hóa, nhưng không bắt buộc
const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;
