import { useEffect, memo } from "react"; // Import useEffect
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch và useSelector
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"; // Thêm icons
import "../../assets/css/PaymentResult.style.css"; // CSS cho trang kết quả

// --- !!! QUAN TRỌNG: Import action thunk lấy profile của bạn !!! ---
// Giả sử bạn đã tạo và export thunk này từ slice user
import { fetchUserProfile } from "../../redux/userSlice"; // Điều chỉnh đường dẫn

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  // Lấy trạng thái loading và lỗi từ Redux store (tùy chọn)
  const { profileLoading, profileError } = useSelector((state) => state.user); // Giả sử state slice tên là 'user'

  // --- Trigger fetch profile khi component được mount ---
  useEffect(() => {
    console.log("PaymentSuccess mounted: Dispatching fetchUserProfile...");
    // Gọi action thunk để lấy profile mới nhất từ backend (bao gồm số coin đã cập nhật)
    dispatch(fetchUserProfile());
  }, [dispatch]); // Dependency là dispatch

  // TODO: Lấy thông tin chi tiết từ URL params nếu cần (ví dụ: mã đơn hàng)
  // import { useSearchParams } from 'react-router-dom';
  // const [searchParams] = useSearchParams();
  // const orderCode = searchParams.get('vnp_TxnRef'); // Ví dụ lấy mã giao dịch VNPAY
  // const amount = searchParams.get('vnp_Amount'); // Số tiền (lưu ý chia 100 nếu VNPAY trả về)

  return (
    <>
      <div className="wallet-page-wrapper">
        <div className="payment-result-container">
          <div className="payment-result-content success">
            {/* Hiển thị icon check hoặc spinner nếu đang load profile */}
            {!profileLoading && !profileError && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="status-icon icon-success"
              />
            )}
            {profileLoading && (
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="status-icon icon-loading"
              />
            )}
            {/* Hiển thị icon lỗi nếu fetch profile thất bại */}
            {!profileLoading && profileError && (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="status-icon icon-warning"
              />
            )}

            <h2>Thanh toán thành công!</h2>
            <p>
              Cảm ơn bạn đã giao dịch. Gói Coin đã được thêm vào tài khoản của
              bạn.
            </p>

            {/* Hiển thị thông báo dựa trên trạng thái fetch profile */}
            {profileLoading && (
              <p className="sub-message loading-message">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  style={{ marginRight: "5px" }}
                />
                Đang cập nhật thông tin tài khoản...
              </p>
            )}
            {!profileLoading && profileError && (
              <p className="sub-message error-message">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  style={{ marginRight: "5px" }}
                />
                Không thể cập nhật số dư mới nhất. Vui lòng kiểm tra lại sau. (
                {profileError})
              </p>
            )}
            {!profileLoading && !profileError && (
              <p className="sub-message">Số dư Xu của bạn đã được cập nhật.</p>
            )}

            {/* Optional: Hiển thị chi tiết giao dịch nếu có */}
            {/* <div className="transaction-details">
                            {orderCode && <p><strong>Mã giao dịch:</strong> {orderCode}</p>}
                            {amount && <p><strong>Số tiền:</strong> {formatCurrency(parseInt(amount) / 100)}</p>}
                        </div> */}

            <div className="action-buttons-payment-result">
              <Link
                to="/tai-khoan/ho-so/vi-ca-nhan"
                className="btn btn-primary"
              >
                Xem Ví Xu
              </Link>
              <Link to="/" className="btn btn-secondary">
                Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(PaymentSuccess);
