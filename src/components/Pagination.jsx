import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = []; const delta = 2; const left = currentPage - delta; const right = currentPage + delta + 1; const range = []; const rangeWithDots = [];
  for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || (i >= left && i < right)) { range.push(i); } }
  let l; for (let i of range) { if (l) { if (i - l === 2) { rangeWithDots.push(l + 1); } else if (i - l !== 1) { rangeWithDots.push("..."); } } rangeWithDots.push(i); l = i; }
  pageNumbers.push(...rangeWithDots); if (totalPages <= 1) { return null; }
  return (
    <nav className="pagination-nav" aria-label="Điều hướng trang"> {/* Cần CSS từ TutorSearch.style.css */}
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}><button className="page-link prev-next" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước"><FaChevronLeft /> <span>Trước</span></button></li>
        {pageNumbers.map((number, index) => number === "..." ? (<li key={`dots-${index}`} className="page-item disabled dots"><span className="page-link">...</span></li>) : (<li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}><button className="page-link" onClick={() => onPageChange(number)} aria-current={currentPage === number ? "page" : undefined}>{number}</button></li>))}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}><button className="page-link prev-next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau"><span>Sau</span> <FaChevronRight /></button></li>
      </ul>
    </nav>
  );
};
Pagination.propTypes = { currentPage: PropTypes.number.isRequired, totalPages: PropTypes.number.isRequired, onPageChange: PropTypes.func.isRequired };
export default Pagination;