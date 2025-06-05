// Media Service to handle CORS issues with media loading
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";

class MediaService {
  constructor() {
    // Cache for media URLs to avoid repeated requests
    this.urlCache = new Map();
    this.blobUrlCache = new Map();
  }
  /**
   * Get media URL with proper authentication headers to avoid CORS
   * @param {string} mediaPath - The media path (e.g., "avatars/filename.jpg")
   * @returns {Promise<string>} - Blob URL or fallback URL
   */
  async getMediaUrl(mediaPath) {
    if (!mediaPath) return null;

    // Check cache first
    if (this.urlCache.has(mediaPath)) {
      return this.urlCache.get(mediaPath);
    }

    try {
      // First, try to fetch through our API with authentication
      const response = await Api({
        endpoint: `media/${mediaPath}`,
        method: METHOD_TYPE.GET,
        responseType: "blob", // Important: get blob response
      });

      if (response && response.data) {
        // Create blob URL
        const blobUrl = URL.createObjectURL(response.data);
        this.urlCache.set(mediaPath, blobUrl);
        this.blobUrlCache.set(mediaPath, blobUrl);
        return blobUrl;
      }
    } catch (error) {
      console.warn("Failed to fetch media via authenticated API:", error);

      // Try direct fetch with different approaches
      try {
        const directUrl = `${
          import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/"
        }media/${mediaPath}`;
        // Try fetch with no-cors mode (limited but may work for some images)
        await fetch(directUrl, {
          mode: "no-cors",
          credentials: "omit",
        });

        // For no-cors, we can't access the response data, so just return the URL
        this.urlCache.set(mediaPath, directUrl);
        return directUrl;
      } catch (directError) {
        console.warn("Direct fetch also failed:", directError);
      }
    }

    // Final fallback to direct URL (might still have CORS issues but better than nothing)
    const fallbackUrl = `${
      import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/"
    }media/${mediaPath}`;
    this.urlCache.set(mediaPath, fallbackUrl);
    return fallbackUrl;
  }

  /**
   * Get avatar URL with fallback to default avatar
   * @param {string} avatarPath - The avatar path
   * @returns {Promise<string>} - Avatar URL
   */
  async getAvatarUrl(avatarPath) {
    if (!avatarPath) {
      return "/default-avatar.png"; // Fallback to default avatar
    }

    try {
      return await this.getMediaUrl(avatarPath);
    } catch (error) {
      console.warn("Failed to load avatar, using default:", error);
      return "/default-avatar.png";
    }
  }

  /**
   * Preload an image and return a promise
   * @param {string} src - Image source URL
   * @returns {Promise} - Promise that resolves when image loads
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Try to load with CORS
      img.onload = () => resolve(img);
      img.onerror = () => {
        // If CORS fails, try without crossOrigin
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => reject(new Error("Failed to load image"));
        fallbackImg.src = src;
      };
      img.src = src;
    });
  }

  /**
   * Clean up blob URLs to prevent memory leaks
   * @param {string} mediaPath - The media path to clean up
   */
  cleanup(mediaPath) {
    if (this.blobUrlCache.has(mediaPath)) {
      URL.revokeObjectURL(this.blobUrlCache.get(mediaPath));
      this.blobUrlCache.delete(mediaPath);
    }
    this.urlCache.delete(mediaPath);
  }

  /**
   * Clean up all cached URLs
   */
  cleanupAll() {
    this.blobUrlCache.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrlCache.clear();
    this.urlCache.clear();
  }
}

// Export singleton instance
const mediaService = new MediaService();
export default mediaService;
