import { useState, useEffect, useCallback } from "react"; // Thêm useCallback nếu cần tối ưu
import { useSelector } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/Wallet.style.css"; // CSS riêng cho trang Wallet

// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins, // Icon chính cho Coin
  faPlusCircle, // Icon cho Nạp Coin
  faHistory, // Icon cho Lịch sử
  faArrowUp, // Icon cho giao dịch Nạp
  faArrowDown, // Icon cho giao dịch Sử dụng/Rút
  faMoneyBillWave, // Icon cho phương thức thanh toán
  faSpinner, // Icon cho trạng thái loading
} from "@fortawesome/free-solid-svg-icons";
// Prop validation (optional but recommended)
import PropTypes from "prop-types";

// --- Helper Function (Ví dụ) ---
// Định dạng số thành tiền tệ VND
const formatCurrency = (amount) => {
  if (isNaN(amount) || typeof amount !== "number") return "0 VND";
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// --- Components ---

// --- Balance Section ---
const WalletBalance = ({ currentBalance = 0 }) => {
  const vndValue = currentBalance * 1000; // 1 coin = 1000 VND

  return (
    <section className="wallet-balance-section">
      <div className="balance-card">
        <FontAwesomeIcon icon={faCoins} className="balance-icon" />
        <div className="balance-details">
          <span className="balance-label">Số dư Coin hiện tại</span>
          <span className="balance-amount">
            {currentBalance.toLocaleString("en-US")} Coins
          </span>
          <span className="balance-vnd-equivalent">
            Tương đương: {formatCurrency(vndValue)}
          </span>
        </div>
      </div>
    </section>
  );
};
WalletBalance.propTypes = {
  currentBalance: PropTypes.number,
};

// --- Top-up Section (Updated with Quick Topup) ---
const WalletTopUp = ({ onTopUpSubmit, isLoading }) => {
  const [topupAmountCoin, setTopupAmountCoin] = useState(""); // Số coin muốn nạp
  const [paymentMethod, setPaymentMethod] = useState("momo"); // Phương thức mặc định
  const [error, setError] = useState("");

  // Danh sách các mệnh giá nạp nhanh (số Coin)
  const quickTopupAmounts = [50, 100, 200, 300, 500, 1000];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và không âm
    if (/^\d*$/.test(value)) {
      setTopupAmountCoin(value);
      setError(""); // Xóa lỗi khi nhập hợp lệ
    } else {
      setError("Vui lòng chỉ nhập số nguyên dương.");
    }
  };

  // Hàm xử lý khi nhấn nút nạp nhanh
  const handleQuickTopupClick = (amount) => {
    setTopupAmountCoin(String(amount)); // Cập nhật state số coin
    setError(""); // Xóa lỗi nếu có
  };

  // Sử dụng useCallback nếu hàm này phức tạp hoặc truyền xuống component con khác
  const calculateVnd = useCallback((amountCoin) => {
    const amount = parseInt(amountCoin, 10);
    return isNaN(amount) || amount <= 0 ? 0 : amount * 1000;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(topupAmountCoin, 10);
    if (isNaN(amount) || amount <= 0) {
      setError("Số Coin nạp phải là số dương.");
      return;
    }
    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán.");
      return;
    }
    setError("");
    // Gọi hàm xử lý nạp tiền từ component cha
    onTopUpSubmit({ amountCoin: amount, method: paymentMethod });
  };

  // Tạo nút Nạp text động
  const getSubmitButtonText = () => {
    if (isLoading) {
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
        </>
      );
    }
    const currentAmountCoin = parseInt(topupAmountCoin, 10);
    if (currentAmountCoin > 0) {
      const vndAmount = calculateVnd(currentAmountCoin);
      return `Nạp ${currentAmountCoin.toLocaleString(
        "en-US"
      )} Coin (${formatCurrency(vndAmount)})`;
    }
    return "Xác Nhận Nạp Coin"; // Text mặc định khi chưa nhập
  };

  return (
    <section className="wallet-topup-section section">
      <h2>
        <FontAwesomeIcon icon={faPlusCircle} /> Nạp Thêm Coin
      </h2>
      <form onSubmit={handleSubmit} className="topup-form">
        {/* --- Quick Topup Options --- */}
        <div className="form-group quick-topup-group">
          <label>Chọn nhanh số Coin muốn nạp:</label>
          <div className="quick-topup-options">
            {quickTopupAmounts.map((amount) => (
              <button
                type="button"
                key={amount}
                className={`quick-topup-button ${
                  // So sánh số sau khi parse để tránh lỗi "50" === 50
                  parseInt(topupAmountCoin, 10) === amount ? "active" : ""
                }`}
                onClick={() => handleQuickTopupClick(amount)}
                disabled={isLoading}
              >
                {amount} <span className="coin-suffix">Coins</span>
                <span className="vnd-suffix">
                  ({formatCurrency(amount * 1000)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Manual Amount Input --- */}
        <div className="form-group topup-amount-group">
          <label htmlFor="topupAmountCoin">Hoặc nhập số Coin khác:</label>
          <div className="amount-input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="topupAmountCoin"
              name="topupAmountCoin"
              value={topupAmountCoin}
              onChange={handleAmountChange}
              placeholder="Ví dụ: 123" // Đổi placeholder
              required
              disabled={isLoading}
            />
            <span className="coin-unit">Coins</span>
          </div>
          {/* Chỉ hiển thị VND tương ứng nếu người dùng nhập số khác các nút nhanh */}
          {topupAmountCoin &&
            !quickTopupAmounts.includes(parseInt(topupAmountCoin, 10)) &&
            parseInt(topupAmountCoin, 10) > 0 && (
              <p className="vnd-equivalent-note">
                = {formatCurrency(calculateVnd(topupAmountCoin))}
              </p>
            )}
          {error && <p className="input-error-message">{error}</p>}
        </div>

        {/* --- Payment Method --- */}
        <div className="form-group payment-method-group">
          <label>Chọn phương thức thanh toán</label>
          <div className="payment-options">
            {/* Ví dụ các phương thức - Cần tích hợp thực tế */}
            <label
              className={`payment-option ${
                paymentMethod === "momo" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
              />
              {/* Nhớ thay bằng đường dẫn ảnh thực tế */}
              <img
                src="/images/momo_logo.png"
                alt="MoMo"
                onError={(e) => (e.target.style.display = "none")}
              />
              <span>Ví MoMo</span>
            </label>
            <label
              className={`payment-option ${
                paymentMethod === "bank" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
              />
              <FontAwesomeIcon icon={faMoneyBillWave} />
              <span>Chuyển khoản</span>
            </label>
            {/* Thêm các phương thức khác nếu cần (VNPAY, ZaloPay,...) */}
          </div>
        </div>

        {/* --- Submit Button --- */}
        <button
          type="submit"
          className="topup-submit-button"
          disabled={
            isLoading || !topupAmountCoin || parseInt(topupAmountCoin, 10) <= 0
          }
        >
          {getSubmitButtonText()}
        </button>
      </form>
    </section>
  );
};
WalletTopUp.propTypes = {
  onTopUpSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

// --- Transaction History Section ---
const WalletHistory = ({ transactions = [], isLoading }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case "Nạp tiền":
      case "Nạp Coin":
        return (
          <FontAwesomeIcon
            icon={faArrowUp}
            className="icon-credit"
            title="Nạp Coin"
          />
        );
      case "Thanh toán lớp học":
      case "Sử dụng Coin":
      case "Rút tiền": // Ví dụ
        return (
          <FontAwesomeIcon
            icon={faArrowDown}
            className="icon-debit"
            title="Sử dụng Coin"
          />
        );
      default:
        // Có thể trả về icon mặc định hoặc null
        return (
          <FontAwesomeIcon
            icon={faCoins}
            className="icon-neutral"
            title="Khác"
          />
        );
    }
  };

  return (
    <section className="wallet-history-section section">
      <h2>
        <FontAwesomeIcon icon={faHistory} /> Lịch Sử Giao Dịch
      </h2>
      <div className="transaction-list-container">
        {isLoading && transactions.length === 0 && (
          <div className="loading-placeholder">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Đang tải lịch sử...</p>
          </div>
        )}
        {!isLoading && transactions.length === 0 && (
          <div className="empty-placeholder">
            <p>Bạn chưa có giao dịch nào.</p>
          </div>
        )}
        {transactions.length > 0 && (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại giao dịch</th>
                <th>Chi tiết</th>
                <th className="amount-col">Số Coin</th>
                <th className="status-col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleString("vi-VN")}</td>
                  <td className="type-col">
                    {getTransactionIcon(tx.type)}
                    <span>{tx.type}</span>
                  </td>
                  <td>{tx.details || "---"}</td>{" "}
                  {/* Hiển thị --- nếu không có chi tiết */}
                  <td
                    className={`amount-col ${
                      tx.amount > 0 ? "positive" : "negative"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString("en-US")}
                  </td>
                  <td className="status-cell">
                    {" "}
                    {/* Cell chứa span trạng thái */}
                    <span
                      className={`status-col status-${tx.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* TODO: Thêm Phân trang nếu lịch sử quá dài */}
      {/* Ví dụ: <Pagination currentPage={...} totalPages={...} onPageChange={...} /> */}
    </section>
  );
};
WalletHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      date: PropTypes.string.isRequired, // ISO date string
      type: PropTypes.string.isRequired,
      details: PropTypes.string,
      amount: PropTypes.number.isRequired, // Positive for credit, negative for debit
      status: PropTypes.string.isRequired, // e.g., 'Hoàn thành', 'Đang xử lý', 'Thất bại'
    })
  ),
  isLoading: PropTypes.bool,
};

// --- Main WalletPage Component ---
const WalletPage = () => {
  // Lấy thông tin user từ Redux (giả sử có coinBalance)
  const userProfile = useSelector((state) => state.user.userProfile);
  const [coinBalance, setCoinBalance] = useState(userProfile?.coinBalance || 0); // Lấy số dư từ profile hoặc mặc định là 0
  const [transactions, setTransactions] = useState([]); // State lưu lịch sử
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingTopup, setIsLoadingTopup] = useState(false);
  const [topupSuccessMessage, setTopupSuccessMessage] = useState("");
  const [topupErrorMessage, setTopupErrorMessage] = useState("");

  // --- Fetch Lịch sử giao dịch khi component mount ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // TODO: Gọi API lấy lịch sử giao dịch
        // const response = await Api({ endpoint: 'user/wallet/history', method: METHOD_TYPE.GET });
        // if (response.success) {
        //   setTransactions(response.data);
        // } else {
        //   console.error("Failed to fetch transaction history");
        //   setTransactions([]); // Đặt về mảng rỗng nếu lỗi
        // }

        // --- Dữ liệu mẫu ---
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập delay API
        setTransactions([
          {
            id: 1,
            date: "2023-10-27T10:30:00Z",
            type: "Nạp Coin",
            details: "Nạp qua MoMo",
            amount: 100,
            status: "Hoàn thành",
          },
          {
            id: 2,
            date: "2023-10-26T15:00:00Z",
            type: "Thanh toán lớp học",
            details: "Lớp học Toán cao cấp - GV Nguyễn Văn A",
            amount: -50,
            status: "Hoàn thành",
          },
          {
            id: 3,
            date: "2023-10-25T09:15:00Z",
            type: "Nạp Coin",
            details: "Nạp qua Chuyển khoản",
            amount: 200,
            status: "Hoàn thành",
          },
          {
            id: 4,
            date: "2023-10-24T11:00:00Z",
            type: "Thanh toán lớp học",
            details: "Lớp học Lập trình Web - GV Trần Thị B",
            amount: -80,
            status: "Hoàn thành",
          },
          {
            id: 5,
            date: "2023-10-28T11:00:00Z",
            type: "Nạp Coin",
            details: "Nạp qua MoMo",
            amount: 50,
            status: "Đang xử lý",
          },
          {
            id: 6,
            date: "2023-10-29T14:20:00Z",
            type: "Nạp Coin",
            details: "Nạp qua Chuyển khoản",
            amount: 150,
            status: "Thất bại",
          },
        ]);
        // --- Kết thúc dữ liệu mẫu ---
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setTransactions([]); // Đặt về mảng rỗng nếu lỗi
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []); // Chỉ chạy 1 lần khi mount

  // --- Fetch số dư Coin (nếu cần cập nhật thường xuyên hoặc không có trong userProfile) ---
  useEffect(() => {
    // Giả sử lấy từ userProfile ban đầu
    setCoinBalance(userProfile?.coinBalance || 0);
    // TODO: Có thể gọi API để lấy số dư mới nhất nếu cần
    // const fetchBalance = async () => { ... }; fetchBalance();
  }, [userProfile?.coinBalance]); // Chạy lại nếu coinBalance trong profile thay đổi

  // --- Xử lý khi người dùng nhấn nút Nạp Coin ---
  const handleTopUpSubmit = async (data) => {
    console.log("Submitting top-up request:", data);
    setIsLoadingTopup(true);
    setTopupSuccessMessage("");
    setTopupErrorMessage("");

    // --- !!! Quan trọng: Phần này chỉ mô phỏng !!! ---
    try {
      // Giả lập gọi API backend để tạo yêu cầu thanh toán
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // const response = await Api({...}); // Gọi API thực tế

      // if (response.success && response.data.paymentUrl) {
      //   window.location.href = response.data.paymentUrl; // Chuyển hướng
      // } else if (response.success && response.data.qrData) {
      //   // Hiển thị QR Code
      // } else {
      //   setTopupErrorMessage(response.message || "Lỗi tạo yêu cầu thanh toán.");
      // }

      // --- Giả lập thành công (chỉ để test UI) ---
      console.warn(
        "Simulating successful payment initiation. Real integration needed!"
      );
      setTopupSuccessMessage(
        `Đã tạo yêu cầu nạp ${data.amountCoin} Coin qua ${data.method}. (Đây là giả lập)`
      );
      // TODO: Xử lý chuyển hướng hoặc hiển thị QR trong thực tế.
    } catch (error) {
      console.error("Top-up request error:", error);
      setTopupErrorMessage("Đã xảy ra lỗi khi tạo yêu cầu nạp tiền.");
    } finally {
      setIsLoadingTopup(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="wallet-page-wrapper">
        <div className="wallet-container">
          <h1>
            <FontAwesomeIcon icon={faCoins} /> Ví Coin Của Bạn
          </h1>

          {/* Thông báo thành công/lỗi cho việc nạp tiền */}
          {topupSuccessMessage && (
            <div className="alert alert-success">{topupSuccessMessage}</div>
          )}
          {topupErrorMessage && (
            <div className="alert alert-danger">{topupErrorMessage}</div>
          )}

          <WalletBalance currentBalance={coinBalance} />
          <WalletTopUp
            onTopUpSubmit={handleTopUpSubmit}
            isLoading={isLoadingTopup}
          />
          <WalletHistory
            transactions={transactions}
            isLoading={isLoadingHistory}
          />
        </div>
      </div>
    </HomePageLayout>
  );
};

export default WalletPage;
