import { useEffect } from "react";

/**
 * Debug hook to track tutor state changes
 * @param {Array} tutors - Array of tutor objects
 * @param {number} refreshKey - Key used to force re-renders
 */
export const useDebugTutorState = (tutors, refreshKey) => {
  useEffect(() => {
    console.log(`[DEBUG STATE] Tutors state changed:`, {
      tutorCount: tutors.length,
      refreshKey,
      timestamp: new Date().toISOString(),
      firstTutor: tutors[0]
        ? {
            id: tutors[0].id,
            name: tutors[0].name,
            isTutorAcceptingRequestAPIFlag:
              tutors[0].isTutorAcceptingRequestAPIFlag,
            bookingStatus: tutors[0].bookingInfoCard?.status,
            bookingId: tutors[0].bookingInfoCard?.bookingId,
          }
        : null,
      lastTutor:
        tutors.length > 1
          ? {
              id: tutors[tutors.length - 1].id,
              name: tutors[tutors.length - 1].name,
              isTutorAcceptingRequestAPIFlag:
                tutors[tutors.length - 1].isTutorAcceptingRequestAPIFlag,
              bookingStatus: tutors[tutors.length - 1].bookingInfoCard?.status,
            }
          : null,
    });
  }, [tutors, refreshKey]);
};
