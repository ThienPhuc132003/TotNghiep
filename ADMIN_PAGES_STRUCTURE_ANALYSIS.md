# ADMIN PAGES STRUCTURE ANALYSIS

## Overview

Phân tích cấu trúc các trang admin trong hệ thống, đặc biệt tập trung vào trang `/admin/tai-khoan-gia-su`

## Admin Routes Structure

### 1. **Main Admin Routes (from App.jsx)**

```jsx
// Public Admin Route
<Route path="/admin/login" element={<AdminLogin />} />

// Protected Admin Routes (require AdminPrivateRoutes)
<Route element={<AdminPrivateRoutes />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/profile" element={<AdminProfile />} />
  <Route path="/admin/nhan-vien" element={<ListOfAdmin />} />
  <Route path="/admin/nganh" element={<ListOfMajor />} />
  <Route path="/admin/tai-khoan-gia-su" element={<ListOfRequest />} />
  <Route path="/admin/nguoi-hoc" element={<ListOfStudent />} />
  <Route path="/admin/gia-su" element={<ListOfTutor />} />
  <Route path="/admin/hang-gia-su" element={<ListOfTutorLevel />} />
  <Route path="/admin/mon-hoc" element={<ListOfSubject />} />
  <Route path="/admin/giao-trinh" element={<ListOfCurriculumn />} />
  <Route path="/admin/goi-thanh-toan" element={<ListOfValueConfigs />} />
  <Route path="/admin/thanh-toan-cho-gia-su" element={<ListOfTutorPayments />} />
  <Route path="/admin/doanh-thu" element={<RevenueStatistics />} />
  <Route path="/admin/luot-thue-gia-su" element={<TutorHireStatistics />} />
  <Route path="/admin/doanh-thu-gia-su" element={<TutorRevenueStatistics />} />
  <Route path="/admin/danh-gia-gia-su" element={<TutorAssessmentStatistics />} />
  <Route path="/admin/rut-tien" element={<ListOfWithdrawalRequests />} />
</Route>
```

## Target Page Analysis: `/admin/tai-khoan-gia-su`

### 1. **Component Used**

- **Path**: `/admin/tai-khoan-gia-su`
- **Component**: `ListOfRequest`
- **File**: `src/pages/Admin/ListOfRequest.jsx`
- **Purpose**: Quản lý Yêu cầu Làm Gia sư (Tutor Registration Requests)

### 2. **Page Title**

```jsx
<h2 className="admin-list-title">Quản lý Yêu cầu Làm Gia sư</h2>
```

### 3. **Main Features**

#### **Search & Filter System**

```jsx
// Search fields available
const searchableRequestColumnOptions = [
  { value: "tutorRequestId", label: "ID Yêu cầu" },
  { value: "fullname", label: "Họ và Tên" },
  { value: "emailOfTutor", label: "Email" },
  { value: "univercity", label: "Trường ĐH" },
  // ... more fields
];
```

#### **Table Columns**

```jsx
const columns = [
  { title: "ID YC", dataKey: "tutorRequestId", sortable: true },
  { title: "Họ và Tên", dataKey: "fullname", sortable: true },
  { title: "Email", dataKey: "emailOfTutor", sortable: true },
  { title: "Trường ĐH", dataKey: "univercity", sortable: true },
  { title: "Điểm Test", dataKey: "testPoint", sortable: true },
  { title: "GPA", dataKey: "GPA", sortable: true },
  { title: "Trạng thái", dataKey: "statusOfForm", render: formatStatus },
  { title: "Ngày tạo", dataKey: "createdAt", render: formatDate },
];
```

#### **Status Management**

```jsx
const formatStatus = (status) => {
  switch (status) {
    case "REQUEST":
      return <span className="status status-pending">Chờ duyệt</span>;
    case "ACCEPT":
      return <span className="status status-active">Đã duyệt</span>;
    case "REFUSE":
      return <span className="status status-failed">Từ chối</span>;
    case "CANCEL":
      return <span className="status status-inactive">Đã hủy</span>;
    default:
      return (
        <span className="status status-unknown">{status || "Không rõ"}</span>
      );
  }
};
```

### 4. **API Integration**

- **Endpoint**: Likely uses tutor request management APIs
- **Methods**: GET (list), PUT (update status), etc.
- **Authentication**: Protected by AdminPrivateRoutes

### 5. **Component Architecture**

```jsx
// Main structure
<AdminDashboardLayout>
  <div className="list-of-admin-container">
    <div className="admin-content">
      <h2>Quản lý Yêu cầu Làm Gia sư</h2>

      {/* Search Bar */}
      <SearchBar
        searchFields={searchableRequestColumnOptions}
        onSearch={handleSearch}
        // ... props
      />

      {/* Data Table */}
      <Table
        columns={columns}
        data={displayData}
        loading={loading}
        // ... props
      />

      {/* Detail Modal */}
      <FormDetail
        isOpen={detailModalOpen}
        data={selectedRowData}
        // ... props
      />
    </div>
  </div>
</AdminDashboardLayout>
```

