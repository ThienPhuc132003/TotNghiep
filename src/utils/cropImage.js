const MAX_WIDTH = 800; // Maximum width for the cropped image
const MAX_HEIGHT = 800; // Maximum height for the cropped image

export default function getCroppedImg(imageSrc, crop) {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Enable CORS if necessary
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
        image.onload = () => {
            if (!crop || crop.width <= 0 || crop.height <= 0 || crop.x < 0 || crop.y < 0) {
                reject(new Error("Invalid crop dimensions"));
                return;
            }

            if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
                reject(new Error("Invalid image dimensions"));
                return;
            }

            const canvas = document.createElement("canvas");
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            // Calculate scaled crop dimensions
            const scaledCropWidth = crop.width;
            const scaledCropHeight = crop.height;

            canvas.width = Math.min(scaledCropWidth, MAX_WIDTH);
            canvas.height = Math.min(scaledCropHeight, MAX_HEIGHT);

            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
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

        image.onerror = (error) => {
            reject(new Error(`Image load failed: ${error?.message}`));
        };
    });
}