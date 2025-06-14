import { useState, useRef, useEffect, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import "../../assets/css/HomePage.style.css"; // Đảm bảo file CSS này tồn tại
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; // Vẫn cần CSS core của Slick để hoạt động
import "slick-carousel/slick/slick-theme.css"; // Vẫn cần CSS theme nếu bạn muốn dots, etc. hoặc bạn có thể bỏ nếu tự style hết
import Select from "react-select";

// --- Assets ---
import welcomeTheme from "../../assets/images/anhdeptrai.jpg";
import vlubackground4 from "../../assets/images/vanlang_background4.webp";
import tutorLevelData from "../../assets/data/tutorLevel.json";
import PropTypes from "prop-types";
import person1 from "../../assets/images/person_1.png";
import person2 from "../../assets/images/person_2.png";
import person3 from "../../assets/images/person_3.png";
import person4 from "../../assets/images/person_4.png";
import person5 from "../../assets/images/person_5.png";
import person6 from "../../assets/images/person_6.png";
import person7 from "../../assets/images/person_7.png";

// --- Ảnh cho PopularSubjectsSection ---
import mayjorAutoImg from "../../assets/images/mayjor_auto.jpg";
import mayjorPhysicalImg from "../../assets/images/mayjor_physical.jpg";
import mayjorArchitectureImg from "../../assets/images/mayjor_architecture.jpg";
import mayjorTechnologyImg from "../../assets/images/mayjor_technology.jpg";
import mayjorBusinessImg from "../../assets/images/mayjor_bussiness.jpg";
import mayjorTeacherImg from "../../assets/images/mayjor_teacher.jpg";

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

// --- Custom Styles cho React-Select ---
const customSelectStylesForHero = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "var(--background-white)",
    border: `1px solid ${
      state.isFocused ? "var(--primary-color)" : "var(--border-color)"
    }`,
    borderRadius: "30px",
    height: "50px",
    minHeight: "50px",
    paddingLeft: "2.3rem",
    display: "flex",
    alignItems: "center",
    boxShadow: state.isFocused
      ? `0 0 0 2px rgba(var(--primary-color-rgb), 0.2)`
      : "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      borderColor: state.isFocused
        ? "var(--primary-color)"
        : "var(--border-color-focus, #9a1a27)",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 4px",
    flexWrap: "wrap",
    height: "calc(100% - 4px)",
    maxHeight: "calc(100% - 4px)",
    overflowY: "auto",
    display: "flex",
    alignItems: "center",
  }),
  input: (provided) => ({
    ...provided,
    margin: "2px",
    padding: "0px",
    alignSelf: "stretch",
    minHeight: "20px",
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: "#6b7280",
    marginLeft: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display:
      (state.hasValue && state.selectProps.isMulti) ||
      state.selectProps.inputValue
        ? "none"
        : "block",
    position:
      state.hasValue && state.selectProps.isMulti ? "absolute" : "relative",
    top: state.hasValue && state.selectProps.isMulti ? "-9999px" : undefined,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#374151",
    marginLeft: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "normal",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "8px",
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "var(--primary-color)" : "#9ca3af",
    transition: "color 0.2s ease",
    padding: "8px",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "4px",
    zIndex: 20,
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: "4px",
    paddingBottom: "4px",
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "10px 15px",
    backgroundColor: state.isSelected
      ? "var(--primary-color)"
      : state.isFocused
      ? "rgba(var(--primary-color-rgb), 0.1)"
      : "var(--background-white)",
    color: state.isSelected ? "var(--background-white)" : "var(--text-dark)",
    cursor: "pointer",
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: !state.isSelected
        ? "rgba(var(--primary-color-rgb), 0.05)"
        : undefined,
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "rgba(var(--primary-color-rgb), 0.1)",
    borderRadius: "4px",
    padding: "1px 5px",
    margin: "2px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.85em",
    minHeight: "20px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "var(--primary-color)",
    padding: "0",
    paddingRight: "4px",
    whiteSpace: "nowrap",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "var(--primary-color)",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "var(--primary-color)",
      color: "white",
      borderRadius: "50%",
    },
  }),
};

