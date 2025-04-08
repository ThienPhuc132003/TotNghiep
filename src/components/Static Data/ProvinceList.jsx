import { useEffect, useState } from "react";
import Api from "../network/Api"; // Đảm bảo đường dẫn đúng
import { METHOD_TYPE } from "../network/methodType"; // Đảm bảo đường dẫn đúng

const ProvinceList = () => {
  const [provinces, setProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await Api({
          endpoint: "static-data/tinh-thanh-vietnam",
          method: METHOD_TYPE.GET,
        });

        if (response.success) {
          setProvinces(response.data); // Lưu dữ liệu tỉnh thành vào state
        } else {
          setError(response.message || "Không thể tải dữ liệu.");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Danh sách tỉnh thành</h2>
      <ul>
        {provinces.map((province) => (
          <li key={province.Code}>
            <strong>{province.FullName}</strong>
            <ul>
              {province.District.map((district) => (
                <li key={district.Code}>
                  {district.FullName}
                  <ul>
                    {district.Ward.map((ward) => (
                      <li key={ward.Code}>{ward.FullName}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProvinceList;
