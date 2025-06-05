import { useState, memo } from "react";
import "../assets/css/EyeBall.style.css";

const Eyeball = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setPosition({ x: mouseX, y: mouseY });
  };

  return (
    <div className="container" onMouseMove={handleMouseMove}>
      <div className="eye">
        <div
          className="pupil"
          style={{
            transform: `translate(${position.x / 10 - 5}px, ${
              position.y / 10 - 5
            }px)`,
          }}
        />
      </div>
    </div>
  );
};

export default memo(Eyeball);
