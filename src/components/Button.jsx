// src/components/Button.jsx (hoặc đường dẫn tương ứng của bạn)
import React from "react";
import PropTypes from "prop-types"; // Sửa Proptypes thành PropTypes

const ButtonComponent = (props) => {
  const {
    onClick = () => {},
    children = null,
    // onChange không phải là prop tiêu chuẩn cho button, có thể bỏ nếu không dùng
    // Nếu bạn thực sự cần onChange cho mục đích đặc biệt, hãy giữ lại
    // onChange = () => {},
    type = "button", // Thêm prop 'type' với giá trị mặc định là "button"
    className = "", // Thêm prop 'className' để nhận class từ bên ngoài
    ...rest
  } = props;

  return (
    <button
      type={type} // Sử dụng prop 'type'
      onClick={onClick}
      className={className} // Áp dụng className
      // onChange={onChange} // Chỉ thêm nếu thực sự cần
      {...rest} // Truyền các props còn lại (ví dụ: disabled, aria-label, ...)
    >
      {children}
    </button>
  );
};

ButtonComponent.propTypes = {
  onClick: PropTypes.func,
  // onChange: PropTypes.func, // Chỉ thêm nếu cần
  children: PropTypes.node,
  type: PropTypes.string, // Prop type cho button (button, submit, reset)
  className: PropTypes.string, // Prop để truyền class CSS
};

// Không cần React.memo ở đây nếu component đủ đơn giản và không có state/props phức tạp
// Hoặc nếu muốn memo, thì giữ nguyên:
const Button = React.memo(ButtonComponent);
export default Button;
