// src/components/FormDetail.jsx
import React from "react";
import PropTypes from "prop-types";
import "../assets/css/FormDetail.style.css"; // Đảm bảo import CSS

// Helper to safely access nested properties
const getNestedValue = (obj, path, defaultValue = undefined) => {
  // Default về undefined để phân biệt rõ hơn
  if (!obj || !path || typeof path !== "string") return defaultValue;
  const value = path.split(".").reduce((acc, part) => {
    return acc && acc[part] !== undefined && acc[part] !== null
      ? acc[part]
      : undefined;
  }, obj);
  // Chỉ trả về defaultValue nếu kết quả cuối cùng là undefined hoặc null
  return value !== undefined && value !== null ? value : defaultValue;
};
const FormDetailComponent = ({
  formData,
  fields,
  mode,
  onChange = () => {}, // Default trống
  onSubmit = () => {}, // Default trống
  title,
  onClose,
  errors = {}, // Default trống
  avatarUrl = null,
  isSubmitting = false, // Default false
  children = null, // <<< Prop children mới
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    onChange(name, newValue); // Gọi onChange từ cha
  };

  // Hàm xử lý submit của thẻ <form> nội bộ
  const handleSubmitInternal = (e) => {
    e.preventDefault();
    // Chỉ gọi prop onSubmit nếu nó được truyền và không phải view mode
    // Và chỉ khi KHÔNG có children (vì children sẽ chứa nút submit riêng)
    if (typeof onSubmit === "function" && mode !== "view" && !children) {
      onSubmit(formData);
    }
  };

  return (
    // Container chính do FormDetail quản lý
    <div className="form-detail-container">
      {/* Header */}
      <div className="form-detail-header">
        <h2>{title}</h2>
        {/* Nút đóng luôn có */}
        <button
          className="form-detail-close-button"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
      {/* Avatar (nếu có) */}
      {avatarUrl && (
        <div className="form-detail-avatar-container">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="form-detail-avatar-img"
          />
        </div>
      )}
      {/* Thẻ Form bao quanh nội dung chính */}
      <form onSubmit={handleSubmitInternal} className="form-content-wrapper">
        {/* Khu vực nội dung có thể cuộn */}
        <div className="form-content">
          {/* Lưới chứa các field */}
          <div className="form-detail-grid">
            {fields.map((field) => {
              const isReadOnly = mode === "view" || field.readOnly;
              // Lấy giá trị, dùng '' làm default cho input/select/textarea
              const currentValue = getNestedValue(formData, field.key, "");
              const fieldError = getNestedValue(errors, field.key); // Lấy lỗi tương ứng

              // Bỏ qua field nếu nó chỉ dành cho view và đang ở mode add/edit
              if (!isReadOnly && field.renderValue && mode !== "view") {
                // Ví dụ: field 'status' chỉ có renderValue, không nên hiện input khi edit
                // Điều chỉnh logic này nếu cần field vừa có input vừa có renderValue phức tạp
                if (
                  field.type !== "select" &&
                  field.type !== "textarea" &&
                  field.type !== "checkbox" &&
                  field.type !== "date" &&
                  field.type !== "number" &&
                  field.type !== "email" &&
                  field.type !== "password" &&
                  field.type !== "tel" &&
                  field.type !== "url"
                ) {
                  // Nếu không phải các loại input cơ bản và có renderValue -> khả năng cao là chỉ để view
                  return null;
                }
              }

              return (
                <div className="form-detail-group" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {/* Chỉ hiện dấu * khi required và không phải view mode */}
                    {field.required && mode !== "view" && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                  {/* Render dựa trên mode và type */}
                  {isReadOnly ? (
                    // Chế độ View hoặc field ReadOnly
                    field.renderValue ? (
                      <div className="form-detail-value">
                        {field.renderValue(
                          getNestedValue(formData, field.key),
                          formData
                        )}{" "}
                        {/* Truyền giá trị gốc và cả formData */}
                      </div>
                    ) : (
                      <div className="form-detail-non-editable">
                        {typeof currentValue === "boolean" ? (
                          currentValue ? (
                            "Có"
                          ) : (
                            "Không"
                          )
                        ) : currentValue !== "" ? (
                          currentValue
                        ) : (
                          <em style={{ color: "#888" }}>Không có</em>
                        )}
                      </div>
                    )
                  ) : field.type === "select" ? (
                    // Select
                    <select
                      id={field.key}
                      name={field.key}
                      value={currentValue}
                      onChange={handleChange}
                      disabled={field.disabled || isSubmitting}
                      required={field.required}
                      className={fieldError ? "input-error" : ""}
                    >
                      {field.placeholder !== false && (
                        <option value="" disabled={field.required}>
                          {" "}
                          {field.placeholder ||
                            `-- Chọn ${field.label.toLowerCase()} --`}{" "}
                        </option>
                      )}
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {" "}
                          {option.label}{" "}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    // Textarea
                    <textarea
                      id={field.key}
                      name={field.key}
                      value={currentValue}
                      onChange={handleChange}
                      rows={field.rows || 4}
                      disabled={field.disabled || isSubmitting}
                      required={field.required}
                      placeholder={
                        field.placeholder ||
                        `Nhập ${field.label.toLowerCase()}...`
                      }
                      className={fieldError ? "input-error" : ""}
                    />
                  ) : field.type === "checkbox" ? (
                    // Checkbox
                    <input
                      id={field.key}
                      name={field.key}
                      type="checkbox"
                      checked={!!currentValue}
                      onChange={handleChange}
                      disabled={field.disabled || isSubmitting}
                      className="form-detail-checkbox"
                    />
                  ) : (
                    // Input mặc định (text, number, date, email, password,...)
                    <input
                      id={field.key}
                      type={field.type || "text"}
                      name={field.key}
                      value={currentValue}
                      onChange={handleChange}
                      disabled={field.disabled || isSubmitting}
                      required={field.required}
                      placeholder={
                        field.placeholder ||
                        `Nhập ${field.label.toLowerCase()}...`
                      }
                      className={fieldError ? "input-error" : ""}
                      pattern={field.pattern}
                      min={field.min}
                      max={field.max}
                    />
                  )}
                  {/* Hiển thị lỗi */}
                  {fieldError && (
                    <p className="form-detail-error-message">{fieldError}</p>
                  )}
                </div>
              );
            })}
          </div>{" "}
          {/* Kết thúc form-detail-grid */}
          {/* ****** RENDER CHILDREN ****** */}
          {/* Render các phần tử con được truyền từ component cha */}
          {children}
          {/* ****** KẾT THÚC RENDER CHILDREN ****** */}
        </div>{" "}
        {/* Kết thúc form-content */}
        {/* Actions Mặc định của FormDetail */}
        {/* Chỉ hiển thị khi không phải view mode VÀ không có children được truyền vào */}
        {mode !== "view" && !children && (
          <div className="form-detail-actions">
            <button
              type="button"
              className="form-detail-cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            {/* Nút submit mặc định sẽ trigger handleSubmitInternal */}
            <button
              type="submit"
              className="form-detail-save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        )}
      </form>{" "}
      {/* Kết thúc thẻ form */}
    </div> // Kết thúc form-detail-container
  );
};

FormDetailComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any.isRequired,
        })
      ),
      readOnly: PropTypes.bool,
      disabled: PropTypes.bool,
      required: PropTypes.bool,
      renderValue: PropTypes.func, // (value, fullFormData) => ReactNode
      rows: PropTypes.number,
      placeholder: PropTypes.string,
      pattern: PropTypes.string,
      min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func, // onSubmit của form (khi dùng nút mặc định)
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object,
  avatarUrl: PropTypes.string,
  isSubmitting: PropTypes.bool, // Trạng thái loading cho nút submit mặc định
  children: PropTypes.node, // <<< Prop children mới
};

export default React.memo(FormDetailComponent);
