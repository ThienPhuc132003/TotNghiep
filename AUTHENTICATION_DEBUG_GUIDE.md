# Debugging Authentication Issues - Implementation Summary

## Changes Made:

### 1. Enhanced axiosClient.js Authentication Logic
- Added comprehensive debug logging for token detection
- Enhanced logic to distinguish between Zoom-specific and system endpoints  
- Added validation for required tokens before making API calls
- Added specific handling for `meeting/get-meeting` endpoint to use system token

### 2. Updated Api.js to Support Token Requirements
- Added `requireToken` parameter to API function signature
- Added `X-Require-Token` header to communicate token requirements to axiosClient
- Enhanced documentation for the new parameter

### 3. Enhanced TutorClassroomPage with Debug Tools
- Added comprehensive debug logging in `handleEnterClassroom` function
- Added cookie inspection before API calls
- Added detailed error logging with full error context
- Integrated TokenDebugger and ApiTester components for real-time debugging

### 4. Created Debug Components
- **TokenDebugger**: Real-time display of token status and cookie testing
- **ApiTester**: Direct API testing with detailed error reporting
- Both components provide visual feedback and console logging

## Debug Features Added:

### Console Logging:
- Token existence check in axiosClient
- Cookie inspection before API calls
- Detailed error information with status codes and response data
- API call tracing with full request details

### Visual Debug Tools:
- Token status indicator (top-right corner)
- API test button (bottom-right corner)
- Real-time cookie testing
- Refresh capability for debug information

## How to Test:

### 1. Start Development Server:
```powershell
# Option 1: Use PowerShell script
.\start-dev.ps1

# Option 2: Direct command
npm run dev
```

### 2. Open Browser and Navigate to TutorClassroomPage:
- Login as a tutor user
- Navigate to classroom management page
- Check debug information in top-right corner

### 3. Monitor Debug Information:
- **Console**: Check browser DevTools console for detailed logging
- **Visual Debugger**: Check token status in top-right corner
- **API Tester**: Use bottom-right button to test API directly

### 4. Test API Call:
- Click on any classroom "Vào lớp" button
- Monitor console for detailed request/response logging
- Check for authentication errors and token validation

## Expected Debug Output:

### Successful Token Detection:
```
[axiosClient Request] GET meeting/get-meeting
[axiosClient Request] User token exists: true
[axiosClient Request] User token value: Token found in cookies
[axiosClient Request] Requires token: true
[axiosClient Request] Using system token for endpoint: meeting/get-meeting
```

### Token Missing Error:
```
[axiosClient Request] Token required but not found for meeting/get-meeting
Error: Authorization token is required but not found. Please log in again.
```

## Next Steps Based on Results:

### If Token Exists But Still Getting 401:
- Check token format and validity
- Verify backend API endpoint requirements
- Check if token is expired

### If Token Doesn't Exist:
- Check login process
- Verify cookie settings and domain
- Check if user is properly authenticated

### If Cookies Are Not Working:
- Check browser settings
- Verify cookie domain and path settings
- Check for HTTPS requirements

## Files Modified:
- `src/network/axiosClient.js` - Enhanced authentication logic
- `src/network/Api.js` - Added requireToken parameter
- `src/pages/User/TutorClassroomPage.jsx` - Added debug logging
- `src/components/TokenDebugger.jsx` - New debug component
- `src/components/ApiTester.jsx` - New API testing component

## Cleanup After Debugging:
Once the issue is resolved, you can:
1. Remove TokenDebugger and ApiTester imports from TutorClassroomPage
2. Remove or comment out console.log statements in axiosClient
3. Remove debug logging from handleEnterClassroom function
4. Delete debug component files if no longer needed
