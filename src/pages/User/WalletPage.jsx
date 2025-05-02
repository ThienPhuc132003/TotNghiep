/* global Intl */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/Wallet.style.css";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import iconVNPAY from "../../assets/images/Icon_VNPAY.png";
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
          <span className="balance-label">Số dư Coin hiện tại</span>
          <span className="balance-amount">
            {currentBalance?.toLocaleString("en-US") || 0} Coins
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
    if (isLoadingSubmit)
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
        </>
      );
    if (selectedPackageInfo)
      return `Nạp ${selectedPackageInfo.coinConfig.toLocaleString(
        "en-US"
      )} Coin (${formatCurrency(selectedPackageInfo.price)}) qua VNPAY`;
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
                        alt={`Gói ${pkg.coinConfig.toLocaleString(
                          "en-US"
                        )} Coin`}
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
                        <span>Gói Coin</span>
                      </div>
                    )}
                    {/* Phần Nội dung */}
                    <div className="package-content">
                      <span className="package-name">
                        {pkg.description ||
                          `Gói ${pkg.coinConfig.toLocaleString("en-US")} Coin`}
                      </span>
                      <span className="package-price">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="input-error-message">{error}</p>}
            </div>
            {/* Phần Payment */}
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
};

// --- Transaction History Section ---
const WalletHistory = ({ transactions = [], isLoading }) => {
  const getTransactionIcon = (type) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case "NẠP TIỀN":
      case "NẠP COIN":
      case "TOPUP":
      case "DEPOSIT":
      case "VNPAY_RETURN":
        return (
          <FontAwesomeIcon
            icon={faArrowUp}
            className="icon-credit"
            title="Nạp Coin / Tăng số dư"
          />
        );
      // --- Cần API khác để hiển thị các loại giao dịch tiêu coin ---
      default:
        if (type?.toLowerCase().includes("nạp")) {
          return (
            <FontAwesomeIcon
              icon={faArrowUp}
              className="icon-credit"
              title="Nạp Coin / Tăng số dư"
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

  const getStatusClass = (status) => {
    if (!status) return "status-unknown";
    const normalizedStatus = status
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[:()]/g, "");
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
                <th className="amount-col">Số Coin</th>
                <th className="status-col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
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
                      tx.amount > 0
                        ? "positive"
                        : tx.amount < 0
                        ? "negative"
                        : ""
                    }`}
                  >
                    {tx.amount !== 0 ? (tx.amount > 0 ? "+" : "") : ""}
                    {tx.amount !== 0
                      ? typeof tx.amount === "number"
                        ? tx.amount.toLocaleString("en-US")
                        : "0"
                      : "---"}
                  </td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusClass(tx.status)}`}
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
  const userProfileData = useSelector((state) => state.user.userProfile);
  const [currentCoinAmount, setCurrentCoinAmount] = useState(
    userProfileData?.coin || 0
  );
  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [topupErrorMessage, setTopupErrorMessage] = useState("");
  const [coinPackages, setCoinPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [packagesError, setPackagesError] = useState(null);

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
        console.error("Error fetching coin packages:", error);
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
  }, []);

  // Fetch Transaction History (API mới)
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
          let displayStatus = "Không rõ";
          switch (apiStatus.toUpperCase()) {
            case "PAID":
              displayStatus = "Hoàn thành";
              break;
            case "WAITING_FOR_PAYMENT":
              displayStatus = "Chờ thanh toán";
              break;
            case "FAILED":
              displayStatus = "Thất bại";
              break;
            case "CANCELLED":
              displayStatus = "Đã hủy";
              break;
            case "PROCESSING":
              displayStatus = "Đang xử lý";
              break;
            default:
              displayStatus = apiStatus;
          }
          const transactionAmount = apiStatus === "PAID" ? coinConfig || 0 : 0;
          const transactionType = "Nạp Coin";
          return {
            id: item.orderId || item.paymentId,
            date: item.createdAt,
            type: transactionType,
            details:
              description || `Nạp ${coinConfig || "?"} Coin qua ${payType}`,
            amount: transactionAmount,
            status: displayStatus,
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
  }, []);
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Update balance from Redux
  useEffect(() => {
    const newCoinValue = userProfileData?.coin;
    if (
      (typeof newCoinValue === "number" &&
        newCoinValue !== currentCoinAmount) ||
      (typeof newCoinValue === "number" &&
        currentCoinAmount === 0 &&
        userProfileData)
    ) {
      setCurrentCoinAmount(newCoinValue);
    }
  }, [userProfileData, currentCoinAmount]);

  // Handle Top-up Submission
  const handleTopUpSubmit = useCallback(
    async ({ packageId }) => {
      const customerFullName =
        userProfileData?.fullname ||
        userProfileData?.userProfile?.fullname ||
        "";
      const customerEmail =
        userProfileData?.personalEmail ||
        userProfileData?.userProfile?.personalEmail ||
        "";
      const customerPhone =
        userProfileData?.phoneNumber ||
        userProfileData?.userProfile?.phoneNumber ||
        "";
      if (!customerFullName || !customerEmail || !customerPhone) {
        setTopupErrorMessage(
          "Thiếu thông tin người dùng (Họ tên, Email, SĐT) trong hồ sơ. Vui lòng cập nhật hồ sơ và thử lại."
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
          customerFullname: customerFullName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
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
    [userProfileData]
  );

  // Render
  return (
    <HomePageLayout>
      <div className="wallet-page-wrapper">
        <div className="wallet-container">
          <h1>
            <FontAwesomeIcon icon={faCoins} /> Ví Coin Của Bạn
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
    </HomePageLayout>
  );
};

export default WalletPage;
