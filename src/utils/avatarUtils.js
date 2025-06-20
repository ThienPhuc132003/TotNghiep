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
  console.log("🖼️ getUserAvatar called with userInfo:", userInfo);

  if (!userInfo) {
    console.log("❌ No userInfo provided, returning default male avatar");
    return dfMale; // Default fallback
  }

  console.log("🔍 Checking avatar logic:");
  console.log("   - roleId:", userInfo.roleId);
  console.log("   - tutorProfile?.avatar:", userInfo.tutorProfile?.avatar);
  console.log("   - userProfile?.avatar:", userInfo.userProfile?.avatar);
  console.log("   - userProfile?.gender:", userInfo.userProfile?.gender);

  // Check if user is TUTOR and has tutorProfile.avatar
  if (userInfo.roleId === "TUTOR" && userInfo.tutorProfile?.avatar) {
    console.log("✅ Using tutorProfile.avatar:", userInfo.tutorProfile.avatar);
    return userInfo.tutorProfile.avatar;
  }

  // For regular users or if tutor doesn't have avatar, use userProfile.avatar
  if (userInfo.userProfile?.avatar) {
    console.log("✅ Using userProfile.avatar:", userInfo.userProfile.avatar);
    return userInfo.userProfile.avatar;
  }

  // Fallback to default avatar based on gender
  const gender = userInfo.userProfile?.gender || userInfo.gender;
  const defaultAvatar = gender === "FEMALE" ? dfFemale : dfMale;
  console.log(
    "⚠️ Using default avatar based on gender:",
    gender,
    "->",
    defaultAvatar
  );
  return defaultAvatar;
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
