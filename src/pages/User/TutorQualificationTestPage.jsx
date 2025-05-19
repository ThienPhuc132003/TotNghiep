// src/pages/User/TutorQualificationTestPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorQualificationTestPage.style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const TutorQualificationTestPage = () => {
  const navigate = useNavigate();

  // --- States --- (Giữ nguyên)
  const [isLoading, setIsLoading] = useState(true);
  const [hasPassedTest, setHasPassedTest] = useState(null);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --- API Calls ---

  // Lấy dữ liệu bài test (Giữ nguyên)
  const fetchTestQuestions = useCallback(async () => {
    // ... (code fetchTestQuestions giữ nguyên) ...
    setError("");
    try {
      const response = await Api({
        endpoint: "test/search",
        method: METHOD_TYPE.GET,
      });

      if (response?.success && response?.data?.items?.length > 0) {
        const firstTest = response.data.items[0];
        firstTest.questions.sort((a, b) => a.questionNumber - b.questionNumber);
        setTestData(firstTest);
        const initialAnswers = firstTest.questions.reduce((acc, q) => {
          acc[q.testQuestionId] = null;
          return acc;
        }, {});
        setAnswers(initialAnswers);
      } else {
        throw new Error(
          response?.message ||
            "Không tìm thấy bài test hoặc dữ liệu không hợp lệ."
        );
      }
    } catch (err) {
      console.error("Error fetching test questions:", err);
      setError(err.message || "Lỗi kết nối khi tải câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kiểm tra xem user đã pass test chưa
  const checkTestStatus = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await Api({
        endpoint: "test-result/check-pass-test",
        method: METHOD_TYPE.GET,
      });

      if (response?.success && typeof response?.data === "boolean") {
        if (response.data === true) {
          console.log("TestPage: User has already passed. Redirecting...");
          setHasPassedTest(true);
          // *** CẬP NHẬT ĐƯỜNG DẪN ***
          navigate("/dang-ky-gia-su", { replace: true });
        } else {
          console.log("TestPage: User has not passed. Fetching test data...");
          setHasPassedTest(false);
          fetchTestQuestions();
        }
      } else {
        // Xử lý trường hợp data không phải boolean (ví dụ message là "false") - Tùy chọn, dựa trên API thực tế
        if (
          response?.success &&
          (response.message === "false" || response.message === false)
        ) {
          console.warn(
            "TestPage: API data is not boolean, using message 'false'. Fetching test data..."
          );
          setHasPassedTest(false);
          fetchTestQuestions();
        } else if (
          response?.success &&
          (response.message === "true" || response.message === true)
        ) {
          console.warn(
            "TestPage: API data is not boolean, using message 'true'. Redirecting..."
          );
          setHasPassedTest(true);
          // *** CẬP NHẬT ĐƯỜNG DẪN ***
          navigate("/dang-ky-gia-su", { replace: true });
        } else {
          throw new Error(
            response?.message ||
              "Kiểm tra trạng thái thất bại: Dữ liệu không hợp lệ."
          );
        }
      }
    } catch (err) {
      console.error("Error checking test status:", err);
      setError(err.message || "Lỗi kết nối khi kiểm tra trạng thái bài test.");
      setIsLoading(false);
      setHasPassedTest(false);
    }
  }, [navigate, fetchTestQuestions]);

  // Gửi kết quả bài test
  const submitTestResults = useCallback(async () => {
    // ... (logic kiểm tra và tạo submissionData giữ nguyên) ...
    if (!testData) {
      setError("Không có dữ liệu bài test để nộp.");
      return;
    }
    const answeredQuestions = Object.values(answers).filter(
      (answer) => answer !== null && answer !== ""
    );
    if (answeredQuestions.length < testData.questions.length) {
      setError("Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.");
      return;
    } else {
      setError("");
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    const submissionData = {
      testId: testData.testId,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId: questionId,
        answer: answer,
      })),
    };

    try {
      const response = await Api({
        endpoint: "test-result/submit-test",
        method: METHOD_TYPE.POST,
        data: submissionData,
      });

      if (response?.success) {
        console.log("Test submitted successfully:", response);
        setSubmitSuccess(true);
        setTimeout(() => {
          // *** CẬP NHẬT ĐƯỜNG DẪN ***
          navigate("/dang-ky-gia-su", { replace: true });
        }, 1500);
      } else {
        throw new Error(response?.message || "Nộp bài không thành công.");
      }
    } catch (err) {
      // ... (xử lý lỗi giữ nguyên) ...
      console.error("Error submitting test results:", err);
      setError(err.message || "Lỗi kết nối khi nộp bài.");
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [testData, answers, navigate]);

  // --- Effects --- (Giữ nguyên)
  useEffect(() => {
    checkTestStatus();
  }, [checkTestStatus]);

  // --- Handlers --- (Giữ nguyên)
  const handleAnswerChange = useCallback(
    (questionId, answer) => {
      // ... (giữ nguyên) ...
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: answer,
      }));
      if (error === "Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.") {
        setError("");
      }
    },
    [error]
  );

  const handleSubmitClick = (e) => {
    e.preventDefault();
    submitTestResults();
  };

  // --- Render Logic --- (Giữ nguyên, chỉ cần đảm bảo các đường dẫn trong navigate đã đúng)
  if (isLoading) {
    return (
      <>
        <div className="tutor-test-container loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Đang tải dữ liệu bài kiểm tra...</p>
        </div>
      </>
    );
  }
  // ... (phần còn lại của render logic giữ nguyên) ...
  if (error && !testData && !isSubmitting) {
    return (
      <>
        <div className="tutor-test-container error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="red" />
          <p className="error-message">{error}</p>
          <button onClick={checkTestStatus} disabled={isLoading}>
            Thử lại
          </button>
        </div>
      </>
    );
  }

  if (hasPassedTest === false && testData) {
    const allAnswered = Object.values(answers).every(
      (ans) => ans !== null && ans !== ""
    );
    return (
      <>
        <div className="tutor-test-container">
          {/* ... (title, description, banners) ... */}
          <h1>{testData.tittle}</h1>
          <p className="test-description">{testData.description}</p>

          {submitSuccess && (
            <div className="success-message submit-success-banner">
              <FontAwesomeIcon icon={faCheckCircle} /> Nộp bài thành công! Đang
              chuyển hướng...
            </div>
          )}

          {error && !submitSuccess && (
            <div className="error-message submit-error-banner">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmitClick}>
            {/* ... (map questions) ... */}
            {testData.questions.map((q) => (
              <div key={q.testQuestionId} className="question-card">
                <p className="question-number">Câu {q.questionNumber}:</p>
                <p className="question-text">{q.questionText}</p>
                <div className="options-group">
                  {["A", "B", "C", "D"].map((optionKey) => {
                    const optionText = q[`option${optionKey}`];
                    const inputId = `${q.testQuestionId}-${optionKey}`;
                    return (
                      <label
                        htmlFor={inputId}
                        key={inputId}
                        className="option-label"
                      >
                        <input
                          type="radio"
                          id={inputId}
                          name={q.testQuestionId}
                          value={optionKey}
                          checked={answers[q.testQuestionId] === optionKey}
                          onChange={() =>
                            handleAnswerChange(q.testQuestionId, optionKey)
                          }
                          disabled={isSubmitting || submitSuccess}
                        />
                        <span className="option-key">{optionKey}.</span>
                        <span className="option-text">{optionText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* ... (submit section) ... */}
            <div className="submit-section">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || !allAnswered || submitSuccess}
              >
                {isSubmitting ? (
                  <>
                    {" "}
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang nộp bài...{" "}
                  </>
                ) : (
                  "Nộp bài kiểm tra"
                )}
              </button>
              {!allAnswered && !isSubmitting && !submitSuccess && (
                <p className="validation-hint">
                  Vui lòng hoàn thành tất cả câu hỏi.
                </p>
              )}
            </div>
          </form>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="tutor-test-container">
        {hasPassedTest === true && (
          <p>Bạn đã hoàn thành bài kiểm tra. Đang chuyển hướng...</p>
        )}
      </div>
    </>
  );
};

export default TutorQualificationTestPage;
