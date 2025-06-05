// Safe Image component with CORS handling
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMedia } from "../hooks/useMedia";

const SafeImage = ({
  src,
  alt,
  className,
  style,
  onError,
  onLoad,
  fallbackSrc = "/default-avatar.svg",
  ...props
}) => {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const { url: mediaUrl, loading, error } = useMedia(src, fallbackSrc);

  useEffect(() => {
    if (error) {
      setShouldUseFallback(true);
      if (onError) {
        onError(error);
      }
    }
  }, [error, onError]);

  const handleImageError = (e) => {
    console.warn("Image failed to load, using fallback:", src);
    setShouldUseFallback(true);
    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = (e) => {
    setShouldUseFallback(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const imageSrc = shouldUseFallback ? fallbackSrc : mediaUrl || src;

  if (loading) {
    return (
      <div
        className={`${className || ""} image-loading`}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
};

SafeImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  fallbackSrc: PropTypes.string,
};

export default SafeImage;
