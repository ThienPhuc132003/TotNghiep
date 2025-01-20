// src/components/LoginZoomButton.jsx
import Api from '../network/Api';
import { METHOD_TYPE } from '../network/methodType';

const LoginZoomButton = () => {
  const handleLogin = async () => {
    try {
      const response = await Api({
        endpoint: 'meeting/auth',
        method: METHOD_TYPE.GET,
      });
      const zoomAuthUrl = response.data.zoomAuthUrl;

      if (zoomAuthUrl) {
        window.location.href = zoomAuthUrl;
      } else {
        console.error('Zoom Auth URL not found.');
      }
    } catch (error) {
      console.error('Error fetching Zoom Auth URL:', error);
    }
  };

  return <button onClick={handleLogin}>Login with Zoom</button>;
};

export default LoginZoomButton;