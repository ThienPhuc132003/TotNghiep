import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Api from "../network/Api";
import PropTypes from "prop-types";
import { METHOD_TYPE } from "../../network/methodType";

const ZoomCallback = ({ setAccessToken }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      // Gửi code đến backend để lấy accessToken
      Api({
        endpoint: "meeting/handle",
        method: METHOD_TYPE.POST,
        data: { authorizationCode: code },
      })
        .then((response) => {
          const token = response.data.result.accessToken;
          setAccessToken(token); // Lưu accessToken
          navigate("/create-meeting"); // Điều hướng đến trang tạo phòng họp
        })
        .catch((error) => console.error("Error fetching access token:", error));
    }
  }, [code, setAccessToken, navigate]);

  return <div>Processing Zoom Authentication...</div>;
};

ZoomCallback.propTypes = {
  setAccessToken: PropTypes.func.isRequired,
};

export default ZoomCallback;