
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/RulesRegulationsPage.style.css"; // Đổi tên file CSS

// --- Icons (Có thể giữ lại nếu cần cho các mục nhỏ) ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel, // Icon cho quy định chung
  faUserGraduate, // Icon cho học viên
  faChalkboardUser, // Icon cho gia sư
  faCircleCheck, // Icon cho điều nên làm
  faCircleXmark, // Icon cho điều cấm
  faScaleBalanced, // Icon cho chính sách
} from "@fortawesome/free-solid-svg-icons";

// --- Hero Section ---
const RulesHeroSection = () => (
  <section className="rules-hero">
    {" "}
    {/* Đổi class CSS */}
    <div className="rules-hero-content">
      <h1>Quy định - Nội quy - Hướng dẫn</h1>
      <p>
        Vui lòng đọc kỹ các quy định và hướng dẫn dưới đây để đảm bảo trải
        nghiệm tốt nhất trên GiaSuVLU.
      </p>
    </div>
  </section>
);

// --- Section Nội dung chính ---
// Thay thế Categories và FAQ bằng các section nội dung quy định
const RegulationsContentSection = () => (
  <section className="regulations-content section">
    {" "}
    {/* Class chung cho nội dung */}
    {/* 1. Quy định chung */}
    <div className="regulation-block" id="general-rules">
      <h2>
        <FontAwesomeIcon icon={faGavel} /> Quy Định Chung
      </h2>
      <ul>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Tôn trọng:</strong> Tất cả thành viên (học viên, gia sư) cần
          giao tiếp và ứng xử với thái độ tôn trọng, lịch sự.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Thông tin chính xác:</strong> Cung cấp thông tin cá nhân, học
          vấn, kinh nghiệm một cách trung thực và chính xác. Nghiêm cấm giả mạo
          thông tin.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleXmark} className="icon-dont" />{" "}
          <strong>Nội dung cấm:</strong> Không đăng tải, chia sẻ nội dung vi
          phạm pháp luật, thuần phong mỹ tục, hoặc nội dung không liên quan đến
          việc dạy và học.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Bảo mật tài khoản:</strong> Tự chịu trách nhiệm bảo mật thông
          tin đăng nhập tài khoản cá nhân.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleXmark} className="icon-dont" />{" "}
          <strong>Hành vi gian lận:</strong> Nghiêm cấm mọi hành vi gian lận
          trong học tập, thi cử hoặc trong quá trình sử dụng dịch vụ.
        </li>
      </ul>
    </div>
    {/* 2. Nội quy dành cho Học viên */}
    <div className="regulation-block" id="student-rules">
      <h2>
        <FontAwesomeIcon icon={faUserGraduate} /> Nội Quy Dành Cho Học Viên
      </h2>
      <ul>
        <li>
          <strong>Tìm kiếm & Liên hệ:</strong> Chủ động tìm kiếm gia sư phù hợp
          qua bộ lọc, xem kỹ hồ sơ và đánh giá. Liên hệ gia sư một cách lịch sự,
          nêu rõ nhu cầu học tập.
        </li>
        <li>
          <strong>Thỏa thuận học phí:</strong> Trao đổi và thống nhất rõ ràng về
          học phí, hình thức và thời hạn thanh toán trực tiếp với gia sư trước
          khi bắt đầu học.
        </li>
        <li>
          <strong>Tham gia lớp học:</strong> Đi học đúng giờ, chuẩn bị bài đầy
          đủ (nếu được yêu cầu), tích cực tham gia và tuân thủ hướng dẫn của gia
          sư trong buổi học.
        </li>
        <li>
          <strong>Phản hồi & Đánh giá:</strong> Sau khóa học hoặc một thời gian
          học, vui lòng đưa ra đánh giá khách quan về gia sư để giúp cộng đồng
          có thêm thông tin tham khảo.
        </li>
        <li>
          <strong>Báo cáo vấn đề:</strong> Nếu gặp vấn đề với gia sư (không đảm
          bảo chất lượng, vi phạm quy định), hãy liên hệ bộ phận hỗ trợ của
          GiaSuVLU để được giúp đỡ.
        </li>
      </ul>
    </div>
    {/* 3. Nội quy dành cho Gia sư */}
    <div className="regulation-block" id="tutor-rules">
      <h2>
        <FontAwesomeIcon icon={faChalkboardUser} /> Nội Quy Dành Cho Gia Sư
      </h2>
      <ul>
        <li>
          <strong>Hồ sơ chuyên nghiệp:</strong> Cung cấp thông tin hồ sơ đầy đủ,
          chính xác về trình độ, kinh nghiệm, môn dạy. Hình ảnh đại diện cần rõ
          ràng, lịch sự.
        </li>
        <li>
          <strong>Xác thực thông tin:</strong> GiaSuVLU có thể yêu cầu xác thực
          thông tin (CCCD, thẻ sinh viên, bằng cấp) để đảm bảo tính minh bạch.
        </li>
        <li>
          <strong>Nhận lớp & Giảng dạy:</strong> Phản hồi tin nhắn/yêu cầu từ
          học viên kịp thời. Chuẩn bị giáo án, phương pháp giảng dạy phù hợp.
          Đảm bảo chất lượng buổi học và tác phong sư phạm chuẩn mực.
        </li>
        <li>
          <strong>Học phí & Thanh toán:</strong> Thống nhất rõ ràng về học phí,
          phương thức nhận thanh toán với học viên.
        </li>
        <li>
          <strong>Cam kết & Trách nhiệm:</strong> Đi dạy đúng giờ, đủ buổi như
          đã thỏa thuận. Thông báo sớm nếu có việc đột xuất cần nghỉ hoặc thay
          đổi lịch.
        </li>
        <li>
          <strong>Bảo mật thông tin học viên:</strong> Không tiết lộ thông tin
          cá nhân của học viên cho bên thứ ba.
        </li>
      </ul>
    </div>
    {/* 4. Chính sách & Điều khoản (Liên kết nếu có trang riêng, hoặc tóm tắt) */}
    <div className="regulation-block" id="policies">
      <h2>
        <FontAwesomeIcon icon={faScaleBalanced} /> Chính Sách & Điều Khoản
      </h2>
      <p>
        Việc sử dụng nền tảng GiaSuVLU đồng nghĩa với việc bạn đã đọc, hiểu và
        đồng ý tuân thủ các Điều khoản Sử dụng và Chính sách Bảo mật của chúng
        tôi.
      </p>
      {/* Nếu có trang riêng:
        <p>
          Vui lòng xem chi tiết tại đây:
          <br />
          <a href="/terms-of-service" className="policy-link">Điều khoản Sử dụng</a>
          <br />
          <a href="/privacy-policy" className="policy-link">Chính sách Bảo mật</a>
        </p>
        */}
      {/* Nếu không có trang riêng, có thể tóm tắt vài điểm chính hoặc để trống */}
    </div>
  </section>
);

// --- Contact Support Section (Giữ lại hoặc chỉnh sửa) ---

// --- Main RulesRegulationsPage Component ---
const RulesRegulationsPage = () => {
  return (
    <HomePageLayout>
      <div className="rules-page-wrapper">
        <RulesHeroSection />
        <RegulationsContentSection />
      </div>
    </HomePageLayout>
  );
};

export default RulesRegulationsPage;
