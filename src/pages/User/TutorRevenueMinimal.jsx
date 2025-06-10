// Ultra-minimal test component
const TutorRevenueMinimal = () => {
  console.log("🟢 TutorRevenueMinimal rendering...");

  return (
    <div style={{ padding: "20px", backgroundColor: "lightgreen" }}>
      <h1>✅ Minimal Tutor Revenue Component</h1>
      <p>Thời gian: {new Date().toLocaleString("vi-VN")}</p>
      <p>Nếu bạn thấy được text này, component đã render thành công!</p>
    </div>
  );
};

export default TutorRevenueMinimal;
