import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/Wallet.style.css"; // Đảm bảo đường dẫn đúng
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";

// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faPlusCircle,
  faHistory,
  faArrowUp,
  faArrowDown,
  faMoneyBillWave,
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
const WalletBalance = ({ currentBalance = 0 }) => {
  // Bạn có thể quyết định có hiển thị VND tương đương hay không
  // const vndValue = currentBalance * 1000; // Tỷ lệ quy đổi cần xác nhận

  return (
    <section className="wallet-balance-section">
      <div className="balance-card">
        <FontAwesomeIcon icon={faCoins} className="balance-icon" />
        <div className="balance-details">
          <span className="balance-label">Số dư Coin hiện tại</span>
          <span className="balance-amount">
            {currentBalance.toLocaleString("en-US")} Coins
          </span>
          {/* <span className="balance-vnd-equivalent">
            Tương đương ước tính: {formatCurrency(vndValue)}
          </span> */}
        </div>
      </div>
    </section>
  );
};
WalletBalance.propTypes = {
  currentBalance: PropTypes.number,
};

// --- Top-up Section (Updated) ---
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
    // Optional: Scroll to submit button
    // document.getElementById('topup-submit-button')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPackageId) {
      setError("Vui lòng chọn một gói nạp Coin.");
      return;
    }
    const selectedPackage = packages.find(
      (pkg) => pkg.valueConfigId === selectedPackageId
    );
    if (!selectedPackage) {
      setError("Gói đã chọn không hợp lệ. Vui lòng chọn lại.");
      return;
    }
    setError("");
    onTopUpSubmit({
      packageId: selectedPackage.valueConfigId,
      amountCoin: selectedPackage.coinConfig,
      price: selectedPackage.price,
      method: "bank", // Hardcoded as bank
    });
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
      )} Coin (${formatCurrency(selectedPackageInfo.price)}) qua Chuyển khoản`;
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
                <FontAwesomeIcon icon={faMoneyBillWave} />
                <span>Chuyển khoản Ngân hàng</span>
                <p className="payment-note">
                  Thông tin chuyển khoản sẽ được cung cấp sau khi bạn xác nhận.
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
const WalletHistory = ({ transactions = [], isLoading }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case "Nạp tiền":
      case "Nạp Coin":
      case "TOPUP":
        return (
          <FontAwesomeIcon
            icon={faArrowUp}
            className="icon-credit"
            title="Nạp Coin"
          />
        );
      case "Thanh toán lớp học":
      case "Sử dụng Coin":
      case "PAYMENT_CLASS":
      case "Rút tiền":
        return (
          <FontAwesomeIcon
            icon={faArrowDown}
            className="icon-debit"
            title="Sử dụng Coin"
          />
        );
      default:
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
                  <td>{tx.details || "---"}</td>
                  <td
                    className={`amount-col ${
                      tx.amount > 0 ? "positive" : "negative"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString("en-US")}
                  </td>
                  <td className="status-cell">
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
      {/* TODO: Phân trang */}
    </section>
  );
};
WalletHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      date: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      details: PropTypes.string,
      amount: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
  isLoading: PropTypes.bool,
};

// --- Main WalletPage Component ---
const WalletPage = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const [coinBalance, setCoinBalance] = useState(userProfile?.coinBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [topupSuccessMessage, setTopupSuccessMessage] = useState("");
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
        if (response.success && response.data?.items) {
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

  // Fetch transaction history (using mock data for now)
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Replace with actual API call:
        // const response = await Api({ endpoint: 'user/wallet/history', method: METHOD_TYPE.GET });
        // setTransactions(response.data || []);
        setTransactions([
          {
            id: 1,
            date: "2023-10-27T10:30:00Z",
            type: "Nạp Coin",
            details: "Nạp qua Chuyển khoản",
            amount: 100,
            status: "Hoàn thành",
          },
          {
            id: 2,
            date: "2023-10-26T15:00:00Z",
            type: "Thanh toán lớp học",
            details: "Lớp học Toán",
            amount: -50,
            status: "Hoàn thành",
          },
          {
            id: 5,
            date: "2023-10-28T11:00:00Z",
            type: "Nạp Coin",
            details: "Nạp qua Chuyển khoản",
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
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setTransactions([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // Update balance from profile
  useEffect(() => {
    setCoinBalance(userProfile?.coinBalance || 0);
  }, [userProfile?.coinBalance]);

  // Handle top-up submission
  const handleTopUpSubmit = async (selectedPackageData) => {
    console.log("Submitting top-up request for package:", selectedPackageData);
    setIsLoadingSubmit(true);
    setTopupSuccessMessage("");
    setTopupErrorMessage("");
    try {
      // --- !!! REAL API INTEGRATION NEEDED HERE !!! ---
      console.log(
        `Simulating API call to create bank transfer request for package ${
          selectedPackageData.packageId
        } - ${formatCurrency(selectedPackageData.price)}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Example: Call your backend API
      // const response = await Api({
      //     endpoint: 'payment/create-bank-transfer',
      //     method: METHOD_TYPE.POST,
      //     data: { valueConfigId: selectedPackageData.packageId }
      // });

      // if (response.success && response.data.bankInfo) {
      // Display bank info to user (e.g., in a modal or dedicated section)
      // setBankInfo(response.data.bankInfo); // State to hold bank info
      // setTransferCode(response.data.transferCode); // State for transfer code
      // setIsShowingBankInfo(true); // State to show the info section/modal
      //     setTopupSuccessMessage("Đã tạo yêu cầu. Vui lòng chuyển khoản theo thông tin được cung cấp.");
      // } else {
      //     throw new Error(response.message || "Lỗi tạo yêu cầu thanh toán.");
      // }

      // --- Simulation Success ---
      console.warn(
        "Simulating successful bank transfer request creation. Real integration needed!"
      );
      setTopupSuccessMessage(
        `Yêu cầu nạp ${selectedPackageData.amountCoin} Coin (${formatCurrency(
          selectedPackageData.price
        )}) đã được tạo. (Đây là giả lập - Cần hiển thị thông tin chuyển khoản thực tế)`
      );
      // Clear selection in WalletTopUp? Maybe need a ref or callback
    } catch (error) {
      console.error("Top-up request error:", error);
      setTopupErrorMessage(
        error.message ||
          "Đã xảy ra lỗi khi tạo yêu cầu nạp tiền. Vui lòng thử lại."
      );
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="wallet-page-wrapper">
        <div className="wallet-container">
          <h1>
            <FontAwesomeIcon icon={faCoins} /> Ví Coin Của Bạn
          </h1>
          {topupSuccessMessage && (
            <div className="alert alert-success global-alert">
              {topupSuccessMessage}
            </div>
          )}
          {topupErrorMessage && (
            <div className="alert alert-danger global-alert">
              {topupErrorMessage}
            </div>
          )}
          {/* TODO: Section/Modal to display bank transfer info */}
          {/* {isShowingBankInfo && bankInfo && ( ... )} */}

          <WalletBalance currentBalance={coinBalance} />
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
