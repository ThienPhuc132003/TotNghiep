import { useState, useRef } from "react";
import "../../assets/css/HomePage.style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaPlus,
  FaMinus,
  FaSearch,
  FaUserGraduate,
} from "react-icons/fa";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import welcomeTheme from "../../assets/images/welcomeTheme.jpg";
import subjectList from "../../assets/data/mayjorList.json";
/* eslint-disable no-unused-vars */

const HeroSection = () => (
  <section className="hero">
    <img className="welcomeTheme" src={welcomeTheme} alt="welcomeTheme" />
    <div className="hero-content">
      <h1>Kết Nối Tri Thức - Mở Cánh Tương Lai</h1>
      <p>
        Tìm gia sư giỏi nhất tại Văn Lang, học hiệu quả, tự tin chinh phục mọi
        thử thách.
      </p>
      <button className="cta-button">Bắt Đầu Ngay</button>
    </div>
  </section>
);

const BenefitsSection = () => (
  <section className="benefits section">
    <h2>Tại Sao Nên Chọn Gia Sư Văn Lang?</h2>
    <div className="benefits-grid">
      <div className="benefit">
        <FaCheckCircle className="benefit-icon" />
        <h3>Gia Sư Đa Dạng, Thân Thiện</h3>
        <p>
          Chủ yếu là các gia sư cũng là sinh viên, dễ dàng trao đổi với học
          viên.
        </p>
      </div>
      <div className="benefit">
        <FaClock className="benefit-icon" />
        <h3>Linh Hoạt Tuyệt Đối</h3>
        <p>
          Tự do lựa chọn thời gian, địa điểm và hình thức học phù hợp với lịch
          trình của bạn.
        </p>
      </div>
      <div className="benefit">
        <FaChartLine className="benefit-icon" />
        <h3>Tiết Kiệm Chi Phí</h3>
        <p>
          Mức giá cạnh tranh, nhiều ưu đãi hấp dẫn dành riêng cho sinh viên Văn
          Lang.
        </p>
      </div>
    </div>
  </section>
);

const PopularSubjectsSection = () => {
  const topSubjects = subjectList.slice(0, 10); // Get the top 10 subjects

  return (
    <section className="popular-subjects section">
      <h2>Các Ngành Được Học Nhiều Nhất</h2>
      <div className="subjects-grid">
        {topSubjects.map((subject, index) => (
          <a
            key={index}
            href={`/search?subject=${subject.major_name}`}
            className="subject-item"
          >
            {subject.major_name}
          </a>
        ))}
      </div>
    </section>
  );
};

const HowItWorksSection = () => (
  <section className="how-it-works section">
    <h2>Quy Trình Tìm Gia Sư Đơn Giản</h2>
    <div className="steps">
      <div className="step">
        <FaSearch className="step-icon" />
        <h3>Tìm Môn Học</h3>
        <p>Nhập môn học bạn cần hỗ trợ và khám phá danh sách gia sư.</p>
      </div>
      <div className="step">
        <FaUserGraduate className="step-icon" />
        <h3>Chọn Gia Sư</h3>
        <p>Xem hồ sơ chi tiết, kinh nghiệm và đánh giá từ học viên khác.</p>
      </div>
      <div className="step">
        <FaClock className="step-icon" />
        <h3>Lên Lịch Học</h3>
        <p>Thống nhất lịch học và bắt đầu buổi học đầu tiên!</p>
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="testimonials section">
    <h2>Chia Sẻ Từ Cộng Đồng Sinh Viên Văn Lang</h2>
    <div className="testimonial">
      <img
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        alt="Sinh viên A"
      />
      <p>
        Nhờ có gia sư của Gia Sư Văn Lang, mình đã tự tin hơn rất nhiều với môn
        Đại Số Tuyến Tính. Cảm ơn các bạn!
      </p>
      <p>- Nguyễn Thị A, K25 - Khoa Tài Chính Ngân Hàng</p>
    </div>
    <div className="testimonial">
      <img
        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80"
        alt="Sinh viên B"
      />
      <p>
        Gia sư rất nhiệt tình, thân thiện và có phương pháp giảng dạy dễ hiểu.
        Mình highly recommend Gia Sư Văn Lang
      </p>
      <p>- Trần Văn B, K26 - Khoa Công Nghệ Thông Tin</p>
    </div>
  </section>
);

