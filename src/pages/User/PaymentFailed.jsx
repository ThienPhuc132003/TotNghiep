import { Link } from "react-router-dom"; // Cần có React Router
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"; // Chọn 1 icon
import "../../assets/css/PaymentResult.style.css"; // Dùng chung file CSS

const PaymentFailed = () => {
  // TODO: Có thể lấy thông tin lỗi từ URL params nếu backend trả về
  // const errorCode = searchParams.get('errorCode');
  // const message = searchParams.get('message');

  return (
    <>
      <div className="wallet-page-wrapper">
        <div className="payment-result-container">
          {" "}
          {/* Hoặc dùng className="wallet-container" */}
          <div className="payment-result-content failed">
            {/* Chọn 1 trong 2 icon */}
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="status-icon icon-failure"
            />
            {/* <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon icon-failure" /> */}

            <h2>Thanh toán thất bại!</h2>
            <p>Rất tiếc, giao dịch của bạn không thể hoàn tất vào lúc này.</p>
            <p className="sub-message">
              Lý do có thể là thông tin thanh toán không chính xác, số dư không
              đủ, hoặc sự cố từ phía cổng thanh toán. Vui lòng thử lại hoặc liên
              hệ hỗ trợ.
              {/* {message && ` (${message})`} */}
            </p>

            {/* Optional: Hiển thị chi tiết lỗi nếu có */}
            {/* <div className="transaction-details error-details">
              <p><strong>Mã lỗi:</strong> {errorCode || 'N/A'}</p>
            </div> */}

            <div className="action-buttons-payment-result">
              <Link to="/vi-cua-toi" className="btn btn-primary">
                {" "}
                {/* Nút thử lại */}
                Thử Nạp Lại
              </Link>
              <Link to="/lien-he" className="btn btn-secondary">
                {" "}
                {/* Nút liên hệ */}
                Liên Hệ Hỗ Trợ
              </Link>
              <Link to="/" className="btn btn-tertiary">
                {" "}
                {/* Nút về trang chủ */}
                Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
