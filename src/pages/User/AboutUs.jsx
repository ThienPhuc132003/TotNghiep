import React from "react";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // Đảm bảo đường dẫn layout đúng
import "../../assets/css/AboutUs.style.css"; // Đảm bảo đường dẫn CSS đúng

// Import icons nếu dùng thư viện FontAwesome
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faUserCheck, faClipboardList, faCalendarAlt, faArrowRight, // Hero icons
//   faCheckCircle, faUsers, faGraduationCap, faChartLine, faStar, // Other section icons
//   faEnvelope, faPhone, faMapMarkerAlt // Contact icons
// } from '@fortawesome/free-solid-svg-icons';
// import { faLinkedin, faFacebookSquare, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons'; // Social icons

const AboutUsComponent = () => {
  // --- State cho Form liên hệ ---
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // *** Xử lý logic gửi form ở đây ***
    console.log("Form Data Submitted:", formData);
    alert("Tin nhắn của bạn đã được gửi! Chúng tôi sẽ liên hệ lại sớm.");
    // Reset form (tùy chọn)
    setFormData({ name: '', email: '', message: '' });
  };


  return (
    <HomePageLayout>
      <div className="about-us-container">
        {/* ===== Hero Section Mới ===== */}
        <section className="hero-section-new">
          <div className="hero-content-new">
            <h1 className="hero-title-new">
              Gia Sư VLU: Nâng Tầm Tri Thức - Bứt Phá Thành Công
            </h1>
            <p className="hero-subtitle-new">
              Kết nối hiệu quả sinh viên Văn Lang với đội ngũ gia sư chất lượng,
              giúp bạn tự tin chinh phục mục tiêu học tập và phát triển bản thân.
            </p>
            <ul className="hero-highlights-new">
              <li>
                {/* <FontAwesomeIcon icon={faUserCheck} className="highlight-icon-new" /> */}
                <i className="fas fa-user-check highlight-icon-new"></i>
                <span>Gia sư chọn lọc, đúng chuyên môn</span>
              </li>
              <li>
                {/* <FontAwesomeIcon icon={faClipboardList} className="highlight-icon-new" /> */}
                 <i className="fas fa-clipboard-list highlight-icon-new"></i>
                <span>Lộ trình học tập cá nhân hóa</span>
              </li>
              <li>
                 {/* <FontAwesomeIcon icon={faCalendarAlt} className="highlight-icon-new" /> */}
                <i className="fas fa-calendar-alt highlight-icon-new"></i>
                <span>Lịch học linh hoạt, chủ động</span>
              </li>
            </ul>
            {/* Nút này có thể link đến trang tìm kiếm */}
            <button className="hero-cta-button-new" onClick={() => {/* Logic chuyển trang */} }>
              Tìm Gia Sư Ngay
              {/* <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }}/> */}
              <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
          </div>
          <div className="hero-image-container-new">
            {/* *** THAY BẰNG ẢNH CHẤT LƯỢNG CAO, PHÙ HỢP *** */}
            <img
              // src="https://plus.unsplash.com/premium_photo-1661775953241-bcb0e0d7f1f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" // Ảnh ví dụ
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" // Ảnh khác phù hợp hơn
              alt="Sinh viên Văn Lang học tập hiệu quả"
              className="hero-image-new"
            />
             {/* Optional: Decorative elements */}
             {/* <div className="hero-deco-shape hero-deco-1"></div>
             <div className="hero-deco-shape hero-deco-2"></div> */}
          </div>
        </section>

        {/* ===== Story Section ===== */}
        <section className="story-section section-padding">
          <h2 className="section-title">Về Gia Sư Văn Lang</h2>
          <p className="section-subtitle">
            Xuất phát từ chính những trăn trở của sinh viên Văn Lang trong quá trình học tập,
            Gia Sư Văn Lang ra đời với sứ mệnh tạo cầu nối vững chắc giữa người cần học và người có thể dạy.
            Chúng tôi tin rằng, với sự hỗ trợ đúng đắn và phương pháp phù hợp, mọi sinh viên đều có thể
            vượt qua thử thách và đạt được thành công. Nền tảng của chúng tôi không chỉ cung cấp gia sư,
            mà còn là người bạn đồng hành, thấu hiểu và hỗ trợ bạn trên con đường học vấn tại VLU.
          </p>
        </section>

        {/* ===== Stats Section ===== */}
        <section className="stats-section section-padding">
          <h2 className="section-title">Thành Tựu Nổi Bật</h2>
           {/* *** CẬP NHẬT SỐ LIỆU THỰC TẾ *** */}
          <div className="stats-grid">
            <div className="stats-item">
              <i className="fas fa-users stats-icon"></i>
              <h3>1000+</h3>
              <p>Sinh Viên Đã Tin Tưởng</p>
            </div>
            <div className="stats-item">
              <i className="fas fa-graduation-cap stats-icon"></i>
              <h3>500+</h3>
              <p>Gia Sư Giỏi Chuyên Môn</p>
            </div>
            <div className="stats-item">
              <i className="fas fa-chart-line stats-icon"></i>
              <h3>95%</h3>
              <p>Phản Hồi Tích Cực</p>
            </div>
             <div className="stats-item">
              <i className="fas fa-star stats-icon"></i>
              <h3>4.8/5</h3>
              <p>Đánh Giá Trung Bình</p>
            </div>
          </div>
        </section>

        {/* ===== Why Choose Section ===== */}
        <section className="why-choose-section section-padding">
          <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
          <ul className="why-choose-list">
            <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Đội ngũ gia sư thường là các sinh viên, thân thiện và đa dạng cho học viên lựa chọn</span>
            </li>
            <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Quy trình tuyển chọn và đánh giá gia sư nghiêm ngặt, đảm bảo chất lượng.</span>
            </li>
            <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Lộ trình học tập được cá nhân hóa, bám sát mục tiêu và tốc độ của từng sinh viên.</span>
            </li>
            <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Nền tảng tiện lợi, dễ dàng tìm kiếm, đặt lịch và quản lý buổi học.</span>
            </li>
            <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Chi phí hợp lý, phù hợp với ngân sách của sinh viên.</span>
            </li>
             <li>
               <i className="fas fa-check-circle why-choose-icon"></i>
              <span>Hỗ trợ nhiệt tình, giải đáp thắc mắc nhanh chóng.</span>
            </li>
          </ul>
        </section>

        {/* ===== Team Section ===== */}
        {/* *** QUAN TRỌNG: CẬP NHẬT THÔNG TIN VÀ HÌNH ẢNH THẬT CỦA ĐỘI NGŨ *** */}
        <section className="team-section section-padding">
          <h2 className="section-title">Đội Ngũ Tâm Huyết</h2>
           <p className="section-subtitle">Những người đứng sau Gia Sư Văn Lang, luôn nỗ lực mang đến trải nghiệm tốt nhất.</p>
          <div className="team-grid">
            {/* --- Thành viên Mẫu 1 --- */}
            <div className="team-member">
              <img
                src="https://via.placeholder.com/150/D72134/FFFFFF?text=Ảnh+TV1" // *** THAY ẢNH ***
                alt="[Tên thành viên 1]"
                className="team-member-img"
              />
              <h3>[Tên Thành Viên 1]</h3>
              <p className="team-member-role">Chức vụ (VD: Founder & CEO)</p> {/* & -> & */}
              <p className="team-member-bio">
                [Mô tả ngắn gọn về vai trò, kinh nghiệm, hoặc tâm huyết...]
              </p>
              {/* Social links */}
            </div>
            {/* --- Thành viên Mẫu 2 --- */}
            <div className="team-member">
               <img
                src="https://via.placeholder.com/150/333333/FFFFFF?text=Ảnh+TV2" // *** THAY ẢNH ***
                alt="[Tên thành viên 2]"
                className="team-member-img"
              />
              <h3>[Tên Thành Viên 2]</h3>
              <p className="team-member-role">Chức vụ</p>
               <p className="team-member-bio">[Mô tả ngắn gọn...]</p>
            </div>
             {/* --- Thành viên Mẫu 3 --- */}
             <div className="team-member">
               <img
                src="https://via.placeholder.com/150/F0F0F0/333333?text=Ảnh+TV3" // *** THAY ẢNH ***
                alt="[Tên thành viên 3]"
                className="team-member-img"
              />
              <h3>[Tên Thành Viên 3]</h3>
              <p className="team-member-role">Chức vụ</p>
               <p className="team-member-bio">[Mô tả ngắn gọn...]</p>
            </div>
          </div>
        </section>

        {/* ===== Testimonials Section (ĐÃ BỊ XÓA) ===== */}

        {/* ===== Contact Section ===== */}
        <section className="contact-section section-padding">
          <h2 className="section-title">Liên Hệ & Hỗ Trợ</h2> {/* & -> & */}
          <div className="contact-wrapper">
              <div className="contact-info">
                 <h3>Thông Tin Liên Hệ</h3>
                  {/* *** CẬP NHẬT THÔNG TIN LIÊN HỆ CHÍNH XÁC *** */}
                 <p>
                   <i className="fas fa-envelope"></i>
                   Email: <a href="mailto:info@giasuvanlang.com">info@giasuvanlang.com</a>
                 </p>
                 <p>
                   <i className="fas fa-phone"></i>
                   Điện thoại: <a href="tel:02871099200">028 7109 9200</a> {/* Cân nhắc số riêng */}
                 </p>
                 <p>
                   <i className="fas fa-map-marker-alt"></i>
                   {/* Sử dụng {} và HTML entity nếu cần dấu ngoặc kép */}
                   {`Địa chỉ: [Điền địa chỉ cụ thể - VD: Phòng XXX, Cơ sở 1, Trường ĐH Văn Lang, hoặc `}
                   {`"Hoạt động Online"]`} {/* Hoặc bỏ dấu "" nếu không cần */}
                 </p>
                 {/* Optional: Social Media Links */}
                 {/* <div className="social-links"> ... </div> */}
              </div>
              <div className="contact-form">
                 <h3>Gửi Tin Nhắn Cho Chúng Tôi</h3>
                 <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tên của bạn:</label>
                        <input
                            type="text" id="name" placeholder="Nhập họ và tên"
                            value={formData.name} onChange={handleInputChange} required
                         />
                    </div>
                     <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email" id="email" placeholder="Nhập địa chỉ email"
                            value={formData.email} onChange={handleInputChange} required
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="message">Tin nhắn:</label>
                        <textarea
                            id="message" rows="5" placeholder="Nội dung bạn muốn trao đổi..."
                            value={formData.message} onChange={handleInputChange} required
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-button">Gửi Tin Nhắn</button>
                 </form>
              </div>
          </div>
        </section>
      </div>
    </HomePageLayout>
  );
};

const AboutUs = React.memo(AboutUsComponent);
export default AboutUs;