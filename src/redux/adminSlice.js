// src/redux/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminProfile: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminProfile(state, action) {
      state.adminProfile = action.payload;
    },
    clearAdminProfile(state) {
      state.adminProfile = null;
    },
  },
});

export const { setAdminProfile, clearAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;