// bookingStateHelpers.js - Utility functions for managing booking state updates

/**
 * Update a specific tutor's booking status in the tutors array
 * @param {Array} tutors - Current tutors array
 * @param {string} tutorId - ID of the tutor to update
 * @param {Object} newBookingStatus - New booking status {status, bookingId}
 * @returns {Array} Updated tutors array
 */
export const updateTutorBookingStatus = (tutors, tutorId, newBookingStatus) => {
  return tutors.map((tutor) =>
    tutor.id === tutorId
      ? {
          ...tutor,
          bookingInfoCard: {
            status: newBookingStatus.status,
            bookingId: newBookingStatus.bookingId,
          },
        }
      : tutor
  );
};

/**
 * Clear booking status for a specific tutor (used when canceling)
 * @param {Array} tutors - Current tutors array
 * @param {string} tutorId - ID of the tutor to clear booking for
 * @returns {Array} Updated tutors array
 */
export const clearTutorBookingStatus = (tutors, tutorId) => {
  return tutors.map((tutor) =>
    tutor.id === tutorId
      ? {
          ...tutor,
          bookingInfoCard: {
            status: null,
            bookingId: null,
          },
        }
      : tutor
  );
};

/**
 * Update favorite status for a specific tutor
 * @param {Array} tutors - Current tutors array
 * @param {string} tutorId - ID of the tutor to update
 * @param {boolean} newIsFavorite - New favorite status
 * @returns {Array} Updated tutors array
 */
export const updateTutorFavoriteStatus = (tutors, tutorId, newIsFavorite) => {
  return tutors.map((tutor) =>
    tutor.id === tutorId
      ? { ...tutor, isInitiallyFavorite: newIsFavorite }
      : tutor
  );
};

/**
 * Booking status constants for consistency
 */
export const BOOKING_STATUS = {
  REQUEST: "REQUEST",
  ACCEPTED: "ACCEPTED",
  HIRED: "HIRED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

/**
 * Check if a tutor should show cancel button
 * @param {Object} bookingInfoCard - Booking info from tutor card
 * @returns {boolean} Whether cancel button should be shown
 */
export const shouldShowCancelButton = (bookingInfoCard) => {
  return (
    bookingInfoCard?.status === BOOKING_STATUS.REQUEST &&
    !!bookingInfoCard?.bookingId
  );
};

/**
 * Check if a tutor should show accepted requests button
 * @param {Object} bookingInfoCard - Booking info from tutor card
 * @returns {boolean} Whether accepted requests button should be shown
 */
export const shouldShowAcceptedRequestsButton = (bookingInfoCard) => {
  return bookingInfoCard?.status === BOOKING_STATUS.ACCEPTED;
};