const TutorFilterSection = () => {
  const [subject, setSubject] = useState("");
  const [university, setUniversity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement your search/filter logic here
    console.log(
      `Searching for tutors in ${subject} at ${university} with price range ${priceRange}`
    );
  };

  return (
    <section className="tutor-filter section">
      <h2>Tìm Gia Sư Theo Tiêu Chí Của Bạn</h2>
      <form onSubmit={handleSearch}>
        <div className="filter-group">
          <label htmlFor="subject">Ngành học</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="cong-nghe-thong-tin">Công nghệ thông tin</option>
            <option value="thiet-ke-noi-that">Thiết kế nội thất</option>
            <option value="ke-toan">Kế toán</option>
            {/* Add more subjects */}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="university">Trường Đại Học:</label>
          <select
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="van-lang">Đại Học Văn Lang</option>
            {/* Add more universities */}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="price">Mức Giá:</label>
          <select
            id="price"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="duoi-50k">Dưới 50k/buổi</option>
            <option value="50k-100k">50k - 100k/buổi</option>
            <option value="tren-100k">Trên 100k/buổi</option>
          </select>
        </div>
        <button type="submit" className="cta-button">
          Tìm Kiếm
        </button>
      </form>
    </section>
  );
};

const TutorProfilesSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);

  const tutors = [
    {
      name: "Lê Minh C",
      major: "Khoa Điện - Điện Tử",
      gpa: "9.0",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    },
    {
      name: "Phạm Thị D",
      major: "Khoa Marketing",
      ielts: "7.5",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      name: "Nguyễn Văn E",
      major: "Khoa CNTT",
      skill: "ReactJS",
      image:
        "https://images.unsplash.com/photo-1599566150163-29194dca90cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      name: "Trần Thị F",
      major: "Khoa Kinh Tế",
      skill: "TOEIC 800",
      image:
        "https://images.unsplash.com/photo-1544005313-943101524655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
    },
    {
      name: "Đỗ Văn G",
      major: "Khoa Xây Dựng",
      skill: "AutoCAD",
      image:
        "https://images.unsplash.com/photo-1500648767791-00d5a4d30aa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: !isPaused,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    beforeChange: (current, next) => {
      // No need to manually set state if autoplay is handled by the slider
    },
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (sliderRef.current && sliderRef.current.slickPause) {
      sliderRef.current.slickPause();
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (sliderRef.current && sliderRef.current.slickPlay) {
      sliderRef.current.slickPlay();
    }
  };

  return (
    <section className="tutor-profiles section">
      <h2>Gặp Gỡ Các Hot Tutor Văn Lang</h2>
      <Slider {...settings} ref={sliderRef} className="tutor-slider">
        {tutors.map((tutor, index) => (
          <div
            key={index}
            className="tutor-slide"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tutor">
              <img src={tutor.image} alt={tutor.name} />
              <h3>{tutor.name}</h3>
              <p className="tutor-info">{tutor.major}</p>
              {tutor.gpa && <p className="tutor-info">GPA: {tutor.gpa}</p>}
              {tutor.ielts && (
                <p className="tutor-info">IELTS: {tutor.ielts}</p>
              )}
              {tutor.skill && (
                <p className="tutor-info">Skill: {tutor.skill}</p>
              )}
              <button className="view-profile-button">Xem Hồ Sơ</button>
            </div>
          </div>
        ))}
      </Slider>
      <button className="view-all-tutors">Xem Tất Cả Gia Sư</button>
    </section>
  );
};

const FAQSection = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: "Tìm gia sư thế nào?",
      answer: "Chọn môn học, xem profile gia sư và liên hệ thôi!",
    },
    {
      question: "Giá cả thế nào?",
      answer:
        "Giá tùy thuộc vào môn và kinh nghiệm gia sư, nhưng luôn ưu đãi sinh viên!",
    },
    {
      question: "Thanh toán bằng gì?",
      answer: "Chuyển khoản, ví điện tử, tiền mặt - tùy bạn chọn!",
    },
  ];

  return (
    <section className="faq section">
      <h2>Hỏi Đáp Nhanh Gọn</h2>
      {faqData.map((item, index) => (
        <div className="faq-item" key={index}>
          <h3 onClick={() => toggleQuestion(index)}>
            {item.question}
            {activeQuestion === index ? <FaMinus /> : <FaPlus />}
          </h3>
          {activeQuestion === index && (
            <p style={{ maxHeight: activeQuestion === index ? "500px" : "0" }}>
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </section>
  );
};

const HomePageContent = () => (
  <div className="home-page-content">
    <HeroSection />
    <BenefitsSection />
    <HowItWorksSection />
    <PopularSubjectsSection />
    <TutorFilterSection />
    <TutorProfilesSection />
    <TestimonialsSection />
    <FAQSection />
  </div>
);

const HomePage = () => (
  <HomePageLayout>
    <HomePageContent />
  </HomePageLayout>
);

export default HomePage;
