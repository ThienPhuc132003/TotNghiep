import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
// CSS cho react-image-crop là bắt buộc
import "react-image-crop/dist/ReactCrop.css";
// Giả sử bạn đã import Api và METHOD_TYPE ở nơi khác hoặc sẽ cung cấp chúng
import Api from "../network/Api"; // <- Đường dẫn tới file Api của bạn
import { METHOD_TYPE } from "../network/methodType"; // <- Đường dẫn methodType của bạn
// Import CSS riêng cho component này
import "../assets/css/AvatarUploader.style.css"; // <- CSS cho component này
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSpinner,
  faCamera,
  faUpload,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

// --- Hàm tiện ích tạo Blob từ ảnh đã crop (Giữ nguyên từ trước) ---
async function getCroppedImgBlob(image, pixelCrop) {
  const canvas = document.createElement("canvas");
  if (!pixelCrop || pixelCrop.width === 0 || pixelCrop.height === 0) {
    console.error("Invalid pixelCrop dimensions:", pixelCrop);
    return Promise.reject(new Error("Kích thước vùng cắt không hợp lệ."));
  }
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("Không thể lấy context 2D cho canvas."));
  }
  if (!image.naturalWidth || !image.naturalHeight || !image.complete) {
    console.error("Original image not ready:", image);
    return Promise.reject(
      new Error("Ảnh gốc chưa sẵn sàng hoặc không hợp lệ.")
    );
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(pixelCrop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(pixelCrop.height * scaleY * pixelRatio);

  if (canvas.width <= 0 || canvas.height <= 0) {
    console.error("Calculated canvas dimensions are zero or negative:", {
      width: canvas.width,
      height: canvas.height,
    });
    return Promise.reject(
      new Error("Kích thước canvas không hợp lệ sau khi tính toán.")
    );
  }

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = "high";

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;
  const cropWidth = pixelCrop.width * scaleX;
  const cropHeight = pixelCrop.height * scaleY;

  if (
    cropX < 0 ||
    cropY < 0 ||
    cropWidth <= 0 ||
    cropHeight <= 0 ||
    Math.round(cropX + cropWidth) > image.naturalWidth ||
    Math.round(cropY + cropHeight) > image.naturalHeight
  ) {
    console.error("Invalid crop parameters for drawing:", {
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    });
    return Promise.reject(new Error("Thông số vùng cắt không hợp lệ để vẽ."));
  }

  try {
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width / pixelRatio,
      canvas.height / pixelRatio
    );
  } catch (drawError) {
    console.error("Error drawing image onto canvas:", drawError);
    return Promise.reject(new Error("Không thể vẽ ảnh lên canvas."));
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty after drawing.");
          reject(new Error("Không thể tạo Blob từ canvas."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

// --- Component Chính ---
const AvatarUploader = ({
  mediaCategory,
  initialImageUrl,
  onUploadComplete, // Callback trả về URL media sau khi upload thành công
  onError = (msg) => console.error("Avatar Upload Error:", msg), // Callback khi có lỗi
  label = "Ảnh đại diện", // Nhãn tùy chọn
}) => {
  const [imageSrc, setImageSrc] = useState(null); // Data URL ảnh gốc để crop
  const imgRef = useRef(null); // Ref cho thẻ img trong ReactCrop
  const fileInputRef = useRef(null); // Ref cho input file ẩn
  const [crop, setCrop] = useState(); // State điều khiển crop (%)
  const [completedCrop, setCompletedCrop] = useState(null); // State lưu crop pixel hoàn chỉnh
  const [displayImageUrl, setDisplayImageUrl] = useState(
    initialImageUrl || null
  ); // URL hiển thị (ảnh gốc hoặc ảnh mới sau upload)
  const [isLoading, setIsLoading] = useState(false); // Loading chỉ cho quá trình upload media
  const [error, setError] = useState(""); // Lỗi hiển thị trên UI

  // Cập nhật ảnh hiển thị nếu initialImageUrl thay đổi từ bên ngoài
  useEffect(() => {
    if (initialImageUrl !== displayImageUrl && !imageSrc) {
      setDisplayImageUrl(initialImageUrl || null);
    }
  }, [initialImageUrl, displayImageUrl, imageSrc]);

  // --- Xử lý chọn file ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCrop(undefined);
      setCompletedCrop(null);
      setError("");

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || ""); // Hiển thị crop UI
        setDisplayImageUrl(null); // Ẩn ảnh cũ khi bắt đầu crop
      });
      reader.onerror = (readError) => {
        console.error("FileReader error:", readError);
        const msg = "Không thể đọc file ảnh. Vui lòng thử lại.";
        setError(msg);
        onError(msg);
        setImageSrc(null);
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // --- Xử lý khi ảnh load vào thẻ img để đặt crop mặc định ---
  const onImageLoad = useCallback(
    (e) => {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
      if (width === 0 || height === 0) {
        const msg = "Ảnh không hợp lệ hoặc không thể tải để cắt.";
        setError(msg);
        onError(msg);
        setImageSrc(null);
        setDisplayImageUrl(initialImageUrl || null);
        return;
      }
      const initialCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
        width,
        height
      );
      setCrop(initialCrop);
      setCompletedCrop(null);
      setError("");
    },
    [initialImageUrl, onError]
  );

  // --- Hàm xử lý crop và upload LÊN MEDIA SERVICE ---
  const handleSaveCroppedImage = async () => {
    if (!completedCrop || !imgRef.current || !imageSrc) {
      setError("Vui lòng chọn và cắt ảnh trước khi lưu.");
      return;
    }
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      setError("Vùng cắt không hợp lệ, vui lòng thử lại.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const croppedBlob = await getCroppedImgBlob(
        imgRef.current,
        completedCrop
      );
      const fileNameResponse = await Api({
        endpoint: "media/media-url",
        query: { mediaCategory },
        method: METHOD_TYPE.GET,
      });
      if (!fileNameResponse?.success || !fileNameResponse?.data?.fileName) {
        throw new Error(
          fileNameResponse?.message || "Không lấy được định danh file."
        );
      }
      const fileName = fileNameResponse.data.fileName;

      const uploadFormData = new FormData();
      uploadFormData.append("file", croppedBlob, `${fileName}.jpeg`);
      const uploadResponse = await Api({
        endpoint: `media/upload-media`,
        query: { mediaCategory, fileName },
        method: METHOD_TYPE.POST,
        data: uploadFormData,
      });
      if (!uploadResponse?.success || !uploadResponse?.data?.mediaUrl) {
        throw new Error(uploadResponse?.message || "Upload media thất bại.");
      }
      const finalUrl = uploadResponse.data.mediaUrl;

      // Upload media thành công:
      setDisplayImageUrl(finalUrl); // Cập nhật ảnh hiển thị
      setImageSrc(null); // Ẩn crop UI
      setCrop(undefined);
      setCompletedCrop(null);
      onUploadComplete(finalUrl); // Báo URL mới cho cha
    } catch (err) {
      console.error(`Avatar upload media error (${mediaCategory}):`, err);
      const message =
        err.response?.data?.message || err.message || "Lỗi xử lý ảnh.";
      setError(message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Kích hoạt input file ---
  const triggerFileInput = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- Hủy bỏ crop ---
  const handleCancelCrop = () => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setError("");
    setDisplayImageUrl(initialImageUrl || null);
  };

  return (
    <div className="avatar-uploader">
      {/* Nhãn tùy chọn */}
      {label && <label className="avatar-uploader-label">{label}</label>}
      <div className="avatar-uploader-content">
        {/* --- Khu vực hiển thị chính --- */}
        <div className="avatar-display-area">
          {/* 1. Giao diện Crop */}
          {imageSrc && (
            <div className="crop-ui-container">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={50}
                minHeight={50}
                circularCrop={true}
                keepSelection={true}
              >
                <img
                  ref={imgRef}
                  alt="Ảnh cắt"
                  src={imageSrc}
                  onLoad={onImageLoad}
                  onError={(e) => {
                    console.error("Failed to load image for cropping.", e);
                    const msg = "Không thể tải ảnh để cắt.";
                    setError(msg);
                    onError(msg);
                    setImageSrc(null);
                    setDisplayImageUrl(initialImageUrl || null);
                  }}
                  className="crop-image-preview"
                />
              </ReactCrop>
            </div>
          )}

          {/* 2. Ảnh cuối cùng (khi không crop) */}
          {!imageSrc && displayImageUrl && (
            <div className="final-avatar-container">
              <img
                src={displayImageUrl}
                alt="Ảnh đại diện"
                className="final-avatar-preview"
                onError={() => {
                  setDisplayImageUrl(null);
                }}
              />
              {/* Nút thay đổi ảnh dạng overlay */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="uploader-button change-button overlay-button"
                disabled={isLoading}
                aria-label="Thay đổi ảnh đại diện"
                title="Thay đổi ảnh đại diện"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
          )}

          {/* 3. Placeholder (khi không crop và không có ảnh) */}
          {!imageSrc && !displayImageUrl && (
            <div
              className="avatar-placeholder"
              onClick={triggerFileInput}
              role="button"
              tabIndex="0"
              aria-label="Chọn ảnh đại diện"
            >
              <FontAwesomeIcon icon={faUser} className="placeholder-icon" />
              <p className="placeholder-text">Chưa có ảnh</p>
              {/* Nút chọn ảnh trong placeholder */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className="uploader-button select-button-placeholder" // Class riêng
                disabled={isLoading}
                aria-label="Chọn ảnh đại diện"
              >
                <FontAwesomeIcon icon={faCamera} /> Chọn ảnh
              </button>
            </div>
          )}
        </div>{" "}
        {/* Kết thúc avatar-display-area */}
        {/* --- Khu vực nút bấm và lỗi --- */}
        {/* Nút bấm khi đang crop */}
        {imageSrc && (
          <div className="avatar-uploader-actions crop-actions">
            <button
              type="button"
              onClick={handleSaveCroppedImage}
              className="uploader-button save-button"
              disabled={
                isLoading || !completedCrop?.width || !completedCrop?.height
              }
              aria-label="Xác nhận cắt và tải ảnh lên media service"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang tải lên...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} /> Xác nhận ảnh
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelCrop}
              className="uploader-button cancel-button"
              disabled={isLoading}
              aria-label="Hủy bỏ cắt ảnh"
            >
              <FontAwesomeIcon icon={faTimes} /> Hủy bỏ
            </button>
          </div>
        )}
        {/* Input File ẩn */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          aria-hidden="true"
          disabled={isLoading}
        />
        {/* Hiển thị lỗi chung */}
        {error && <p className="uploader-error-message">{error}</p>}
      </div>{" "}
      {/* Kết thúc avatar-uploader-content */}
    </div> // Kết thúc avatar-uploader
  );
};

AvatarUploader.propTypes = {
  mediaCategory: PropTypes.string.isRequired,
  initialImageUrl: PropTypes.string,
  onUploadComplete: PropTypes.func.isRequired,
  onError: PropTypes.func,
  label: PropTypes.string,
};

export default AvatarUploader;
