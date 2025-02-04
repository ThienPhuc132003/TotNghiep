// src/redux/uiAdminSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarVisible: true,
};

const uiAdminSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarVisible = !state.isSidebarVisible;
    },
    setSidebarVisibility(state, action) {
      state.isSidebarVisible = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarVisibility } = uiAdminSlice.actions;
export default uiAdminSlice.reducer;