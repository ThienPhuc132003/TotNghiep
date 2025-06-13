# Student Information Debug Guide

## 🔧 **Debugging Steps Implemented:**

### **1. Added Debug Logging:**

- Added console.log to check classroom data structure
- Added console.log to check user data specifically
- Added detailed API response logging

### **2. API Enhancement:**

- Added `include` parameter to API call: `"user,tutor,user.major,tutor.major,tutor.subject,tutor.tutorLevel"`
- Created `fetchClassroomDetail()` function to get specific classroom data
- Modified `handleShowClassroomDetail()` to fetch detailed data

### **3. Data Path Corrections:**

- ✅ Changed from `classroom.student` to `classroom.user`
- ✅ Updated field mappings to match API response structure

## 🧪 **Testing Instructions:**

### **Step 1: Check Console Logs**

1. Open Developer Tools (F12)
2. Go to Console tab
3. Navigate to classroom detail view
4. Look for these debug logs:
   ```
   🔍 DEBUG - Classroom data: [object]
   🔍 DEBUG - User data: [object]
   🔍 Fetching detailed classroom info for: [classroomId]
   ✅ Detailed classroom data: [object]
   ```

### **Step 2: Verify Data Structure**

Check if the console shows data like:

```javascript
user: {
  fullname: "Trần Thị Thảo",
  personalEmail: "thanh.tran00@gmail.com",
  phoneNumber: "0771234879",
  birthday: "2000-07-04",
  homeAddress: "120 Hải Triều...",
  major: {
    majorName: "Công nghệ thông tin"
  }
}
```

### **Step 3: API Response Check**

If logs show `null` or missing data:

1. Check if API endpoint `classroom/search-for-tutor` supports:
   - `classroomId` filter parameter
   - `include` parameter for relationships
2. May need to use different API endpoint for detailed data

## 🔧 **Potential Solutions:**

### **If API doesn't support detailed data:**

```javascript
// Option 1: Use different endpoint
endpoint: `classroom/detail/${classroomId}`;

// Option 2: Make separate API calls
const userResponse = await Api({ endpoint: `user/${classroom.userId}` });
const tutorResponse = await Api({ endpoint: `tutor/${classroom.tutorId}` });
```

### **If API structure is different:**

Update field mappings based on actual response structure.

## 🎯 **Expected Result:**

After fixes, UI should display:

```
👤 Tên: Trần Thị Thảo
📧 Email: thanh.tran00@gmail.com
📞 Số điện thoại: 0771234879
🎂 Ngày sinh: 04/07/2000
📍 Địa chỉ: 120 Hải Triều, P. Bến Nghé, Q.1, TP. Hồ Chí Minh
🎓 Ngành học: Công nghệ thông tin
💰 Học phí: 180 Xu/giờ
```

---

**Next Step**: Test and check console logs to determine the exact issue with data fetching.
