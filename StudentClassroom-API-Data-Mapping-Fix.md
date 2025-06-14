# Student Classroom API Data Mapping Fix ✅

## 🔍 ISSUE IDENTIFIED:

- StudentClassroomPage không hiển thị classroom nào sau khi fix
- API `classroom/search-for-user` trả về data structure khác với expected

## 📊 API RESPONSE STRUCTURE:

### Expected (Old):

```javascript
response.data.classrooms = [...]
```

### Actual (Fixed):

```javascript
response.data.items = [
  {
    classroomId: "...",
    nameOfRoom: "...",
    // No direct subject/price fields
    tutor: {
      fullname: "...",          // Not firstName/lastName
      subject: {
        subjectName: "..."      // Subject info here
      },
      coinPerHours: 180,        // Price info here
      phoneNumber: "...",
      avatar: "..."
    },
    user: { ... },
    status: "IN_SESSION",
    // ... other fields
  }
]
```

## ✅ FIXES APPLIED:

### 1. **Data Extraction Fix**:

```javascript
// ❌ OLD:
if (response.data && response.data.classrooms) {
  const allData = response.data.classrooms;

// ✅ NEW:
const allData = response?.data?.items ||
               response?.data?.classrooms ||
               response?.items ||
               [];
```

### 2. **Field Mapping Fixes**:

#### Subject Field:

```javascript
// ❌ OLD:
{
  classroom.subject;
}

// ✅ NEW:
{
  classroom.tutor?.subject?.subjectName || classroom.subject || "Chưa xác định";
}
```

#### Price Field:

```javascript
// ❌ OLD:
{
  classroom.price?.toLocaleString();
}
VND;

// ✅ NEW:
{
  (classroom.tutor?.coinPerHours || classroom.price || 0).toLocaleString();
}
VND / giờ;
```

#### Tutor Name:

```javascript
// ❌ OLD:
{
  classroom.tutor?.firstName;
}
{
  classroom.tutor?.lastName;
}

// ✅ NEW:
{
  classroom.tutor?.fullname ||
    `${classroom.tutor?.firstName || ""} ${
      classroom.tutor?.lastName || ""
    }`.trim() ||
    "Chưa xác định";
}
```

## 🧪 TESTING GUIDE:

### Test 1: Classroom List Display

1. Login as student
2. Go to "Lớp học của tôi"
3. **EXPECTED**: Should see classrooms in both "Đang học" and "Đã hoàn thành" tabs
4. **VERIFY**: Console shows "📊 Total classrooms fetched: X" where X > 0

### Test 2: Field Display

For each classroom card, verify:

- ✅ Tutor name displays correctly (`classroom.tutor.fullname`)
- ✅ Subject shows (`classroom.tutor.subject.subjectName`)
- ✅ Price shows (`classroom.tutor.coinPerHours`)
- ✅ Phone number shows (`classroom.tutor.phoneNumber`)
- ✅ Avatar loads correctly (`classroom.tutor.avatar`)

### Test 3: Tab Filtering

1. Click between "Đang học" and "Đã hoàn thành" tabs
2. **EXPECTED**: Classrooms filter correctly by status
3. **VERIFY**: Console shows filtering logs

## 📋 DATA FIELD REFERENCE:

| Display Field  | API Response Path           | Fallback               |
| -------------- | --------------------------- | ---------------------- |
| Tutor Name     | `tutor.fullname`            | `firstName + lastName` |
| Subject        | `tutor.subject.subjectName` | `subject`              |
| Price          | `tutor.coinPerHours`        | `price`                |
| Phone          | `tutor.phoneNumber`         | -                      |
| Avatar         | `tutor.avatar`              | default image          |
| Status         | `status`                    | -                      |
| Classroom Name | `nameOfRoom`                | -                      |
| Start/End Date | `startDay`/`endDay`         | -                      |

## 🚨 POTENTIAL ISSUES TO WATCH:

1. If `tutor` object is null/missing
2. If `tutor.subject` is null/missing
3. If `coinPerHours` is 0 or missing
4. Avatar loading errors (handled by `handleAvatarError`)

---

**Status**: ✅ **FIXED** - Student classroom list should now display correctly with proper field mapping.
