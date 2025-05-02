import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // Điều chỉnh đường dẫn nếu cần
import "../../assets/css/Wallet.style.css"; // Điều chỉnh đường dẫn nếu cần
import Api from "../../network/Api"; // Đảm bảo Api helper được cấu hình đúng
import { METHOD_TYPE } from "../../network/methodType";

// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faPlusCircle,
  faHistory,
  faArrowUp,
  faArrowDown,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

// --- Helper Function ---
const formatCurrency = (amount) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || typeof numAmount !== "number") return "0 VND";
  return numAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// --- Components ---

// --- Balance Section ---
// Component này không cần thay đổi, nó nhận prop 'currentBalance'
const WalletBalance = ({ currentBalance = 0 }) => {
  return (
    <section className="wallet-balance-section section">
      <div className="balance-card">
        <FontAwesomeIcon icon={faCoins} className="balance-icon" />
        <div className="balance-details">
          <span className="balance-label">Số dư Coin hiện tại</span>
          <span className="balance-amount">
            {/* Sử dụng toLocaleString cho số coin nếu muốn có dấu phẩy */}
            {currentBalance.toLocaleString("en-US")} Coins
          </span>
        </div>
      </div>
    </section>
  );
};
WalletBalance.propTypes = {
  currentBalance: PropTypes.number,
};

