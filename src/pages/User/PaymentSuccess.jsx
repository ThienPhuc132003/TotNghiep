
import { Link } from 'react-router-dom'; // Cần có React Router
import HomePageLayout from '../../components/User/layout/HomePageLayout'; // Điều chỉnh đường dẫn
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/PaymentResult.style.css'; // Tạo file CSS này

const PaymentSuccess = () => {
  // TODO: Có thể lấy thông tin chi tiết từ URL params nếu backend trả về
  // ví dụ: const [searchParams] = useSearchParams();
  // const orderId = searchParams.get('orderId');
  // const amount = searchParams.get('amount');

  return (
    <HomePageLayout>
      {/* Sử dụng lại class của container Wallet hoặc tạo class mới nếu muốn tùy chỉnh */}
      <div className="wallet-page-wrapper">
        <div className="payment-result-container"> {/* Hoặc dùng className="wallet-container" */}
          <div className="payment-result-content success">
            <FontAwesomeIcon icon={faCheckCircle} className="status-icon icon-success" />
            <h2>Thanh toán thành công!</h2>
            <p>
              Cảm ơn bạn đã giao dịch. Gói Coin đã được thêm vào tài khoản của bạn.
            </p>
            <p className="sub-message">
              Số dư Coin của bạn sẽ được cập nhật trong giây lát.
            </p>

            {/* Optional: Hiển thị chi tiết giao dịch nếu có */}
            {/* <div className="transaction-details">
              <p><strong>Mã đơn hàng:</strong> {orderId || 'N/A'}</p>
              <p><strong>Số tiền:</strong> {amount ? formatCurrency(amount) : 'N/A'}</p>
            </div> */}

            <div className="action-buttons">
              <Link to="/vi-cua-toi" className="btn btn-primary"> {/* Sử dụng class button của bạn */}
                Xem Ví Coin
              </Link>
              <Link to="/" className="btn btn-secondary"> {/* Sử dụng class button của bạn */}
                Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};

// Hàm formatCurrency nếu cần hiển thị số tiền
// const formatCurrency = (amount) => { ... };

export default PaymentSuccess;