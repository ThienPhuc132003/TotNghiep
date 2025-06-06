// useTutorStateManager.js - Custom hook for managing tutor state updates

import { useCallback } from "react";
import { toast } from "react-toastify";
import {
  updateTutorBookingStatus,
  clearTutorBookingStatus,
  updateTutorFavoriteStatus,
} from "../utils/bookingStateHelpers";

/**
 * Custom hook for managing tutor state updates efficiently
 * @param {Function} setTutors - State setter function for tutors array
 * @param {Function} handleCloseBookingModal - Function to close booking modal
 * @param {Function} fetchTutorsData - Function to fetch tutors data (fallback)
 * @param {number} currentPage - Current page number
 * @returns {Object} Object containing all state update handlers
 */
export const useTutorStateManager = (
  setTutors,
  handleCloseBookingModal,
  fetchTutorsData,
  currentPage
) => {
  // Handle successful booking creation
  const handleBookingSuccess = useCallback(
    (tutorId, newBookingStatus) => {
      if (handleCloseBookingModal) handleCloseBookingModal();
      toast.success("Yêu cầu thuê đã được gửi thành công!");

      setTutors((prevTutors) =>
        updateTutorBookingStatus(prevTutors, tutorId, {
          status: newBookingStatus.status || "REQUEST",
          bookingId: newBookingStatus.bookingId,
        })
      );
    },
    [setTutors, handleCloseBookingModal]
  );

  // Handle successful booking cancellation
  const handleCancelSuccess = useCallback(
    (tutorId) => {
      setTutors((prevTutors) => clearTutorBookingStatus(prevTutors, tutorId));
      toast.success("Đã hủy yêu cầu thành công!");
    },
    [setTutors]
  );

  // Handle favorite status change
  const handleFavoriteStatusChange = useCallback(
    (tutorId, newIsFavorite) => {
      setTutors((prevTutors) =>
        updateTutorFavoriteStatus(prevTutors, tutorId, newIsFavorite)
      );
    },
    [setTutors]
  );

  // Handle accepted request modal actions
  const handleAcceptedRequestAction = useCallback(
    (tutorId, updatedStatus) => {
      if (tutorId && updatedStatus) {
        setTutors((prevTutors) =>
          updateTutorBookingStatus(prevTutors, tutorId, updatedStatus)
        );
      } else {
        // Fallback to full refresh if no specific update info provided
        if (fetchTutorsData && currentPage) {
          fetchTutorsData(currentPage);
        }
      }
    },
    [setTutors, fetchTutorsData, currentPage]
  );

  // Handle bulk status updates (for future use)
  const handleBulkStatusUpdate = useCallback(
    (updates) => {
      setTutors((prevTutors) => {
        let updatedTutors = [...prevTutors];

        updates.forEach(({ tutorId, newStatus, action }) => {
          switch (action) {
            case "booking":
              updatedTutors = updateTutorBookingStatus(
                updatedTutors,
                tutorId,
                newStatus
              );
              break;
            case "cancel":
              updatedTutors = clearTutorBookingStatus(updatedTutors, tutorId);
              break;
            case "favorite":
              updatedTutors = updateTutorFavoriteStatus(
                updatedTutors,
                tutorId,
                newStatus.isFavorite
              );
              break;
            default:
              console.warn(`Unknown action: ${action}`);
          }
        });

        return updatedTutors;
      });
    },
    [setTutors]
  );

  // Handle optimistic updates (update UI immediately, then sync with server)
  const handleOptimisticUpdate = useCallback(
    (tutorId, tempStatus, apiCall) => {
      // Apply temporary update
      setTutors((prevTutors) =>
        updateTutorBookingStatus(prevTutors, tutorId, tempStatus)
      );

      // Execute API call and handle result
      apiCall()
        .then((result) => {
          // Apply final status from server response
          if (result && result.status) {
            setTutors((prevTutors) =>
              updateTutorBookingStatus(prevTutors, tutorId, result)
            );
          }
        })
        .catch((error) => {
          // Revert on error - could fetch fresh data or revert to previous state
          console.error("Optimistic update failed:", error);
          if (fetchTutorsData && currentPage) {
            fetchTutorsData(currentPage);
          }
        });
    },
    [setTutors, fetchTutorsData, currentPage]
  );

  return {
    handleBookingSuccess,
    handleCancelSuccess,
    handleFavoriteStatusChange,
    handleAcceptedRequestAction,
    handleBulkStatusUpdate,
    handleOptimisticUpdate,
  };
};

export default useTutorStateManager;
