import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";

const ListOfWithdrawalRequestsSimple = () => {
  console.log("🏗️ Simple withdrawal component rendering...");

  const childrenMiddleContentLower = (
    <div style={{ padding: "20px" }}>
      <h2>🏦 Quản lý Yêu cầu Rút tiền</h2>
      <div
        style={{
          background: "#e8f5e8",
          padding: "15px",
          borderRadius: "8px",
          border: "2px solid #28a745",
        }}
      >
        <p>✅ Component đã load thành công!</p>
        <p>📅 Thời gian: {new Date().toLocaleString()}</p>
        <p>🌐 URL: {window.location.pathname}</p>
        <p>🔧 Đây là version đơn giản để test routing và layout.</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>📋 Tính năng sẽ có:</h3>
        <ul>
          <li>Hiển thị danh sách yêu cầu rút tiền</li>
          <li>Tìm kiếm và lọc theo trạng thái</li>
          <li>Duyệt/từ chối yêu cầu</li>
          <li>Xem chi tiết yêu cầu</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#fff3cd",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ffeaa7",
        }}
      >
        <strong>🔧 Debug Info:</strong>
        <br />
        Status: Component loaded successfully
        <br />
        Layout: AdminDashboardLayout is working
        <br />
        Next: Implement full component features
      </div>
    </div>
  );

  return (
    <AdminDashboardLayout
      childrenMiddleContentLower={childrenMiddleContentLower}
    />
  );
};

export default ListOfWithdrawalRequestsSimple;
