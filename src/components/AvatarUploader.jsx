import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import "../assets/css/AvatarUploader.style.css";

// --- Hàm tiện ích tạo Blob từ ảnh đã crop ---
// (Lưu ý: Hàm này hoạt động phía client, vẽ lên canvas)
function getCroppedImgBlob(image, pixelCrop) {
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("Không thể lấy context 2D cho canvas."));
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1; // Để nét hơn trên màn hình retina

  canvas.width = Math.floor(pixelCrop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(pixelCrop.height * scaleY * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = "high";

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas trống sau khi crop.");
          reject(new Error("Không thể tạo Blob từ canvas."));
          return;
        }
        // Gán tên file cho Blob nếu cần (không bắt buộc khi dùng FormData)
        // blob.name = fileName;
        resolve(blob);
      },
      "image/jpeg", // Định dạng ảnh
      0.9 // Chất lượng (0-1)
    );
  });
}

// --- Component Chính ---
const AvatarUploader = ({
  mediaCategory,
  initialImageUrl,
  onUploadComplete,
  label = "Ảnh đại diện",
}) => {
  const [imageSrc, setImageSrc] = useState(null); // Data URL ảnh gốc để crop
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const [crop, setCrop] = useState(); // State điều khiển crop (%)
  const [completedCrop, setCompletedCrop] = useState(null); // State lưu crop pixel hoàn chỉnh
  const [finalAvatarUrl, setFinalAvatarUrl] = useState(initialImageUrl || null); // URL cuối cùng
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Xử lý khi có ảnh ban đầu ---
  useEffect(() => {
    setFinalAvatarUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  // --- Xử lý chọn file ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Reset crop
      setCompletedCrop(null);
      setError("");
      setFinalAvatarUrl(null); // Xóa ảnh cũ khi chọn ảnh mới
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    // Reset input để có thể chọn lại cùng file
    e.target.value = null;
  };

  // --- Xử lý khi ảnh load vào thẻ img để đặt crop mặc định ---
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    if (width === 0 || height === 0) return; // Tránh lỗi khi ảnh chưa load xong hẳn
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90, // Bắt đầu crop 90% giữa ảnh
        },
        1, // Aspect ratio 1:1
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(null); // Reset completed crop khi ảnh mới load
  }, []);

  // --- Hàm xử lý upload (Core Logic) ---
  const handleUploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current || !imageSrc) {
      setError("Vui lòng chọn vùng ảnh cần cắt.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Lấy Blob ảnh đã crop
      const croppedBlob = await getCroppedImgBlob(
        imgRef.current,
        completedCrop
      );

      // 2. Gọi API lấy fileName
      console.log(`Calling API to get filename for category: ${mediaCategory}`);
      const fileNameResponse = await Api({
        endpoint: "media/media-url",
        query: { mediaCategory: mediaCategory }, // Truyền category
        method: METHOD_TYPE.GET,
      });
      console.log("Filename Response:", fileNameResponse);

      if (!fileNameResponse?.data?.fileName) {
        throw new Error("Không lấy được tên file từ server.");
      }
      const fileName = fileNameResponse.data.fileName;
      console.log(`Got filename: ${fileName}`);

      // 3. Tạo FormData và Upload ảnh đã crop
      const uploadFormData = new FormData();
      uploadFormData.append("file", croppedBlob, `${fileName}.jpeg`); // Tên field thường là 'file'
      console.log(
        `Uploading file with category=${mediaCategory} and fileName=${fileName}`
      );

      const uploadResponse = await Api({
        endpoint: `media/upload-media`,
        query: { mediaCategory: mediaCategory, fileName: fileName }, // Truyền cả 2 query params
        method: METHOD_TYPE.POST,
        data: uploadFormData, // Truyền FormData
        // Không cần isFormData=true nếu Api.js đã được sửa để không set Content-Type
      });
      console.log("Upload Response:", uploadResponse);

      if (!uploadResponse?.data?.mediaUrl) {
        throw new Error(
          uploadResponse?.data?.message ||
            "Upload ảnh thất bại hoặc không nhận được URL."
        );
      }

      // 4. Thành công: Lưu URL, gọi callback, reset state
      const receivedUrl = uploadResponse.data.mediaUrl;
      console.log(`Upload successful. Media URL: ${receivedUrl}`);
      setFinalAvatarUrl(receivedUrl);
      onUploadComplete(receivedUrl); // Thông báo cho component cha
      setImageSrc(null); // Ẩn giao diện crop
      setCrop(undefined);
      setCompletedCrop(null);
    } catch (err) {
      console.error("Lỗi trong quá trình upload avatar:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tải ảnh lên.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Hàm kích hoạt input file ---
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- Hàm hủy bỏ crop / Chọn lại ảnh ---
  const handleCancelCrop = () => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setError("");
    // Nếu có ảnh cũ thì hiển thị lại
    if (initialImageUrl) {
      setFinalAvatarUrl(initialImageUrl);
    }
    // Có thể trigger chọn file mới luôn nếu muốn
    // triggerFileInput();
  };

  return (
    <div className="avatar-uploader">
      <label className="avatar-uploader-label">{label}</label>
      <div className="avatar-uploader-content">
        {/* --- Phần hiển thị Crop hoặc Ảnh cuối cùng --- */}
        <div className="avatar-display-area">
          {imageSrc &&
            !finalAvatarUrl && ( // Đang trong quá trình crop
              <div className="crop-ui-container">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={50} // Kích thước crop tối thiểu
                  minHeight={50}
                  circularCrop={true} // Hiển thị vòng tròn crop
                  keepSelection={true}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="crop-image-preview"
                  />
                </ReactCrop>
              </div>
            )}

          {finalAvatarUrl &&
            !imageSrc && ( // Đã upload xong hoặc có ảnh ban đầu
              <img
                src={finalAvatarUrl}
                alt="Ảnh đại diện"
                className="final-avatar-preview"
              />
            )}

          {!imageSrc &&
            !finalAvatarUrl && ( // Trạng thái chưa chọn gì
              <div className="avatar-placeholder">
                <i className="fas fa-user fa-3x placeholder-icon"></i>{" "}
                {/* Ví dụ dùng Font Awesome */}
                <p>Chưa có ảnh</p>
              </div>
            )}
        </div>

        {/* --- Input File ẩn --- */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          disabled={isLoading}
        />

        {/* --- Các nút điều khiển --- */}
        <div className="avatar-uploader-actions">
          {!imageSrc && ( // Chưa chọn file hoặc đã upload xong
            <button
              type="button"
              onClick={triggerFileInput}
              className="uploader-button select-button"
              disabled={isLoading}
            >
              {finalAvatarUrl ? "Thay đổi ảnh" : "Chọn ảnh"}
            </button>
          )}

          {imageSrc && ( // Đang trong quá trình crop
            <>
              <button
                type="button"
                onClick={handleUploadCroppedImage}
                className="uploader-button save-button"
                disabled={isLoading || !completedCrop}
              >
                {isLoading ? "Đang tải lên..." : "Lưu ảnh"}
              </button>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="uploader-button cancel-button"
                disabled={isLoading}
              >
                Hủy bỏ
              </button>
            </>
          )}
        </div>

        {/* --- Thông báo lỗi --- */}
        {error && <p className="uploader-error-message">{error}</p>}
      </div>
    </div>
  );
};

AvatarUploader.propTypes = {
  mediaCategory: PropTypes.string.isRequired, // Bắt buộc phải có category
  initialImageUrl: PropTypes.string, // URL ảnh ban đầu (không bắt buộc)
  onUploadComplete: PropTypes.func.isRequired, // Callback khi upload xong (bắt buộc)
  label: PropTypes.string, // Nhãn cho component (không bắt buộc)
};

export default AvatarUploader;
