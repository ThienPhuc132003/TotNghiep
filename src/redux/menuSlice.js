import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";

export const fetchMenuData = createAsyncThunk("menu/fetchMenuData", async () => {
  const response = await Api({
    endpoint: "loan-service/menu/me",
    method: METHOD_TYPE.GET,
  });
  return response.data;
});

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenuData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchMenuData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default menuSlice.reducer;