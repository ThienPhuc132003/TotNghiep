# Fix cho Nút "Xem Yêu Cầu Duyệt" và Optimistic Updates

## Vấn đề được giải quyết

### 1. **Viết tắt không phù hợp với người dùng**

- **Trước**: "Xem YC Duyệt" (sử dụng viết tắt)
- **Sau**: "Xem Yêu Cầu Được Duyệt" (viết đầy đủ)

### 2. **State không cập nhật real-time**

- **Vấn đề**: Khi gửi/hủy yêu cầu, nút không thay đổi ngay lập tức, cần refresh trang
- **Nguyên nhân**: Chỉ update `bookingInfoCard` nhưng không update `isBookingRequestAccepted`
- **Giải pháp**: Thêm optimistic updates cho `isTutorAcceptingRequestAPIFlag`

## Thay đổi được thực hiện

### 1. **TutorCard.jsx** - Sửa text hiển thị

```jsx
// BEFORE
<FaCalendarCheck /> Xem YC Duyệt

// AFTER
<FaCalendarCheck /> Xem Yêu Cầu Được Duyệt
```

### 2. **bookingStateHelpers.js** - Thêm optimistic update functions

```javascript
// Thêm 2 functions mới:
export const updateTutorBookingStatusOptimistic = (
  tutors,
  tutorId,
  newBookingStatus
) => {
  return tutors.map((tutor) =>
    tutor.id === tutorId
      ? {
          ...tutor,
          bookingInfoCard: {
            status: newBookingStatus.status,
            bookingId: newBookingStatus.bookingId,
          },
          // Optimistically update isBookingRequestAccepted
          isTutorAcceptingRequestAPIFlag:
            newBookingStatus.status === "REQUEST"
              ? true
              : tutor.isTutorAcceptingRequestAPIFlag,
        }
      : tutor
  );
};

export const clearTutorBookingStatusOptimistic = (tutors, tutorId) => {
  return tutors.map((tutor) =>
    tutor.id === tutorId
      ? {
          ...tutor,
          bookingInfoCard: {
            status: null,
            bookingId: null,
          },
          // Optimistically assume no more requests when canceling
          isTutorAcceptingRequestAPIFlag: false,
        }
      : tutor
  );
};
```

### 3. **TutorList.jsx** - Sử dụng optimistic updates

```jsx
// BEFORE - Chỉ update booking status
const updatedTutors = updateTutorBookingStatus(
  prevTutors,
  tutorId,
  newBookingStatus
);

// AFTER - Update cả booking status và isBookingRequestAccepted
const updatedTutors = updateTutorBookingStatusOptimistic(
  prevTutors,
  tutorId,
  newBookingStatus
);

// BEFORE - Chỉ clear booking status
setTutors((prevTutors) => clearTutorBookingStatus(prevTutors, tutorId));

// AFTER - Clear cả booking status và isBookingRequestAccepted
setTutors((prevTutors) =>
  clearTutorBookingStatusOptimistic(prevTutors, tutorId)
);
```

## Logic hiển thị nút

### Điều kiện hiển thị

```jsx
// Hiển thị nút "Xem Yêu Cầu Được Duyệt"
const showViewAcceptedBtnCard =
  isLoggedIn && apiIsTutorAcceptingFlagOnCard === true;

// Hiển thị text "Chưa có yêu cầu được chấp nhận"
const showNoAcceptedMsgCard =
  isLoggedIn && apiIsTutorAcceptingFlagOnCard === false;
```

### Mapping từ API

```jsx
// Trong mapApiTutorToCardProps()
if (typeof profile.isBookingRequestAccepted === "boolean") {
  apiIsTutorAcceptingRequestFlagOutput = profile.isBookingRequestAccepted;
}

// Truyền vào TutorCard props
isTutorAcceptingRequestAPIFlag: apiIsTutorAcceptingRequestFlagOutput,
```

## Behavior mong đợi

### Khi gửi yêu cầu thành công:

1. **Immediate UI Update**: Nút "Yêu Cầu Mới" → "Chờ duyệt" + nút "Hủy"
2. **Optimistic Update**: `isTutorAcceptingRequestAPIFlag` = `true`
3. **Result**: Nút "Xem Yêu Cầu Được Duyệt" xuất hiện ngay lập tức

### Khi hủy yêu cầu thành công:

1. **Immediate UI Update**: Nút "Hủy" biến mất → nút "Yêu Cầu Mới" xuất hiện
2. **Optimistic Update**: `isTutorAcceptingRequestAPIFlag` = `false`
3. **Result**: Text "Chưa có yêu cầu được chấp nhận" xuất hiện ngay lập tức

## Test để verify

### Test Case 1: Gửi yêu cầu mới

1. Tìm gia sư có nút "Yêu Cầu Mới"
2. Click gửi yêu cầu
3. **Expect**: Ngay lập tức thấy nút "Xem Yêu Cầu Được Duyệt" (không cần refresh)

### Test Case 2: Hủy yêu cầu

1. Tìm gia sư có nút "Hủy" (đang chờ duyệt)
2. Click hủy yêu cầu
3. **Expect**: Ngay lập tức thấy text "Chưa có yêu cầu được chấp nhận" (không cần refresh)

## Debug Logging

- Thêm console.log trong TutorCard để debug `showViewAcceptedBtnCard` và `showNoAcceptedMsgCard`
- Thêm API response logging để verify dữ liệu `isBookingRequestAccepted` từ backend

## Files đã thay đổi

1. `src/components/User/TutorCard.jsx` - Sửa text hiển thị + debug logging
2. `src/utils/bookingStateHelpers.js` - Thêm optimistic update functions
3. `src/components/Static_Data/TutorList.jsx` - Sử dụng optimistic updates