// --- Hero Section Component ---
const HeroSection = ({ onSearch }) => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedStudyForm, setSelectedStudyForm] = useState(null);
  const [selectedDay, setSelectedDay] = useState([]);

  const levelOptions = tutorLevelData.map((level) => ({
    value: level.level_name,
    label: level.level_name,
  }));

  const majorsForSearchOptions = [
    { value: "CNTT", label: "Công nghệ thông tin" },
    { value: "QTKD", label: "Quản trị kinh doanh" },
    { value: "OTO", label: "Kỹ thuật ô tô" },
    { value: "KT", label: "Kiến trúc" },
    { value: "NNA", label: "Ngôn ngữ Anh" },
  ];
  const studyFormOptions = [
    { value: "ONLINE", label: "Trực tuyến" },
    { value: "OFFLINE", label: "Tại nhà" },
    { value: "BOTH", label: "Cả hai" },
  ];
  const dayOptions = [
    { value: "Monday", label: "Thứ 2" },
    { value: "Tuesday", label: "Thứ 3" },
    { value: "Wednesday", label: "Thứ 4" },
    { value: "Thursday", label: "Thứ 5" },
    { value: "Friday", label: "Thứ 6" },
    { value: "Saturday", label: "Thứ 7" },
    { value: "Sunday", label: "Chủ nhật" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    const searchParams = {};
    if (selectedLevel) searchParams.level = selectedLevel.value;
    if (selectedMajor) searchParams.major = selectedMajor.value;
    if (selectedStudyForm) searchParams.studyForm = selectedStudyForm.value;
    if (selectedDay && selectedDay.length > 0) {
      searchParams.day = selectedDay.map((day) => day.value);
    }
    onSearch(searchParams);
  };

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
        <h1>Tìm kiếm gia sư với GiaSuVLU</h1>
        <p>Nhanh chóng và dễ dàng tìm kiếm gia sư theo nhu cầu của bạn</p>
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-inputs">
            <div className="search-input-wrapper react-select-hero-wrapper">
              <FontAwesomeIcon
                icon={faChalkboardUser}
                className="search-icon"
                aria-hidden="true"
              />
              <Select
                options={levelOptions}
                value={selectedLevel}
                onChange={setSelectedLevel}
                styles={customSelectStylesForHero}
                placeholder="Trình độ gia sư"
                aria-label="Chọn trình độ gia sư"
                isClearable
                className="hero-search-select"
                classNamePrefix="hero-select"
              />
            </div>
            <div className="search-input-wrapper react-select-hero-wrapper">
              <FontAwesomeIcon
                icon={faBook}
                className="search-icon"
                aria-hidden="true"
              />
              <Select
                options={majorsForSearchOptions}
                value={selectedMajor}
                onChange={setSelectedMajor}
                styles={customSelectStylesForHero}
                placeholder="Tất cả các ngành"
                aria-label="Chọn ngành học"
                isClearable
                className="hero-search-select"
                classNamePrefix="hero-select"
              />
            </div>
            <div className="search-input-wrapper react-select-hero-wrapper">
              <FontAwesomeIcon
                icon={faClockSolid}
                className="search-icon"
                aria-hidden="true"
              />
              <Select
                options={studyFormOptions}
                value={selectedStudyForm}
                onChange={setSelectedStudyForm}
                styles={customSelectStylesForHero}
                placeholder="Hình thức học"
                aria-label="Chọn hình thức học"
                isClearable
                className="hero-search-select"
                classNamePrefix="hero-select"
              />
            </div>
            <div className="search-input-wrapper react-select-hero-wrapper">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="search-icon"
                aria-hidden="true"
              />
              <Select
                options={dayOptions}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                value={selectedDay}
                onChange={setSelectedDay}
                styles={customSelectStylesForHero}
                placeholder="Chọn thứ"
                aria-label="Chọn ngày học"
                isClearable
                className="hero-search-select"
                classNamePrefix="hero-select"
              />
            </div>
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

// --- Arrow Components for Slider (ĐÃ CẬP NHẬT) ---
function SampleNextArrow(props) {
  const { style, onClick } = props;
  return (
    <button
      type="button"
      className="custom-slick-arrow custom-slick-next" // Sử dụng class tùy chỉnh
      style={style} // Giữ lại style từ slick nếu cần, CSS sẽ ghi đè nếu cần
      onClick={onClick}
      aria-label="Next Slide"
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </button>
  );
}
SampleNextArrow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

function SamplePrevArrow(props) {
  const { style, onClick } = props;
  return (
    <button
      type="button"
      className="custom-slick-arrow custom-slick-prev" // Sử dụng class tùy chỉnh
      style={style}
      onClick={onClick}
      aria-label="Previous Slide"
    >
      <FontAwesomeIcon icon={faChevronLeft} />
    </button>
  );
}
SamplePrevArrow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

// --- Dữ liệu cho Popular Subjects Section (Định nghĩa cứng) ---
const popularSubjectsData = [
  { id: "auto", major_name: "Kỹ thuật ô tô", image: mayjorAutoImg },
  { id: "physical", major_name: "Vật lý trị liệu", image: mayjorPhysicalImg },
  { id: "architecture", major_name: "Kiến trúc", image: mayjorArchitectureImg },
  { id: "it", major_name: "Công nghệ thông tin", image: mayjorTechnologyImg },
  {
    id: "business",
    major_name: "Quản trị kinh doanh",
    image: mayjorBusinessImg,
  },
  { id: "teacher", major_name: "Sư phạm tiểu học", image: mayjorTeacherImg },
];

// --- Popular Subjects Section Component ---
const PopularSubjectsSection = () => {
  const sliderRef = useRef(null);
  const slidesToShowDefault = 4;
  const settings = {
    dots: false,
    infinite: popularSubjectsData.length > slidesToShowDefault,
    speed: 500,
    slidesToShow: Math.min(slidesToShowDefault, popularSubjectsData.length),
    slidesToScroll: 1,
    autoplay: popularSubjectsData.length > slidesToShowDefault,
    autoplaySpeed: 4000,
    swipeToSlide: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, popularSubjectsData.length),
          infinite: popularSubjectsData.length > 3,
          autoplay: popularSubjectsData.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, popularSubjectsData.length),
          infinite: popularSubjectsData.length > 2,
          autoplay: popularSubjectsData.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: Math.min(1, popularSubjectsData.length),
          infinite: popularSubjectsData.length > 1,
          autoplay: popularSubjectsData.length > 1,
        },
      },
    ],
  };
  return (
    <section className="popular-subjects section">
      <h2>Các Ngành Được Học Nhiều Nhất</h2>
      {popularSubjectsData.length > 0 ? (
        <Slider {...settings} ref={sliderRef} className="subjects-slider">
          {popularSubjectsData.map((subject) => (
            <div key={subject.id} className="subject-slide">
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
      ) : (
        <p>Chưa có thông tin về các ngành học phổ biến.</p>
      )}
    </section>
  );
};

// --- Testimonials Section Component ---
const TestimonialsSection = () => {
  const studentReviews = [
    {
      id: 1,
      name: "Hồ Đăng Khôi Nguyên",
      major: "Khoa Công Nghệ Thông Tin",
      image: person7,
      quote:
        "Nhờ có GiaSuVLU, mình đã tìm được một bạn gia sư CNTT cùng trường rất nhiệt tình. Bạn ấy không chỉ giúp mình qua môn Lập trình Web mà còn chia sẻ nhiều kinh nghiệm thực tế hữu ích.",
    },
    {
      id: 2,
      name: "Nguyễn Thị Bích Trâm",
      major: "Khoa Quản Trị Kinh Doanh",
      image: person6,
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
    arrows: false, // Mũi tên mặc định của slick, có thể không cần nếu đã custom
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
    {
      id: 5,
      name: "Hoàng Văn G",
      major: "Khoa Mỹ Thuật Công Nghiệp",
      skill: "Vẽ tay, Photoshop",
      image: person5,
    },
  ];
  const slidesToShowDefault = 4;
  const settings = {
    dots: false,
    infinite: tutors.length > slidesToShowDefault,
    speed: 500,
    slidesToShow: Math.min(slidesToShowDefault, tutors.length),
    slidesToScroll: 1,
    autoplay: tutors.length > slidesToShowDefault,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, tutors.length),
          infinite: tutors.length > 3,
          autoplay: tutors.length > 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(2, tutors.length),
          infinite: tutors.length > 2,
          autoplay: tutors.length > 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, tutors.length),
          infinite: tutors.length > 2,
          autoplay: tutors.length > 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: Math.min(1, tutors.length),
          infinite: tutors.length > 1,
          autoplay: tutors.length > 1,
        },
      },
    ],
  };

  return (
    <section className="tutor-profiles section">
      <h2>Gặp Gỡ Các Gia Sư Nổi Bật Của Văn Lang</h2>
      {tutors.length > 0 ? (
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
                  {" "}
                  Xem Hồ Sơ{" "}
                </button>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p>Chưa có thông tin về gia sư nổi bật.</p>
      )}
      {tutors.length > slidesToShowDefault && (
        <button type="button" className="view-all-tutors">
          Xem Tất Cả Gia Sư
        </button>
      )}
    </section>
  );
};

