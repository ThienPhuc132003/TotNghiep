import { useState, useEffect } from "react";
import Api from "../../network/Api"; // Ensure the correct path
import { METHOD_TYPE } from "../../network/methodType"; // Ensure the correct path

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await Api({
          endpoint: "static-data/bank",
          method: METHOD_TYPE.GET,
        });

        if (response.success) {
          setBanks(response.data);
          setFilteredBanks(response.data); 
        } else {
          setError(response.message || "Failed to fetch bank data.");
        }
      } catch (err) {
        setError("An error occurred while fetching bank data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    // Filter banks based on the search query
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = banks.filter((bank) =>
      bank.shortName.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBanks(filtered);
  }, [searchQuery, banks]);

  if (isLoading) {
    return <p>Loading bank data...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Bank List</h2>
      <input
        type="text"
        placeholder="Search by bank short name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />
      <ul>
        {filteredBanks.map((bank) => (
          <li key={bank.bankId}>
            <strong>{bank.shortName}</strong> - {bank.vn_name} ({bank.en_name})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankList;
