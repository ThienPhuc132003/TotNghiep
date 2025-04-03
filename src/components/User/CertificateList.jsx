// src/components/CertificateList.jsx
import PropTypes from "prop-types";

const CertificateList = ({ certificates }) => {
  if (!certificates || certificates.length === 0) {
    return <p>Không có chứng chỉ nào được tải lên.</p>;
  }

  return (
    <ul>
      {certificates.map((certificate, index) => (
        <li key={index}>
          <a href={certificate.filePath} download={certificate.fileName}>
            {certificate.certificateName}
          </a>
        </li>
      ))}
    </ul>
  );
};

CertificateList.propTypes = {
  certificates: PropTypes.arrayOf(
    PropTypes.shape({
      certificateName: PropTypes.string.isRequired,
      filePath: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
    })
  ),
};

export default CertificateList;
