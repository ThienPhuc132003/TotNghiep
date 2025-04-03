import React from "react";
import PropTypes from "prop-types";

const InputFieldComponent = ({
  label,
  type,
  id,
  name,
  value,
  onChange,
  required,
  error,
}) => {
  return (
    <div className="formGroup">
      <label htmlFor={id} className="inputLabel">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="inputField"
        required={required}
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
};

InputFieldComponent.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
};

const InputField = React.memo(InputFieldComponent);
export default InputField;
