import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/PaymentPage.style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const PaymentPage = () => {
  const [step, setStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
  };

  const handlePayment = (status) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setPaymentStatus(status);
      setStep(3);
      setIsSubmitting(false);
    }, 2000);
  };

  useEffect(() => {
    if (paymentStatus) {
      navigate(
        paymentStatus === "success" ? "/payment/success" : "/payment/failed"
      );
    }
  }, [paymentStatus, navigate]);

  return (
    <div className="payment-page">
      <h1>Payment Page</h1>
      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
        <div
          className={`progress-step ${
            step >= 3
              ? paymentStatus === "success"
                ? "active success"
                : "active failure"
              : ""
          }`}
        >
          3
        </div>
      </div>
      {step === 1 && (
        <div className="payment-info">
          <h2>Enter Payment Information</h2>
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={paymentInfo.cardNumber}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="expiryDate"
            placeholder="Expiry Date"
            value={paymentInfo.expiryDate}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={paymentInfo.cvv}
            onChange={handleInputChange}
          />
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="payment-buttons">
          <h2>Confirm Payment</h2>
          <button onClick={() => handlePayment("success")} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Simulate Success"}
          </button>
          <button onClick={() => handlePayment("failure")} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Simulate Failure"}
          </button>
        </div>
      )}
      {step === 3 && paymentStatus === "success" && (
        <div className="payment-success">
          <FontAwesomeIcon icon={faCheckCircle} size="2x" />
          <h2>Payment Successful</h2>
          <p>Thank you for your payment. Your transaction was successful.</p>
        </div>
      )}
      {step === 3 && paymentStatus === "failure" && (
        <div className="payment-failure">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
          <h2>Payment Failed</h2>
          <p>
            Unfortunately, your payment could not be processed. Please try
            again.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;