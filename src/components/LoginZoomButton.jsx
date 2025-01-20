

const LoginZoomButton = () => {
  const handleLogin = () => {
    // Redirect đến Zoom OAuth
    window.location.href = "https://giasuvlu.click/api/meeting/login";
  };

  return <button onClick={handleLogin}>Login with Zoom</button>;
};

export default LoginZoomButton;
