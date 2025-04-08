// src/components/User/layout/HomePageLayout.jsx

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie"; // <<< Đã thêm import Cookies >>>
import { useSelector } from "react-redux"; // Giữ lại useSelector
import logo from "../../../assets/images/logo_white.webp"; // Đường dẫn tới logo
import "../../../assets/css/HomePageLayout.style.css"; // Import CSS cho layout
import { FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa"; // Import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import UserAccountToolbar from "./UserAccountToolbar"; // Component Toolbar người dùng

// Component chính của Layout
const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation(); // Hook để lấy thông tin route
  const [isScrollingUp, setIsScrollingUp] = useState(true); // State ẩn/hiện header khi cuộn
  const lastScrollY = useRef(window.scrollY); // Ref lưu vị trí cuộn cuối cùng
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State đóng/mở menu mobile
  const today = new Date();
  const thisYear = today.getFullYear(); // Lấy năm hiện tại cho footer

  // --- Lấy profile từ Redux store ---
  // Giả sử state profile user nằm trong state.user.profile
  const userProfile = useSelector((state) => state.user.profile);
  // Kiểm tra sự tồn tại của một trường định danh trong profile (ví dụ: userId, id, email)
  const userIdFromProfile =
    userProfile?.userId || userProfile?.id || userProfile?.email; // Thay 'userId' bằng trường thực tế

  // --- KIỂM TRA AUTHENTICATION (Kết hợp Redux và Cookie) ---
  // Kiểm tra xem có cookie token và role=user hợp lệ không
  const hasValidCookies =
    !!Cookies.get("token") && Cookies.get("role") === "user";
  // Xác thực nếu có thông tin định danh trong profile Redux HOẶC có cookie hợp lệ
  // Điều này giúp hiển thị toolbar ngay cả khi Redux chưa kịp cập nhật sau khi login form
  const isAuthenticated = !!userIdFromProfile || hasValidCookies;

  // Log trạng thái để debug (có thể xóa/comment sau khi hoạt động ổn định)
  console.log(
    "HomePageLayout Rendering:",
    "- userIdFromProfile:",
    userIdFromProfile, // Log giá trị ID lấy từ Redux
    "- hasValidCookies:",
    hasValidCookies, // Log kết quả kiểm tra cookie
    "- isAuthenticated (final):",
    isAuthenticated // Log trạng thái xác thực cuối cùng
    // "- Profile from Redux:", JSON.stringify(userProfile) // Log chi tiết profile nếu cần
  );
  // --- KẾT THÚC KIỂM TRA AUTH ---

  // --- Side Effects ---

  // Xử lý sự kiện cuộn trang để ẩn/hiện header
  const handleScroll = () => {
    if (window.scrollY < lastScrollY.current || window.scrollY < 50) {
      setIsScrollingUp(true); // Hiện header nếu cuộn lên hoặc ở gần đầu trang
    } else {
      setIsScrollingUp(false); // Ẩn header nếu cuộn xuống
    }
    lastScrollY.current = window.scrollY; // Cập nhật vị trí cuộn cuối
  };

  // Đăng ký và hủy đăng ký sự kiện scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Chạy một lần khi component mount

  // Hàm đóng/mở menu mobile
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false); // Hàm đóng menu

  // Effect để đánh dấu menu item active dựa trên route hiện tại
  useEffect(() => {
    const path = location.pathname;
    const menuItems = document.querySelectorAll(".home-page-menu-item"); // Lấy các item menu desktop

    menuItems.forEach((item) => {
      const link = item.getAttribute("href"); // Lấy href của item
      // So sánh path hiện tại với href
      if (link && (path === link || (link !== "/" && path.startsWith(link)))) {
        item.classList.add("active"); // Thêm class active nếu khớp
      } else {
        item.classList.remove("active"); // Xóa class active nếu không khớp
      }
    });
    // Tương tự có thể làm cho mobile menu nếu cần
  }, [location]); // Chạy lại mỗi khi location thay đổi

  // --- Render JSX ---
  return (
    <div className="home-page-container">
      {/* ==================== Header ==================== */}
      <header
        className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}
      >
        {/* Menu Desktop */}
        <nav className="home-page-menu">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <img src={logo} alt="Gia Sư VLU Logo" className="logo" />
          </Link>
          {/* Các mục menu */}
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
          {/* Link "Đăng ký làm gia sư" chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && (
            <Link
              to="/dang-ky-gia-su"
              className="home-page-menu-item"
              href="/dang-ky-gia-su"
            >
              Đăng ký làm gia sư
            </Link>
          )}
          <Link to="/help" className="home-page-menu-item" href="/help">
            Trợ giúp
          </Link>
          <Link to="/blog" className="home-page-menu-item" href="/blog">
            Blog
          </Link>
        </nav>

        {/* Phần Đăng nhập/Đăng ký hoặc Toolbar User */}
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
          // Hiển thị khi đã đăng nhập (dựa trên Redux hoặc Cookie)
          <UserAccountToolbar />
        )}

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
          {/* Các link trong mobile menu */}
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
          {/* Link đăng ký gia sư trong mobile menu */}
          {isAuthenticated && (
            <Link
              to="/dang-ky-gia-su"
              className="mobile-menu-item"
              onClick={closeMobileMenu}
            >
              Đăng ký gia sư
            </Link>
          )}
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
          {/* Phần đăng nhập/đăng ký hoặc toolbar trong mobile menu */}
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
              <UserAccountToolbar />
            </div>
          )}
        </nav>
      </div>

      {/* ==================== Main Content ==================== */}
      {/* Render nội dung của trang con được truyền vào */}
      <main className="main-content">{children}</main>

      {/* ==================== Footer ==================== */}
      <footer className="home-page-footer">
        <div className="footer-content">
          {/* Cột 1: Logo & Mô tả */}
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

          {/* Cột 3: Bản đồ */}
          <div className="footer-section footer-map-section">
            <h3>Bản đồ</h3>
            <div className="map-responsive-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7877999948746!2d106.69745087573634!3d10.827544858247297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyBjaMOtbmg!5e0!3m2!1svi!2sus!4v1743440267185!5m2!1svi!2sus"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ vị trí Đại học Văn Lang"
              ></iframe>
            </div>
          </div>

          {/* Cột 2: Thông tin liên hệ */}
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
            {/* ... các địa chỉ khác ... */}
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

// Định nghĩa PropTypes
HomePageLayoutComponent.propTypes = {
  children: PropTypes.node, // Nội dung trang con
};

// Sử dụng React.memo để tối ưu hóa render nếu props không thay đổi
const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;
