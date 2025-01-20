import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";

const ZoomCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      console.log("Authorization code:", code); // Log the authorization code

      Api({
        endpoint: "meeting/handle",
        method: METHOD_TYPE.POST,
        data: { authorizationCode: code },
      })
        .then((response) => {
          console.log("API response:", response); // Log the API response
          if (response.success === true) {
            const { accessToken, refreshToken } = response.data.result;
            Cookies.set("zoomAccessToken", accessToken);
            Cookies.set("zoomRefreshToken", refreshToken);
            navigate("/dashboard");
          } else {
            console.error("Authorization failed:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching access token:", error);
        });
    } else {
      console.error("Authorization code not found in URL");
    }
  }, [code, navigate]);

  return <div>Loading...</div>;
};

export default ZoomCallback;