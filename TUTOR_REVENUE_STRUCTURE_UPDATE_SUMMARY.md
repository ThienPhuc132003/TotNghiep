# TutorRevenueStatistics Cấu Trúc Cập Nhật - Tóm Tắt

## 🎯 Vấn Đề Đã Giải Quyết

### Vấn đề ban đầu:

- Trang thống kê doanh thu gia sư không theo cấu trúc chuẩn của 2 trang thống kê khác
- API endpoint có thể không hoạt động đúng
- Cách search và filter khác biệt với pattern chung
- Data structure mapping không chính xác

### Giải pháp đã implement:

## 📊 So Sánh Cấu Trúc Trước và Sau

### TRƯỚC (Cấu trúc không chuẩn):

```javascript
// Search approach: Custom form
const [searchKeyword, setSearchKeyword] = useState("");
const [searchField, setSearchField] = useState("fullname");

// Query structure: Custom searchField/searchKeyword
const query = {
  rpp: itemsPerPage,
  page: currentPage + 1,
  periodType: periodType,
  periodValue: periodValue,
  searchField: searchField,
  searchKeyword: searchKeyword.trim(),
  sort: JSON.stringify([...])
};

// API endpoint: Specific tutor revenue endpoint only
endpoint: `manage-payment/search-with-time-for-tutor-revenue`
```

### SAU (Cấu trúc chuẩn theo pattern):

```javascript
// Search approach: SearchBar component (giống 2 trang kia)
const [searchInput, setSearchInput] = useState("");
const [selectedSearchField, setSelectedSearchField] = useState("userId");
const [appliedSearchInput, setAppliedSearchInput] = useState("");
const [appliedSearchField, setAppliedSearchField] = useState("userId");

// Query structure: Filter-based (giống 2 trang kia)
const finalFilterConditions = [];
if (appliedSearchInput && appliedSearchInput.trim() && appliedSearchField) {
  finalFilterConditions.push({
    key: appliedSearchField,
    operator: "like",
    value: appliedSearchInput.trim(),
  });
}

const query = {
  rpp: itemsPerPage,
  page: currentPage + 1,
  periodType: periodType,
  periodValue: periodValue,
  ...(finalFilterConditions.length > 0 && {
    filter: JSON.stringify(finalFilterConditions),
  }),
  sort: JSON.stringify([...])
};

// API endpoint: Fallback mechanism
try {
  // Try specific endpoint first
  endpoint: `manage-payment/search-with-time-for-tutor-revenue`
} catch {
  // Fallback to general endpoint
  endpoint: `manage-payment/search-with-time`
}
```

## 🔧 Thay Đổi Chi Tiết

### 1. **Import và Dependencies**

```javascript
// Thêm SearchBar component
import SearchBar from "../../components/SearchBar";
```

### 2. **Search Options Configuration**

```javascript
// Search Key Options - theo pattern của 2 trang kia
const searchKeyOptions = [
  { value: "userId", label: "Mã gia sư" },
  { value: "fullname", label: "Tên gia sư" },
];

// Helper lấy placeholder cho search input
const getSearchPlaceholder = (selectedField) => {
  const placeholders = {
    userId: "Nhập mã gia sư...",
    fullname: "Nhập tên gia sư...",
  };
  return placeholders[selectedField] || "Nhập từ khóa tìm kiếm...";
};
```

### 3. **State Management Updates**

```javascript
// Search states - theo pattern của 2 trang kia
const [searchInput, setSearchInput] = useState("");
const [selectedSearchField, setSelectedSearchField] = useState(
  searchKeyOptions[0].value
);
const [appliedSearchInput, setAppliedSearchInput] = useState("");
const [appliedSearchField, setAppliedSearchField] = useState(
  searchKeyOptions[0].value
);
```

### 4. **Fetch Data Logic**

```javascript
// Filter-based search (giống RevenueStatistics và TutorHireStatistics)
const finalFilterConditions = [];

if (appliedSearchInput && appliedSearchInput.trim() && appliedSearchField) {
  let operator = "like";

  // For tutor IDs, use exact match
  if (appliedSearchField === "userId") {
    operator = "equal";
  }

  finalFilterConditions.push({
    key: appliedSearchField,
    operator: operator,
    value: appliedSearchInput.trim(),
  });
}

// API Fallback mechanism
let responsePayload;
try {
  responsePayload = await Api({
    endpoint: `manage-payment/search-with-time-for-tutor-revenue`,
    method: METHOD_TYPE.GET,
    query: query,
  });
} catch (tutorRevenueError) {
  console.warn(
    "Tutor revenue endpoint failed, trying general endpoint:",
    tutorRevenueError
  );

  // Fallback to general payment endpoint
  responsePayload = await Api({
    endpoint: `manage-payment/search-with-time`,
    method: METHOD_TYPE.GET,
    query: query,
  });
}
```

### 5. **Columns Definition Updates**

