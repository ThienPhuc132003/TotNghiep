import { createSlice } from "@reduxjs/toolkit";

const uiAdminSlice = createSlice({
  name: "uiAdmin",
  initialState: {
    openMenus: {}, // Object to store the open/close state of menus
    isSidebarVisible: true,
  },
  reducers: {
    toggleMenu: (state, action) => {
      const menuName = action.payload;
      state.openMenus[menuName] = !state.openMenus[menuName];
    },
    setMenu: (state, action) => {
      state.openMenus = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarVisible = !state.isSidebarVisible;
    },
    setSidebarVisibility: (state, action) => {
      state.isSidebarVisible = action.payload;
    },
    toggleSubmenu: (state, action) => {  // New action
      const { menuName } = action.payload;
      state.openMenus[menuName] = !state.openMenus[menuName];
    },
  },
});

export const { toggleMenu, setMenu, toggleSidebar, setSidebarVisibility, toggleSubmenu } = uiAdminSlice.actions; // Export toggleSubmenu
export default uiAdminSlice.reducer;