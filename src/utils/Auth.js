// src/utils/auth.js
export const setAuth = (isAuth) => {
  localStorage.setItem("isAuth", isAuth ? "true" : "false");
};

export const checkAuth = () => {
  return localStorage.getItem("isAuth") === "true";
};
