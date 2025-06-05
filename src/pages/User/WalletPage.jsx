/* global Intl */

import { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faPlusCircle,
  faHistory,
  faArrowUp,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import "../../assets/css/Wallet.style.css";
import iconVNPAY from "../../assets/images/Icon_VNPAY.png";

// --- Helper Function ---
const formatCurrency = (amount) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || typeof numAmount !== "number") return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
  })
    .format(numAmount)
    .replace(" VND", " VND");
};

// --- Components ---

// --- Balance Section ---
const WalletBalance = ({ currentBalance = 0 }) => {
  return (
    <section className="wallet-balance-section section">
      <div className="balance-card">
        <FontAwesomeIcon icon={faCoins} className="balance-icon" />
        <div className="balance-details">
          <span className="balance-label">Số dư Xu hiện tại</span>
          <span className="balance-amount">
            {currentBalance?.toLocaleString("en-US") || 0} Xu
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
const WalletTopUp = ({
  packages = [],
  isLoadingPackages,
  packagesError,
  onTopUpSubmit,
  isLoadingSubmit,
  userFullName,
  setUserFullName,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [error, setError] = useState("");

  const handlePackageSelect = (packageId) => {
    if (!isLoadingSubmit) {
      setSelectedPackageId(packageId);
      setError("");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPackageId) {
      setError("Vui lòng chọn một gói nạp Xu.");
      return;
    }
    setError("");
    onTopUpSubmit({ packageId: selectedPackageId });
  };
  const selectedPackageInfo = packages.find(
    (pkg) => pkg.valueConfigId === selectedPackageId
  );

  const getSubmitButtonText = () => {
    if (isLoadingSubmit)
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
        </>
      );
    if (selectedPackageInfo)
      return `Nạp ${selectedPackageInfo.coinConfig.toLocaleString(
        "en-US"
      )} Xu (${formatCurrency(selectedPackageInfo.price)}) qua VNPAY`;
    return "Chọn gói và Xác Nhận Nạp Xu";
  };

  return (
    <section className="wallet-topup-section section">
      <h2>
        <FontAwesomeIcon icon={faPlusCircle} /> Nạp Thêm Xu (1,000 VND = 1 Xu)
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
            <p>Hiện tại chưa có gói nạp Xu nào.</p>
          </div>
        )}
        {!isLoadingPackages && !packagesError && packages.length > 0 && (
          <>
            <div className="form-group package-selection-group">
              <label>Chọn gói Xu bạn muốn nạp:</label>
              <div className="package-options">
                {packages.map((pkg) => (
                  <div
                    key={pkg.valueConfigId}
                    className={`package-card ${
                      selectedPackageId === pkg.valueConfigId ? "active" : ""
                    } ${isLoadingSubmit ? "disabled" : ""}`}
                    onClick={() => handlePackageSelect(pkg.valueConfigId)}
                    role="radio"
                    aria-checked={selectedPackageId === pkg.valueConfigId}
                    tabIndex={isLoadingSubmit ? -1 : 0}
                    onKeyDown={(e) => {
                      if (
                        !isLoadingSubmit &&
                        (e.key === "Enter" || e.key === " ")
                      )
                        handlePackageSelect(pkg.valueConfigId);
                    }}
                  >
                    {/* Phần Ảnh/Placeholder */}
                    {pkg.urlConfig ? (
                      <img
                        src={pkg.urlConfig}
                        alt={`Gói ${pkg.coinConfig.toLocaleString("en-US")} Xu`}
                        className="package-image-direct"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                        onError={(e) => {
                          console.error(`Lỗi tải ảnh: ${e.target.src}`);
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="package-image-placeholder"
                        style={{ height: "150px" }}
                      >
                        <FontAwesomeIcon icon={faCoins} />
                        <span>Gói Xu</span>
                      </div>
                    )}
                    {/* Phần Nội dung */}
                    <div className="package-content">
                      <span className="package-name">
                        {pkg.description ||
                          `Gói ${pkg.coinConfig.toLocaleString("en-US")} Xu`}
                      </span>
                      <span className="package-price">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="input-error-message">{error}</p>}
            </div>{" "}
            {/* Phần Payment và Thông tin thanh toán */}
            <div className="form-group payment-method-display">
              <label>Phương thức thanh toán:</label>
              <div className="payment-option-static">
                <img
                  src={iconVNPAY}
                  alt="VNPAY"
                  style={{ height: "24px", marginRight: "8px" }}
                />
                <span>Thanh toán qua VNPAY</span>
                <p className="payment-note">
                  Bạn sẽ được chuyển đến cổng thanh toán VNPAY.
                </p>
              </div>

              {/* Thêm form thông tin người dùng vào phương thức thanh toán */}
              <div className="payment-user-info">
                <h4>Thông tin người thanh toán</h4>
                <div className="payment-input-group">
                  <div className="payment-form-control">
                    <label>Họ và Tên:</label>
                    <input
                      type="text"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="payment-form-control">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="payment-form-control">
                    <label>Số điện thoại:</label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Nút Submit */}
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
      urlConfig: PropTypes.string,
    })
  ),
  isLoadingPackages: PropTypes.bool,
  packagesError: PropTypes.string,
  onTopUpSubmit: PropTypes.func.isRequired,
  isLoadingSubmit: PropTypes.bool,
  userFullName: PropTypes.string,
  setUserFullName: PropTypes.func,
  userEmail: PropTypes.string,
  setUserEmail: PropTypes.func,
  userPhone: PropTypes.string,
  setUserPhone: PropTypes.func,
};

// --- Transaction History Section ---
const WalletHistory = ({ transactions = [], isLoading }) => {
  const getTransactionIcon = (type) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case "NẠP TIỀN":
      case "NẠP XU":
      case "TOPUP":
      case "DEPOSIT":
      case "VNPAY_RETURN":
        return (
          <FontAwesomeIcon
            icon={faArrowUp}
            className="icon-credit"
            title="Nạp Xu / Tăng số dư"
          />
        );
      // --- Cần API khác để hiển thị các loại giao dịch tiêu coin ---
      default:
        if (type?.toLowerCase().includes("nạp")) {
          return (
            <FontAwesomeIcon
              icon={faArrowUp}
              className="icon-credit"
              title="Nạp Xu / Tăng số dư"
            />
          );
        }
        return (
          <FontAwesomeIcon
            icon={faCoins}
            className="icon-neutral"
            title="Giao dịch khác"
          />
        );
    }
  };

  const getStatusClass = (status, paymentStatus) => {
    if (paymentStatus === false) {
      return "status-failed"; // Ensure failed payments get the 'failed' style
    }
    const normalizedStatus = (status || "unknown")
      .toLowerCase()
      .replace(/\\s+/g, "-");
    // Add more specific classes if needed, e.g., for "Chờ thanh toán"
    if (normalizedStatus.includes("chờ-thanh-toán")) return "status-pending";
    if (normalizedStatus.includes("hoàn-thành")) return "status-completed";
    if (normalizedStatus.includes("thất-bại")) return "status-failed";
    if (normalizedStatus.includes("đã-hủy")) return "status-cancelled";
    return `status-${normalizedStatus}`;
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
                <th className="amount-col">Số Xu</th>
                <th className="status-col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className={
                    tx.paymentStatus === false ? "transaction-failed" : ""
                  }
                >
                  <td>
                    {tx.date
                      ? new Date(tx.date).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "---"}
                  </td>
                  <td className="type-col">
                    {getTransactionIcon(tx.type)}
                    <span>{tx.type || "Không rõ"}</span>
                  </td>
                  <td className="details-col">{tx.details || "---"}</td>
                  <td
                    className={`amount-col ${
                      tx.paymentStatus === false
                        ? "negative" // Use 'negative' for red color, or a new class if defined
                        : tx.amount > 0
                        ? "positive"
                        : tx.amount < 0 // This case might not be applicable for "+0 Xu"
                        ? "negative"
                        : ""
                    }`}
                  >
                    {tx.paymentStatus === false
                      ? "+0 Xu"
                      : `${tx.amount > 0 ? "+" : ""}${
                          tx.amount !== 0
                            ? typeof tx.amount === "number"
                              ? tx.amount.toLocaleString("en-US")
                              : "0"
                            : "---"
                        } Xu`}
                  </td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusClass(
                        tx.status,
                        tx.paymentStatus
                      )}`}
                    >
                      {tx.status || "Không rõ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
WalletHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      date: PropTypes.string,
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
  // Lấy số dư coin từ Redux userProfile
  const userProfile = useSelector((state) => state.user.userProfile) || {};
  const currentCoinAmount =
    typeof userProfile.coin === "number" ? userProfile.coin : 0;
  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [topupErrorMessage, setTopupErrorMessage] = useState("");
  const [coinPackages, setCoinPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [packagesError, setPackagesError] = useState(null);

  // New state for user input
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Fetch Coin Packages
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
        console.error("Error fetching Xu packages:", error);
        setPackagesError(
          error.message ||
            "Lỗi kết nối hoặc máy chủ khi tải gói nạp. Vui lòng thử lại sau."
        );
        setCoinPackages([]);
      } finally {
        setIsLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []); // Fetch Transaction History (API mới)
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const historyResponse = await Api({
        endpoint: "payment/get-my-payment",
        method: METHOD_TYPE.GET,
      });
      if (
        historyResponse.success &&
        Array.isArray(historyResponse.data?.items)
      ) {
        const formattedTransactions = historyResponse.data.items.map((item) => {
          const coinConfig = item.items?.[0]?.valueConfig?.coinConfig;
          const description = item.items?.[0]?.valueConfig?.description;
          const payType = item.payment?.payType || "Không rõ";
          const apiStatus = item.status || "UNKNOWN";
          const paymentStatus = item.payment?.paymentStatus; // Store paymentStatus

          let displayStatus = "Không rõ";
          let transactionAmount = 0;

          if (paymentStatus === false) {
            displayStatus = "Thất bại";
            transactionAmount = 0;
          } else {
            switch (apiStatus.toUpperCase()) {
              case "PAID":
                displayStatus = "Hoàn thành";
                transactionAmount = coinConfig || 0;
                break;
              case "WAITING_FOR_PAYMENT":
                displayStatus = "Chờ thanh toán";
                // transactionAmount remains 0 as it's not paid
                break;
              case "FAILED":
                displayStatus = "Thất bại";
                // transactionAmount remains 0
                break;
              case "CANCELLED":
                displayStatus = "Đã hủy";
                // transactionAmount remains 0
                break;
              case "PROCESSING":
                displayStatus = "Đang xử lý";
                // transactionAmount remains 0
                break;
              default:
                displayStatus = apiStatus; // Or some other default
              // transactionAmount remains 0
            }
          }

          const transactionType = "Nạp Xu"; // Assuming all these are top-ups
          return {
            id: item.orderId || item.paymentId,
            date: item.createdAt,
            type: transactionType,
            details:
              description || `Nạp ${coinConfig || "?"} Xu qua ${payType}`,
            amount: transactionAmount,
            status: displayStatus,
            paymentStatus: paymentStatus, // Pass paymentStatus to the transaction object
          };
        });
        formattedTransactions.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setTransactions(formattedTransactions);
      } else {
        throw new Error(
          historyResponse.message || "Không thể tải lịch sử giao dịch."
        );
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setHistoryError(
        error.message ||
          "Lỗi kết nối hoặc máy chủ khi tải lịch sử. Vui lòng thử lại sau."
      );
      setTransactions([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []); // Empty dependency array is fine since we don't depend on any props or state that changes

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // Now this is safe because fetchHistory won't change

  // Handle Top-up Submission
  const handleTopUpSubmit = useCallback(
    async ({ packageId }) => {
      if (!userFullName || !userEmail || !userPhone) {
        setTopupErrorMessage(
          "Vui lòng nhập đầy đủ thông tin (Họ tên, Email, SĐT)."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!packageId) {
        setTopupErrorMessage("Vui lòng chọn lại gói nạp. Đã có lỗi xảy ra.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setIsLoadingSubmit(true);
      setTopupErrorMessage("");
      try {
        const orderPayload = {
          valueConfigId: packageId,
          customerFullname: userFullName,
          customerEmail: userEmail,
          customerPhone: userPhone,
          payType: "VNPAY",
        };
        const orderResponse = await Api({
          endpoint: "order/create-order/with-value-config-id",
          method: METHOD_TYPE.POST,
          data: orderPayload,
        });
        if (!orderResponse.success || !orderResponse.data?.paymentId) {
          const errorMsg =
            orderResponse.message ||
            orderResponse.error ||
            "Không thể tạo đơn hàng.";
          console.error("Order creation failed:", errorMsg, orderResponse);
          throw new Error(errorMsg);
        }
        const paymentId = orderResponse.data.paymentId;
        const vnpayUrlResponse = await Api({
          endpoint: `payment/vnp-url/${paymentId}`,
          method: METHOD_TYPE.GET,
        });
        if (!vnpayUrlResponse.success || !vnpayUrlResponse.data?.payUrl) {
          const errorMsg =
            vnpayUrlResponse.message ||
            vnpayUrlResponse.error ||
            "Không thể lấy URL thanh toán.";
          console.error("Get VNPAY URL failed:", errorMsg, vnpayUrlResponse);
          throw new Error(errorMsg);
        }
        window.location.href = vnpayUrlResponse.data.payUrl;
      } catch (error) {
        console.error("Lỗi trong quá trình nạp VNPAY:", error);
        setTopupErrorMessage(
          `Lỗi: ${error.message || "Sự cố khi tạo thanh toán."}`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsLoadingSubmit(false);
      }
    },
    [userFullName, userEmail, userPhone]
  );

  // Render
  return (
    <>
      <div className="wallet-page-wrapper">
        <div className="wallet-container">
          <h1>
            <FontAwesomeIcon icon={faCoins} /> Ví Xu Của Bạn
          </h1>
          {topupErrorMessage && (
            <div className="alert alert-danger global-alert" role="alert">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{ marginRight: "8px" }}
              />
              {topupErrorMessage}
            </div>
          )}
          <WalletBalance currentBalance={currentCoinAmount} />
          <WalletTopUp
            packages={coinPackages}
            isLoadingPackages={isLoadingPackages}
            packagesError={packagesError}
            onTopUpSubmit={handleTopUpSubmit}
            isLoadingSubmit={isLoadingSubmit}
            userFullName={userFullName}
            setUserFullName={setUserFullName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
          />
          {historyError && !isLoadingHistory && (
            <div className="alert alert-danger" role="alert">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{ marginRight: "8px" }}
              />
              {historyError}
              <button
                onClick={fetchHistory}
                style={{
                  marginLeft: "15px",
                  padding: "2px 5px",
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            </div>
          )}
          <WalletHistory
            transactions={transactions}
            isLoading={isLoadingHistory}
          />
        </div>
      </div>
    </>
  );
};

export default memo(WalletPage);
