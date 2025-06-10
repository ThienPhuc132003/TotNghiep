/**
 * Test API Compatibility - Tutor Revenue Search
 *
 * This test checks if the backend API endpoint `manage-payment/search-with-time`
 * supports the new `filter` parameter format that follows ListOfAdmin pattern.
 *
 * Expected Query Format:
 * {
 *   rpp: 10,
 *   page: 1,
 *   periodType: "MONTH",
 *   periodValue: 1,
 *   filter: '[{"key":"user.fullname","operator":"like","value":"test"}]',
 *   sort: '[{"key":"createdAt","type":"DESC"}]'
 * }
 *
 * To test this manually:
 * 1. Start the application: npm start
 * 2. Navigate to /admin/doanh-thu
 * 3. Try searching with a test value
 * 4. Check the Network tab in DevTools for the API request
 * 5. Verify that the request includes `filter` parameter instead of `searchKey`/`searchValue`
 *
 * Backend should support:
 * - filter: JSON string array with {key, operator, value} structure
 * - periodType: DAY/WEEK/MONTH/YEAR
 * - periodValue: number
 * - Standard pagination: rpp, page
 * - Standard sorting: sort JSON string
 */

console.log("API Compatibility Test Configuration:");
console.log("Endpoint: manage-payment/search-with-time");
console.log("Method: GET");
console.log("Required Parameters:");
console.log("- filter: JSON string (new format)");
console.log("- periodType: string");
console.log("- periodValue: number");
console.log("- rpp: number");
console.log("- page: number");
console.log("- sort: JSON string");

console.log("\nOld Parameters (removed):");
console.log("- searchKey");
console.log("- searchValue");

console.log("\nTest Steps:");
console.log("1. Start application and go to /admin/doanh-thu");
console.log("2. Use search functionality");
console.log("3. Check Network tab for API calls");
console.log("4. Verify filter parameter format");
