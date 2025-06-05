import { memo } from "react";
import "../../assets/css/TutorCardSkeleton.style.css"; // *** Điều chỉnh đường dẫn ***

const TutorCardSkeleton = memo(() => {
  return (
    <div className="tutor-card-skeleton">
      <div className="skeleton-left">
        {" "}
        <div className="skeleton skeleton-avatar"></div>{" "}
      </div>
      <div className="skeleton-right">
        {" "}
        <div
          className="skeleton skeleton-line skeleton-line-md"
          style={{ marginBottom: "1.2rem" }}
        ></div>{" "}
        <div className="skeleton skeleton-line skeleton-line-sm"></div>{" "}
        <div className="skeleton skeleton-line skeleton-line-lg"></div>{" "}
        <div
          className="skeleton skeleton-line skeleton-line-sm"
          style={{ width: "50%", marginBottom: "1rem" }}
        ></div>{" "}
        <div className="skeleton skeleton-line skeleton-line-lg"></div>{" "}
        <div
          className="skeleton skeleton-line skeleton-line-md"
          style={{ marginBottom: "1.5rem" }}
        ></div>{" "}
        <div className="skeleton-footer">
          {" "}
          <div
            className="skeleton skeleton-line skeleton-line-xs"
            style={{ marginBottom: 0 }}
          ></div>{" "}
          <div className="skeleton skeleton-button"></div>{" "}
        </div>{" "}
      </div>
    </div>
  );
});

TutorCardSkeleton.displayName = "TutorCardSkeleton";

export default TutorCardSkeleton;
