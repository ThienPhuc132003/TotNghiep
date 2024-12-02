// src/network/queryParser.js
export const parseQuery = (query) => {
  if (!query) return "";

  const buildQuery = (key, value) => {
    if (Array.isArray(value)) {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value.join(","))}`;
    } else if (typeof value === "object" && value !== null) {
      return Object.keys(value)
        .map((subKey) => buildQuery(`${key}[${subKey}]`, value[subKey]))
        .join("&");
    } else {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  };

  return (
    "?" +
    Object.keys(query)
      .map((key) => buildQuery(key, query[key]))
      .join("&")
  );
};