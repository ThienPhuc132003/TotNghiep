# Zoom Meeting Functionality Manual Test Plan

## Overview

This document provides a step-by-step manual testing plan to verify that the previously identified Zoom SDK meeting issues have been resolved.

## Issues Being Tested

1. **Tutor Issue**: Tutors can create meetings but cannot enter their own meeting pages
2. **Student Issue**: Students cannot enter classrooms when clicking on class entries

## Prerequisites for Testing

1. Development server running (`npm run dev`)
2. Browser opened to `http://localhost:5173`
3. Test accounts available:
   - Tutor account (role: TUTOR)
   - Student account (role: USER)

## Test Scenarios

### Scenario 1: Tutor Meeting Flow

**Objective**: Verify tutors can create meetings AND enter their own meeting pages

**Steps**:

1. **Login as Tutor**

   - Navigate to login page
   - Login with tutor credentials
   - Verify you reach tutor dashboard

2. **Access Classroom Management**

   - Navigate to `Lớp học của tôi` (My Classes)
   - Click on a classroom entry
   - Verify `TutorClassroomPage` loads correctly

3. **Create New Meeting**

   - Click `Tạo phòng học` (Create Classroom) button
   - Fill in meeting details:
     - Topic: "Test Meeting"
     - Password: "test123"
     - Duration: 60 minutes
   - Submit the form
   - Verify meeting creation success message

4. **Enter Own Meeting (CRITICAL TEST)**

   - Click `Vào lớp học` (Enter Classroom) button
   - Verify meeting list modal appears
   - Look for the meeting you just created
   - Click `Tham gia (Embedded)` button
   - **EXPECTED**: Navigate to `/tai-khoan/ho-so/phong-hop-zoom` with:
     - `userRole: "host"`
     - Meeting data passed correctly
     - ZoomDebugComponent loads with host permissions

5. **Verify Meeting Room Access**
   - Check browser URL is correct: `phong-hop-zoom`
   - Verify no route access errors
   - Check console for navigation state logging
   - Verify Zoom SDK initializes for host role

### Scenario 2: Student Meeting Flow

**Objective**: Verify students can enter classrooms when clicking on class entries

**Steps**:

1. **Login as Student**

   - Logout from tutor account
   - Login with student credentials (role: USER)
   - Verify you reach student dashboard

2. **Access Available Classes**

   - Navigate to student class list
   - Find a classroom with active meetings
   - Click on class entry

3. **Enter Classroom (CRITICAL TEST)**

   - Click `Vào lớp học` (Enter Classroom) button
   - Verify meeting list modal appears
   - Look for available meetings
   - Click `Tham gia (Embedded)` button
   - **EXPECTED**: Navigate to `/tai-khoan/ho-so/phong-hop-zoom` with:
     - `userRole: "student"`
     - Meeting data passed correctly
     - ZoomDebugComponent loads with participant permissions

4. **Verify Meeting Room Access**
   - Check browser URL is correct: `phong-hop-zoom`
   - Verify NO route protection errors (this was the main issue)
   - Check console for navigation state logging
   - Verify Zoom SDK initializes for participant role

## Key Fixes to Verify

### 1. Route Protection Fix

**File**: `src/App.jsx`
**Fix**: `phong-hop-zoom` route moved from TUTOR-only to shared section
**Test**: Students should be able to access the route without 403/404 errors

### 2. Import Fix

**File**: `src/pages/User/TutorMeetingRoomPage.jsx`
**Fix**: Added missing `ZoomDebugComponent` import
**Test**: No console import errors when accessing meeting room

### 3. Role-Based Navigation

**Files**: `TutorClassroomPage.jsx`, `StudentClassroomPage.jsx`
**Fix**: Proper state passing with correct `userRole`
**Test**:

- Tutors navigate with `userRole: "host"`
- Students navigate with `userRole: "student"`

## Expected Results After Fixes

### ✅ Tutor Flow Should Work

- Can create meetings ✓
- Can see meeting list ✓
- Can enter own meetings ✓
- Becomes meeting host ✓

### ✅ Student Flow Should Work

- Can see available classes ✓
- Can see meeting list ✓
- Can enter classrooms ✓
- Becomes meeting participant ✓

## Debugging Tools Available

### Console Logging

Check browser console for these debug messages:

```javascript
// From TutorMeetingRoomPage
console.log("Navigation state:", location.state);
console.log("Meeting data:", meetingData);
console.log("User role:", userRole);

// From navigation functions
console.log("Navigating to meeting room with state:", state);
```

### Components

- `ZoomDebugComponent` - Shows Zoom SDK connection status
- Meeting modals - Show meeting list and join options
- Navigation state logging - Track data flow between pages

## Manual Test Checklist

### Before Testing

- [ ] Development server is running
- [ ] Browser opened to localhost:5173
- [ ] Both test accounts available
- [ ] Network connection stable

### Tutor Tests

- [ ] Login as tutor successful
- [ ] Access classroom page
- [ ] Create new meeting
- [ ] See meeting in list
- [ ] Click join button works
- [ ] Route navigation successful
- [ ] Meeting room page loads
- [ ] Zoom SDK initializes
- [ ] Role is "host"

### Student Tests

- [ ] Login as student successful
- [ ] Access student classroom page
- [ ] See available meetings
- [ ] Click join button works
- [ ] Route navigation successful (NO 403 error)
- [ ] Meeting room page loads
- [ ] Zoom SDK initializes
- [ ] Role is "student"

### Error Conditions

- [ ] No route protection errors for students
- [ ] No import errors in console
- [ ] No navigation state errors
- [ ] Zoom SDK errors handled gracefully

## Success Criteria

1. **Tutors** can create AND enter their own meetings without errors
2. **Students** can enter classrooms without route protection errors
3. **Both roles** can access the `/phong-hop-zoom` route
4. **Role-based permissions** work correctly (host vs participant)
5. **Navigation state** passes correctly between components

## If Tests Fail

1. Check browser console for specific errors
2. Verify the fixes are actually applied in the code
3. Check network tab for API call failures
4. Review navigation state logging
5. Test with different browser/clear cache

---

**Last Updated**: Manual testing required after code analysis completed
**Next Step**: Execute this test plan in browser to verify fixes work
