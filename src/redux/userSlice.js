// src/redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../network/Api"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // Đảm bảo đường dẫn đúng

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const response = await Api({
        endpoint: "user/get-profile",
        method: METHOD_TYPE.GET,
      });
      if (response.success && response.data) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(
          response.message || "Lỗi không xác định từ API khi lấy profile."
        );
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Lỗi kết nối hoặc xử lý khi lấy profile."
      );
    }
  }
);

const initialState = {
  userProfile: null,
  isAuthenticated: false, // KHỞI TẠO LÀ FALSE
  profileLoading: false,
  profileError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile(state, action) {
      state.userProfile = action.payload;
      state.isAuthenticated = !!action.payload; // True nếu có userProfile, false nếu null
      state.profileLoading = false;
      state.profileError = null;
    },
    clearUserProfile(state) {
      state.userProfile = null;
      state.isAuthenticated = false; // QUAN TRỌNG: Set false khi logout
      state.profileLoading = false;
      state.profileError = null;
    },
    // Action riêng để set isAuthenticated nếu cần (ví dụ sau khi chỉ xác thực token)
    setAuthenticationStatus(state, action) {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.userProfile = action.payload;
        state.isAuthenticated = !!action.payload; // CẬP NHẬT isAuthenticated
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || "Lấy thông tin hồ sơ thất bại";
        // Không tự động set isAuthenticated = false ở đây trừ khi đó là yêu cầu
      });
  },
});

export const { setUserProfile, clearUserProfile, setAuthenticationStatus } =
  userSlice.actions;
export default userSlice.reducer;