```javascript
// Flexible data mapping để handle different API response structures
{
  title: "Mã gia sư",
  dataKey: "tutor.userId",
  sortKey: "tutor.userId",
  sortable: true,
  renderCell: (_, row) => getSafeNestedValue(row, "tutor.userId", "N/A"),
},
{
  title: "Tên gia sư",
  dataKey: "tutor.fullname",
  sortKey: "tutor.fullname",
  sortable: true,
  renderCell: (_, row) => getSafeNestedValue(row, "tutor.fullname", "N/A"),
},
{
  title: "Tổng số lượt đăng ký",
  dataKey: "totalHire",
  sortKey: "totalHire",
  sortable: true,
  renderCell: (_, row) => {
    // Try different possible paths for hire count
    const totalHire = getSafeNestedValue(row, "totalHire", null) ||
                     getSafeNestedValue(row, "hireCount", null) ||
                     getSafeNestedValue(row, "bookingCount", 0);
    return Number(totalHire).toLocaleString("vi-VN");
  },
},
{
  title: "Doanh thu tổng của gia sư",
  dataKey: "coinOfTutorReceive",
  sortKey: "coinOfTutorReceive",
  sortable: true,
  renderCell: (_, row) => {
    // Try different possible paths for tutor revenue
    const revenue = getSafeNestedValue(row, "coinOfTutorReceive", null) ||
                   getSafeNestedValue(row, "totalRevenueWithTime", null) ||
                   getSafeNestedValue(row, "tutorRevenue", 0);
    return formatCurrency(revenue);
  },
},
```

### 6. **UI Component Updates**

```javascript
// Thay thế custom search form bằng SearchBar component
<SearchBar
  searchInput={searchInput}
  onSearchInputChange={handleSearchInputChange}
  selectedSearchField={selectedSearchField}
  onSearchFieldChange={handleSearchFieldChange}
  searchKeyOptions={searchKeyOptions}
  onSearchSubmit={handleSearchSubmit}
  onSearchClear={handleSearchClear}
  getSearchPlaceholder={getSearchPlaceholder}
  isLoading={isLoading}
/>
```

### 7. **Handler Functions Updates**

```javascript
// Search handlers - theo pattern của 2 trang kia
const handleSearchFieldChange = (newField) => {
  setSelectedSearchField(newField);
  setSearchInput(""); // Clear input when changing field
};

const handleSearchInputChange = (newInput) => {
  setSearchInput(newInput);
};

const handleSearchSubmit = () => {
  setAppliedSearchInput(searchInput);
  setAppliedSearchField(selectedSearchField);
  setCurrentPage(0);
};

const handleSearchClear = () => {
  setSearchInput("");
  setAppliedSearchInput("");
  setAppliedSearchField(searchKeyOptions[0].value);
  setSelectedSearchField(searchKeyOptions[0].value);
  setCurrentPage(0);
};
```

## 🧪 Testing Guide

### 1. **Kiểm Tra Cấu Trúc Trang**

```javascript
// Chạy trong browser console
testCurrentPageFunctionality();
```

### 2. **Test API Endpoints**

```javascript
// Test cả 2 endpoints
testTutorRevenueAPI();
```

### 3. **Kiểm Tra SearchBar Component**

- Verify dropdown có 2 options: "Mã gia sư" và "Tên gia sư"
- Test search functionality với cả 2 fields
- Verify clear search works properly

### 4. **Kiểm Tra Data Mapping**

- Check columns hiển thị đúng data
- Verify flexible data mapping hoạt động với different API responses
- Test sort functionality trên tất cả columns

### 5. **Kiểm Tra API Fallback**

- Verify nếu specific endpoint fails, sẽ fallback to general endpoint
- Check error handling và logging

## 📊 Expected API Response Structures

### Option 1: Tutor Revenue Specific Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "TU001",
        "fullname": "Nguyễn Văn A",
        "totalHire": 15,
        "totalRevenueWithTime": 5000000
      }
    ],
    "total": 25,
    "totalRevenue": 125000000
  }
}
```

### Option 2: General Payment Response (Fallback)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "tutor": {
          "userId": "TU001",
          "fullname": "Nguyễn Văn A"
        },
        "coinOfTutorReceive": 5000000,
        "totalHire": 15
      }
    ],
    "total": 25,
    "totalRevenue": 125000000
  }
}
```

## 🎯 Benefits của Update

### 1. **Consistency**

- Cùng pattern với TutorHireStatistics và RevenueStatistics
- Sử dụng SearchBar component chuẩn
- Filter-based search approach

### 2. **Flexibility**

- API fallback mechanism
- Flexible data mapping for different response structures
- Multiple possible field paths for data extraction

### 3. **Maintainability**

- Easier to maintain với consistent pattern
- Reusable components và handlers
- Better error handling và logging

### 4. **User Experience**

- Consistent UI/UX across all statistics pages
- Better search functionality
- Enhanced error feedback

## ✅ Status

- ✅ Cấu trúc trang updated để phù hợp với pattern chuẩn
- ✅ SearchBar component integrated
- ✅ API fallback mechanism implemented
- ✅ Flexible data mapping added
- ✅ Enhanced logging maintained
- ✅ Error handling improved

## 📋 Next Steps

1. Test trang với real data
2. Verify API endpoints hoạt động đúng
3. Confirm data mapping với actual API response
4. Validate search functionality
5. Test export functionality với new data structure

Trang TutorRevenueStatistics giờ đây đã có cấu trúc consistent với 2 trang thống kê khác và sẵn sàng để test với real data.
