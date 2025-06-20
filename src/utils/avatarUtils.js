// src/utils/avatarUtils.js
// Utility functions for avatar display logic

import dfMale from "../assets/images/df-male.png";
import dfFemale from "../assets/images/df-female.png";

/**
 * Get the correct avatar URL based on user role and available avatar fields
 * @param {Object} userInfo - User profile object from Redux state
 * @returns {string} - Avatar URL to display
 */
export const getUserAvatar = (userInfo) => {
  if (!userInfo) {
    return dfMale; // Default fallback
  }

  // Check if user is TUTOR and has tutorProfile.avatar
  if (userInfo.roleId === "TUTOR" && userInfo.tutorProfile?.avatar) {
    return userInfo.tutorProfile.avatar;
  }

  // For regular users or if tutor doesn't have avatar, use userProfile.avatar
  if (userInfo.userProfile?.avatar) {
    return userInfo.userProfile.avatar;
  }

  // Fallback to default avatar based on gender
  const gender = userInfo.userProfile?.gender || userInfo.gender;
  return gender === "FEMALE" ? dfFemale : dfMale;
};

/**
 * Get display name for user
 * @param {Object} userInfo - User profile object from Redux state
 * @returns {string} - Display name
 */
export const getUserDisplayName = (userInfo) => {
  if (!userInfo || !userInfo.userProfile) {
    return "Người dùng";
  }
  return userInfo.userProfile.fullname || "Người dùng";
};

/**
 * Get user role text
 * @param {Object} userInfo - User profile object from Redux state
 * @returns {string} - Role text
 */
export const getUserRoleText = (userInfo) => {
  if (!userInfo) {
    return "Người dùng";
  }
  return userInfo.tutorProfile ? "Gia sư" : "Học viên";
};
