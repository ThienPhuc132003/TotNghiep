# Enhanced API Logging Guide for TutorRevenueStatistics

## Overview

The API logging system has been significantly enhanced to provide comprehensive debugging information for the TutorRevenueStatistics page. This guide explains how to use the enhanced logging features.

## Features Added

### 1. Enhanced API Logger (`src/utils/apiLogger.js`)

- **Request Timing**: Tracks request duration with unique request IDs
- **Detailed Request Logging**: Full URL, query parameters, request body
- **Enhanced Response Logging**: Structured analysis for different data types
- **Comprehensive Error Logging**: Network errors, HTTP errors, request setup errors
- **Specialized Tutor Revenue Logging**: Custom logging for tutor revenue statistics

### 2. API Client Updates (`src/network/Api.js`)

- **Request ID Tracking**: Each request gets a unique ID for correlation
- **Enhanced Timing**: Request duration calculation
- **Better Error Correlation**: Errors are linked to specific requests

### 3. TutorRevenueStatistics Component Updates

- **Specialized Debug Logging**: Custom logging for tutor revenue requests
- **Response Structure Analysis**: Detailed analysis of API response structure
- **Search/Sort Parameter Logging**: Detailed logging of search and sort parameters
- **Error Analysis**: Comprehensive error analysis with context

## How to Use

### 1. Enable API Logging

```javascript
// In browser console
apiLogger.enable();
// or
window.enableAPILogging();
```

### 2. Access Logging Controls

```javascript
// Enable logging
apiLogger.enable();

// Disable logging
apiLogger.disable();

// Toggle logging
apiLogger.toggle();

// Clear request timing data
apiLogger.clearRequestTimes();
```

### 3. View Logs

#### Request Logs

When a request is made, you'll see:

```
🚀 [GET] API Request - 2024-01-01T12:00:00.000Z
  🔗 Full URL: http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue
  📋 Query Parameters:
  ┌─────────────────┬─────────────────────────────────────────┐
  │ (index)         │ Values                                  │
  ├─────────────────┼─────────────────────────────────────────┤
  │ rpp             │ 10                                      │
  │ page            │ 1                                       │
  │ periodType      │ 'MONTH'                                 │
  │ periodValue     │ 1                                       │
  │ searchField     │ 'fullname'                             │
  │ searchKeyword   │ 'John'                                  │
  │ sort            │ '[{"key":"totalRevenueWithTime","type":"DESC"}]' │
  └─────────────────┴─────────────────────────────────────────┘
  🔍 Query String: rpp=10&page=1&periodType=MONTH&periodValue=1&searchField=fullname&searchKeyword=John&sort=[%7B%22key%22%3A%22totalRevenueWithTime%22%2C%22type%22%3A%22DESC%22%7D]
  🆔 Request ID: req_1704110400000_abc123def
```

#### Tutor Revenue Specific Logs

```
🎓 TUTOR REVENUE STATISTICS - REQUEST DEBUG
  📅 Timestamp: 2024-01-01T12:00:00.000Z
  🔍 Search Parameters:
  ┌─────────────────┬─────────────────┐
  │ (index)         │ Values          │
  ├─────────────────┼─────────────────┤
  │ searchField     │ 'fullname'      │
  │ searchKeyword   │ 'John'          │
  │ hasSearch       │ true            │
  └─────────────────┴─────────────────┘
  📊 Sort Parameters:
  ┌─────────────────┬─────────────────────────────────────────┐
  │ (index)         │ Values                                  │
  ├─────────────────┼─────────────────────────────────────────┤
  │ sortKey         │ 'totalRevenueWithTime'                  │
  │ sortDirection   │ 'desc'                                  │
  │ sortJSON        │ '[{"key":"totalRevenueWithTime","type":"DESC"}]' │
  └─────────────────┴─────────────────────────────────────────┘
```

#### Response Logs

```
✅ API Response - 2024-01-01T12:00:01.234Z
  ⏱️ Duration: 1234.56ms
  🆔 Request ID: req_1704110400000_abc123def
  📄 Paginated Response:
  📊 Pagination Info: {page: 1, pageSize: 10, totalItems: 100, totalPages: 10}
  📋 Data (5 items):
  ┌─────────┬──────────┬─────────────────┬───────────┬─────────────────────┐
  │ (index) │ userId   │ fullname        │ totalHire │ totalRevenueWithTime │
  ├─────────┼──────────┼─────────────────┼───────────┼─────────────────────┤
  │ 0       │ 'TU001'  │ 'John Doe'      │ 15        │ 15000000            │
  │ 1       │ 'TU002'  │ 'Jane Smith'    │ 12        │ 12000000            │
  └─────────┴──────────┴─────────────────┴───────────┴─────────────────────┘
```

