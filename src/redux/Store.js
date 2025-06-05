// src/redux/Store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import adminReducer from "./adminSlice";
import menuAdminReducer from "./menuAdminSlice";
import uiAdminReducer from "./uiAdminSlice";

// Separate persist configs for different data types
const userPersistConfig = {
  key: "user",
  storage,
  // Only persist essential user data
  whitelist: ["profile", "token", "isAuthenticated"],
  // Set expiration for user session
  version: 1,
};

const adminPersistConfig = {
  key: "admin",
  storage,
  whitelist: ["adminProfile"],
  version: 1,
};

// UI state should not be persisted (memory optimization)
const uiPersistConfig = {
  key: "ui",
  storage,
  // Only persist theme and language settings
  whitelist: ["theme", "language"],
  version: 1,
};

// Menu state with limited persistence
const menuPersistConfig = {
  key: "menu",
  storage,
  whitelist: ["selectedMenu"],
  version: 1,
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);
const persistedMenuAdminReducer = persistReducer(
  menuPersistConfig,
  menuAdminReducer
);
const persistedUiAdminReducer = persistReducer(uiPersistConfig, uiAdminReducer);

// Combine reducers
const rootReducer = combineReducers({
  user: persistedUserReducer,
  admin: persistedAdminReducer,
  menuAdmin: persistedMenuAdminReducer,
  ui: persistedUiAdminReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["register"],
      },
      // Add memory optimization
      immutableCheck: {
        warnAfter: 128,
      },
    }),
  // Enable DevTools only in development
  devTools: import.meta.env.DEV,
});

// Create persistor with garbage collection
export const persistor = persistStore(store, null, () => {
  // Clear old persisted data on app load
  if (typeof window !== "undefined") {
    // Clear expired sessions
    const userState = storage.getItem("persist:user");
    if (userState) {
      try {
        JSON.parse(userState);
        // Data is valid, keep it
      } catch (error) {
        // Clear corrupted data
        storage.removeItem("persist:user");
      }
    }
  }
});

export default store;
