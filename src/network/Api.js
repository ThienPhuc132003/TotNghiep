import { METHOD_TYPE } from "./methodType";
import axiosClient from "./axiosClient";
import qs from 'qs';
const Api = ({
  domain = "https://giasuvlu.click/api/",
  endpoint,
  method = METHOD_TYPE.GET,
  data,
  query,
  isFormData = false,
}) => {
  const queryString = query ? `?${qs.stringify(query, { encode: false })}` : '';
  const url = `${domain}${endpoint}${queryString}`;
  console.log(`API URL axi: ${url}`);

  const config = {
    headers: {},
  };

  if (isFormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  switch (method) {
    case METHOD_TYPE.POST:
      return axiosClient.post(url, data, config);
    case METHOD_TYPE.PUT:
      return axiosClient.put(url, data, config);
    case METHOD_TYPE.DELETE:
      return axiosClient.delete(url, { data, ...config });
    default:
      return axiosClient.get(url, config);
  }
};

export default Api;