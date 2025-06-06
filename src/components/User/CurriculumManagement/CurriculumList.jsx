// src/components/User/CurriculumManagement/CurriculumList.jsx
import { useState, useEffect, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import Api from "../../../network/Api";
import { METHOD_TYPE } from "../../../network/methodType";
import CurriculumItem from "./CurriculumItem";
import "../../../assets/css/CurriculumList.style.css";
import { toast } from "react-toastify";
import { setUserProfile } from "../../../redux/userSlice";

const ITEMS_PER_PAGE = 4;

const CurriculumList = ({ onAfterCurriculumAdded = () => {} }) => {
  const [availableCurriculums, setAvailableCurriculums] = useState([]);
  const [myCurriculumIds, setMyCurriculumIds] = useState(new Set());
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [isLoadingMyCurriculums, setIsLoadingMyCurriculums] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [processingCurriculumId, setProcessingCurriculumId] = useState(null);

  const dispatch = useDispatch();
  const currentUserProfile = useSelector((state) => state.user.userProfile);
  const currentUserCoin = currentUserProfile?.coin ?? 0;

  const fetchMyCurriculumsInternal = useCallback(async () => {
    // Đổi tên để tránh trùng với prop
    setIsLoadingMyCurriculums(true);
    try {
      const response = await Api({
        endpoint: "my-curriculumn/get-my-curriculumn",
        method: METHOD_TYPE.GET,
        requireToken: true,
      });
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        const ids = response.data.items
          .flatMap((ownedItem) =>
            ownedItem.items && Array.isArray(ownedItem.items)
              ? ownedItem.items.map(
                  (detailItem) => detailItem.curriculumn?.curriculumnId
                )
              : []
          )
          .filter(Boolean);
        setMyCurriculumIds(new Set(ids));
      } else if (response.success && Array.isArray(response.data)) {
        const ids = response.data.map(
          (item) => item.curriculumnId || item.id || item
        ); // Thử nhiều key ID
        setMyCurriculumIds(new Set(ids.filter(Boolean)));
      } else {
        console.warn(
          "[CurriculumList] Không thể tải danh sách giáo trình của tôi (internal) hoặc dữ liệu rỗng/sai định dạng.",
          response
        );
        setMyCurriculumIds(new Set());
      }
    } catch (err) {
      console.error(
        "[CurriculumList] Lỗi khi tải danh sách giáo trình của tôi (internal):",
        err
      );
      setMyCurriculumIds(new Set());
    } finally {
      setIsLoadingMyCurriculums(false);
    }
  }, []);

  const fetchAvailableCurriculums = useCallback(async (pageToFetch) => {
    setIsLoadingAvailable(true);
    setError(null);
    try {
      const filterParams = [
        { key: "status", operator: "equal", value: "ACTIVE" },
      ];
      const queryParams = {
        filter: JSON.stringify(filterParams), // Stringify the filter array
        rpp: ITEMS_PER_PAGE,
        page: pageToFetch,
      };
      const response = await Api({
        endpoint: "curriculumn/search-for-tutor",
        method: METHOD_TYPE.GET,
        query: queryParams,
      });
      if (
        response &&
        response.data &&
        typeof response.data.total !== "undefined" &&
        Array.isArray(response.data.items)
      ) {
        setAvailableCurriculums(response.data.items || []);
        setTotalItems(response.data.total || 0);
      } else if (
        response &&
        response.data &&
        response.data.success &&
        response.data.data &&
        typeof response.data.data.total !== "undefined" &&
        Array.isArray(response.data.data.items)
      ) {
        setAvailableCurriculums(response.data.data.items || []);
        setTotalItems(response.data.data.total || 0);
      } else {
        console.error(
          "[CurriculumList] Lỗi từ API /curriculumn/search-for-tutor hoặc định dạng dữ liệu không đúng:",
          response
        );
        throw new Error(
          response?.data?.message || "Lỗi tải danh sách giáo trình."
        );
      }
    } catch (err) {
      console.error("[CurriculumList] Lỗi khi fetchAvailableCurriculums:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải giáo trình.");
      setAvailableCurriculums([]);
      setTotalItems(0);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCurriculumsInternal();
  }, [fetchMyCurriculumsInternal]);

  useEffect(() => {
    fetchAvailableCurriculums(currentPage);
  }, [currentPage, fetchAvailableCurriculums]);

  const handleRequestAddCurriculum = async (
    curriculumIdToAdd,
    curriculumName
  ) => {
    if (processingCurriculumId) return;
    if (currentUserCoin < 10) {
      toast.error("Bạn không đủ 10 Coin để sử dụng giáo trình này.");
      return;
    }
    if (myCurriculumIds.has(curriculumIdToAdd)) {
      toast.info(`Bạn đã sở hữu giáo trình "${curriculumName}".`);
      return;
    }

    setProcessingCurriculumId(curriculumIdToAdd);
    try {
      const response = await Api({
        endpoint: "my-curriculumn/add-to-my-curriculumn",
        method: METHOD_TYPE.POST,
        data: { curriculumnId: curriculumIdToAdd },
        requireToken: true,
      });

      if (response.success) {
        toast.success(
          `Đã thêm giáo trình "${curriculumName}" vào danh sách của bạn!`
        );
        await fetchMyCurriculumsInternal(); // Cập nhật lại set IDs nội bộ

        if (currentUserProfile) {
          const updatedProfile = {
            ...currentUserProfile,
            coin: (currentUserProfile.coin || 0) - 10,
          };
          dispatch(setUserProfile(updatedProfile));
        } else {
          console.warn(
            "[CurriculumList] Không tìm thấy userProfile trong Redux để cập nhật coin."
          );
        }

        if (onAfterCurriculumAdded) {
          // Gọi callback để báo cho component cha (CurriculumManagementPage)
          onAfterCurriculumAdded();
        }
      } else {
        throw new Error(
          response.message || "Không thể thêm giáo trình. Vui lòng thử lại."
        );
      }
    } catch (err) {
      console.error("Lỗi khi thêm giáo trình:", err);
      toast.error(`Lỗi: ${err.message || "Không thể hoàn thành thao tác."}`);
    } finally {
      setProcessingCurriculumId(null);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  if (isLoadingAvailable || isLoadingMyCurriculums) {
    return (
      <div className="loadingState" aria-live="polite">
        Đang tải dữ liệu giáo trình...
      </div>
    );
  }
  if (error && availableCurriculums.length === 0) {
    return (
      <div className="errorState" role="alert">
        Lỗi: {error}
      </div>
    );
  }
  if (!availableCurriculums || availableCurriculums.length === 0) {
    return (
      <p className="emptyState">
        Hiện không có giáo trình nào (trạng thái ACTIVE) để bạn sử dụng.
      </p>
    );
  }

  return (
    <section
      className="curriculumListContainer"
      aria-labelledby="available-curriculums-title"
    >
      {error && (
        <div className="errorState" role="alert">
          Lỗi tải một phần dữ liệu: {error}
        </div>
      )}
      <h2 id="available-curriculums-title" className="listTitle">
        Giáo trình có thể mua
      </h2>
      <ul className="list" role="list">
        {availableCurriculums.map((curriculum) => (
          <CurriculumItem
            key={curriculum.curriculumnId}
            curriculum={curriculum}
            onAddCurriculum={handleRequestAddCurriculum}
            isAdded={myCurriculumIds.has(curriculum.curriculumnId)}
            isProcessingAdd={
              processingCurriculumId === curriculum.curriculumnId
            }
          />
        ))}
      </ul>
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
            {" "}
            Trước{" "}
          </button>
          <span className="paginationInfo">
            {" "}
            Trang {currentPage} / {totalPages}{" "}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="paginationButton"
            aria-label="Trang sau"
          >
            {" "}
            Sau{" "}
          </button>
        </nav>
      )}
    </section>
  );
};

CurriculumList.propTypes = {
  onAfterCurriculumAdded: PropTypes.func,
};
export default memo(CurriculumList);
