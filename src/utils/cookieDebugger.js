// src/utils/cookieDebugger.js
import Cookies from 'js-cookie';

export const debugCookies = () => {
  console.log('===== COOKIE DEBUG INFORMATION =====');
  console.log('All cookies string:', document.cookie);
  console.log('Token cookie:', Cookies.get('token'));
  console.log('Role cookie:', Cookies.get('role'));
  
  // Check cookie attributes
  const cookieAttributes = {
    token: {
      value: Cookies.get('token'),
      exists: !!Cookies.get('token'),
    },
    role: {
      value: Cookies.get('role'),
      exists: !!Cookies.get('role'),
    }
  };
  
  console.log('Cookie attributes:', cookieAttributes);
  console.log('===== END COOKIE DEBUG =====');
  
  return cookieAttributes;
};

export const setCookieWithAllOptions = (name, value) => {
  // Try setting with maximum compatibility
  Cookies.set(name, value, {
    expires: 7,  // 7 days
    path: '/',
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:'
  });
  console.log(`Cookie ${name} set with all options`);
};

export default { debugCookies, setCookieWithAllOptions };
