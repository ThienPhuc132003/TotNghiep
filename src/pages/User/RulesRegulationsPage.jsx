import { memo } from "react";
import "../../assets/css/RulesRegulationsPage.style.css"; // Đổi tên file CSS

// --- Icons (Có thể giữ lại nếu cần cho các mục nhỏ) ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel, // Icon cho quy định chung
  faUserGraduate, // Icon cho học viên
  faChalkboardUser, // Icon cho gia sử
  faCircleCheck, // Icon cho điều nên làm
  faCircleXmark, // Icon cho điều cấm
  faScaleBalanced, // Icon cho chính sách
  faCreditCard, // Icon cho thanh toán
  faCoins, // Icon cho xu
  faShieldAlt, // Icon cho bảo mật
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
        </li>{" "}
        <li>
          <strong>Thỏa thuận học phí:</strong> Thống nhất rõ ràng về học phí với
          gia sư. Thanh toán thông qua hệ thống xu của GiaSuVLU để đảm bảo an
          toàn và minh bạch.
        </li>
        <li>
          <strong>Nạp xu trước khi học:</strong> Đảm bảo có đủ xu trong tài
          khoản trước khi bắt đầu lớp học. Hệ thống sẽ tự động trừ xu sau mỗi
          buổi học hoặc theo thỏa thuận.
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
        </li>{" "}
        <li>
          <strong>Báo cáo vấn đề:</strong> Nếu gặp vấn đề với gia sư (không đảm
          bảo chất lượng, vi phạm quy định), hãy liên hệ bộ phận hỗ trợ của
          GiaSuVLU để được giúp đỡ và có thể được hoàn xu.
        </li>
        <li>
          <strong>Bảo mật thông tin:</strong> Không chia sẻ thông tin cá nhân,
          mật khẩu tài khoản với bất kỳ ai. Thông báo ngay cho GiaSuVLU nếu phát
          hiện hoạt động bất thường.
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
        </li>{" "}
        <li>
          <strong>Học phí & Thanh toán:</strong> Thiết lập học phí hợp lý và
          minh bạch. Nhận thanh toán thông qua hệ thống xu của GiaSuVLU, đảm bảo
          an toàn cho cả hai bên.
        </li>
        <li>
          <strong>Hoàn thành lớp học:</strong> Cam kết hoàn thành đầy đủ các
          buổi học đã thỏa thuận. Chỉ nhận được thanh toán sau khi hoàn thành
          buổi học hoặc theo lịch trình đã định.
        </li>
        <li>
          <strong>Cam kết & Trách nhiệm:</strong> Đi dạy đúng giờ, đủ buổi như
          đã thỏa thuận. Thông báo sớm nếu có việc đột xuất cần nghỉ hoặc thay
          đổi lịch.
        </li>{" "}
        <li>
          <strong>Bảo mật thông tin học viên:</strong> Không tiết lộ thông tin
          cá nhân của học viên cho bên thứ ba. Tôn trọng quyền riêng tư và dữ
          liệu cá nhân.
        </li>
        <li>
          <strong>Đánh giá và phản hồi:</strong> Khuyến khích học viên đưa ra
          đánh giá sau khóa học để cải thiện chất lượng dịch vụ.
        </li>
      </ul>{" "}
    </div>
    {/* 4. Quy định Thanh toán và Hệ thống Xu */}
    <div className="regulation-block" id="payment-rules">
      <h2>
        <FontAwesomeIcon icon={faCreditCard} /> Quy Định Thanh Toán & Hệ Thống
        Xu
      </h2>

      <h3>
        <FontAwesomeIcon icon={faCoins} /> Hệ thống Xu (GVL Coin)
      </h3>
      <ul>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Nạp xu:</strong> Học viên có thể nạp xu vào tài khoản thông
          qua các phương thức thanh toán được hỗ trợ (VNPay, MoMo, Banking,
          v.v.). Tỷ lệ quy đổi: 1.000 VND = 1 xu.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Sử dụng xu:</strong> Xu được sử dụng để thanh toán học phí cho
          gia sư, đặt lớp học và các dịch vụ khác trên nền tảng. Mỗi giao dịch
          sẽ trừ số xu tương ứng từ tài khoản.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleXmark} className="icon-dont" />{" "}
          <strong>Không hoàn xu:</strong> Xu đã nạp vào tài khoản không thể hoàn
          trả thành tiền mặt. Chỉ có thể sử dụng trong hệ thống GiaSuVLU.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} className="icon-do" />{" "}
          <strong>Thời hạn sử dụng:</strong> Xu không có thời hạn sử dụng, có
          thể tích lũy và sử dụng bất cứ khi nào.
        </li>
      </ul>

      <h3>
        <FontAwesomeIcon icon={faCreditCard} /> Quy định Thanh toán
      </h3>
      <ul>
        <li>
          <strong>Phương thức thanh toán:</strong> Hỗ trợ thanh toán qua VNPay,
          MoMo, Internet Banking, và các ví điện tử được kết nối. Tất cả giao
          dịch đều được mã hóa và bảo mật.
        </li>
        <li>
          <strong>Xác nhận giao dịch:</strong> Mọi giao dịch nạp xu sẽ được xác
          nhận tự động qua email và thông báo trong hệ thống. Thời gian xử lý:
          1-5 phút.
        </li>
        <li>
          <strong>Hoá đơn điện tử:</strong> GiaSuVLU cung cấp hoá đơn điện tử
          cho tất cả giao dịch nạp xu theo yêu cầu của người dùng.
        </li>
        <li>
          <strong>Bảo mật thanh toán:</strong> Thông tin thanh toán được mã hóa
          SSL 256-bit. GiaSuVLU không lưu trữ thông tin thẻ tín dụng/thẻ ghi nợ
          của người dùng.
        </li>
      </ul>

      <h3>
        <FontAwesomeIcon icon={faShieldAlt} /> Chính sách Hoàn tiền
      </h3>
      <ul>
        <li>
          <strong>Hoàn xu cho lớp học:</strong> Nếu gia sư hủy lớp đột xuất hoặc
          không thể thực hiện, xu sẽ được hoàn trả vào tài khoản học viên trong
          vòng 24 giờ.
        </li>
        <li>
          <strong>Tranh chấp thanh toán:</strong> Trong trường hợp có tranh
          chấp, GiaSuVLU sẽ làm trung gian giải quyết dựa trên bằng chứng và
          thỏa thuận ban đầu.
        </li>
        <li>
          <strong>Hoàn tiền nạp nhầm:</strong> Chỉ xem xét hoàn tiền trong
          trường hợp nạp nhầm số tiền trong vòng 24 giờ kể từ khi giao dịch
          thành công, cần có bằng chứng rõ ràng.
        </li>
        <li>
          <strong>Phí xử lý:</strong> Đối với các giao dịch hoàn tiền được chấp
          thuận, GiaSuVLU có thể áp dụng phí xử lý 2-5% giá trị giao dịch.
        </li>
      </ul>

      <h3>Quy định đối với Gia sư</h3>
      <ul>
        <li>
          <strong>Nhận thanh toán:</strong> Gia sư nhận thanh toán từ học viên
          thông qua hệ thống xu. Tiền sẽ được chuyển vào tài khoản ngân hàng đã
          đăng ký của gia sư.
        </li>
        <li>
          <strong>Chu kỳ thanh toán:</strong> Thanh toán được thực hiện hàng
          tuần (mỗi thứ Hai) cho các lớp học đã hoàn thành trong tuần trước.
        </li>
        <li>
          <strong>Phí dịch vụ:</strong> GiaSuVLU thu phí dịch vụ 10% trên mỗi
          giao dịch thành công để duy trì và phát triển nền tảng.
        </li>
        <li>
          <strong>Thông tin thuế:</strong> Gia sư cần tự khai báo và đóng thuế
          theo quy định pháp luật. GiaSuVLU sẽ cung cấp báo cáo thu nhập theo
          yêu cầu.
        </li>
      </ul>
    </div>
    {/* 5. Chính sách & Điều khoản (Liên kết nếu có trang riêng, hoặc tóm tắt) */}
    <div className="regulation-block" id="policies">
      <h2>
        <FontAwesomeIcon icon={faScaleBalanced} /> Chính Sách & Điều Khoản
      </h2>
      <p>
        Việc sử dụng nền tảng GiaSuVLU đồng nghĩa với việc bạn đã đọc, hiểu và
        đồng ý tuân thủ toàn bộ nội dung sau đây:
      </p>

      <h3>1. Phạm vi áp dụng</h3>
      <p>
        Mọi cá nhân, tổ chức truy cập, đăng ký và sử dụng các dịch vụ trên
        GiaSuVLU (bao gồm website, ứng dụng di động và các kênh liên quan) đều
        buộc phải tuân theo “Điều khoản Sử dụng” và “Chính sách Bảo mật” của
        chúng tôi. Nếu bạn không đồng ý với bất kỳ nội dung nào trong những
        chính sách này, vui lòng ngừng ngay việc truy cập và sử dụng.
      </p>

      <h3>2. Quyền và nghĩa vụ của Người dùng</h3>
      <ul>
        <li>
          <strong>Quyền của Người dùng:</strong>
          Truy cập, đăng ký tài khoản, tìm kiếm và liên hệ với gia sư/học viên;
          cung cấp phản hồi, đánh giá trải nghiệm.
        </li>
        <li>
          <strong>Nghĩa vụ của Người dùng:</strong>
          Cung cấp thông tin chính xác, đầy đủ khi đăng ký; không chia sẻ, mua
          bán tài khoản; tuân thủ quy định về nội dung (không vi phạm pháp luật,
          không đăng tải thông tin sai lệch, mang tính chất lừa đảo).
        </li>
      </ul>

      <h3>3. Chính sách Bảo mật Thông tin</h3>
      <ul>
        <li>
          <strong>Thu thập:</strong>
          Chỉ thu thập những dữ liệu cần thiết (họ tên, email, số điện thoại, hồ
          sơ năng lực, lịch sử giao dịch).
        </li>
        <li>
          <strong>Sử dụng:</strong>
          Dữ liệu được sử dụng nhằm cải thiện trải nghiệm, liên hệ xác nhận dịch
          vụ, hỗ trợ kỹ thuật và gửi thông báo quan trọng.
        </li>
        <li>
          <strong>Bảo mật:</strong>
          Áp dụng biện pháp kỹ thuật, quản lý nội bộ nghiêm ngặt để ngăn chặn
          truy cập trái phép, rò rỉ hoặc mất mát dữ liệu.
        </li>
        <li>
          <strong>Chia sẻ:</strong>
          Không chuyển giao thông tin cho bên thứ ba nếu không có sự đồng ý của
          bạn, trừ trường hợp pháp luật yêu cầu.
        </li>
      </ul>

      <h3>4. Cam kết tuân thủ và xử lý vi phạm</h3>
      <p>
        Khi sử dụng GiaSuVLU, bạn cam kết thực hiện đúng các Điều khoản và Chính
        sách. Mọi hành vi vi phạm (gian lận, đánh giá ảo, quấy rối, lừa đảo…) sẽ
        bị xử lý tùy theo mức độ: từ nhắc nhở, tạm khoá tài khoản đến xóa tài
        khoản vĩnh viễn và báo cơ quan chức năng nếu cần.
      </p>

      <h3>5. Thay đổi và cập nhật chính sách</h3>
      <p>
        GiaSuVLU có quyền cập nhật, sửa đổi “Điều khoản Sử dụng” và “Chính sách
        Bảo mật” theo sát quy định pháp luật và nhu cầu phát triển dịch vụ. Mọi
        thay đổi sẽ được thông báo công khai trên nền tảng ít nhất 07 ngày trước
        khi có hiệu lực. Việc bạn tiếp tục sử dụng dịch vụ sau thời điểm có hiệu
        lực của bản cập nhật tức là đã đồng ý với các điều khoản mới.
      </p>

      <p>
        Bằng việc tiếp tục truy cập và sử dụng GiaSuVLU, bạn xác nhận đã đọc kỹ,
        hiểu rõ và chấp thuận tuân thủ đầy đủ các quy định nêu trên. Nếu có bất
        cứ thắc mắc hoặc yêu cầu bổ sung, vui lòng liên hệ đội ngũ Hỗ trợ Khách
        hàng của chúng tôi qua email{" "}
        <a href="mailto:support@giasuvlu.com">support@giasuvlu.com</a> hoặc số
        hotline 1900-1234 để được giải đáp kịp thời.
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
    <>
      <div className="rules-page-wrapper">
        <RulesHeroSection />
        <RegulationsContentSection />
      </div>{" "}
    </>
  );
};

export default memo(RulesRegulationsPage);
