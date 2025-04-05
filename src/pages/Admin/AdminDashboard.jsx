// src/pages/Admin/AdminDashboardPage.jsx
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout"; // <-- Đường dẫn đúng
import ChartComponent from "../../components/Chart"; // <-- Đường dẫn đúng
import AdminCard from "../../components/Admin/AdminCard"; // <-- Đường dẫn đúng
import "../../assets/css/Admin/AdminDashboard.style.css"; // <-- Đường dẫn đúng

const AdminDashboardPage = () => {
  // --- Không còn state và effect xử lý callback ở đây ---

  // Dữ liệu mẫu cho charts. Trong ứng dụng thực tế, bạn sẽ fetch dữ liệu này từ API.
  const userData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Đăng ký mới",
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const classData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Lớp học đang hoạt động",
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        tension: 0.1, // Làm đường line mượt hơn
      },
    ],
  };

  const revenueData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Doanh thu (nghìn VNĐ)", // Sửa label cho rõ ràng
        data: [5000, 7000, 8000, 6000, 9000, 10000], // Ví dụ dữ liệu doanh thu
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true, // Cho phép chart thay đổi kích thước
    maintainAspectRatio: false, // Cho phép thay đổi tỷ lệ khung hình (quan trọng khi đặt trong container)
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      // Cấu hình các plugin (ví dụ: legend, tooltip)
      legend: {
        position: "top", // Vị trí chú thích
      },
      tooltip: {
        enabled: true, // Bật tooltip
      },
    },
  };

  console.log("AdminDashboardPage Rendering..."); // Log để kiểm tra khi nào component render

  return (
    // Truyền tiêu đề trang vào Layout
    <AdminDashboardLayout currentPage="Bảng Điều Khiển">
      {/* Sử dụng Fragment <>...</> để nhóm các thành phần */}
      <>
        {/* Phần Thống kê Cards */}
        <div className="admin-dashboard-content">
          {/* Ví dụ dữ liệu tĩnh, nên thay bằng dữ liệu động từ Redux hoặc fetch API */}
          <AdminCard
            title="Tổng Gia sư"
            iconAdminCard={<i className="fa-solid fa-graduation-cap"></i>}
          >
            <p className="data-card">150</p>
          </AdminCard>
          <AdminCard
            title="Tổng Học viên"
            iconAdminCard={<i className="fa-solid fa-user-group"></i>}
          >
            <p className="data-card">1200</p>
          </AdminCard>
          <AdminCard
            title="Lớp Hoạt động"
            iconAdminCard={<i className="fa-solid fa-chalkboard-user"></i>}
          >
            <p className="data-card">75</p>
          </AdminCard>
          <AdminCard
            title="Giao dịch"
            iconAdminCard={<i className="fa-solid fa-money-bill-transfer"></i>}
          >
            <p className="data-card">500</p>
          </AdminCard>
          <AdminCard
            title="Doanh thu Tổng"
            iconAdminCard={<i className="fa-solid fa-coins"></i>}
          >
            <p className="data-card">50,000k</p> {/* Thêm đơn vị */}
          </AdminCard>
          <AdminCard
            title="Yêu cầu Chờ duyệt"
            iconAdminCard={<i className="fa-solid fa-user-check"></i>}
          >
            <p className="data-card">10</p>
          </AdminCard>
        </div>

        {/* Phần Biểu đồ */}
        <div className="admin-dashboard-charts">
          <AdminCard title="Đăng ký mới">
            {/* Đặt ChartComponent trong div để dễ quản lý kích thước */}
            <div
              className="chart-container"
              style={{ position: "relative", height: "300px", width: "100%" }}
            >
              <ChartComponent type="bar" data={userData} options={options} />
            </div>
          </AdminCard>
          <AdminCard title="Lớp học đang hoạt động">
            <div
              className="chart-container"
              style={{ position: "relative", height: "300px", width: "100%" }}
            >
              <ChartComponent type="line" data={classData} options={options} />
            </div>
          </AdminCard>
          <AdminCard title="Doanh thu">
            <div
              className="chart-container"
              style={{ position: "relative", height: "300px", width: "100%" }}
            >
              <ChartComponent
                type="line"
                data={revenueData}
                options={options}
              />
            </div>
          </AdminCard>
        </div>

        {/* Phần Danh sách Top (nếu có) */}
        <div className="admin-dashboard-lists">
          <AdminCard title="Top gia sư được đánh giá cao nhất">
            <ul className="top-list">
              {" "}
              {/* Thêm class để style */}
              <li>
                Nguyễn Văn A - 4.9{" "}
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#fadb14" }}
                ></i>
              </li>
              <li>
                Trần Thị B - 4.8{" "}
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#fadb14" }}
                ></i>
              </li>
              <li>
                Lê Minh C - 4.7{" "}
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#fadb14" }}
                ></i>
              </li>
            </ul>
          </AdminCard>
          <AdminCard title="Top học viên hoạt động nhiều nhất">
            <ul className="top-list">
              <li>Phạm Thị D - 20 lớp</li>
              <li>Hoàng Văn E - 18 lớp</li>
              <li>Vũ Thị F - 15 lớp</li>
            </ul>
          </AdminCard>
        </div>
      </>
    </AdminDashboardLayout>
  );
};

// Có thể dùng React.memo nếu component này không thay đổi thường xuyên dựa trên props/state nội bộ
// const AdminDashboard = React.memo(AdminDashboardPage);
// export default AdminDashboard;

export default AdminDashboardPage;
