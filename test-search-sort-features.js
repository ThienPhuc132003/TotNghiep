// Quick Test Script for Search & Sort Features
// Run this in browser console on the TutorRevenueStatistics page

console.log("🔍 Testing Search & Sort Features for TutorRevenueStatistics");

// Test functions
const searchSortTests = {
  // Check if search elements exist
  checkSearchUI: function () {
    console.log("\n🔍 Checking Search UI Elements...");

    const searchFieldSelect = document.querySelector("#searchFieldSelect");
    const searchKeywordInput = document.querySelector("#searchKeywordInput");
    const searchSubmitBtn = document.querySelector('button[type="submit"]');
    const clearSearchBtn = document.querySelector('button[type="button"]');

    console.log(
      "✅ Search Field Select:",
      searchFieldSelect ? "Found" : "❌ Missing"
    );
    console.log(
      "✅ Search Keyword Input:",
      searchKeywordInput ? "Found" : "❌ Missing"
    );
    console.log(
      "✅ Search Submit Button:",
      searchSubmitBtn ? "Found" : "❌ Missing"
    );
    console.log(
      "✅ Clear Search Button:",
      clearSearchBtn ? "Found" : "❌ Missing"
    );

    return {
      searchFieldSelect,
      searchKeywordInput,
      searchSubmitBtn,
      clearSearchBtn,
    };
  },

  // Check if sort functionality exists
  checkSortUI: function () {
    console.log("\n📊 Checking Sort UI Elements...");

    const tableHeaders = document.querySelectorAll("th");
    const sortableHeaders = [];

    tableHeaders.forEach((header, index) => {
      const isClickable = header.style.cursor === "pointer" || header.onclick;
      console.log(
        `Header ${index + 1}: "${header.textContent.trim()}" - ${
          isClickable ? "Sortable" : "Not sortable"
        }`
      );
      if (isClickable) sortableHeaders.push(header);
    });

    console.log("✅ Total sortable columns:", sortableHeaders.length);
    return sortableHeaders;
  },

  // Test search by tutor name
  testSearchByName: function (searchTerm = "test") {
    console.log(`\n🧪 Testing Search by Name: "${searchTerm}"`);

    const elements = this.checkSearchUI();
    if (!elements.searchFieldSelect || !elements.searchKeywordInput) {
      console.log("❌ Cannot test - UI elements missing");
      return;
    }

    // Set search field to name
    elements.searchFieldSelect.value = "fullname";
    elements.searchFieldSelect.dispatchEvent(new Event("change"));

    // Set search keyword
    elements.searchKeywordInput.value = searchTerm;
    elements.searchKeywordInput.dispatchEvent(new Event("input"));

    console.log("✅ Search setup complete. Click submit button to test.");

    // Auto-submit after 1 second
    setTimeout(() => {
      if (elements.searchSubmitBtn) {
        elements.searchSubmitBtn.click();
        console.log("✅ Search submitted automatically");
      }
    }, 1000);
  },

  // Test search by tutor ID
  testSearchById: function (searchTerm = "123") {
    console.log(`\n🧪 Testing Search by ID: "${searchTerm}"`);

    const elements = this.checkSearchUI();
    if (!elements.searchFieldSelect || !elements.searchKeywordInput) {
      console.log("❌ Cannot test - UI elements missing");
      return;
    }

    // Set search field to ID
    elements.searchFieldSelect.value = "userId";
    elements.searchFieldSelect.dispatchEvent(new Event("change"));

    // Set search keyword
    elements.searchKeywordInput.value = searchTerm;
    elements.searchKeywordInput.dispatchEvent(new Event("input"));

    console.log("✅ Search setup complete. Click submit button to test.");

    // Auto-submit after 1 second
    setTimeout(() => {
      if (elements.searchSubmitBtn) {
        elements.searchSubmitBtn.click();
        console.log("✅ Search submitted automatically");
      }
    }, 1000);
  },

  // Test sort on a specific column
  testSort: function (columnText = "Doanh thu") {
    console.log(`\n📊 Testing Sort on column containing: "${columnText}"`);

    const headers = document.querySelectorAll("th");
    let targetHeader = null;

    headers.forEach((header) => {
      if (header.textContent.includes(columnText)) {
        targetHeader = header;
      }
    });

    if (targetHeader) {
      console.log("✅ Found column:", targetHeader.textContent.trim());
      targetHeader.click();
      console.log("✅ Clicked column for sorting");

      // Click again after 2 seconds to test reverse sort
      setTimeout(() => {
        targetHeader.click();
        console.log("✅ Clicked again for reverse sort");
      }, 2000);
    } else {
      console.log("❌ Column not found");
    }
  },

  // Clear search
  clearSearch: function () {
    console.log("\n🗑️ Testing Clear Search...");

    const elements = this.checkSearchUI();
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.click();
      console.log("✅ Clear search button clicked");
    } else {
      console.log("❌ Clear search button not found");
    }
  },

  // Monitor API calls
  monitorAPIRequests: function () {
    console.log("\n🔍 Monitoring API Requests...");

    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0];
      const options = args[1] || {};

      if (
        typeof url === "string" &&
        url.includes("manage-payment/search-with-time-for-tutor-revenue")
      ) {
        console.log("🌐 API Request detected:");
        console.log("URL:", url);
        if (options.body) {
          console.log("Body:", options.body);
        }

        // Extract query params
        const urlObj = new URL(url, window.location.origin);
        const params = Object.fromEntries(urlObj.searchParams);
        console.log("Query Parameters:", params);
      }

      return originalFetch.apply(this, args);
    };

    console.log("✅ API monitoring enabled");
  },

  // Run all tests
  runAllTests: function () {
    console.log("🚀 Running All Search & Sort Tests...\n");

    this.monitorAPIRequests();

    setTimeout(() => this.checkSearchUI(), 1000);
    setTimeout(() => this.checkSortUI(), 2000);
    setTimeout(() => this.testSearchByName("nguyen"), 3000);
    setTimeout(() => this.clearSearch(), 8000);
    setTimeout(() => this.testSearchById("123"), 10000);
    setTimeout(() => this.clearSearch(), 15000);
    setTimeout(() => this.testSort("Doanh thu"), 17000);

    console.log("📋 Tests scheduled. Watch console for results...");
  },
};

// Make available globally
window.searchSortTests = searchSortTests;

// Auto-run if on correct page
if (window.location.pathname.includes("/admin/doanh-thu-gia-su")) {
  console.log("🎯 TutorRevenueStatistics page detected!");
  console.log("📋 Available test functions:");
  console.log("- searchSortTests.runAllTests() - Run all tests automatically");
  console.log("- searchSortTests.checkSearchUI() - Check search elements");
  console.log("- searchSortTests.checkSortUI() - Check sort functionality");
  console.log(
    "- searchSortTests.testSearchByName('keyword') - Test name search"
  );
  console.log("- searchSortTests.testSearchById('123') - Test ID search");
  console.log("- searchSortTests.testSort('column') - Test column sort");
  console.log("- searchSortTests.clearSearch() - Test clear search");
  console.log("- searchSortTests.monitorAPIRequests() - Monitor API calls");

  console.log("\n💡 Quick start: searchSortTests.runAllTests()");
} else {
  console.log("ℹ️ Navigate to /admin/doanh-thu-gia-su to run tests");
}
