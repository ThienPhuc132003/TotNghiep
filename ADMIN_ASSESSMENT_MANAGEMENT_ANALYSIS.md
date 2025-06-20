# ADMIN PAGES OVERVIEW - Assessment Management Analysis

## 📊 CURRENT ADMIN PAGES STRUCTURE

### ✅ **EXISTING ADMIN LIST PAGES:**

#### 1. **User Management:**

- `ListOfAdmin.jsx` - Quản lý admin
- `ListOfTutor.jsx` - Quản lý gia sư
- `ListOfStudent.jsx` - Quản lý học viên

#### 2. **Content Management:**

- `ListOfSubject.jsx` - Quản lý môn học
- `ListOfMajor.jsx` - Quản lý chuyên ngành
- `ListOfCurriculumn.jsx` - Quản lý chương trình học
- `ListOfTutorLevel.jsx` - Quản lý cấp độ gia sư

#### 3. **Financial Management:**

- `ListOfTransactions.jsx` - Quản lý giao dịch
- `ListOfTutorPayments.jsx` - Quản lý thanh toán gia sư
- `ListOfTutorRevenue.jsx` - Quản lý doanh thu gia sư
- `ListOfWithdrawalRequests.jsx` - Quản lý yêu cầu rút tiền
- `ListOfWithdrawalRequestsSimple.jsx` - Phiên bản đơn giản

#### 4. **System Management:**

- `ListOfRequest.jsx` - Quản lý yêu cầu
- `ListOfValueConfigs.jsx` - Quản lý cấu hình hệ thống

#### 5. **Assessment Statistics (Existing):**

- `TutorAssessmentStatistics.jsx` - Thống kê đánh giá gia sư

## 🎯 **ASSESSMENT-RELATED APIS IDENTIFIED:**

### **Current Assessment APIs:**

```javascript
// 1. Create Assessment (Student Side - Implemented)
POST classroom-assessment/create/:classroomId
Payload: {
    tutorId: "US00011",
    classroomEvaluation: 4.5,
    description: "comment",
    meetingId: "optional-meeting-id"
}

// 2. Assessment Statistics (Admin - Existing)
GET classroom-assessment/search-with-time
Query: {
    page: 0,
    size: 10,
    periodType: "MONTH|WEEK|DAY|YEAR",
    periodValue: 1,
    filterConditions: []
}

// 3. Tutor Assessment Statistics (Tutor Side - Existing)
GET classroom-assessment/search-with-time-for-tutor
Query: { tutorId, page, size, periodType, periodValue }
```

## 🚀 **MISSING: ASSESSMENT MANAGEMENT PAGE**

### **Proposed: ListOfAssessments.jsx**

#### **Purpose:**

- Admin xem tất cả đánh giá trong hệ thống
- Quản lý đánh giá (view, edit, delete nếu cần)
- Filter by tutor, student, classroom, rating level
- Export assessment reports

#### **Required APIs:**

```javascript
// 1. Get All Assessments (with pagination & filters)
GET classroom-assessment/admin/list
Query: {
    page: 0,
    size: 10,
    tutorId?: "US00011",
    studentId?: "US00028",
    classroomId?: "classroom-id",
    minRating?: 1,
    maxRating?: 5,
    dateFrom?: "2025-01-01",
    dateTo?: "2025-12-31",
    sortBy?: "createdAt|rating|tutorId",
    sortOrder?: "ASC|DESC"
}

Response: {
    success: true,
    data: {
        items: [
            {
                assessmentId: "uuid",
                classroomId: "uuid",
                tutorId: "US00011",
                studentId: "US00028",
                meetingId: "uuid", // nullable
                classroomEvaluation: 4.5,
                description: "Comment text",
                createdAt: "2025-06-20T10:00:00Z",
                updatedAt: "2025-06-20T10:00:00Z",
                tutor: {
                    fullname: "Nguyễn Văn A",
                    email: "tutor@example.com"
                },
                student: {
                    fullname: "Trần Thị B",
                    email: "student@example.com"
                },
                classroom: {
                    nameOfRoom: "Lớp Toán 12",
                    subject: "Toán học"
                },
                meeting: { // nullable
                    topic: "Buổi học số 5",
                    startTime: "2025-06-20T08:00:00Z"
                }
            }
        ],
        total: 150,
        page: 0,
        size: 10,
        totalPages: 15
    }
}

// 2. Get Assessment Details
GET classroom-assessment/admin/details/:assessmentId

// 3. Update Assessment (if needed)
PUT classroom-assessment/admin/update/:assessmentId
Payload: {
    classroomEvaluation?: 4.5,
    description?: "Updated comment",
    status?: "ACTIVE|HIDDEN|DELETED"
}

// 4. Delete Assessment (soft delete)
DELETE classroom-assessment/admin/:assessmentId

// 5. Assessment Statistics Summary
GET classroom-assessment/admin/statistics
Response: {
    totalAssessments: 1500,
    averageRating: 4.2,
    ratingDistribution: {
        "1": 50,
        "2": 100,
        "3": 300,
        "4": 600,
        "5": 450
    },
    monthlyStats: [...]
}
```