#### Response Analysis Logs

```
🎓 TUTOR REVENUE STATISTICS - API RESPONSE ANALYSIS
  📅 Response Time: 2024-01-01T12:00:01.234Z
  ✅ Raw Response Payload: {success: true, data: {...}}
  🔍 Response Structure Analysis:
  - Has success property: true
  - Success value: true
  - Has data property: true
  📊 Data Structure Analysis:
  - Data type: object
  - Has items property: true
  - Has total property: true
  📋 Items Analysis:
  - Items is array: true
  - Items length: 5
  📄 First Item Structure:
  ┌─────────┬──────────────────────┐
  │ (index) │ Values               │
  ├─────────┼──────────────────────┤
  │ userId  │ 'TU001'              │
  │ fullname│ 'John Doe'           │
  │ totalHire│ 15                  │
  │ totalRevenueWithTime│ 15000000 │
  └─────────┴──────────────────────┘
  📊 Total Items: 100
```

#### Error Logs

```
❌ API Error - 2024-01-01T12:00:01.234Z
  🔗 Failed URL: http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue
  ⏱️ Duration: 1234.56ms
  🆔 Request ID: req_1704110400000_abc123def
  📛 HTTP Error Response:
  🔢 Status: 401
  📄 Status Text: Unauthorized
  💬 Error Data: {message: "Token not provided", code: "UNAUTHORIZED"}
```

### 4. Common Debugging Scenarios

#### Scenario 1: No Data Returned

1. Check if API request is being made (look for request logs)
2. Verify query parameters are correct
3. Check response structure analysis
4. Verify API endpoint and authentication

#### Scenario 2: Search Not Working

1. Check tutor revenue request debug logs
2. Verify search parameters are included in query
3. Check if searchKeyword is being trimmed correctly
4. Verify searchField value ('fullname' or 'userId')

#### Scenario 3: Sort Not Working

1. Check sort parameters in tutor revenue debug logs
2. Verify sort JSON structure
3. Check if sort direction is uppercase (DESC/ASC)

#### Scenario 4: Authentication Issues

1. Check for 401 errors in error logs
2. Verify token is being sent in request headers
3. Check X-Require-Token header is set

### 5. Performance Monitoring

- Request duration is tracked for each API call
- Long-running requests (>2000ms) can be identified
- Memory usage of request timing storage is managed

### 6. Production Considerations

- Logging can be disabled in production by calling `apiLogger.disable()`
- Request timing data is automatically cleaned up after responses
- Logs are only shown in browser console, not sent to server

## Testing the Enhanced Logging

### Test Search Functionality

```javascript
// In browser console, navigate to TutorRevenueStatistics page
// Enable logging
apiLogger.enable();

// Perform search
// 1. Select search field (fullname or userId)
// 2. Enter search keyword
// 3. Click search button
// 4. Check logs for search parameters

// Clear search
// 1. Click clear button
// 2. Check logs for cleared parameters
```

### Test Sort Functionality

```javascript
// Click on any sortable column header
// Check logs for sort parameters
// Click again to reverse sort direction
// Verify sort direction changes in logs
```

### Test Error Scenarios

```javascript
// Disconnect network
// Perform API request
// Check error logs for network error details

// Or modify token in localStorage to invalid value
// Perform API request
// Check error logs for authentication error details
```

## Log Levels and Filtering

The enhanced logging system provides different types of logs:

- 🚀 **Request Logs**: API requests with full details
- ✅ **Response Logs**: API responses with structured data
- ❌ **Error Logs**: API errors with comprehensive details
- 🎓 **Tutor Revenue Logs**: Specialized logs for tutor revenue debugging
- 📊 **Analysis Logs**: Response structure analysis

You can filter these in browser console by searching for the emoji prefixes.

## Conclusion

The enhanced API logging system provides comprehensive debugging capabilities for the TutorRevenueStatistics page. Use this guide to effectively debug API issues, verify data flow, and optimize performance.
