// src/components/User/CurriculumManagement/CurriculumList.jsx
import { useState, useEffect } from "react";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import CurriculumItem from "./CurriculumItem";
// IMPORT CSS TRỰC TIẾP (nếu bạn không dùng CSS Modules)
import "../../../assets/css/CurriculumList.style.css";
// HOẶC IMPORT CSS MODULES (nếu bạn đã đổi tên file thành .module.css)
// import styles from '../../../assets/css/CurriculumList.module.css';

// Giả sử bạn vẫn đang dùng class name trực tiếp cho CSS
// Nếu dùng CSS Modules, thay thế các className="someClass" bằng className={styles.someClass}

const ITEMS_PER_PAGE = 10; // Số lượng item mặc định trên mỗi trang

const CurriculumList = () => {
  const [curriculums, setCurriculums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Để tính tổng số trang

  useEffect(() => {
    const fetchCurriculums = async (pageToFetch) => {
      setIsLoading(true);
      setError(null);
      try {
        const filterParams = [
          {
            key: "status", // Key để lọc
            operator: "equal", // Toán tử so sánh bằng
            value: "ACTIVE", // Giá trị cần lọc
          },
          // Bạn có thể thêm các điều kiện lọc khác vào đây nếu cần
          // Ví dụ: lọc theo tên giáo trình (curriculumnName) nếu người dùng nhập vào ô tìm kiếm
          // {
          //   key: 'curriculumnName',
          //   operator: 'like', // hoặc 'contains' tùy API của bạn
          //   value: searchTerm, // searchTerm từ state của input tìm kiếm
          // }
        ];

        // API của bạn mong muốn `filter` và `sort` là chuỗi JSON.
        // Hàm Api của bạn đã có logic JSON.stringify cho filter và sort,
        // nên chúng ta chỉ cần truyền object vào.
        const queryParams = {
          filter: filterParams,
          // sort: [{ key: "createdAt", type: "DESC" }], // Bỏ sort nếu tạm thời chưa cần
          rpp: ITEMS_PER_PAGE,
          page: pageToFetch,
        };

        const response = await Api({
          endpoint: "/curriculumn/search",
          method: METHOD_TYPE.GET,
          query: queryParams,
          // requireToken: false,
        });

        if (
          response &&
          response.data &&
          typeof response.data.total !== "undefined" &&
          Array.isArray(response.data.items)
        ) {
          setCurriculums(response.data.items || []);
          setTotalItems(response.data.total || 0);
        } else if (
          response &&
          response.data &&
          response.data.success &&
          response.data.data
        ) {
          setCurriculums(response.data.data.items || []);
          setTotalItems(response.data.data.total || 0);
        } else {
          const errorMessage =
            response?.data?.message ||
            "Không thể tải danh sách giáo trình hoặc định dạng dữ liệu không đúng.";
          console.error(
            "Lỗi từ API hoặc định dạng dữ liệu không đúng:",
            response
          );
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error(
          "Lỗi trong CurriculumList khi fetchCurriculums:",
          err.message
        );
        setError(
          err.response?.data?.message ||
            err.message ||
            "Đã xảy ra lỗi không mong muốn khi tải danh sách giáo trình."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurriculums(currentPage);
  }, [currentPage]); // Fetch lại dữ liệu khi currentPage thay đổi

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- Render UI ---
  if (isLoading) {
    return (
      <div className="loadingState" aria-live="polite">
        Đang tải danh sách giáo trình...
      </div>
    );
  }

  if (error) {
    return (
      <div className="errorState" role="alert">
        Lỗi: {error}
      </div>
    );
  }

  if (!curriculums || curriculums.length === 0) {
    return (
      <>
        <p className="emptyState">
          Hiện không có giáo trình nào (trạng thái ACTIVE) để hiển thị.
        </p>
        {/* Nút thử lại hoặc quay về trang trước có thể hữu ích ở đây */}
      </>
    );
  }

  return (
    <section
      className="curriculumListContainer"
      aria-labelledby="available-curriculums-title"
    >
      <h2 id="available-curriculums-title" className="listTitle">
        Giáo trình có thể thuê
      </h2>
      <ul className="list" role="list">
        {curriculums.map((curriculum) => (
          <CurriculumItem
            key={curriculum.curriculumnId}
            curriculum={curriculum}
          />
        ))}
      </ul>

      {/* Component Phân trang đơn giản */}
      {totalPages > 1 && (
        <nav
          aria-label="Phân trang danh sách giáo trình"
          className="paginationContainer"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="paginationButton"
            aria-label="Trang trước"
          >
            Trước
          </button>
          <span className="paginationInfo">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="paginationButton"
            aria-label="Trang sau"
          >
            Sau
          </button>
        </nav>
      )}
    </section>
  );
};

export default CurriculumList;
