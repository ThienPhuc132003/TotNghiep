import { useState } from "react";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/HelpPage.style.css"; // Import CSS riêng

// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserGraduate, // Icon cho học viên
  faChalkboardUser, // Icon cho gia sư
  faUserCircle, // Icon cho tài khoản
  faCreditCard, // Icon cho thanh toán
  faBug, // Icon cho báo lỗi/kỹ thuật
  faHeadset, // Icon cho hỗ trợ chung
  faChevronRight,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

// --- Components ---

// --- Hero Section ---
const HelpHeroSection = () => (
  <section className="help-hero">
    <div className="help-hero-content">
      <h1>Trung Tâm Trợ Giúp GiaSuVLU</h1>
      <p>Tìm kiếm câu trả lời hoặc duyệt qua các chủ đề bên dưới</p>
      <form className="help-search-form" onSubmit={(e) => e.preventDefault()}>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        <input
          type="search"
          placeholder="Nhập từ khóa tìm kiếm (vd: tìm gia sư, đăng ký dạy...)"
          aria-label="Tìm kiếm trợ giúp"
        />
        <button type="submit">Tìm kiếm</button>
      </form>
    </div>
  </section>
);

// --- Categories Section ---
const HelpCategoriesSection = () => {
  const categories = [
    {
      id: 1,
      title: "Dành cho Học viên",
      description: "Tìm gia sư, đặt lịch, quản lý lớp học...",
      icon: faUserGraduate,
      link: "#faq-hoc-vien", // Liên kết đến phần FAQ tương ứng (ví dụ)
    },
    {
      id: 2,
      title: "Dành cho Gia sư",
      description: "Đăng ký dạy, tạo hồ sơ, quản lý lịch...",
      icon: faChalkboardUser,
      link: "#faq-gia-su",
    },
    {
      id: 3,
      title: "Tài khoản & Bảo mật",
      description: "Đăng nhập, đổi mật khẩu, thông tin cá nhân...",
      icon: faUserCircle,
      link: "#faq-tai-khoan",
    },
    {
      id: 4,
      title: "Thanh toán & Học phí",
      description: "Phương thức thanh toán, hoàn tiền, hóa đơn...",
      icon: faCreditCard,
      link: "#faq-thanh-toan",
    },
    {
      id: 5,
      title: "Báo cáo sự cố & Kỹ thuật",
      description: "Gặp lỗi trang web, vấn đề kỹ thuật khác...",
      icon: faBug,
      link: "/contact", // Có thể link đến trang liên hệ riêng
    },
    {
      id: 6,
      title: "Chính sách & Điều khoản",
      description: "Quy định sử dụng, chính sách bảo mật...",
      icon: faHeadset, // Hoặc faFileAlt
      link: "/terms", // Link đến trang điều khoản (ví dụ)
    },
  ];

  return (
    <section className="help-categories section">
      <h2>Duyệt Theo Chủ Đề</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <a href={category.link} className="category-card" key={category.id}>
            <div className="category-icon-wrapper">
              <FontAwesomeIcon icon={category.icon} className="category-icon" />
            </div>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
          </a>
        ))}
      </div>
    </section>
  );
};

// --- FAQ Section ---
const HelpFAQSection = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  // Ví dụ dữ liệu FAQ - Nên lấy từ nguồn dữ liệu động nếu có thể
  const faqData = [
    {
      id: "faq-hv-1",
      category: "hoc-vien",
      question: "Làm cách nào để tìm gia sư phù hợp nhất?",
      answer:
        "Bạn có thể sử dụng bộ lọc chi tiết trên trang tìm kiếm, xem kỹ hồ sơ gia sư (kinh nghiệm, đánh giá), và có thể liên hệ trực tiếp để trao đổi thêm trước khi quyết định.",
    },
    {
      id: "faq-gs-1",
      category: "gia-su",
      question: "Tôi cần làm gì để đăng ký trở thành gia sư?",
      answer:
        "Bạn cần tạo tài khoản Gia sư, điền đầy đủ thông tin hồ sơ cá nhân, kinh nghiệm, môn dạy và chờ hồ sơ được duyệt. Đảm bảo thông tin cung cấp là chính xác và chuyên nghiệp.",
    },
    {
      id: "faq-tk-1",
      category: "tai-khoan",
      question: "Tôi quên mật khẩu, làm thế nào để lấy lại?",
      answer:
        'Nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập và làm theo hướng dẫn để đặt lại mật khẩu qua email đã đăng ký.',
    },
    {
      id: "faq-tt-1",
      category: "thanh-toan",
      question: "Hình thức thanh toán học phí như thế nào?",
      answer:
        "Hiện tại, việc thanh toán chủ yếu diễn ra theo thỏa thuận trực tiếp giữa học viên và gia sư. Vui lòng trao đổi rõ ràng về phương thức và thời hạn thanh toán.",
    },
    {
      id: "faq-hv-2",
      category: "hoc-vien",
      question: "Tôi có thể học thử với gia sư không?",
      answer:
        "Việc có buổi học thử hay không tùy thuộc vào thỏa thuận với từng gia sư. Bạn nên chủ động đề xuất và trao đổi về vấn đề này khi liên hệ.",
    },
  ];

  return (
    <section className="help-faq section" id="faq">
      <h2>Câu Hỏi Thường Gặp</h2>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div className="faq-item" key={item.id}>
            <button
              type="button"
              className="faq-question"
              onClick={() => toggleQuestion(index)}
              aria-expanded={activeQuestion === index}
              aria-controls={item.id}
            >
              <span>{item.question}</span>
              {activeQuestion === index ? (
                <FontAwesomeIcon icon={faMinus} aria-hidden="true" />
              ) : (
                <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
              )}
            </button>
            <div
              id={item.id}
              className={`faq-answer ${
                activeQuestion === index ? "active" : ""
              }`}
              role="region"
              hidden={activeQuestion !== index}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- Contact Support Section ---
const ContactSupportSection = () => (
  <section className="contact-support section">
    <h2>Không Tìm Thấy Câu Trả Lời?</h2>
    <p>
      Đội ngũ hỗ trợ của chúng tôi luôn sẵn lòng giúp đỡ bạn.
      <br />
      Vui lòng liên hệ qua email hoặc gọi hotline để được hỗ trợ nhanh nhất.
    </p>
    <div className="contact-info">
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hotro@giasuvlu.com">hotro@giasuvlu.com</a>
      </p>
      <p>
        <strong>Hotline:</strong> <a href="tel:09xxxxxxxx">09xx xxx xxx</a> (Giờ
        hành chính)
      </p>
    </div>
    <a href="/contact" className="contact-button">
      {" "}
      {/* Hoặc link đến trang Contact nếu có */}
      Gửi yêu cầu hỗ trợ
    </a>
  </section>
);

// --- Main HelpPage Component ---
const HelpPage = () => {
  return (
    <HomePageLayout>
      <div className="help-page-wrapper">
        <HelpHeroSection />
        <HelpCategoriesSection />
        <HelpFAQSection />
        <ContactSupportSection />
      </div>
    </HomePageLayout>
  );
};

export default HelpPage;
