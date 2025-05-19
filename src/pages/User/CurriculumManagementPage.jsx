// src/pages/User/CurriculumManagementPage.jsx

import CurriculumList from "../../components/User/CurriculumManagement/CurriculumList";
// IMPORT CSS TRỰC TIẾP
import "../../assets/css/CurriculumManagementPage.style.css";

const CurriculumManagementPage = () => {
  return (
    <>
      {/* SỬ DỤNG TÊN CLASS DƯỚI DẠNG CHUỖI STRING */}
      <div className="pageWrapper">
        {" "}
        {/* Thay styles.pageWrapper */}
        <h1 className="pageTitle">Quản lý Giáo trình</h1>{" "}
        {/* Thay styles.pageTitle */}
        <main className="mainContent">
          {" "}
          {/* Thay styles.mainContent */}
          <div className="section">
            {" "}
            {/* Thay styles.section */}
            <CurriculumList />
          </div>
          <div className="section">
            <section
              className="myCurriculumsPlaceholder" /* Thay styles.myCurriculumsPlaceholder */
              aria-labelledby="my-curriculums-title"
            >
              <h2 id="my-curriculums-title" className="sectionTitle">
                {" "}
                {/* Thay styles.sectionTitle */}
                Giáo trình của tôi
              </h2>
              <p className="comingSoonText">
                {" "}
                {/* Thay styles.comingSoonText */}
                Chức năng này sẽ được cập nhật trong thời gian sớm nhất. Tại đây
                sẽ hiển thị các giáo trình bạn đã đăng hoặc đã thuê.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default CurriculumManagementPage;
