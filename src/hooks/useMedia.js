// Custom hook for handling media loading with CORS fix
import { useState, useEffect, useCallback } from "react";
import mediaService from "../services/mediaService";

/**
 * Custom hook to load media with CORS handling
 * @param {string} mediaPath - Path to the media file
 * @param {string} fallbackUrl - Fallback URL if media loading fails
 * @returns {object} - { url, loading, error, retry }
 */
export const useMedia = (mediaPath, fallbackUrl = "/default-avatar.png") => {
  const [url, setUrl] = useState(fallbackUrl);
  const [loading, setLoading] = useState(!!mediaPath);
  const [error, setError] = useState(null);

  const loadMedia = useCallback(async () => {
    if (!mediaPath) {
      setUrl(fallbackUrl);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mediaUrl = await mediaService.getMediaUrl(mediaPath);
      setUrl(mediaUrl || fallbackUrl);
    } catch (err) {
      console.warn("Media loading failed:", err);
      setError(err);
      setUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  }, [mediaPath, fallbackUrl]);

  const retry = useCallback(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    loadMedia();

    // Cleanup function
    return () => {
      if (mediaPath) {
        mediaService.cleanup(mediaPath);
      }
    };
  }, [loadMedia, mediaPath]);

  return { url, loading, error, retry };
};

/**
 * Custom hook specifically for avatar loading
 * @param {string} avatarPath - Path to the avatar file
 * @returns {object} - { avatarUrl, loading, error, retry }
 */
export const useAvatar = (avatarPath) => {
  const { url, loading, error, retry } = useMedia(
    avatarPath,
    "/default-avatar.png"
  );

  return {
    avatarUrl: url,
    loading,
    error,
    retry,
  };
};
