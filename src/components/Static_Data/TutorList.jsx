import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TutorCardSkeleton from "../../components/User/TutorCardSkeleton";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import BookingModal from "../User/BookingModal";
import TutorCard from "../../components/User/TutorCard";
import Pagination from "../Pagination";
import "../../assets/css/TutorCardSkeleton.style.css";
import "../../assets/css/TutorSearch.style.css";
import "../../assets/css/BookingModal.style.css";

const TUTORS_PER_PAGE = 8;

const mapApiTutorToCardProps = (apiTutor) => {
  if (!apiTutor || !apiTutor.tutorProfile || !apiTutor.userId) return null;
  const profile = apiTutor.tutorProfile;
  const avatar = profile.avatar || null;
  const fullname = profile.fullname || "Gia sư ẩn danh";
  const coinPerHours = profile.coinPerHours ?? 0;
  const levelName = profile.tutorLevel?.levelName || "Chưa cập nhật";
  let rankKey = "bronze";
  const lNL = typeof levelName === "string" ? levelName.toLowerCase() : "";
  if (lNL === "bạc") rankKey = "silver";
  else if (lNL === "vàng") rankKey = "gold";
  else if (lNL === "bạch kim") rankKey = "platinum";
  else if (lNL === "kim cương") rankKey = "diamond";

  let bookingRequestForCard = null;
  let idForCancellation = profile.bookingRequestId || null; // Lấy bookingRequestId từ profile trước

  if (profile.isBookingRequest === true) {
    bookingRequestForCard = {
      status: "REQUEST",
      bookingRequestId: idForCancellation,
    };
    if (!idForCancellation)
      console.warn(
        "TutorList: isBookingRequest=true, bookingRequestId=null for tutor:",
        apiTutor.userId
      );
  } else if (
    profile.bookingRequest &&
    typeof profile.bookingRequest === "object"
  ) {
    bookingRequestForCard = {
      status: profile.bookingRequest.status,
      bookingRequestId: profile.bookingRequest.bookingRequestId,
    };
    idForCancellation = profile.bookingRequest.bookingRequestId; // Ghi đè nếu có object cụ thể
  }

  return {
    id: apiTutor.userId,
    imageUrl: avatar,
    name: fullname,
    major: profile.major?.majorName || "N/A",
    level: levelName,
    subjects: [
      profile.subject?.subjectName,
      profile.subject2?.subjectName,
      profile.subject3?.subjectName,
    ].filter(Boolean).length
      ? [
          profile.subject?.subjectName,
          profile.subject2?.subjectName,
          profile.subject3?.subjectName,
        ].filter(Boolean)
      : ["N/A môn dạy"],
    rating: profile.averageRating
      ? parseFloat(profile.averageRating.toFixed(1))
      : 0,
    reviewCount: profile.totalReviews || 0,
    isVerified:
      apiTutor.checkActive === "ACTIVE" && profile.isPublicProfile === true,
    rank: rankKey,
    hourlyRate: coinPerHours,
    teachingTime: profile.teachingTime
      ? parseFloat(profile.teachingTime)
      : null,
    bookingRequest: bookingRequestForCard, // object đã chuẩn hóa
    bookingRequestId: idForCancellation, // ID để hủy
    isInitiallyFavorite: profile.isMyFavouriteTutor ?? false,
    teachingPlace: profile.teachingPlace || "N/A",
    description: profile.description || "Chưa có mô tả.",
    gender: profile.gender,
    university: profile.univercity || "N/A",
    GPA: profile.GPA,
    teachingMethod: profile.teachingMethod,
    dateTimeLearn: profile.dateTimeLearn || [],
  };
};

