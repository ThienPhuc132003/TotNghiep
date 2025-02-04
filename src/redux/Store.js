// src/redux/Store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import adminReducer from "./adminSlice";
import menuAdminReducer from "./menuAdminSlice";
import uiAdminReducer from "./uiAdminSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedAdminReducer = persistReducer(persistConfig, adminReducer);
const persistedMenuAdminReducer = persistReducer(persistConfig, menuAdminReducer);
const persistedUiAdminReducer = persistReducer(persistConfig, uiAdminReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    admin: persistedAdminReducer,
    menuAdmin: persistedMenuAdminReducer,
    ui: persistedUiAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;