## Complete Admin Pages Mapping

### 1. **Dashboard & Core**

| Path               | Component        | Title     | Purpose                                 |
| ------------------ | ---------------- | --------- | --------------------------------------- |
| `/admin/dashboard` | `AdminDashboard` | Dashboard | Main admin overview with charts & stats |
| `/admin/profile`   | `AdminProfile`   | Profile   | Admin profile management                |
| `/admin/login`     | `AdminLogin`     | Login     | Admin authentication                    |

### 2. **User Management**

| Path                      | Component                  | Title                      | Purpose                             |
| ------------------------- | -------------------------- | -------------------------- | ----------------------------------- |
| `/admin/nhan-vien`        | `ListOfAdmin`              | Danh sách Nhân viên        | Staff/Admin management              |
| `/admin/nguoi-hoc`        | `ListOfStudent`            | Danh sách Học viên         | Student management                  |
| `/admin/gia-su`           | `ListOfTutor`              | Danh sách Gia sư           | Tutor management                    |
| `/admin/tai-khoan-gia-su` | `ListOfRequest`            | Quản lý Yêu cầu Làm Gia sư | Tutor registration requests         |
| `/admin/rut-tien`         | `ListOfWithdrawalRequests` | Quản lý Yêu cầu Rút tiền   | Quản lý yêu cầu rút tiền của gia sư |

### 3. **Academic Management**

| Path                 | Component           | Title                 | Purpose                     |
| -------------------- | ------------------- | --------------------- | --------------------------- |
| `/admin/nganh`       | `ListOfMajor`       | Danh sách Ngành       | Major/Field management      |
| `/admin/mon-hoc`     | `ListOfSubject`     | Danh sách Môn học     | Subject management          |
| `/admin/hang-gia-su` | `ListOfTutorLevel`  | Danh sách Hạng Gia sư | Tutor level/rank management |
| `/admin/giao-trinh`  | `ListOfCurriculumn` | Danh sách Giáo trình  | Curriculum management       |

### 4. **Financial Management**

| Path                           | Component                | Title                 | Purpose                      |
| ------------------------------ | ------------------------ | --------------------- | ---------------------------- |
| `/admin/goi-thanh-toan`        | `ListOfValueConfigs`     | Gói Thanh toán        | Payment package management   |
| `/admin/thanh-toan-cho-gia-su` | `ListOfTutorPayments`    | Thanh toán cho Gia sư | Tutor payment management     |
| `/admin/doanh-thu`             | `RevenueStatistics`      | Thống kê Doanh thu    | General revenue statistics   |
| `/admin/doanh-thu-gia-su`      | `TutorRevenueStatistics` | Doanh thu Gia sư      | Tutor-specific revenue stats |

### 5. **Analytics & Statistics**

| Path                      | Component                   | Title            | Purpose                       |
| ------------------------- | --------------------------- | ---------------- | ----------------------------- |
| `/admin/luot-thue-gia-su` | `TutorHireStatistics`       | Lượt thuê Gia sư | Tutor hiring statistics       |
| `/admin/danh-gia-gia-su`  | `TutorAssessmentStatistics` | Đánh giá Gia sư  | Tutor assessment/rating stats |

## Common Architecture Pattern

### 1. **Layout Structure**

```jsx
<AdminDashboardLayout>
  <div className="list-of-admin-container">
    <div className="admin-content">
      <h2 className="admin-list-title">[Page Title]</h2>

      {/* Search & Filter Section */}
      <div className="search-bar-filter-container">
        <SearchBar {...searchProps} />
      </div>

      {/* Data Display Section */}
      <Table {...tableProps} />

      {/* Modal Sections */}
      <FormDetail {...detailProps} />
      <DeleteConfirmationModal {...deleteProps} />
    </div>
  </div>
</AdminDashboardLayout>
```

### 2. **Shared Components**

- **`AdminDashboardLayout`**: Main layout wrapper with sidebar & header
- **`SearchBar`**: Advanced search with field selection
- **`Table`**: Data table with sorting, pagination, actions
- **`FormDetail`**: Modal for viewing/editing details
- **`DeleteConfirmationModal`**: Confirmation for delete actions

### 3. **Shared Styling**

- **`ListOfAdmin.style.css`**: Main admin page styles
- **`Modal.style.css`**: Modal component styles
- **`FormDetail.style.css`**: Form detail specific styles

### 4. **Common Features**

