
import PropTypes from "prop-types";
import "../../assets/css/YoutubeEmbed.style.css"; // Tạo file CSS này ở bước sau

/**
 * Trích xuất YouTube Video ID từ nhiều định dạng URL khác nhau.
 * @param {string} url - URL video YouTube.
 * @returns {string|null} - Video ID hoặc null nếu không tìm thấy.
 */
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  // Biểu thức chính quy (Regex) để khớp với các định dạng URL YouTube phổ biến
  // và trích xuất video ID (thường là 11 ký tự)
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

/**
 * Component để nhúng và hiển thị video YouTube.
 * @param {object} props - Props của component.
 * @param {string} props.videoUrl - URL gốc của video YouTube.
 * @param {string} [props.title="Video giới thiệu YouTube"] - Tiêu đề cho iframe (quan trọng cho accessibility).
 */
const YoutubeEmbed = ({ videoUrl, title = "Video giới thiệu YouTube" }) => {
  const videoId = getYoutubeVideoId(videoUrl);

  // Chỉ hiển thị iframe nếu trích xuất được videoId hợp lệ
  if (!videoId) {
    console.warn("Không thể trích xuất YouTube video ID từ URL:", videoUrl);
    // Có thể trả về link gốc hoặc thông báo lỗi thay vì null
    return (
        <div className="youtube-embed-invalid">
             <p>Link video không hợp lệ hoặc không được hỗ trợ: <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a></p>
        </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="youtube-embed-container">
      <iframe
        src={embedUrl}
        title={title} // Tiêu đề cho accessibility
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen // Cho phép xem toàn màn hình
      ></iframe>
    </div>
  );
};

YoutubeEmbed.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default YoutubeEmbed;