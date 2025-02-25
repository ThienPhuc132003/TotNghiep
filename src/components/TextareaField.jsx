// src/components/TutorRegistration/TextareaField.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TextareaFieldComponent = ({ label, id, name, value, onChange, required, error }) => {
    return (
        <div className="formGroup">
            <label htmlFor={id} className="textareaLabel">{label}</label>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className="textareaField"
                required={required}
            />
            {error && <div className="errorMessage">{error}</div>}
        </div>
    );
};

TextareaFieldComponent.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    error: PropTypes.string,
};

const TextareaField = React.memo(TextareaFieldComponent);
export default TextareaField;