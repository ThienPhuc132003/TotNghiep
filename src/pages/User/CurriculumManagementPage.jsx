// src/pages/User/CurriculumManagementPage.jsx
import { useState, useEffect, useCallback } from "react";
// import { useSelector } from "react-redux"; // Bỏ nếu không dùng userId cho API
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import CurriculumList from "../../components/User/CurriculumManagement/CurriculumList";
import OwnedCurriculumItem from "../../components/User/CurriculumManagement/OwnedCurriculumItem";
import "../../assets/css/CurriculumManagementPage.style.css";

const CurriculumManagementPage = () => {
  const [myOwnedCurriculums, setMyOwnedCurriculums] = useState([]);
  const [isLoadingMyList, setIsLoadingMyList] = useState(true);
  const [myListError, setMyListError] = useState(null);
  const [currentOwnedPage, setCurrentOwnedPage] = useState(1);
  const [totalOwnedCurriculums, setTotalOwnedCurriculums] = useState(0);

  const OWNED_ITEMS_PER_PAGE = 4;
  const fetchMyOwnedCurriculums = useCallback(async (page = 1) => {
    setIsLoadingMyList(true);
    setMyListError(null);
    try {
      const response = await Api({
        endpoint: `my-curriculumn/get-my-curriculumn?rpp=${OWNED_ITEMS_PER_PAGE}&page=${page}`,
        method: METHOD_TYPE.GET,
        requireToken: true,
      });
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        const extractedCurriculums = response.data.items
          .flatMap((ownedItem) =>
            ownedItem.items && Array.isArray(ownedItem.items)
              ? ownedItem.items.map((detailItem) => detailItem.curriculumn)
              : []
          )
          .filter(Boolean);
        setMyOwnedCurriculums(extractedCurriculums);
        setTotalOwnedCurriculums(
          response.data.total || extractedCurriculums.length
        );
      } else if (response.success && Array.isArray(response.data)) {
        // Trường hợp API trả về trực tiếp mảng object curriculum
        // Điều này ít khả năng xảy ra với cấu trúc bạn đưa, nhưng để phòng hờ
        setMyOwnedCurriculums(
          response.data.filter((item) => item && item.curriculumnId)
        );
        setTotalOwnedCurriculums(response.data.length);
      } else {
        console.warn(
          "Không thể tải danh sách giáo trình của tôi hoặc dữ liệu không hợp lệ/rỗng.",
          response
        );
        setMyOwnedCurriculums([]); // Set về mảng rỗng nếu không có dữ liệu hoặc lỗi nhẹ
        setTotalOwnedCurriculums(0);
      }
    } catch (err) {
      console.error("Lỗi khi tải giáo trình của tôi:", err);
      setMyListError(
        "Đã xảy ra lỗi khi tải danh sách giáo trình của bạn. Vui lòng thử lại."
      ); // Không nên toast ở đây vì đây là lần load ban đầu, lỗi sẽ hiển thị trên UI
      setMyOwnedCurriculums([]);
      setTotalOwnedCurriculums(0);
    } finally {
      setIsLoadingMyList(false);
    }
  }, []); // Dependencies rỗng
  useEffect(() => {
    fetchMyOwnedCurriculums(currentOwnedPage);
  }, [fetchMyOwnedCurriculums, currentOwnedPage]);

  const handleOwnedPageChange = (page) => {
    setCurrentOwnedPage(page);
  };

  const totalOwnedPages = Math.ceil(
    totalOwnedCurriculums / OWNED_ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="pageWrapper">
        {" "}
        {/* Giả sử bạn vẫn dùng class này từ CSS */}
        <h1 className="pageTitle">Quản lý Giáo trình</h1>
        <main className="mainContent">
          <div className="section my-curriculums-section">
            <h2 id="my-curriculums-title" className="sectionTitle">
              Giáo trình của tôi
            </h2>
            {isLoadingMyList ? (
              <p className="loadingState">Đang tải giáo trình của bạn...</p>
            ) : myListError ? (
              <p className="errorState">{myListError}</p>
            ) : myOwnedCurriculums.length > 0 ? (
              <>
                <ul className="list my-curriculum-list">
                  {myOwnedCurriculums.map((curriculum) => (
                    <OwnedCurriculumItem
                      key={curriculum.curriculumnId}
                      curriculum={curriculum}
                      // Thêm prop onDelete nếu bạn có chức năng xóa
                      // onDelete={() => handleDeleteMyCurriculum(curriculum.curriculumnId)}
                    />
                  ))}
                </ul>
                {totalOwnedPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        handleOwnedPageChange(currentOwnedPage - 1)
                      }
                      disabled={currentOwnedPage === 1}
                      className="pagination-btn"
                    >
                      Trang trước
                    </button>
                    <span className="pagination-info">
                      Trang {currentOwnedPage} / {totalOwnedPages}
                    </span>
                    <button
                      onClick={() =>
                        handleOwnedPageChange(currentOwnedPage + 1)
                      }
                      disabled={currentOwnedPage === totalOwnedPages}
                      className="pagination-btn"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="emptyState">
                Bạn chưa sở hữu giáo trình nào để hiển thị ở đây.
              </p>
            )}
          </div>{" "}
          <div className="section">
            {/* Truyền hàm fetchMyOwnedCurriculums vào CurriculumList */}
            <CurriculumList
              onAfterCurriculumAdded={() => {
                setCurrentOwnedPage(1);
                fetchMyOwnedCurriculums(1);
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default CurriculumManagementPage;
