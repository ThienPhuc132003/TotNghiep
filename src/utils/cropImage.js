export default function getCroppedImg(imageSrc, crop) {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      if (!crop || crop.width <= 0 || crop.height <= 0 || crop.x < 0 || crop.y < 0) {
        reject(new Error("Invalid crop dimensions"));
        return;
      }

      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / (image.width || image.naturalWidth);
      const scaleY = image.naturalHeight / (image.height || image.naturalHeight);
      canvas.width = crop.width;
      canvas.height = crop.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      const fileType = "image/png"; // You can change this to "image/jpeg"
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], "cropped_image.png", { type: fileType });
          resolve(file);
        },
        fileType,
        1 // Quality parameter for PNG or JPEG (0.1 to 1)
      );
    };

    image.onerror = (error) =>
      reject(new Error(`Image load failed: ${error.message}`));
  });
}