- **Search & Filter**: All pages have searchable fields
- **Sorting**: Column-based sorting functionality
- **Pagination**: Server-side or client-side pagination
- **CRUD Operations**: Create, Read, Update, Delete
- **Status Management**: Consistent status display
- **Loading States**: Spinner/skeleton loading
- **Error Handling**: Toast notifications & error displays

## Authentication & Authorization

### 1. **Route Protection**

```jsx
<Route element={<AdminPrivateRoutes />}>
  // All admin routes protected here
</Route>
```

### 2. **Access Control**

- Admin login required via `/admin/login`
- Role-based permissions (admin role)
- Session management with cookies
- Token-based authentication

## Navigation & Menu

### 1. **Sidebar Menu Structure** (Likely from AdminDashboardLayout)

```
📊 Dashboard
👥 User Management
   ├── 👨‍💼 Nhân viên (Staff)
   ├── 👨‍🎓 Học viên (Students)
   ├── 👨‍🏫 Gia sư (Tutors)
   └── 📝 Yêu cầu Gia sư (Tutor Requests) ← tai-khoan-gia-su
📚 Academic Management
   ├── 🎓 Ngành (Majors)
   ├── 📖 Môn học (Subjects)
   ├── ⭐ Hạng Gia sư (Tutor Levels)
   └── 📋 Giáo trình (Curriculum)
💰 Financial Management
   ├── 💳 Gói Thanh toán (Payment Packages)
   ├── 💸 Thanh toán Gia sư (Tutor Payments)
   ├── 📈 Doanh thu (Revenue Stats)
   └── 📊 Doanh thu Gia sư (Tutor Revenue)
📊 Analytics
   ├── 📈 Lượt thuê Gia sư (Hire Stats)
   └── ⭐ Đánh giá Gia sư (Assessment Stats)
```

## Key Observations

### 1. **Naming Discrepancy**

The path `/admin/tai-khoan-gia-su` (tutor accounts) actually shows `ListOfRequest` (tutor requests), not `ListOfTutor`. This might confuse users expecting to see active tutors.

**Suggestion**: Consider renaming to `/admin/yeu-cau-gia-su` for clarity.

### 2. **Workflow Integration**

```
Request Flow:
1. User applies → Request created
2. Admin reviews in `/admin/tai-khoan-gia-su` (ListOfRequest)
3. Admin approves → User becomes tutor
4. Tutor appears in `/admin/gia-su` (ListOfTutor)
```

### 3. **Data Consistency**

- All admin pages follow similar data structure patterns
- Consistent API response handling
- Shared helper functions for formatting

### 4. **Performance Considerations**

- Client-side pagination for smaller datasets
- Server-side pagination for larger datasets
- Optimized search with debouncing
- Lazy loading for components

---

**Summary**: The admin section is well-structured with consistent patterns across all pages. The `/admin/tai-khoan-gia-su` page specifically handles tutor registration requests with comprehensive review and approval capabilities, fitting seamlessly into the overall admin workflow.

## 💰 NEW PAGE ADDED: `/admin/rut-tien`

### **Withdrawal Requests Management**

| Path              | Component                  | Title                    | Purpose                          |
| ----------------- | -------------------------- | ------------------------ | -------------------------------- |
| `/admin/rut-tien` | `ListOfWithdrawalRequests` | Quản lý Yêu cầu Rút tiền | Manage tutor withdrawal requests |

#### **Key Features:**

- **API Integration**: `manage-banking/search`, `manage-banking/approve/{id}`, `manage-banking/reject/{id}`
- **Search Fields**: ID yêu cầu, Mã gia sư, Tên gia sư, Số tiền, Ngân hàng, STK, Ngày tạo
- **Status Filter**: PENDING, APPROVED, REJECTED, PROCESSED, CANCELLED
- **Actions**: View details, Approve (with note), Reject (with note)
- **Data Display**: Amount formatting (Xu), Bank info display, Status badges

#### **Pattern Compliance:**

- ✅ AdminDashboardLayout wrapper
- ✅ SearchBar with field dropdown
- ✅ Table with sort/pagination
- ✅ FormDetail modal
- ✅ Action confirmation modals
- ✅ Toast notifications
- ✅ Error handling
- ✅ Consistent styling

#### **Files Created:**

- `src/pages/Admin/ListOfWithdrawalRequests.jsx`
- `ADMIN_WITHDRAWAL_REQUESTS_PAGE_COMPLETE.md`
- `admin-withdrawal-requests-api-test.html`

#### **Route Added:**

```jsx
<Route path="/admin/rut-tien" element={<ListOfWithdrawalRequests />} />
```

This new page follows the exact same pattern as other admin pages, ensuring consistency and maintainability.
