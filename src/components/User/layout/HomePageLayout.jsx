// src/components/User/layout/HomePageLayout.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom"; // Thêm useNavigate nếu cần logout
import Cookies from "js-cookie";
import { useSelector } from "react-redux"; // Thêm useDispatch nếu cần logout
import logo from "../../../assets/images/logo_white.webp";
import "../../../assets/css/HomePageLayout.style.css";
import { FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import UserAccountToolbar from "./UserAccountToolbar"; // Đảm bảo đường dẫn đúng
// Import action logout từ userSlice nếu bạn có (ví dụ)
// import { logoutUser } from '../../../redux/userSlice';

const HomePageLayoutComponent = ({ children }) => {
  const location = useLocation();
  // const navigate = useNavigate(); // Dùng khi cần chuyển hướng sau logout
  // const dispatch = useDispatch(); // Dùng khi cần dispatch action Redux logout

  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const thisYear = today.getFullYear();

  // --- Lấy userProfile từ Redux store ---
  // Vẫn lấy userProfile để sử dụng cho các thông tin khác khi đã đăng nhập
  const userProfile = useSelector((state) => state.user.userProfile);

  // --- Hàm kiểm tra Authentication dựa trên Cookies ---
  const checkAuthentication = useCallback(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    // console.log("[AuthCheck] Token:", token, "Role:", role); // Debug log
    return !!token && role === "user"; // Chỉ true nếu có token VÀ role là 'user'
  }, []); // useCallback vì hàm này không phụ thuộc vào state/props nào trong component này

  // --- State lưu trạng thái đăng nhập ---
  // Khởi tạo state dựa trên kết quả kiểm tra cookie ban đầu
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthentication());

  // --- Effect cập nhật trạng thái Authentication ---
  // Chạy mỗi khi location thay đổi (chuyển trang) hoặc khi component mount
  useEffect(() => {
    const currentAuthStatus = checkAuthentication();
    // Chỉ cập nhật state nếu trạng thái thực tế khác với state hiện tại
    if (currentAuthStatus !== isAuthenticated) {
      setIsAuthenticated(currentAuthStatus);
      // console.log("[AuthCheck Effect] Updated isAuthenticated:", currentAuthStatus); // Debug log
    }
  }, [location, checkAuthentication, isAuthenticated]); // Thêm isAuthenticated vào dependencies

  // --- Lấy thông tin gia sư (chỉ khi đã đăng nhập) ---
  const tutorStatus = isAuthenticated ? userProfile?.tutorStatus : null;
  const isTutorAccepted = isAuthenticated && tutorStatus === "ACCEPT";

  /* // Log tổng hợp (bật/tắt khi cần debug)
  console.log(
    "HomePageLayout Rendering:",
    "- isAuthenticated (State):", isAuthenticated,
    "- User Profile from Redux:", userProfile,
    "- tutorStatus:", tutorStatus,
    "- isTutorAccepted:", isTutorAccepted
  );
  */

  // --- Xử lý Scroll Header ---
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
      setIsScrollingUp(true);
    } else {
      setIsScrollingUp(false);
    }
    lastScrollY.current = currentScrollY;
  }, []); // useCallback vì không phụ thuộc state/props

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]); // Thêm handleScroll vào dependencies

  // --- Xử lý Mobile Menu ---
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // --- Xử lý Active Menu Item ---
  useEffect(() => {
    const path = location.pathname;
    const menuItems = document.querySelectorAll(
      ".home-page-menu .home-page-menu-item"
    );
    const mobileMenuItems = document.querySelectorAll(
      ".mobile-menu-nav .mobile-menu-item"
    );

    const setActive = (items) => {
      items.forEach((item) => {
        // Lấy href từ thẻ a (item có thể là Link hoặc thẻ khác chứa Link)
        const linkElement = item.tagName === "A" ? item : item.closest("a"); // Tìm thẻ 'a' gần nhất
        const link = linkElement ? linkElement.getAttribute("href") : null;

        // Bỏ class 'active' trước khi kiểm tra
        item.classList.remove("active");

        if (link) {
          // Xử lý trường hợp trang chủ (path = '/' và link = '/' hoặc link = '/trang-chu')
          if ((link === "/" || link === "/trang-chu") && path === "/") {
            item.classList.add("active");
          }
          // Xử lý các trang khác (phải bắt đầu bằng link và không phải là link cha của trang hiện tại)
          else if (
            link !== "/" &&
            link !== "/trang-chu" &&
            path.startsWith(link)
          ) {
            // Kiểm tra chính xác hoặc là trang con trực tiếp
            if (path === link || path.startsWith(link + "/")) {
              item.classList.add("active");
            }
          }
        }
      });
    };

    setActive(menuItems);
    setActive(mobileMenuItems);
  }, [location]); // Chỉ phụ thuộc vào location

  // --- Hàm xử lý khi Logout từ Toolbar ---
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false); // Cập nhật state ngay lập tức
    closeMobileMenu(); // Đóng menu mobile nếu đang mở
    // Tại đây, component UserAccountToolbar đã thực hiện việc xóa cookie và Redux state
    // navigate('/login'); // Có thể chuyển hướng về trang login nếu muốn
  }, [closeMobileMenu]); // Phụ thuộc vào closeMobileMenu

  // --- Render JSX ---
  return (
    <div className="home-page-container">
      {/* ==================== Header ==================== */}
      <header
        className={`home-page-header ${isScrollingUp ? "visible" : "hidden"}`}
      >
        <nav className="home-page-menu">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Gia Sư VLU Logo" className="logo" />
          </Link>
          <Link to="/trang-chu" className="home-page-menu-item">
            Trang chủ
          </Link>
          <Link to="/about" className="home-page-menu-item">
            Về chúng tôi
          </Link>

          {/* Link Đăng ký/Hồ sơ gia sư - Chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated &&
            (isTutorAccepted ? (
              <Link to="/ho-so-gia-su" className="home-page-menu-item">
                Hồ sơ gia sư
              </Link>
            ) : (
              <Link to="/dang-ky-gia-su" className="home-page-menu-item">
                Đăng ký làm gia sư
              </Link>
            ))}

          <Link
            to="/quy-dinh-noi-quy-huong-dan"
            className="home-page-menu-item"
          >
            Quy định
          </Link>
          <Link to="/blog" className="home-page-menu-item">
            Blog
          </Link>
          <Link to="/tim-kiem-gia-su" className="home-page-menu-item">
            Tìm kiếm gia sư
          </Link>
        </nav>

        {/* Phần Đăng nhập/Đăng ký hoặc User Toolbar */}
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
            // Truyền hàm handleLogout vào UserAccountToolbar
            <UserAccountToolbar onLogout={handleLogout} />
          )}
        </div>

        {/* Nút mở Mobile Menu */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"} // Cập nhật aria-label
          aria-expanded={isMobileMenuOpen} // Thêm aria-expanded
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* ==================== Mobile Menu ==================== */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <button
          className="mobile-menu-close-button"
          onClick={toggleMobileMenu} // Dùng lại toggleMobileMenu
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

          {/* Link Đăng ký/Hồ sơ gia sư trong mobile */}
          {isAuthenticated &&
            (isTutorAccepted ? (
              <Link
                to="/ho-so-gia-su"
                className="mobile-menu-item"
                onClick={closeMobileMenu}
              >
                Hồ sơ gia sư
              </Link>
            ) : (
              <Link
                to="/dang-ky-gia-su"
                className="mobile-menu-item"
                onClick={closeMobileMenu}
              >
                Đăng ký làm gia sư
              </Link>
            ))}

          <Link
            to="/quy-dinh-noi-quy-huong-dan"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Quy định
          </Link>
          <Link
            to="/blog"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Blog
          </Link>
          <Link
            to="/tim-kiem-gia-su"
            className="mobile-menu-item"
            onClick={closeMobileMenu}
          >
            Tìm kiếm gia sư
          </Link>
          <hr className="mobile-menu-divider" />

          {/* Phần Đăng nhập/Đăng ký hoặc User Toolbar trong Mobile */}
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
              {/* Truyền hàm handleLogout vào UserAccountToolbar */}
              <UserAccountToolbar onLogout={handleLogout} />
            </div>
          )}
        </nav>
      </div>

      {/* ==================== Main Content ==================== */}
      <main className="main-content">{children}</main>

      {/* ==================== Footer ==================== */}
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
              Lang, nơi kết nối với đội ngũ gia sư uy tín và giàu kinh nghiệm,
              giúp hỗ trợ học tập hiệu quả thông qua các buổi học tương tác trực
              tuyến (online) lẫn kèm cặp trực tiếp (offline), đồng thời mang lại
              sự linh hoạt, tiện lợi và nâng cao chất lượng giáo dục.
            </p>
          </div>
          <div className="footer-section footer-map-section">
            <h3>Bản đồ</h3>
            <div className="map-responsive-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7877999948746!2d106.69745087573634!3d10.827544858247297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyBjaMOtbmg!5e0!3m2!1svi!2sus!4v1743440267185!5m2!1svi!2sus" // Lưu ý: API key có thể cần thiết cho Google Maps ở môi trường production
                style={{ border: 0 }}
                allowFullScreen={true} // Thuộc tính boolean
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
            {/* Thêm link Điều khoản sử dụng nếu có */}
            {/* <Link to="/terms-of-service" className="footer-policy-link">Điều khoản sử dụng</Link> */}
          </p>
        </div>
      </footer>
    </div>
  );
};

// Định nghĩa PropTypes
HomePageLayoutComponent.propTypes = {
  children: PropTypes.node, // children có thể là bất kỳ node React nào
};

// Sử dụng React.memo để tối ưu hóa việc render lại không cần thiết
const HomePageLayout = React.memo(HomePageLayoutComponent);
export default HomePageLayout;
