import { useState } from 'react';
import Cookies from 'js-cookie';
import { debugCookies, setCookieWithAllOptions } from '../utils/cookieDebugger';

const LoginSimulator = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleSetToken = () => {
    try {
      // Remove existing token if any
      Cookies.remove('token');
      Cookies.remove('role');
      
      // Set new token with secure options
      const tokenToSet = token || 'simulated-token-for-testing';
      setCookieWithAllOptions('token', tokenToSet);
      setCookieWithAllOptions('role', 'user');
      
      setStatus(`Token set successfully: ${tokenToSet.substring(0, 10)}...`);
      debugCookies();
      
      // Force a page reload to apply the token
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Error setting token:', error);
    }
  };

  const handleClearToken = () => {
    try {
      Cookies.remove('token');
      Cookies.remove('role');
      setStatus('Token cleared');
      debugCookies();
      
      // Force a page reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      right: '10px',
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      width: '300px',
      zIndex: 9999
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <b>Login Simulator</b>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter token or leave empty for auto"
        style={{ 
          width: '100%',
          padding: '5px',
          marginBottom: '10px',
          borderRadius: '3px',
          border: 'none'
        }}
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSetToken}
          style={{ 
            flex: 1,
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Set Token
        </button>
        
        <button
          onClick={handleClearToken}
          style={{ 
            flex: 1,
            background: '#f44336', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Token
        </button>
      </div>
      
      {status && (
        <div style={{ 
          marginTop: '10px',
          padding: '5px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '3px',
          fontSize: '12px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default LoginSimulator;