// --- FAQ Section Component ---
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (code && state) {
      let isMounted = true;
      setIsProcessingOAuth(true);
      setOauthError(null);
      setTimeout(() => {
        if (isMounted) oauthProcessingRef.current?.focus();
      }, 0);

      const storedState = Cookies.get("microsoft_auth_state");
      if (!storedState || state !== storedState) {
        if (isMounted) {
          setOauthError(
            "Lỗi bảo mật (state không khớp). Vui lòng thử đăng nhập lại."
          );
          Cookies.remove("microsoft_auth_state");
          navigate(location.pathname, { replace: true });
          setIsProcessingOAuth(false);
        }
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
          if (response.success && response.data?.token && isMounted) {
            Cookies.set("token", response.data.token, {
              secure: true,
              sameSite: "Lax",
            });
            Cookies.set("role", "user", { secure: true, sameSite: "Lax" });
            try {
              const userInfoResponse = await Api({
                endpoint: "user/get-profile",
                method: METHOD_TYPE.GET,
              });
              if (
                userInfoResponse.success &&
                userInfoResponse.data &&
                isMounted
              ) {
                dispatch(setUserProfile(userInfoResponse.data));
              } else if (isMounted) {
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
            navigate(location.pathname, { replace: true });
            setIsProcessingOAuth(false);
          }
        }
      };
      exchangeCodeForToken(code);
      return () => {
        isMounted = false;
      };
    }
  }, [location.search, navigate, dispatch, location]);

  const handleSearch = (searchParams) => {
    const queryParams = new URLSearchParams();
    for (const key in searchParams) {
      if (Array.isArray(searchParams[key])) {
        searchParams[key].forEach((val) => queryParams.append(key, val));
      } else {
        queryParams.append(key, searchParams[key]);
      }
    }
    navigate(`/tim-kiem-gia-su?${queryParams.toString()}`);
  };

  return (
    <>
      <div className="home-page-wrapper">
        {isProcessingOAuth && (
          <div
            ref={oauthProcessingRef}
            className="oauth-processing-overlay"
            tabIndex="-1"
            role="region"
            aria-live="assertive"
            aria-label="Đang xử lý đăng nhập qua Microsoft"
          >
            <p>Đang xử lý đăng nhập...</p>
          </div>
        )}
        {oauthError && (
          <div className="oauth-error-message" role="alert">
            <strong>Lỗi Đăng Nhập:</strong> {oauthError}
          </div>
        )}
        {!isProcessingOAuth && <HomePageContent onSearch={handleSearch} />}
      </div>
    </>
  );
};

export default memo(HomePage);
