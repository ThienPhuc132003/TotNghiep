// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import ChartComponent from "../../components/Chart";
import AdminCard from "../../components/Admin/AdminCard";
import "../../assets/css/Admin/AdminDashboard.style.css";

const AdminDashboardPage = () => {
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
      },
    ],
  };

  const revenueData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Doanh thu",
        data: [500, 700, 800, 600, 900, 1000],
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AdminDashboardLayout>
      <div className="admin-dashboard-content">
        <AdminCard
          title="Tổng số gia sư"
          iconAdminCard={<i className="fa-solid fa-graduation-cap"></i>}
        >
          <p className="data-card">150</p>
        </AdminCard>
        <AdminCard
          title="Tổng số học viên"
          iconAdminCard={<i className="fa-solid fa-user-group"></i>}
        >
          <p className="data-card">1200</p>
        </AdminCard>
        <AdminCard
          title="Lớp học đang hoạt động"
          iconAdminCard={<i className="fa-solid fa-chalkboard-user"></i>}
        >
          <p className="data-card">75</p>
        </AdminCard>
        <AdminCard
          title="Số giao dịch đã thực hiện"
          iconAdminCard={<i className="fa-solid fa-money-bill-transfer"></i>}
        >
          <p className="data-card">500</p>
        </AdminCard>
        <AdminCard
          title="Doanh thu tổng"
          iconAdminCard={<i className="fa-solid fa-coins"></i>}
        >
          <p className="data-card">$50,000</p>
        </AdminCard>
        <AdminCard
          title="Yêu cầu thuê gia sư đang chờ duyệt"
          iconAdminCard={<i className="fa-solid fa-user-check"></i>}
        >
          <p className="data-card">10</p>
        </AdminCard>
      </div>
      <div className="admin-dashboard-charts">
        <AdminCard title="Đăng ký mới">
          <ChartComponent type="bar" data={userData} options={options} />
        </AdminCard>
        <AdminCard title="Lớp học đang hoạt động">
          <ChartComponent type="line" data={classData} options={options} />
        </AdminCard>
        <AdminCard title="Doanh thu">
          <ChartComponent type="line" data={revenueData} options={options} />
        </AdminCard>
      </div>
      <div className="admin-dashboard-lists">
        <AdminCard title="Top gia sư được đánh giá cao nhất">
          <ul>
            <li>John Doe - 4.9</li>
            <li>Jane Smith - 4.8</li>
            <li>Mark Johnson - 4.7</li>
          </ul>
        </AdminCard>
        <AdminCard title="Top học viên hoạt động nhiều nhất">
          <ul>
            <li>Emily Davis - 20 lớp</li>
            <li>Michael Brown - 18 lớp</li>
            <li>Sarah Wilson - 15 lớp</li>
          </ul>
        </AdminCard>
      </div>
    </AdminDashboardLayout>
  );
};

const AdminDashboard = React.memo(AdminDashboardPage);
export default AdminDashboard;
