// src/components/Common/GenericFileUploader.jsx
import { useState, useRef, useEffect } from "react"; // <- Bỏ import React
import PropTypes from "prop-types";
import Api from "../network/Api"; 
import { METHOD_TYPE } from "../network/methodType";
import "../assets/css/GenericFileUploader.style.css";

const GenericFileUploader = ({
  mediaCategory,
  label,
  accept = ".pdf,.png,.jpg,.jpeg,.doc,.docx",
  initialFileUrl,
  onUploadComplete,
  onError = (msg, identifier) => {
    console.error(`File Upload Error [${identifier}]:`, msg);
  },
  required = false,
  fileIdentifier = "",
}) => {
  // const [selectedFile, setSelectedFile] = useState(null); // <- Xóa state này
  const [fileNameDisplay, setFileNameDisplay] = useState("");
  const [finalFileUrl, setFinalFileUrl] = useState(initialFileUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFinalFileUrl(initialFileUrl || null);
    if (initialFileUrl) {
      try {
        const urlObject = new URL(initialFileUrl);
        const params = new URLSearchParams(urlObject.search);
        const nameFromUrl = params.get("fileName");
        if (nameFromUrl) {
          const extensionMatch = nameFromUrl.match(/\.[0-9a-z]+$/i);
          const display = extensionMatch ? nameFromUrl : `${nameFromUrl}.file`;
          setFileNameDisplay(display);
        } else {
          const pathParts = urlObject.pathname.split("/");
          setFileNameDisplay(
            pathParts[pathParts.length - 1] || "File đã tải lên"
          );
        }
      } catch (e) {
        console.warn("Could not parse filename from URL:", initialFileUrl, e);
        setFileNameDisplay("File đã tải lên");
      }
    } else {
      setFileNameDisplay("");
    }
    setErrorMsg("");
  }, [initialFileUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // setSelectedFile(file); // <- Xóa dòng này
      setFileNameDisplay(file.name);
      setErrorMsg("");
      setFinalFileUrl(null);
      handleUploadFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleUploadFile = async (fileToUpload) => {
    // ... (logic upload giữ nguyên) ...
    if (!fileToUpload) {
      const msg = "Vui lòng chọn một file.";
      setErrorMsg(msg);
      onError(msg, fileIdentifier); // Gọi callback lỗi
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // --- Bước 1: Lấy `fileName` từ API ---
      console.log(
        `[${fileIdentifier}] Calling API to get filename for category: ${mediaCategory}`
      );
      const fileNameResponse = await Api({
        endpoint: "media/media-url", // Endpoint lấy filename
        query: { mediaCategory: mediaCategory },
        method: METHOD_TYPE.GET,
      });
      console.log(`[${fileIdentifier}] Filename Response:`, fileNameResponse);

      if (!fileNameResponse?.data?.fileName) {
        throw new Error("Không lấy được tên file định danh từ server.");
      }
      const serverFileName = fileNameResponse.data.fileName; // vd: uuid

      // Lấy phần đuôi file từ tên gốc (vd: ".pdf", ".jpg")
      const originalExtension = fileToUpload.name.includes(".")
        ? `.${fileToUpload.name.split(".").pop()}`
        : "";
      // Tạo tên file đầy đủ để gửi đi (có thể không cần thiết nếu backend tự xử lý)
      const fullServerFileName = `${serverFileName}${
        originalExtension || ".unknown"
      }`;
      console.log(
        `[${fileIdentifier}] Got server filename: ${serverFileName}, Full name: ${fullServerFileName}`
      );

      // --- Bước 2: Tạo FormData và Upload file ---
      const uploadFormData = new FormData();
      // Backend thường mong đợi field tên là 'file'
      uploadFormData.append("file", fileToUpload, fullServerFileName);

      console.log(
        `[${fileIdentifier}] Uploading file with category=${mediaCategory} and fileName=${serverFileName}`
      );
      const uploadResponse = await Api({
        endpoint: `media/upload-media`, // Endpoint upload file
        query: { mediaCategory: mediaCategory, fileName: serverFileName }, // Truyền params
        method: METHOD_TYPE.POST,
        data: uploadFormData, // Body là FormData
      });
      console.log(`[${fileIdentifier}] Upload Response:`, uploadResponse);

      if (!uploadResponse?.data?.mediaUrl) {
        throw new Error(
          uploadResponse?.data?.message ||
            "Upload file thất bại hoặc không nhận được URL."
        );
      }

      // --- Bước 3: Upload thành công ---
      const receivedUrl = uploadResponse.data.mediaUrl;
      console.log(
        `[${fileIdentifier}] Upload successful. Media URL: ${receivedUrl}`
      );
      setFinalFileUrl(receivedUrl); // Lưu URL cuối cùng
      setFileNameDisplay(fileToUpload.name); // Giữ lại tên file gốc để hiển thị
      // setSelectedFile(null); // <- Xóa dòng này
      onUploadComplete(receivedUrl, fileIdentifier); // Gọi callback báo thành công
    } catch (err) {
      console.error(`[${fileIdentifier}] Lỗi upload file:`, err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tải file lên.";
      setErrorMsg(message); // Hiển thị lỗi trên UI
      onError(message, fileIdentifier); // Gọi callback báo lỗi
      setFinalFileUrl(null); // Xóa URL nếu upload lỗi
      setFileNameDisplay(""); // Xóa tên file hiển thị
      // setSelectedFile(null); // <- Xóa dòng này
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    // setSelectedFile(null); // <- Xóa dòng này
    setFinalFileUrl(null);
    setFileNameDisplay("");
    setErrorMsg("");
    onUploadComplete("", fileIdentifier);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Đang tải...";
    if (finalFileUrl || fileNameDisplay) return "Thay đổi file";
    return "Chọn file";
  };

  return (
    <div
      className={`generic-file-uploader ${errorMsg ? "has-error" : ""} ${
        isLoading ? "is-loading" : ""
      }`}
    >
      <label className="gfu-label">
        {label} {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="gfu-input-area">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={triggerFileInput}
          className="gfu-button select-button"
          disabled={isLoading}
        >
          <i
            className={`fas ${
              isLoading ? "fa-spinner fa-spin" : "fa-paperclip"
            }`}
          ></i>
          {getButtonText()}
        </button>

        {/* Sửa điều kiện hiển thị nút xóa */}
        {(fileNameDisplay || finalFileUrl) && !isLoading && (
          <div className="gfu-file-info">
            <span className="gfu-file-name" title={fileNameDisplay}>
              {finalFileUrl ? (
                <a
                  href={finalFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Xem file đã tải lên"
                >
                  {fileNameDisplay || "Xem file"}{" "}
                  <i className="fas fa-external-link-alt fa-xs"></i>
                </a>
              ) : (
                fileNameDisplay
              )}
            </span>
            {/* Điều kiện hiển thị nút xóa cũng được sửa */}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="gfu-remove-button"
              title="Xóa file này"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        )}
      </div>
      {errorMsg && <p className="gfu-error-message">{errorMsg}</p>}
    </div>
  );
};

GenericFileUploader.propTypes = {
  mediaCategory: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  accept: PropTypes.string,
  initialFileUrl: PropTypes.string,
  onUploadComplete: PropTypes.func.isRequired,
  onError: PropTypes.func,
  required: PropTypes.bool,
  fileIdentifier: PropTypes.string,
};

export default GenericFileUploader;