// --- Top-up Section ---
// Component này không cần thay đổi logic hiển thị gói hay submit
const WalletTopUp = ({
  packages = [],
  isLoadingPackages,
  packagesError,
  onTopUpSubmit,
  isLoadingSubmit,
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [error, setError] = useState("");

  const handlePackageSelect = (packageId) => {
    setSelectedPackageId(packageId);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPackageId) {
      setError("Vui lòng chọn một gói nạp Coin.");
      return;
    }
    setError("");
    onTopUpSubmit({ packageId: selectedPackageId });
  };

  const selectedPackageInfo = packages.find(
    (pkg) => pkg.valueConfigId === selectedPackageId
  );

  const getSubmitButtonText = () => {
    if (isLoadingSubmit) {
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
        </>
      );
    }
    if (selectedPackageInfo) {
      return `Nạp ${selectedPackageInfo.coinConfig.toLocaleString(
        "en-US"
      )} Coin (${formatCurrency(selectedPackageInfo.price)}) qua VNPAY`;
    }
    return "Chọn gói và Xác Nhận Nạp Coin";
  };

  return (
    <section className="wallet-topup-section section">
      <h2>
        <FontAwesomeIcon icon={faPlusCircle} /> Nạp Thêm Coin
      </h2>
      <form onSubmit={handleSubmit} className="topup-form">
        {isLoadingPackages && (
          <div className="loading-placeholder">
            <FontAwesomeIcon icon={faSpinner} spin /> Đang tải các gói nạp...
          </div>
        )}
        {packagesError && !isLoadingPackages && (
          <div className="error-placeholder alert alert-danger">
            <FontAwesomeIcon icon={faExclamationTriangle} /> {packagesError}
          </div>
        )}
        {!isLoadingPackages && !packagesError && packages.length === 0 && (
          <div className="empty-placeholder">
            <p>Hiện tại chưa có gói nạp Coin nào.</p>
          </div>
        )}
        {!isLoadingPackages && !packagesError && packages.length > 0 && (
          <>
            <div className="form-group package-selection-group">
              <label>Chọn gói Coin bạn muốn nạp:</label>
              <div className="package-options">
                {packages.map((pkg) => (
                  <button
                    type="button"
                    key={pkg.valueConfigId}
                    className={`package-button ${
                      selectedPackageId === pkg.valueConfigId ? "active" : ""
                    }`}
                    onClick={() => handlePackageSelect(pkg.valueConfigId)}
                    disabled={isLoadingSubmit}
                  >
                    <span className="package-coins">
                      {pkg.coinConfig.toLocaleString("en-US")} Coins
                    </span>
                    <span className="package-price">
                      {formatCurrency(pkg.price)}
                    </span>
                    {pkg.description && (
                      <span className="package-description">
                        {pkg.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {error && <p className="input-error-message">{error}</p>}
            </div>
            <div className="form-group payment-method-display">
              <label>Phương thức thanh toán:</label>
              <div className="payment-option-static">
                <img
                  src="/path/to/vnpay_logo.png" // Thay bằng đường dẫn logo VNPAY
                  alt="VNPAY"
                  style={{
                    height: "24px",
                    marginRight: "8px",
                  }}
                />
                <span>Thanh toán qua VNPAY</span>
                <p className="payment-note">
                  Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao
                  dịch.
                </p>
              </div>
            </div>
            <button
              id="topup-submit-button"
              type="submit"
              className="topup-submit-button"
              disabled={isLoadingSubmit || !selectedPackageId}
            >
              {getSubmitButtonText()}
            </button>
          </>
        )}
      </form>
    </section>
  );
};
WalletTopUp.propTypes = {
  packages: PropTypes.arrayOf(
    PropTypes.shape({
      valueConfigId: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      coinConfig: PropTypes.number.isRequired,
      description: PropTypes.string,
    })
  ),
  isLoadingPackages: PropTypes.bool,
  packagesError: PropTypes.string,
  onTopUpSubmit: PropTypes.func.isRequired,
  isLoadingSubmit: PropTypes.bool,
};

// --- Transaction History Section ---
// Component này không cần thay đổi
const WalletHistory = ({ transactions = [], isLoading }) => {
  const getTransactionIcon = (type) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case "NẠP TIỀN":
      case "NẠP COIN":
      case "TOPUP":
      case "DEPOSIT":
        return (
          <FontAwesomeIcon
            icon={faArrowUp}
            className="icon-credit"
            title="Nạp Coin / Tăng số dư"
          />
        );
      case "THANH TOÁN LỚP HỌC":
      case "SỬ DỤNG COIN":
      case "PAYMENT_CLASS":
      case "RÚT TIỀN":
      case "WITHDRAWAL":
      case "PAYMENT":
        return (
          <FontAwesomeIcon
            icon={faArrowDown}
            className="icon-debit"
            title="Sử dụng Coin / Giảm số dư"
          />
        );
      default:
        return (
          <FontAwesomeIcon
            icon={faCoins}
            className="icon-neutral"
            title="Giao dịch khác"
          />
        );
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
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
                <th className="details-col">Chi tiết</th>
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
                    <span>{tx.type || "Không rõ"}</span>
                  </td>
                  <td className="details-col">{tx.details || "---"}</td>
                  <td
                    className={`amount-col ${
                      tx.amount > 0
                        ? "positive"
                        : tx.amount < 0
                        ? "negative"
                        : ""
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount?.toLocaleString("en-US")}
                  </td>
                  <td className="status-cell">
                    <span className={`status-col ${getStatusClass(tx.status)}`}>
                      {tx.status || "Không rõ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* <Pagination ... /> */}
    </section>
  );
};
WalletHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      date: PropTypes.string.isRequired,
      type: PropTypes.string,
      details: PropTypes.string,
      amount: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
};

// --- Main WalletPage Component ---
const WalletPage = () => {
  const userProfile = useSelector(
    (state) => state.user.userProfile
  );
  console.log("User Profile Data:", userProfile); // Log để kiểm tra dữ liệu

  // *** THAY ĐỔI Ở ĐÂY: Sử dụng userProfile?.coin ***
  const [currentCoinAmount, setCurrentCoinAmount] = useState(
    userProfile?.coin || 0
  );
  // ----------------------------------------------

  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [topupErrorMessage, setTopupErrorMessage] = useState("");
  const [coinPackages, setCoinPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState(null);

  // Fetch coin packages
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoadingPackages(true);
      setPackagesError(null);
      try {
        const response = await Api({
          endpoint: "value-config/get-list",
          method: METHOD_TYPE.GET,
        });
        if (response.success && Array.isArray(response.data?.items)) {
          const sortedPackages = response.data.items.sort(
            (a, b) => parseFloat(a.price) - parseFloat(b.price)
          );
          setCoinPackages(sortedPackages);
        } else {
          throw new Error(
            response.message || "Không thể tải danh sách gói nạp."
          );
        }
      } catch (error) {
        console.error("Error fetching coin packages:", error);
        setPackagesError(
          error.message || "Lỗi kết nối hoặc máy chủ. Vui lòng thử lại sau."
        );
        setCoinPackages([]);
      } finally {
        setIsLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  // Fetch transaction history (Mock data)
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // --- !!! THAY BẰNG API CALL THẬT !!! ---
        await new Promise((resolve) => setTimeout(resolve, 700));
        setTransactions([
          {
            id: 1,
            date: "2024-03-10T10:30:00Z",
            type: "Nạp Coin",
            details: "Thanh toán VNPAY #12345",
            amount: 200,
            status: "Hoàn thành",
          },
          {
            id: 2,
            date: "2024-03-09T15:00:00Z",
            type: "Thanh toán lớp học",
            details: "Lớp học Guitar cơ bản G01",
            amount: -50,
            status: "Hoàn thành",
          },
          {
            id: 3,
            date: "2024-03-11T11:00:00Z",
            type: "Nạp Coin",
            details: "Thanh toán VNPAY #67890 (Đang chờ)",
            amount: 100,
            status: "Đang xử lý",
          },
          {
            id: 4,
            date: "2024-03-08T09:00:00Z",
            type: "Nạp Coin",
            details: "Thanh toán VNPAY #11223 (Thất bại)",
            amount: 0,
            status: "Thất bại",
          },
        ]);
        // --- END MOCK DATA ---
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setTransactions([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // *** THAY ĐỔI Ở ĐÂY: Lắng nghe userProfile?.coin ***
  useEffect(() => {
    const newCoinValue = userProfile?.coin; // Lấy giá trị coin mới
    // Chỉ cập nhật state nếu giá trị mới là số và khác giá trị hiện tại
    if (
      typeof newCoinValue === "number" &&
      newCoinValue !== currentCoinAmount
    ) {
      setCurrentCoinAmount(newCoinValue); // Cập nhật state
    }
  }, [userProfile?.coin, currentCoinAmount]); // Dependencies là coin và state hiện tại
  // --------------------------------------------

  // Handle top-up submission - Luồng VNPAY
  const handleTopUpSubmit = useCallback(
    async (selectedPackageData) => {
      // --- !!! QUAN TRỌNG: Xác nhận lại tên trường chính xác từ Redux !!! ---
      const customerFullName = userProfile?.userProfile.fullname; // Hoặc userProfile?.fullname ?
      const customerEmail = userProfile?.userProfile.personalEmail; // Hoặc userProfile?.personalEmail ?
      const customerPhone = userProfile?.userProfile.phoneNumber; // Hoặc userProfile?.phoneNumber ?
      // ---------------------------------------------------------------------

      // 1. Validate inputs
      if (!customerFullName || !customerEmail || !customerPhone) {
        setTopupErrorMessage(
          "Thiếu thông tin người dùng (Họ tên, Email, SĐT). Vui lòng cập nhật hồ sơ và thử lại."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!selectedPackageData?.packageId) {
        setTopupErrorMessage(
          "Đã có lỗi xảy ra. Không tìm thấy ID gói nạp đã chọn."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      console.log(
        "Bắt đầu quá trình nạp VNPAY cho gói ID:",
        selectedPackageData.packageId
      );
      setIsLoadingSubmit(true);
      setTopupErrorMessage("");

      try {
        // --- Bước 2: Gọi API tạo Order ---
        console.log("Gọi API tạo order...");
        const orderPayload = {
          valueConfigId: selectedPackageData.packageId,
          customerFullname: customerFullName, // Sử dụng biến đã kiểm tra
          customerEmail: customerEmail, // Sử dụng biến đã kiểm tra
          customerPhone: customerPhone, // Sử dụng biến đã kiểm tra
          payType: "VNPAY",
        };

        const orderResponse = await Api({
          endpoint: "order/create-order/with-value-config-id",
          method: METHOD_TYPE.POST,
          data: orderPayload,
        });

        console.log("Response tạo order:", orderResponse);

        if (!orderResponse.success || !orderResponse.data?.paymentId) {
          const errorMessage =
            orderResponse.message ||
            orderResponse.error ||
            "Không thể tạo đơn hàng hoặc thiếu thông tin thanh toán từ máy chủ.";
          throw new Error(errorMessage);
        }

        const paymentId = orderResponse.data.paymentId;
        console.log(`Tạo order thành công. Payment ID: ${paymentId}`);

        // --- Bước 3: Gọi API lấy URL VNPAY ---
        console.log("Gọi API lấy URL VNPAY...");
        const vnpayUrlResponse = await Api({
          endpoint: `payment/vnp-url/${paymentId}`,
          method: METHOD_TYPE.GET,
        });

        console.log("Response lấy URL VNPAY:", vnpayUrlResponse);

        if (!vnpayUrlResponse.success || !vnpayUrlResponse.data?.payUrl) {
          const errorMessage =
            vnpayUrlResponse.message ||
            vnpayUrlResponse.error ||
            "Không thể lấy được liên kết thanh toán VNPAY từ máy chủ.";
          throw new Error(errorMessage);
        }

        const payUrl = vnpayUrlResponse.data.payUrl;
        console.log(`Lấy URL VNPAY thành công: ${payUrl}`);

        // --- Bước 4: Điều hướng người dùng ---
        console.log("Điều hướng tới VNPAY...");
        window.location.href = payUrl;
      } catch (error) {
        console.error("Lỗi trong quá trình nạp VNPAY:", error);
        setTopupErrorMessage(
          `Lỗi: ${
            error.message ||
            "Đã xảy ra sự cố không mong muốn. Vui lòng thử lại."
          }`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsLoadingSubmit(false);
      }
    },
    [userProfile] // Chỉ cần userProfile vì các giá trị khác lấy từ đó
  );

  return (
    <HomePageLayout>
      <div className="wallet-page-wrapper">
        <div className="wallet-container">
          <h1>
            <FontAwesomeIcon icon={faCoins} /> Ví Coin Của Bạn
          </h1>

          {topupErrorMessage && (
            <div className="alert alert-danger global-alert">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{ marginRight: "8px" }}
              />
              {topupErrorMessage}
            </div>
          )}

          {/* *** THAY ĐỔI Ở ĐÂY: Truyền state mới vào WalletBalance *** */}
          <WalletBalance currentBalance={currentCoinAmount} />
          {/* --------------------------------------------------- */}

          <WalletTopUp
            packages={coinPackages}
            isLoadingPackages={isLoadingPackages}
            packagesError={packagesError}
            onTopUpSubmit={handleTopUpSubmit}
            isLoadingSubmit={isLoadingSubmit}
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