const TutorList = ({
  searchTerm,
  selectedLevelId,
  selectedMajorId,
  sortBy,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => !!state.user.userProfile?.userId);
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const requireLogin = useCallback(
    (a = "className này") => {
      toast.info(`Đ.nhập để ${a}!`);
      navigate("/login", { state: { from: location } });
    },
    [navigate, location]
  );
  const fetchTutorsData = useCallback(
    async (p = 1) => {
      console.log(`Tải trang: ${p}. Logged: ${isLoggedIn}. (No filter/sort)`);
      setIsLoading(true);
      setError(null);
      const eP = isLoggedIn
        ? "user/get-list-tutor-public"
        : "user/get-list-tutor-public-without-login";
      try {
        const r = await Api({
          endpoint: eP,
          method: METHOD_TYPE.GET,
          query: { page: p, rpp: TUTORS_PER_PAGE },
          requireToken: isLoggedIn,
        });
        if (r?.data?.items && Array.isArray(r.data.items)) {
          const d = r.data;
          const mT = d.items.map(mapApiTutorToCardProps).filter(Boolean);
          setTutors(mT);
          setTotalTutors(d.total || 0);
        } else {
          setTutors([]);
          setTotalTutors(0);
        }
      } catch (e) {
        console.error(`Lỗi tải DSGS:`, e);
        if (
          e.response &&
          (e.response.status === 401 || e.response.status === 403) &&
          isLoggedIn
        ) {
          setError("P.đăng nhập hết hạn.");
        } else {
          setError("Không thể tải DSGS.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn]
  );
  useEffect(() => {
    setCurrentPage(1);
    fetchTutorsData(1);
  }, [fetchTutorsData]);
  const hPC = (pN) => {
    const tPC = Math.ceil(totalTutors / TUTORS_PER_PAGE);
    if (pN >= 1 && pN <= tPC && pN !== currentPage) {
      setCurrentPage(pN);
      fetchTutorsData(pN);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const hOBM = useCallback(
    (t) => {
      if (!isLoggedIn) {
        requireLogin("thuê");
        return;
      }
      setSelectedTutorForBooking(t);
      setIsBookingModalOpen(true);
    },
    [isLoggedIn, requireLogin]
  );
  const hCBM = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTutorForBooking(null);
  }, []);
  const hBSIL = useCallback(() => {
    hCBM();
    toast.success("Y.cầu thuê đã gửi!");
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData, hCBM]);
  const hCSIL = useCallback(() => {
    toast.success("Đã hủy y.cầu thuê.");
    fetchTutorsData(currentPage);
  }, [currentPage, fetchTutorsData]);
  const hFSC = useCallback((tId, nIF) => {
    setTutors((pT) =>
      pT.map((t) => (t.id === tId ? { ...t, isInitiallyFavorite: nIF } : t))
    );
  }, []);
  const tP = Math.ceil(totalTutors / TUTORS_PER_PAGE);
  const iFFT = (currentPage - 1) * TUTORS_PER_PAGE;
  const iLLOP = Math.min(iFFT + TUTORS_PER_PAGE, totalTutors);

  return (
    <section className="search-results-section">
      <div className="results-header">
        {" "}
        {error && <p className="error-message">{error}</p>}{" "}
        {!error && (
          <p className="results-count">
            {isLoading && tutors.length === 0
              ? "Đang tải..."
              : !isLoading && totalTutors > 0
              ? `Hiển thị ${
                  totalTutors > 0 ? iFFT + 1 : 0
                } - ${iLLOP} trên ${totalTutors} gia sư`
              : !isLoading && totalTutors === 0
              ? "Không tìm thấy."
              : isLoading && tutors.length > 0
              ? `Đang tải thêm... (Tổng: ${totalTutors})`
              : ""}
          </p>
        )}{" "}
      </div>
      {isLoading && tutors.length === 0 ? (
        <div className="tutor-list redesigned-list loading">
          {Array.from({ length: TUTORS_PER_PAGE }).map((_, i) => (
            <TutorCardSkeleton key={`sk-${i}`} />
          ))}
        </div>
      ) : !error && tutors.length > 0 ? (
        <>
          {" "}
          <div className="tutor-list redesigned-list">
            {tutors.map((t) => (
              <TutorCard
                key={t.id}
                tutor={t}
                onOpenBookingModal={hOBM}
                onCancelSuccess={hCSIL}
                isLoggedIn={isLoggedIn}
                onFavoriteStatusChange={hFSC}
              />
            ))}
          </div>{" "}
          {tP > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={tP}
              onPageChange={hPC}
            />
          )}{" "}
        </>
      ) : !isLoading && !error && totalTutors === 0 ? (
        <p className="no-results">Không tìm thấy.</p>
      ) : null}
      {selectedTutorForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={hCBM}
          tutorId={selectedTutorForBooking.id}
          tutorName={selectedTutorForBooking.name}
          onBookingSuccess={hBSIL}
          maxHoursPerLesson={selectedTutorForBooking.teachingTime}
          availableScheduleRaw={selectedTutorForBooking.dateTimeLearn || []}
        />
      )}
    </section>
  );
};
TutorList.propTypes = {
  searchTerm: PropTypes.string,
  selectedLevelId: PropTypes.string,
  selectedMajorId: PropTypes.string,
  sortBy: PropTypes.string,
};
export default TutorList;
