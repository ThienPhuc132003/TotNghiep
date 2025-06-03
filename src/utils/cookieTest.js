import Cookies from 'js-cookie';

// Test cookie functionality
console.log('Testing cookies...');
console.log('Setting test cookie...');
Cookies.set('test', 'value123', { expires: 1 });

console.log('Reading test cookie:', Cookies.get('test'));
console.log('All cookies:', document.cookie);

console.log('Reading token cookie:', Cookies.get('token'));
console.log('Reading role cookie:', Cookies.get('role'));

export const runCookieTest = () => {
  console.log('=== COOKIE TEST ===');
  console.log('Setting test cookie...');
  Cookies.set('test', 'value123', { expires: 1 });
  
  console.log('Reading test cookie:', Cookies.get('test'));
  console.log('All cookies:', document.cookie);
  
  console.log('Reading token cookie:', Cookies.get('token'));
  console.log('Reading role cookie:', Cookies.get('role'));
  console.log('=== END COOKIE TEST ===');
};
