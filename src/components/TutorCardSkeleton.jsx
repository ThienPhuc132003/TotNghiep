// src/components/User/common/TutorCardSkeleton.jsx
import '../assets/css/TutorCardSkeleton.style.css'; // Đảm bảo đường dẫn này đúng

const TutorCardSkeleton = () => {
  return (
    <div className="tutor-card-skeleton">
      <div className="skeleton-left">
        <div className="skeleton skeleton-avatar"></div>
      </div>
      <div className="skeleton-right">
        {/* Dòng tên + hạng */}
        <div className="skeleton skeleton-line skeleton-line-md" style={{ marginBottom: '1.2rem' }}></div>
         {/* Dòng trình độ/trường */}
        <div className="skeleton skeleton-line skeleton-line-sm"></div>
         {/* Dòng môn học */}
        <div className="skeleton skeleton-line skeleton-line-lg"></div>
        {/* Dòng rating */}
        <div className="skeleton skeleton-line skeleton-line-sm" style={{ width: '50%', marginBottom: '1rem' }}></div>
         {/* Dòng description */}
        <div className="skeleton skeleton-line skeleton-line-lg"></div>
        <div className="skeleton skeleton-line skeleton-line-md" style={{ marginBottom: '1.5rem' }}></div>

        {/* Footer */}
        <div className="skeleton-footer">
          <div className="skeleton skeleton-line skeleton-line-xs" style={{marginBottom: 0}}></div> {/* Giá coin */}
          <div className="skeleton skeleton-button"></div> {/* Nút xem hồ sơ */}
        </div>
      </div>
    </div>
  );
};

export default TutorCardSkeleton;