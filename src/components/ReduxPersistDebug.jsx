import { useSelector } from "react-redux";

const ReduxPersistDebug = () => {
  const userState = useSelector((state) => state.user);
  const persistedData = localStorage.getItem("persist:user");

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#f0f0f0",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "12px",
        maxWidth: "300px",
        zIndex: 9999,
      }}
    >
      <h4>🔧 Redux Persist Debug</h4>
      <div>
        <strong>Redux State:</strong>
        <pre>
          {JSON.stringify(
            {
              userProfile: !!userState.userProfile,
              isAuthenticated: userState.isAuthenticated,
              profileLoading: userState.profileLoading,
            },
            null,
            2
          )}
        </pre>
      </div>
      <div>
        <strong>LocalStorage persist:user:</strong>
        <pre>{persistedData ? "EXISTS" : "NOT FOUND"}</pre>
      </div>
      <button
        onClick={() => window.clearReduxStorage?.()}
        style={{ marginTop: "5px", padding: "5px", fontSize: "11px" }}
      >
        Clear Storage
      </button>
    </div>
  );
};

export default ReduxPersistDebug;
