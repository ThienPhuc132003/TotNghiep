// Test filter structure for tutor search API
console.log("=== TUTOR SEARCH FILTER STRUCTURE TEST ===\n");

// Test case 1: Search with "all" type + level + major filters
console.log("TEST CASE 1: Complex search with multiple filters");
const filterConditions1 = [];

const searchTerm = "Nguyen";
const searchType = "all";
const selectedLevelId = "TL0002";
const selectedMajorId = "M0002";

if (searchTerm && searchTerm.trim()) {
  const searchValue = searchTerm.trim();
  if (searchType === "all") {
    // Tìm kiếm tất cả - chỉ key, operator, value
    filterConditions1.push(
      {
        key: "tutorProfile.fullname",
        operator: "like",
        value: searchValue,
      },
      {
        key: "tutorProfile.univercity",
        operator: "like",
        value: searchValue,
      },
      {
        key: "tutorProfile.subject.subjectName",
        operator: "like",
        value: searchValue,
      },
      {
        key: "tutorProfile.subject2.subjectName",
        operator: "like",
        value: searchValue,
      },
      {
        key: "tutorProfile.subject3.subjectName",
        operator: "like",
        value: searchValue,
      }
    );
  }
}

// Filter theo level ID
if (selectedLevelId) {
  filterConditions1.push({
    key: "tutorProfile.tutorLevelId",
    operator: "equal",
    value: selectedLevelId,
  });
}

// Filter theo major ID
if (selectedMajorId) {
  filterConditions1.push({
    key: "tutorProfile.majorId",
    operator: "equal",
    value: selectedMajorId,
  });
}

console.log("Search Term:", searchTerm);
console.log("Search Type:", searchType);
console.log("Level ID:", selectedLevelId);
console.log("Major ID:", selectedMajorId);
console.log("\nGenerated Filter Conditions:");
console.log(JSON.stringify(filterConditions1, null, 2));
console.log("\nQuery filter parameter:");
console.log("filter=" + JSON.stringify(filterConditions1));

// Test case 2: Different search types
console.log("\n\n=== TEST CASE 2: Different Search Types ===");

const testSearchTypes = [
  { type: "name", term: "Trịnh Văn Bảo" },
  { type: "university", term: "Đại học Văn Lang" },
  { type: "subject", term: "Lập trình Web" },
];

testSearchTypes.forEach(({ type, term }) => {
  const testConditions = [];

  if (type === "name") {
    testConditions.push({
      key: "tutorProfile.fullname",
      operator: "like",
      value: term,
    });
  } else if (type === "university") {
    testConditions.push({
      key: "tutorProfile.univercity",
      operator: "like",
      value: term,
    });
  } else if (type === "subject") {
    testConditions.push(
      {
        key: "tutorProfile.subject.subjectName",
        operator: "like",
        value: term,
      },
      {
        key: "tutorProfile.subject2.subjectName",
        operator: "like",
        value: term,
      },
      {
        key: "tutorProfile.subject3.subjectName",
        operator: "like",
        value: term,
      }
    );
  }

  console.log(`\nSearch Type: ${type}`);
  console.log(`Search Term: ${term}`);
  console.log("Filter: " + JSON.stringify(testConditions));
});

// Test case 3: Complete API query structure
console.log("\n\n=== TEST CASE 3: Complete API Query Structure ===");

const completeQuery = {
  page: 1,
  rpp: 8,
  filter: JSON.stringify(filterConditions1),
  sort: JSON.stringify([{ key: "tutorProfile.rating", type: "DESC" }]),
};

console.log("Complete API Query:");
console.log(JSON.stringify(completeQuery, null, 2));

console.log("\nAPI Endpoint: user/get-list-tutor-public");
console.log("Method: GET");
console.log("Query Parameters:", Object.keys(completeQuery).join(", "));
