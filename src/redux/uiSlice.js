// File: uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isSidebarVisible: true,
  },
  reducers: {
    toggleSidebar(state) {
      state.isSidebarVisible = !state.isSidebarVisible;
    },
    setSidebarVisibility(state, action) {
      state.isSidebarVisible = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarVisibility } = uiSlice.actions;
export default uiSlice.reducer;
