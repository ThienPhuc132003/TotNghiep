import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient";
import { parseQuery } from "./queryParser";

const Api = ({
  domain = "http://152.42.232.101:9005/api/v1/",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  isFormData = false, // Cờ để xác định FormData
}) => {
  const url = `${domain}${endpoint}${parseQuery(query)}`;
  console.log(`API URL axi: ${url}`);

  const config = {
    headers: {},
  };

  // Nếu là FormData, không cần thêm Content-Type
  if (isFormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  switch (method) {
    case METHOD_TYPE.POST:
      return axiosClient.post(endpoint, data, config);
    case METHOD_TYPE.PUT:
      return axiosClient.put(endpoint, data, config);
    case METHOD_TYPE.DELETE:
      return axiosClient.delete(endpoint, { data, ...config });
    default:
      return axiosClient.get(url, config);
  }
};

export default Api;