## 📋 **STANDARD ADMIN PAGE STRUCTURE:**

### **Common Features Required:**

```javascript
// All admin list pages follow this pattern:
const ListOfAssessments = () => {
    // 1. State Management
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Search & Filter States
    const [searchInput, setSearchInput] = useState("");
    const [selectedSearchField, setSelectedSearchField] = useState("all");
    const [filterBy, setFilterBy] = useState({});

    // 3. Modal States
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 4. Table Columns Configuration
    const columns = useMemo(() => [...], []);

    // 5. Fetch Data Function
    const fetchData = useCallback(async () => {...}, []);

    // 6. Event Handlers
    const handleSearch = () => {...};
    const handleView = (item) => {...};
    const handleEdit = (item) => {...};
    const handleDelete = (item) => {...};
    const handleExport = () => {...};

    // 7. Render
    return (
        <AdminDashboardLayout currentPath="/admin/assessments">
            <SearchBar />
            <Table />
            <Modal />
        </AdminDashboardLayout>
    );
};
```

### **Required Components:**

1. **AdminDashboardLayout** - Layout wrapper
2. **Table** - Data display with pagination
3. **SearchBar** - Search and filter functionality
4. **Modal** - Detail view/edit modal
5. **DeleteConfirmationModal** - Delete confirmation
6. **Toast** - Success/error notifications

## 🎨 **UI/UX REQUIREMENTS:**

### **Assessment List Table Columns:**

1. **STT** - Row number
2. **Mã đánh giá** - Assessment ID (short)
3. **Gia sư** - Tutor name + ID
4. **Học viên** - Student name + ID
5. **Phòng học** - Classroom name
6. **Buổi học** - Meeting topic (if specific)
7. **Điểm đánh giá** - Rating (1-5 stars)
8. **Nội dung** - Comment (truncated)
9. **Ngày tạo** - Created date
10. **Thao tác** - View/Edit/Delete buttons

### **Filter Options:**

- **Gia sư**: Dropdown list tutors
- **Học viên**: Dropdown list students
- **Điểm đánh giá**: Range slider (1-5)
- **Ngày tạo**: Date range picker
- **Loại đánh giá**: Classroom/Meeting specific

### **Search Fields:**

- All fields
- Tutor name/ID
- Student name/ID
- Classroom name
- Comment content

## 🔧 **INTEGRATION POINTS:**

### **With Existing Pages:**

1. **ListOfTutor.jsx** → Link to tutor's assessments
2. **ListOfStudent.jsx** → Link to student's assessments
3. **TutorAssessmentStatistics.jsx** → Link to detailed assessments
4. **AdminDashboard.jsx** → Assessment summary widgets

### **Navigation Menu:**

```javascript
// Add to AdminSidebar menu structure:
{
    name: "Quản lý đánh giá",
    icon: "fas fa-star",
    children: [
        {
            name: "Danh sách đánh giá",
            path: "/admin/assessments",
            icon: "fas fa-list"
        },
        {
            name: "Thống kê đánh giá",
            path: "/admin/assessment-statistics",
            icon: "fas fa-chart-bar"
        }
    ]
}
```

## 📝 **NEXT STEPS:**

1. **Backend APIs** - Implement missing assessment management endpoints
2. **Frontend Page** - Create ListOfAssessments.jsx following standard pattern
3. **Routes** - Add assessment routes to AdminPrivateRoutes.jsx
4. **Menu Integration** - Add assessment menu to AdminSidebar
5. **Permissions** - Add role-based access control
6. **Testing** - Test CRUD operations and data flow

## 🎯 **PRIORITY APIS NEEDED:**

### **High Priority:**

1. `GET classroom-assessment/admin/list` - List all assessments
2. `GET classroom-assessment/admin/details/:id` - Assessment details

### **Medium Priority:**

3. `PUT classroom-assessment/admin/update/:id` - Update assessment
4. `DELETE classroom-assessment/admin/:id` - Delete assessment
5. `GET classroom-assessment/admin/statistics` - Admin statistics

### **Low Priority:**

6. Bulk operations (export, bulk delete)
7. Advanced analytics and reporting

**Ready to receive API endpoints and implement ListOfAssessments.jsx!** 🚀
