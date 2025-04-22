import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import "../../assets/css/HomePage.style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // Layout chính

// --- Assets ---
import welcomeTheme from "../../assets/images/vanlang_background3.webp";
import vlubackground4 from "../../assets/images/vanlang_background4.webp";
import subjectList from "../../assets/data/mayjorList.json"; // Sample subject data
import tutorLevel from "../../assets/data/tutorLevel.json"; // Sample tutor level data
import PropTypes from "prop-types"; // For prop type checking
import person1 from "../../assets/images/person_1.png"; // Sample images
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
} from "react-icons/fa"; // Using react-icons

// --- Network và Redux ---
import Api from "../../network/Api"; // API call function
import { METHOD_TYPE } from "../../network/methodType"; // API methods
import { setUserProfile } from "../../redux/userSlice"; // Action to update user profile

/* eslint-disable react/prop-types */ // Disable prop-types check if not fully defined yet

// --- Hero Section Component ---
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
  const navigate = useNavigate();
  const FindTutor = () => {
    navigate("/tim-kiem-gia-su");
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
            {/* Level Select */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faChalkboardUser}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="level" name="level" aria-label="Chọn trình độ gia sư">
                <option value="">Trình độ gia sư</option>
                {tutorLevel.map((level, index) => (
                  <option
                    key={level.level_id || `level-${index}`}
                    value={level.level_name}
                  >
                    {level.level_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Major Select */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faBook}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="major" name="major" aria-label="Chọn ngành học">
                <option value="">Tất cả các ngành</option>
                {subjectList.map((subject) => (
                  <option
                    key={subject.major_id || `subject-${subject.major_name}`}
                    value={subject.major_name}
                  >
                    {subject.major_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Study Form Select */}
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
                <option value="">Hình thức học</option>{" "}
                <option value="online">Trực tuyến</option>{" "}
                <option value="offline">Tại nhà</option>{" "}
                <option value="both">Cả hai</option>
              </select>
            </div>
            {/* Day Select */}
            <div className="search-input-wrapper js-no-focus-highlight">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="search-icon"
                aria-hidden="true"
              />
              <select id="day" name="day" aria-label="Chọn ngày học">
                <option value="">Chọn ngày</option>{" "}
                <option value="monday">Thứ 2</option>{" "}
                <option value="tuesday">Thứ 3</option>{" "}
                <option value="wednesday">Thứ 4</option>{" "}
                <option value="thursday">Thứ 5</option>{" "}
                <option value="friday">Thứ 6</option>{" "}
                <option value="saturday">Thứ 7</option>{" "}
                <option value="sunday">Chủ nhật</option>
              </select>
            </div>
            {/* Search Button */}
            <button type="submit" aria-label="Tìm kiếm gia sư">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </form>
        <button type="button" className="cta-button" onClick={FindTutor}>
          Bắt Đầu Ngay
        </button>
      </div>
    </section>
  );
};
HeroSection.propTypes = { onSearch: PropTypes.func.isRequired };

// --- Benefits Section Component ---
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

// --- Arrow Components for Slider ---
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

// --- Popular Subjects Section Component ---
const PopularSubjectsSection = () => {
  const sliderRef = useRef(null);
  const slidesToShow = 4; // Số lượng slide hiển thị mặc định
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
          <div
            key={subject.major_id || `subject-slide-${subject.major_name}`}
            className="subject-slide"
          >
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

// --- Testimonials Section Component (Updated Content) ---
const TestimonialsSection = () => {
  const studentReviews = [
    {
      id: 1,
      name: "Hồ Đăng Khôi Nguyên",
      major: "Khoa Công Nghệ Thông Tin",
      image: person1,
      quote:
        "Nhờ có GiaSuVLU, mình đã tìm được một bạn gia sư CNTT cùng trường rất nhiệt tình. Bạn ấy không chỉ giúp mình qua môn Lập trình Web mà còn chia sẻ nhiều kinh nghiệm thực tế hữu ích.",
    },
    {
      id: 2,
      name: "Nguyễn Thị Bích Trâm",
      major: "Khoa Quản Trị Kinh Doanh",
      image: person2,
      quote:
        "Lịch học của mình khá bận, nhưng mình vẫn dễ dàng sắp xếp được buổi học với gia sư Quản trị nhờ tính năng linh hoạt của nền tảng. Gia sư rất kiên nhẫn và giải thích dễ hiểu.",
    },
    {
      id: 3,
      name: "Tiêu Thị Ngọc Mai",
      major: "Khoa Quan Hệ Công Chúng",
      image: person4,
      quote:
        "Ban đầu mình hơi lo lắng về việc tìm gia sư online, nhưng trải nghiệm trên GiaSuVLU rất tuyệt vời. Gia sư Quan hệ công chúng của mình rất thân thiện và chuyên nghiệp. Mình cảm thấy tự tin hơn hẳn!",
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
      style={{ backgroundImage: `url(${vlubackground4})` }}
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
                    <p>“{student.quote}”</p>
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

// --- Tutor Profiles Section Component ---
const TutorProfilesSection = () => {
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
    // Thêm gia sư nếu cần
    {
      id: 5,
      name: "Hoàng Văn G",
      major: "Khoa Mỹ Thuật Công Nghiệp",
      skill: "Vẽ tay, Photoshop",
      image: person1, // Thay ảnh nếu có
    },
  ];
  const slidesToShow = 4; // Số lượng slide hiển thị mặc định
  const settings = {
    dots: false,
    infinite: tutors.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: tutors.length > slidesToShow,
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
          autoplay: tutors.length > 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          infinite: tutors.length > 2,
          autoplay: tutors.length > 2,
        },
      },
      {
        breakpoint: 768, // Điều chỉnh breakpoint nếu cần
        settings: {
          slidesToShow: 2,
          infinite: tutors.length > 2,
          autoplay: tutors.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: tutors.length > 1,
          autoplay: tutors.length > 1,
        },
      },
    ],
  };
  return (
    <section className="tutor-profiles section">
      <h2>Gặp Gỡ Các Gia Sư Nổi Bật Của Văn Lang</h2>
      <Slider {...settings} ref={sliderRef} className="tutor-slider">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="tutor-slide">
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

// --- FAQ Section Component (Updated Content) ---
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
        "Bạn có thể sử dụng bộ lọc tìm kiếm trên trang chủ để chọn trình độ, ngành học, hình thức học (online/offline) và ngày học mong muốn. Hãy xem kỹ hồ sơ của gia sư, bao gồm kinh nghiệm, thành tích và đánh giá (nếu có) để đưa ra lựa chọn tốt nhất.",
    },
    {
      id: "faq2",
      question: "Gia sư trên GiaSuVLU có đáng tin cậy không?",
      answer:
        "Chúng tôi ưu tiên kết nối bạn với các gia sư là sinh viên hoặc cựu sinh viên Đại học Văn Lang, tạo sự gần gũi và am hiểu chương trình học. Bạn nên xem xét kỹ hồ sơ và có thể yêu cầu buổi học thử (nếu gia sư đồng ý) để đảm bảo sự phù hợp.",
    },
    {
      id: "faq3",
      question: "Làm sao để trở thành gia sư trên GiaSuVLU?",
      answer:
        "Bạn cần đăng ký tài khoản dành cho gia sư, sau đó hoàn thiện hồ sơ cá nhân một cách chi tiết nhất, bao gồm thông tin học vấn (ưu tiên sinh viên VLU), kinh nghiệm giảng dạy/thành tích, các môn/kỹ năng bạn muốn dạy và mức phí mong muốn. Hồ sơ của bạn sẽ được duyệt trước khi hiển thị công khai.",
    },
    {
      id: "faq4",
      question: "Hình thức thanh toán như thế nào?",
      answer:
        "Hiện tại, việc thanh toán học phí thường được thỏa thuận và thực hiện trực tiếp giữa học viên và gia sư. GiaSuVLU đóng vai trò là nền tảng kết nối. Hãy trao đổi rõ ràng về phương thức và thời gian thanh toán với gia sư trước khi bắt đầu.",
    },
    {
      id: "faq5",
      question: "Chi phí thuê gia sư là bao nhiêu?",
      answer:
        "Mức học phí sẽ khác nhau tùy thuộc vào trình độ của gia sư (sinh viên năm mấy, đã tốt nghiệp, thành tích...), môn học/kỹ năng, thời lượng buổi học và hình thức học (online thường có chi phí thấp hơn offline). Bạn có thể tham khảo mức phí đề xuất trên hồ sơ của từng gia sư.",
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

// --- HomePage Content Wrapper Component ---
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

// --- Main HomePage Component ---
const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const oauthProcessingRef = useRef(null);

  // --- OAuth Callback Logic ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (code && state) {
      let isMounted = true;
      setIsProcessingOAuth(true);
      setOauthError(null);
      // Focus after render to ensure element exists
      setTimeout(() => {
        if (isMounted) oauthProcessingRef.current?.focus();
      }, 0);

      const storedState = Cookies.get("microsoft_auth_state");
      if (!storedState || state !== storedState) {
        if (isMounted) {
          setOauthError(
            "Lỗi bảo mật (state không khớp). Vui lòng thử đăng nhập lại."
          );
          Cookies.remove("microsoft_auth_state"); // Clean up invalid state
          navigate(location.pathname, { replace: true }); // Remove code/state from URL
          setIsProcessingOAuth(false);
        }
        return;
      }
      Cookies.remove("microsoft_auth_state"); // State matched, remove it

      const exchangeCodeForToken = async (authCode) => {
        try {
          const response = await Api({
            endpoint: "user/auth/callback", // Make sure this endpoint is correct
            method: METHOD_TYPE.POST,
            data: { code: authCode },
          });

          if (response.success && response.data?.token && isMounted) {
            Cookies.set("token", response.data.token, {
              secure: true,
              sameSite: "Lax",
            }); // Add security flags
            Cookies.set("role", "user", { secure: true, sameSite: "Lax" }); // Assume 'user' role for now

            // Fetch user profile after successful login
            try {
              const userInfoResponse = await Api({
                endpoint: "user/get-profile",
                method: METHOD_TYPE.GET,
                // No need to pass token in data, Api function should handle Authorization header
              });

              if (
                userInfoResponse.success &&
                userInfoResponse.data &&
                isMounted
              ) {
                dispatch(setUserProfile(userInfoResponse.data));
              } else if (isMounted) {
                // Handle profile fetch error - maybe log user in but show error fetching profile?
                setOauthError(
                  "Đăng nhập thành công nhưng không thể tải thông tin hồ sơ."
                );
                console.error("Profile fetch error:", userInfoResponse.message);
              }
            } catch (profileError) {
              if (isMounted) {
                setOauthError(
                  "Đăng nhập thành công nhưng có lỗi khi tải hồ sơ."
                );
                console.error("Error fetching user profile:", profileError);
              }
            }
          } else if (isMounted) {
            // Throw specific error from backend if available
            throw new Error(
              response.message || "Không thể đổi mã xác thực lấy token."
            );
          }
        } catch (err) {
          if (isMounted) {
            setOauthError(
              `Lỗi xử lý đăng nhập: ${
                err.message || "Đã xảy ra lỗi không xác định."
              }`
            );
            console.error("OAuth Callback Error:", err);
          }
        } finally {
          if (isMounted) {
            navigate(location.pathname, { replace: true }); // Remove code/state from URL regardless of success/failure
            setIsProcessingOAuth(false);
          }
        }
      };

      exchangeCodeForToken(code);

      // Cleanup function for useEffect
      return () => {
        isMounted = false;
      };
    }
    // Only run when location.search changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, dispatch]);

  // --- Search Handler ---
  const handleSearch = (searchParams) => {
    console.log("Searching with params:", searchParams);
    // TODO: Implement navigation to search results page
    // Example: navigate(`/search?level=${searchParams.level}&major=${searchParams.major}...`);
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search-results?${query}`); // Navigate to a hypothetical search results page
  };

  // --- Render ---
  return (
    <HomePageLayout>
      {/* Added Wrapper Div for CSS Scoping and potential styling */}
      <div className="home-page-wrapper">
        {isProcessingOAuth && (
          <div
            ref={oauthProcessingRef}
            className="oauth-processing-overlay"
            tabIndex="-1" // Make it focusable
            role="region"
            aria-live="assertive" // Announce changes to screen readers
            aria-label="Đang xử lý đăng nhập qua Microsoft"
          >
            <p>Đang xử lý đăng nhập...</p>
            {/* Optional: Add a spinner */}
          </div>
        )}
        {oauthError && (
          <div
            className="oauth-error-message"
            role="alert" // Important for accessibility
            style={{
              color: "#D8000C", // Error red color
              backgroundColor: "#FFD2D2", // Light red background
              border: "1px solid #D8000C",
              borderRadius: "4px",
              padding: "10px 15px",
              margin: "20px auto", // Center it a bit
              textAlign: "center",
              maxWidth: "600px", // Limit width
            }}
          >
            <strong>Lỗi Đăng Nhập:</strong> {oauthError}
          </div>
        )}
        {/* Render main content only when not processing OAuth */}
        {!isProcessingOAuth && <HomePageContent onSearch={handleSearch} />}
      </div>
    </HomePageLayout>
  );
};

export default HomePage;
