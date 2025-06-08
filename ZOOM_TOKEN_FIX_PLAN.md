## ZOOM TOKEN CONFIGURATION FIX - TEST PLAN

### IDENTIFIED ISSUE

**Critical Token Configuration Mismatch**

**OLD WORKING FLOW (CreateMeetingPage):**

- meeting/create → requireToken: true
- meeting/signature → requireToken: true

**NEW BROKEN FLOW:**

- TutorClassroomPage → meeting/create → requireToken: false
- TutorMeetingRoomPage → meeting/signature → requireToken: false

### HYPOTHESIS

The new flow is failing because it's using `requireToken: false` while the old working flow uses `requireToken: true`. This suggests the API endpoints expect user authentication tokens, not just Zoom tokens.

### TEST PLAN

#### Phase 1: Apply Token Configuration Fix

1. Change TutorClassroomPage meeting/create to `requireToken: true`
2. Change TutorMeetingRoomPage meeting/signature to `requireToken: true`
3. Test the flow to see if this resolves the white screen issue

#### Phase 2: Test User Flow

1. Login as tutor
2. Navigate to classroom management
3. Create a meeting
4. Try to join the meeting
5. Verify that Zoom loads properly without white screen

### FILES TO MODIFY

1. `src/pages/User/TutorClassroomPage.jsx` - Line 531
2. `src/pages/User/TutorMeetingRoomPage.jsx` - Line 123

### EXPECTED RESULT

If this fixes the issue, the new integrated flow should work the same as the old CreateMeetingPage flow.
