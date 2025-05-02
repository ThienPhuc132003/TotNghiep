// src/store/slices/userSlice.js (Hoặc đường dẫn của bạn)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../../network/Api"; // <<= Đảm bảo đường dẫn này đúng
import { METHOD_TYPE } from "../../network/methodType"; // <<= Đảm bảo đường dẫn này đúng

// --- 1. Định nghĩa Async Thunk ---
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile", // Tên định danh cho action types (pending, fulfilled, rejected)
  async (_, thunkAPI) => {
    // Tham số đầu tiên là argument truyền vào khi dispatch (không cần ở đây nên dùng _)
    // thunkAPI chứa các hàm như dispatch, getState, rejectWithValue
    try {
      console.log(
        "fetchUserProfile thunk: Bắt đầu gọi API user/get-profile..."
      );
      const response = await Api({
        endpoint: "user/get-profile", // Endpoint để lấy profile
        method: METHOD_TYPE.GET,
        // Có thể cần thêm headers Authorization nếu API yêu cầu xác thực
        // headers: { Authorization: `Bearer ${thunkAPI.getState().auth.token}` } // Ví dụ lấy token từ state khác
      });

      console.log("fetchUserProfile thunk: Nhận được response:", response);

      // Kiểm tra API trả về thành công và có dữ liệu
      if (response.success && response.data) {
        // Return dữ liệu profile, nó sẽ thành payload của action 'fulfilled'
        return response.data;
      } else {
        // Nếu API báo lỗi (success: false hoặc không có data)
        const errorMessage = response.message || "Lỗi không xác định từ API.";
        console.error("fetchUserProfile thunk: API trả về lỗi -", errorMessage);
        // Trả về lỗi bằng rejectWithValue
        return thunkAPI.rejectWithValue(errorMessage);
      }
    } catch (error) {
      // Nếu có lỗi mạng hoặc lỗi trong logic try...
      const message =
        error.response?.data?.message || // Lỗi từ Axios response
        error.message || // Lỗi JS thông thường
        "Lỗi kết nối hoặc xử lý."; // Lỗi mặc định
      console.error("fetchUserProfile thunk: Bắt lỗi catch -", message);
      // Trả về lỗi bằng rejectWithValue
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- 2. Cập nhật initialState ---
const initialState = {
  userProfile: null,
  profileLoading: false, // Trạng thái loading khi gọi API
  profileError: null, // Lưu lỗi nếu có
};

// --- 3. Cập nhật createSlice ---
const userSlice = createSlice({
  name: "user",
  initialState,
  // Reducers đồng bộ giữ nguyên
  reducers: {
    setUserProfile(state, action) {
      state.userProfile = action.payload;
      // Có thể reset loading/error ở đây nếu cần đồng bộ thủ công
      state.profileLoading = false;
      state.profileError = null;
    },
    clearUserProfile(state) {
      state.userProfile = null;
      state.profileLoading = false;
      state.profileError = null;
    },
  },
  // --- 4. Thêm extraReducers để xử lý async thunk ---
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        console.log("Reducer: fetchUserProfile pending...");
        state.profileLoading = true; // Báo đang loading
        state.profileError = null; // Xóa lỗi cũ
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        console.log("Reducer: fetchUserProfile fulfilled!", action.payload);
        state.profileLoading = false; // Hết loading
        state.userProfile = action.payload; // <<== CẬP NHẬT PROFILE MỚI
        state.profileError = null; // Đảm bảo không có lỗi
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        console.error("Reducer: fetchUserProfile rejected!", action.payload); // action.payload chứa lỗi từ rejectWithValue
        state.profileLoading = false; // Hết loading
        state.profileError = action.payload || "Lấy thông tin thất bại"; // Lưu lỗi
        // Không thay đổi userProfile khi lỗi để giữ lại profile cũ nếu có
      });
  },
});

// --- 5. Export actions và reducer ---
export const { setUserProfile, clearUserProfile } = userSlice.actions; // Export action đồng bộ
// export { fetchUserProfile }; // Export riêng async thunk nếu muốn (không bắt buộc nếu đã export ở trên)
export default userSlice.reducer; // Export reducer
