# 🚨 API Get Body Debug - Missing meetingId Error

## 🔍 Phân tích lỗi từ DevTools

Từ ảnh DevTools:

- ❌ **Error**: `Missing meetingId` (400 Bad Request)
- 🔗 **URL**: `http://localhost:5173/api/meeting/get-meeting`
- 📝 **Method**: GET
- 📊 **Status**: 400

→ **Backend không nhận được `classroomId` từ body request**

## 🔧 Changes Made

### **1. Fixed Api.js - Use axios.request() for GET with body**

```javascript
// OLD: axios.get(url, { ...config, data })
// NEW: axios.request({ method: 'GET', url, data, ...config })

if (data && Object.keys(data).length > 0) {
  console.log("🔍 DEBUG - Sending GET with body data:", data);
  result = await axiosClient.request({
    method: "GET",
    url: requestUrl,
    data: data,
    ...config,
  });
} else {
  result = await axiosClient.get(requestUrl, config);
}
```

### **2. Enhanced API Logger Debug**

```javascript
// Added detailed debug logging for GET with body
console.log(`🔍 DEBUG - Exact body data: ${JSON.stringify(data)}`);
console.log(`🔍 DEBUG - Data type: ${typeof data}`);
console.log(`🔍 DEBUG - Data keys: [${Object.keys(data).join(", ")}]`);
```

## 🧪 Test Steps

### **1. Load Main App**

```
http://localhost:5174
```

### **2. Open DevTools Console**

```javascript
// Enable detailed logging
enableAPILogging();

// Check API Logger is working
apiLogger.getStatus();
```

### **3. Test in StudentClassroomPage**

- Navigate to classroom page
- Try to view meetings
- Check console for DEBUG logs
- Check Network tab for actual request

### **4. Expected Console Output:**

```
🚀 [GET] API Request
🔗 URL: http://localhost:5173/api/meeting/get-meeting
📤 Request Body:
{
  "classroomId": "your-classroom-id"
}
🔥 Custom GET with Body Data: classroomId
🔍 DEBUG - Exact body data: {"classroomId":"your-classroom-id"}
🔍 DEBUG - Data type: object
🔍 DEBUG - Data keys: [classroomId]

🔍 DEBUG - Sending GET with body data: {classroomId: "your-classroom-id"}
🔍 DEBUG - Request URL: meeting/get-meeting
🔍 DEBUG - Config: {...}
```

### **5. Test with Debug Scripts**

```javascript
// Load debug script in console
// Then run:
debugAxiosGetBody.runAllAxiosTests();
```

## 🔍 What to Check

### **In Console:**

1. ✅ API Logger shows body data
2. ✅ DEBUG logs show correct data
3. ✅ No JavaScript errors

### **In Network Tab:**

1. 🔍 **Request Headers**: `Content-Type: application/json`
2. 🔍 **Request Payload**: Should have `{"classroomId": "..."}`
3. 🔍 **Method**: GET
4. 🔍 **Response**: Should not be "Missing meetingId"

## 🎯 Possible Issues & Solutions

### **Issue 1: Axios still not sending body**

**Solution**: Try different axios methods

```javascript
// Test these in console:
debugAxiosGetBody.testAxiosGetWithConfigData();
debugAxiosGetBody.testAxiosRequestWithMethodGET();
debugAxiosGetBody.testAxiosConfigObject();
```

### **Issue 2: Backend not reading GET body**

**Solution**: Check backend logs or change to POST

```javascript
// Temporary change method to POST for testing
method: METHOD_TYPE.POST; // instead of GET
```

### **Issue 3: axiosClient interceptor interference**

**Solution**: Check `src/network/axiosClient.js` interceptors

### **Issue 4: Token/Auth issue**

**Solution**: Check token validity

```javascript
// Check token
console.log("Token:", Cookies.get("token"));
```

## 📋 Debug Files Created

1. **`debug-axios-get-body-methods.js`** - Test different axios methods
2. **Enhanced API Logger** - More detailed debug info
3. **Enhanced Api.js** - Better debugging logs

## 🎯 Success Criteria

✅ Console shows body data being sent  
✅ Network tab shows request payload  
✅ Backend receives classroomId  
✅ API returns meetings data instead of "Missing meetingId"

---

**Next Action**: Test in browser và check console + network tab để xem request có gửi body data hay không.
