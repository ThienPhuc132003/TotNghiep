import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userProfile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile(state, action) {
      state.userProfile = action.payload;
    },
    setUserAvatar(state, action) {
      state.userProfile.avatar = action.payload;
    },
  },
});

export const { setUserProfile ,setUserAvatar} = userSlice.actions;
export default userSlice.reducer;