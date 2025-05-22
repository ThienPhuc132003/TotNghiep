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

  const fetchMyOwnedCurriculums = useCallback(async () => {
    setIsLoadingMyList(true);
    setMyListError(null);
    try {
      const response = await Api({
        endpoint: "/my-curriculumn/get-my-curriculumn",
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
      } else if (response.success && Array.isArray(response.data)) {
        // Trường hợp API trả về trực tiếp mảng object curriculum
        // Điều này ít khả năng xảy ra với cấu trúc bạn đưa, nhưng để phòng hờ
        setMyOwnedCurriculums(
          response.data.filter((item) => item && item.curriculumnId)
        );
      } else {
        console.warn(
          "Không thể tải danh sách giáo trình của tôi hoặc dữ liệu không hợp lệ/rỗng.",
          response
        );
        setMyOwnedCurriculums([]); // Set về mảng rỗng nếu không có dữ liệu hoặc lỗi nhẹ
      }
    } catch (err) {
      console.error("Lỗi khi tải giáo trình của tôi:", err);
      setMyListError(
        "Đã xảy ra lỗi khi tải danh sách giáo trình của bạn. Vui lòng thử lại."
      );
      // Không nên toast ở đây vì đây là lần load ban đầu, lỗi sẽ hiển thị trên UI
      setMyOwnedCurriculums([]);
    } finally {
      setIsLoadingMyList(false);
    }
  }, []); // Dependencies rỗng

  useEffect(() => {
    fetchMyOwnedCurriculums();
  }, [fetchMyOwnedCurriculums]);

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
            ) : (
              <p className="emptyState">
                Bạn chưa sở hữu giáo trình nào để hiển thị ở đây.
              </p>
            )}
          </div>

          <div className="section">
            {/* Truyền hàm fetchMyOwnedCurriculums vào CurriculumList */}
            <CurriculumList onAfterCurriculumAdded={fetchMyOwnedCurriculums} />
          </div>
        </main>
      </div>
    </>
  );
};

export default CurriculumManagementPage;
