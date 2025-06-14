# 🧪 QUICK TESTING GUIDE - Student vs Tutor Meeting API

## 🎯 Testing Objective

Verify that both Student and Tutor can see meeting lists when accessing classrooms using the same `meeting/get-meeting` (POST) API.

## 🔧 Testing Setup

### 1. Start Application

```bash
cd c:\Users\PHUC\Documents\GitHub\TotNghiep
npm start
```

### 2. Test ClassroomId

Use this confirmed working classroom ID for testing:

```
67585e77b3fd4c6b40bb03e9
```

## 📋 Test Cases

### ✅ STUDENT TESTING

1. **Login as Student**
2. **Navigate to Student Dashboard**
3. **Find a classroom and click "Danh sách phòng học"**
4. **Expected Result**: Should see list of meetings for that classroom
5. **Check Console**: Should see debug logs:
   ```
   🔍 STUDENT DEBUG - Starting meeting fetch for: {classroomId, classroomName}
   🔍 STUDENT DEBUG - Fetching meetings using meeting/get-meeting API (primary)
   ✅ STUDENT DEBUG - Found meetings via meeting/get-meeting: X
   ```

### ✅ TUTOR TESTING

1. **Login as Tutor**
2. **Navigate to Tutor Dashboard**
3. **Find a classroom and click "Vào lớp học"**
4. **Expected Result**: Should see list of meetings for that classroom
5. **Check Console**: Should see debug logs:
   ```
   🔍 TUTOR DEBUG - Fetching meetings for classroom: {details}
   🔍 TUTOR DEBUG - meeting/get-meeting response: {response}
   ✅ TUTOR DEBUG - Found meetings via meeting/get-meeting: X
   ```

## 🔍 Debug Verification

### Browser Console Checks:

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for debug logs** starting with 🔍 STUDENT DEBUG or 🔍 TUTOR DEBUG
4. **Verify API calls** show `meeting/get-meeting` endpoint
5. **Check classroomId** is being passed correctly

### Network Tab Verification:

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Look for POST requests** to `meeting/get-meeting`
4. **Check Request Body** contains:
   ```json
   { "classroomId": "67585e77b3fd4c6b40bb03e9" }
   ```
5. **Check Response** has success=true and items array

## 🐛 Troubleshooting

### If Student Can't See Meetings:

1. Check console for error messages
2. Verify token is valid
3. Check if fallback to `meeting/search` is triggered
4. Verify classroomId is correct

### If Tutor Can't See Meetings:

1. Check console for error messages
2. Verify token is valid
3. Check if API response has correct structure
4. Verify classroomId is correct

### Common Issues:

- **Token Expired**: Re-login to get fresh token
- **Invalid ClassroomId**: Use confirmed working ID: `67585e77b3fd4c6b40bb03e9`
- **Network Error**: Check if backend is running
- **CORS Issues**: Check browser network tab for CORS errors

## 📊 Success Indicators

### ✅ Test PASSED if:

- Both Student and Tutor can see meeting lists
- Console shows successful API calls to `meeting/get-meeting`
- Network tab shows POST requests with correct classroomId
- No console errors related to meeting fetching
- UI displays meetings with join buttons

### ❌ Test FAILED if:

- Either Student or Tutor shows empty meeting list
- Console shows API errors
- Network tab shows failed requests
- UI shows "Chưa có phòng học nào" when meetings should exist

## 🎯 API Testing Tool

For direct API testing, open:

```
c:\Users\PHUC\Documents\GitHub\TotNghiep\debug-student-vs-tutor-meeting-api.html
```

This tool allows you to:

- Test both APIs directly
- Compare responses
- Verify data structure
- Debug authentication issues

## 📝 Test Checklist

- [ ] Student can access meeting list
- [ ] Tutor can access meeting list
- [ ] Both use `meeting/get-meeting` POST API
- [ ] ClassroomId passed correctly in request body
- [ ] Debug logs appear in console
- [ ] No compilation errors
- [ ] No runtime errors
- [ ] UI displays meetings correctly
- [ ] Join buttons work properly
- [ ] Page reload preserves meeting view

---

**Quick Start**: Login as Student → Click "Danh sách phòng học" → Should see meetings!  
**Expected Result**: Both Student and Tutor see identical meeting functionality!
