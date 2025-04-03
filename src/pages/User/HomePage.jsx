import { useState, useRef, useEffect } from "react"; // Đảm bảo có useRef, useEffect, useState
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
// import { AuthContext } from '../context/AuthContext'; // Bỏ comment nếu dùng Context thay Redux

// --- CSS và Components ---
import "../../assets/css/HomePage.style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePageLayout from "../../components/User/layout/HomePageLayout";

// --- Assets ---
import welcomeTheme from "../../assets/images/vanlang_background3.webp";
import vlubackground4 from "../../assets/images/vanlang_background4.webp";
import subjectList from "../../assets/data/mayjorList.json";
import tutorLevel from "../../assets/data/tutorLevel.json";
import PropTypes from "prop-types";
import person1 from "../../assets/images/person_1.png";
import person2 from "../../assets/images/person_2.png";
import person3 from "../../assets/images/person_3.png";
import person4 from "../../assets/images/person_4.png";

// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faChalkboardUser,
  faBook,
  faClock as faClockSolid,
  faCalendarDays,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

// --- Network và Redux ---
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import { setUserProfile } from "../../redux/userSlice";

/* eslint-disable react/prop-types */

// --- Hero Section (Giữ nguyên) ---
const HeroSection = ({ onSearch }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const searchParams = {
      level: formData.get("level"),
      major: formData.get("major"),
      studyForm: formData.get("studyForm"),
      day: formData.get("day"),
    };
    onSearch(searchParams);
  };

  return (
    <section className="hero">
      <img
        className="welcomeTheme"
        src={welcomeTheme}
        alt="Ảnh nền Đại học Văn Lang"
        loading="lazy"
      />
      <div className="hero-content">
        <h1>Tìm kiếm gia sư theo yêu cầu của bạn</h1>
        <p>Nhanh chóng và dễ dàng tìm kiếm gia sư theo nhu cầu của bạn</p>
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-inputs">
            {/* Trình độ gia sư */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faChalkboardUser}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="level" name="level" aria-label="Chọn trình độ gia sư">
                <option value="">Trình độ gia sư</option>
                {tutorLevel.map((level) => (
                  <option key={level.level_name} value={level.level_name}>
                    {level.level_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngành học */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faBook}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="major" name="major" aria-label="Chọn ngành học">
                <option value="">Tất cả các ngành</option>
                {subjectList.map((subject) => (
                  <option key={subject.major_id} value={subject.major_name}>
                    {subject.major_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hình thức học */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faClockSolid}
                className="search-icon"
                aria-hidden="true"
              />
              <select
                id="studyForm"
                name="studyForm"
                aria-label="Chọn hình thức học"
              >
                <option value="">Hình thức học</option>
                <option value="online">Trực tuyến</option>
                <option value="offline">Tại nhà</option>
                <option value="both">Cả hai</option>
              </select>
            </div>

            {/* Ngày học */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="day" name="day" aria-label="Chọn ngày học">
                <option value="">Chọn ngày</option>
                <option value="monday">Thứ 2</option>
                <option value="tuesday">Thứ 3</option>
                <option value="wednesday">Thứ 4</option>
                <option value="thursday">Thứ 5</option>
                <option value="friday">Thứ 6</option>
                <option value="saturday">Thứ 7</option>
                <option value="sunday">Chủ nhật</option>
              </select>
            </div>

            {/* Nút tìm kiếm */}
            <button type="submit" aria-label="Tìm kiếm gia sư">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </form>
        <button type="button" className="cta-button">
          Bắt Đầu Ngay
        </button>
      </div>
    </section>
  );
};
HeroSection.propTypes = { onSearch: PropTypes.func.isRequired };

// --- Benefits Section (Giữ nguyên) ---
const BenefitsSection = () => (
  <section className="benefits section">
    <h2>Tại Sao Nên Chọn Gia Sư Văn Lang?</h2>
    <div className="benefits-grid">
      <div className="benefit">
        <FaCheckCircle className="benefit-icon" aria-hidden="true" />
        <h3>Gia Sư Đa Dạng, Thân Thiện</h3>
        <p>
          Chủ yếu là các gia sư cũng là sinh viên, dễ dàng trao đổi với học
          viên.
        </p>
      </div>
      <div className="benefit">
        <FaClock className="benefit-icon" aria-hidden="true" />
        <h3>Linh Hoạt Tuyệt Đối</h3>
        <p>
          Tự do lựa chọn thời gian, địa điểm và hình thức học phù hợp với lịch
          trình của bạn.
        </p>
      </div>
      <div className="benefit">
        <FaChartLine className="benefit-icon" aria-hidden="true" />
        <h3>Tiết Kiệm Chi Phí</h3>
        <p>
          Mức giá cạnh tranh, nhiều ưu đãi hấp dẫn dành riêng cho sinh viên Văn
          Lang.
        </p>
      </div>
    </div>
  </section>
);

// --- Arrow Components (Giữ nguyên) ---
function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      className={`${className} custom-slick-arrow custom-slick-next`}
      style={{ ...style }}
      onClick={onClick}
      aria-label="Next Slide"
    >
      <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
    </button>
  );
}
SampleNextArrow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};
function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      className={`${className} custom-slick-arrow custom-slick-prev`}
      style={{ ...style }}
      onClick={onClick}
      aria-label="Previous Slide"
    >
      <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
    </button>
  );
}
SamplePrevArrow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

// --- Popular Subjects Section (Giữ nguyên) ---
const PopularSubjectsSection = () => {
  const sliderRef = useRef(null);
  const slidesToShow = 4;
  const settings = {
    dots: false,
    infinite: subjectList.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: subjectList.length > slidesToShow,
    autoplaySpeed: 4000,
    swipeToSlide: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: subjectList.length > 3,
          autoplay: subjectList.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          infinite: subjectList.length > 2,
          autoplay: subjectList.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: subjectList.length > 1,
          autoplay: subjectList.length > 1,
        },
      },
    ],
  };
  return (
    <section className="popular-subjects section">
      <h2>Các Ngành Được Học Nhiều Nhất</h2>
      <Slider {...settings} ref={sliderRef} className="subjects-slider">
        {subjectList.map((subject) => (
          <div key={subject.major_id} className="subject-slide">
            <div className="subject-item">
              <img
                src={subject.image}
                alt={`Ngành ${subject.major_name}`}
                className="subject-img"
                loading="lazy"
              />
              <div className="subject-img-mask"></div>
              <p>{subject.major_name}</p>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

// --- Testimonials Section (Giữ nguyên) ---
const TestimonialsSection = () => {
  const studentReviews = [
    {
      id: 1,
      name: "Hồ Đăng Khôi Nguyên",
      major: "Khoa Công Nghệ Thông Tin",
      image: person1,
      quote:
        "GiaSuVLU giúp mình tìm được gia sư phù hợp chỉ trong vài phút! Nhờ có bài kiểm tra đánh giá, mình dễ dàng chọn được gia sư có chuyên môn phù hợp với nhu cầu học tập.",
    },
    {
      id: 2,
      name: "Nguyễn Thị B",
      major: "Khoa Quản Trị Kinh Doanh",
      image: person2,
      quote:
        "Quy trình đăng ký và thanh toán rất minh bạch. Mình cảm thấy yên tâm khi sử dụng nền tảng này để tìm gia sư chất lượng, đặc biệt là có sự kiểm duyệt kỹ lưỡng.",
    },
    {
      id: 3,
      name: "Tiêu Thị Ngọc Mai",
      major: "Khoa Quan Hệ Công Chúng",
      image: person4,
      quote:
        "Trải nghiệm học với GiaSuVLU rất tuyệt! Mình có thể chọn học online hoặc offline, lịch học linh hoạt giúp mình dễ dàng cân bằng giữa việc học trên trường và học thêm.",
    },
  ];
  const settings = {
    dots: true,
    infinite: studentReviews.length > 1,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: studentReviews.length > 1,
    autoplaySpeed: 5000,
    arrows: false,
    pauseOnHover: true,
  };
  return (
    <section
      className="testimonials section"
      style={{
        backgroundImage: `url(${vlubackground4})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-labelledby="testimonials-heading"
    >
      <div className="testimonials-overlay"></div>
      <div className="testimonials-content">
        <h2 id="testimonials-heading">Sinh Viên Nói Về Chúng Tôi</h2>
        <Slider {...settings} className="testimonials-slider">
          {studentReviews.map((student) => (
            <div key={student.id}>
              <figure className="student-review">
                <img
                  src={student.image}
                  alt={`Ảnh đại diện ${student.name}`}
                  className="student-image"
                  loading="lazy"
                />
                <figcaption className="student-info">
                  <h3 className="student-name">{student.name}</h3>
                  <p className="student-major">{student.major}</p>
                  <blockquote className="student-quote">
                    {student.quote}
                  </blockquote>
                </figcaption>
              </figure>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

// --- Tutor Profiles Section (Giữ nguyên) ---
const TutorProfilesSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);
  const tutors = [
    {
      id: 1,
      name: "Nguyễn Văn E",
      major: "Khoa CNTT",
      skill: "ReactJS",
      image: person1,
    },
    {
      id: 2,
      name: "Trần Thị F",
      major: "Khoa Kinh Tế",
      skill: "TOEIC 800",
      image: person2,
    },
    {
      id: 3,
      name: "Lê Minh C",
      major: "Khoa Điện - Điện Tử",
      gpa: "9.0",
      image: person3,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      major: "Khoa Marketing",
      ielts: "7.5",
      image: person4,
    },
  ];
  const slidesToShow = 4;
  const settings = {
    dots: false,
    infinite: tutors.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: !isPaused && tutors.length > slidesToShow,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: tutors.length > 3,
          autoplay: !isPaused && tutors.length > 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          infinite: tutors.length > 2,
          autoplay: !isPaused && tutors.length > 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          infinite: tutors.length > 2,
          autoplay: !isPaused && tutors.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: tutors.length > 1,
          autoplay: !isPaused && tutors.length > 1,
        },
      },
    ],
  };
  const handleMouseEnter = () => {
    if (tutors.length > slidesToShow) {
      setIsPaused(true);
      sliderRef.current?.slickPause();
    }
  };
  const handleMouseLeave = () => {
    if (tutors.length > slidesToShow) {
      setIsPaused(false);
      sliderRef.current?.slickPlay();
    }
  };

  return (
    <section className="tutor-profiles section">
      <h2>Gặp Gỡ Các Gia Sư Nổi Bật Của Văn Lang</h2>
      <Slider {...settings} ref={sliderRef} className="tutor-slider">
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className="tutor-slide"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tutor">
              <img
                src={tutor.image}
                alt={`Gia sư ${tutor.name}`}
                loading="lazy"
              />
              <h3>{tutor.name}</h3>
              <p className="tutor-info">{tutor.major}</p>
              {tutor.gpa && <p className="tutor-info">GPA: {tutor.gpa}</p>}
              {tutor.ielts && (
                <p className="tutor-info">IELTS: {tutor.ielts}</p>
              )}
              {tutor.skill && (
                <p className="tutor-info">Skill: {tutor.skill}</p>
              )}
              <button type="button" className="view-profile-button">
                Xem Hồ Sơ
              </button>
            </div>
          </div>
        ))}
      </Slider>
      {tutors.length > slidesToShow && (
        <button type="button" className="view-all-tutors">
          Xem Tất Cả Gia Sư
        </button>
      )}
    </section>
  );
};

// --- FAQ Section (Giữ nguyên) ---
const FAQSection = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };
  const faqData = [
    {
      id: "faq1",
      question: "Làm thế nào để tìm gia sư phù hợp?",
      answer:
        "Để tìm gia sư phù hợp, bạn vui lòng sử dụng bộ lọc tìm kiếm ở đầu trang. Bạn có thể lọc theo trình độ, ngành học, hình thức học và ngày học mong muốn. Hệ thống sẽ hiển thị danh sách các gia sư phù hợp nhất.",
    },
    {
      id: "faq2",
      question: "Gia sư trên GiaSuVLU có đáng tin cậy không?",
      answer:
        "Tại GiaSuVLU, chất lượng gia sư là ưu tiên hàng đầu. Tất cả gia sư đều là sinh viên Văn Lang, trải qua quy trình xác minh thông tin và năng lực. Chúng tôi cũng thu thập phản hồi từ học viên để đảm bảo chất lượng.",
    },
    {
      id: "faq3",
      question: "Làm sao để trở thành gia sư trên GiaSuVLU?",
      answer:
        'Nếu bạn là sinh viên Văn Lang và muốn trở thành gia sư, vui lòng nhấp vào nút "Đăng ký" ở góc trên bên phải và chọn vai trò "Gia sư". Bạn sẽ được hướng dẫn điền hồ sơ và chờ xét duyệt.',
    },
    {
      id: "faq4",
      question: "Hình thức thanh toán như thế nào?",
      answer:
        "Hiện tại, GiaSuVLU hỗ trợ thanh toán học phí qua chuyển khoản ngân hàng hoặc ví điện tử MoMo. Thông tin chi tiết sẽ được cung cấp khi bạn đặt lịch học với gia sư.",
    },
    {
      id: "faq5",
      question: "Chi phí thuê gia sư là bao nhiêu?",
      answer:
        "Chi phí thuê gia sư phụ thuộc vào trình độ, kinh nghiệm của gia sư và môn học. Mức học phí được niêm yết công khai trên hồ sơ của từng gia sư để bạn tham khảo và lựa chọn.",
    },
  ];
  return (
    <section className="faq section">
      <h2>Hỏi Đáp Nhanh Gọn</h2>
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
                <FaMinus aria-hidden="true" />
              ) : (
                <FaPlus aria-hidden="true" />
              )}
            </button>
            <div
              id={item.id}
              className="faq-answer"
              role="region"
              hidden={activeQuestion !== index}
              style={{ maxHeight: activeQuestion === index ? "500px" : "0" }}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- HomePage Content Wrapper (Giữ nguyên) ---
const HomePageContent = ({ onSearch }) => (
  <div className="home-page-content">
    <HeroSection onSearch={onSearch} />
    <BenefitsSection />
    <PopularSubjectsSection />
    <TutorProfilesSection />
    <TestimonialsSection />
    <FAQSection />
  </div>
);
HomePageContent.propTypes = { onSearch: PropTypes.func.isRequired };

// --- Main HomePage Component (Đã cập nhật logic focus) ---
const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { login } = useContext(AuthContext); // Nếu dùng Context

  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const oauthProcessingRef = useRef(null); // Ref cho div loading

  // --- Logic xử lý OAuth Callback ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      setIsProcessingOAuth(true);
      setOauthError(null);

      // <<< START: Đặt focus vào vùng xử lý >>>
      setTimeout(() => {
        oauthProcessingRef.current?.focus();
      }, 0);
      // <<< END: Đặt focus >>>

      const storedState = Cookies.get("microsoft_auth_state");

      if (!storedState || state !== storedState) {
        console.error("Lỗi bảo mật OAuth: State không khớp.");
        setOauthError("Lỗi bảo mật xác thực. Thử lại.");
        Cookies.remove("microsoft_auth_state");
        navigate(location.pathname, { replace: true });
        setIsProcessingOAuth(false);
        return;
      }

      Cookies.remove("microsoft_auth_state");

      const exchangeCodeForToken = async (authCode) => {
        try {
          const response = await Api({
            endpoint: "user/auth/callback",
            method: METHOD_TYPE.POST,
            data: { code: authCode },
          });

          if (response.success && response.data?.token) {
            const { token } = response.data;
            Cookies.set("token", token);
            Cookies.set("role", "user");

            // Lấy profile và dispatch
            try {
              const userInfoResponse = await Api({
                endpoint: "user/get-profile",
                method: METHOD_TYPE.GET,
              });

              if (userInfoResponse.success && userInfoResponse.data) {
                dispatch(setUserProfile(userInfoResponse.data)); // Quan trọng: Cập nhật Redux
                console.log("OAuth: Profile dispatched.");
              } else {
                console.error(
                  "OAuth: Failed to fetch profile:",
                  userInfoResponse.message
                );
                setOauthError("Đăng nhập OK nhưng lỗi tải profile.");
              }
            } catch (profileError) {
              console.error("OAuth: Error fetching profile:", profileError);
              setOauthError("Lỗi tải profile sau OAuth.");
            }
            // if (typeof login === 'function') { login(token, userId); } // Nếu dùng Context
          } else {
            throw new Error(response.message || "Lỗi đổi code lấy token.");
          }
        } catch (err) {
          console.error("Lỗi callback OAuth:", err);
          setOauthError(err.message || "Lỗi đăng nhập OAuth.");
        } finally {
          navigate(location.pathname, { replace: true }); // Luôn làm sạch URL
          setIsProcessingOAuth(false); // Kết thúc xử lý
        }
      };
      exchangeCodeForToken(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, dispatch]); // Dependencies

  // --- Xử lý tìm kiếm ---
  const handleSearch = (searchParams) => {
    console.log("Searching with:", searchParams);
    // Logic tìm kiếm...
  };

  // --- Render ---
  return (
    <HomePageLayout>
      {/* Loading OAuth */}
      {isProcessingOAuth && (
        <div
          ref={oauthProcessingRef} // <<< Gắn ref
          className="oauth-processing-overlay"
          tabIndex="-1" // <<< Cho phép focus bằng JS
          role="region"
          aria-live="assertive"
          aria-label="Đang xử lý đăng nhập"
        >
          <p>Đang xử lý đăng nhập...</p>
          {/* Thêm Spinner nếu muốn */}
        </div>
      )}

      {/* Lỗi OAuth */}
      {oauthError && (
        <div
          className="oauth-error-message"
          style={{
            color: "red",
            border: "1px solid red",
            padding: "10px",
            margin: "10px auto",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          <strong>Lỗi đăng nhập OAuth:</strong> {oauthError}
        </div>
      )}

      {/* Nội dung chính */}
      {!isProcessingOAuth && <HomePageContent onSearch={handleSearch} />}
    </HomePageLayout>
  );
};

export default HomePage;
