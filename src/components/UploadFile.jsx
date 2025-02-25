// src/components/TutorRegistration/UploadFile.jsx
import React from 'react';
import PropTypes from 'prop-types';

const UploadFileComponent = ({ label, id, name, onChange, error }) => {
    return (
        <div className="formGroup">
            <label htmlFor={id} className="uploadLabel">{label}</label>
            <input
                type="file"
                id={id}
                name={name}
                onChange={onChange}
                className="uploadField"
            />
            {error && <div className="errorMessage">{error}</div>}
        </div>
    );
};

UploadFileComponent.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
};

const UploadFile = React.memo(UploadFileComponent);
export default UploadFile;