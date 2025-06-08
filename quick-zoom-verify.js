// Quick Zoom SDK Verification Script
console.log("=== Zoom SDK Verification ===");

// Test 1: Check if package is properly installed
console.log("\n1. Checking package installation...");
try {
  const fs = require("fs");
  const path = require("path");

  const packageJsonPath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (
    packageJson.dependencies &&
    packageJson.dependencies["@zoom/meetingsdk"]
  ) {
    console.log(
      "✅ @zoom/meetingsdk found in dependencies:",
      packageJson.dependencies["@zoom/meetingsdk"]
    );
  } else {
    console.log("❌ @zoom/meetingsdk not found in dependencies");
  }
} catch (error) {
  console.log("❌ Error reading package.json:", error.message);
}

// Test 2: Check if package files exist
console.log("\n2. Checking package files...");
try {
  const fs = require("fs");
  const path = require("path");

  const sdkPath = path.join(__dirname, "node_modules", "@zoom", "meetingsdk");
  if (fs.existsSync(sdkPath)) {
    console.log("✅ SDK package directory exists");

    const pkgJsonPath = path.join(sdkPath, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const sdkPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      console.log("✅ SDK package version:", sdkPkg.version);
      console.log("✅ SDK main entry:", sdkPkg.main);
    }

    // Check for common files
    const commonFiles = [
      "index.js",
      "lib/index.js",
      "dist/zoom-meeting-embedded.umd.min.js",
    ];
    commonFiles.forEach((file) => {
      const filePath = path.join(sdkPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Found: ${file}`);
      }
    });
  } else {
    console.log("❌ SDK package directory not found");
  }
} catch (error) {
  console.log("❌ Error checking package files:", error.message);
}

// Test 3: Check network connectivity to Zoom CDN
console.log("\n3. Testing Zoom CDN connectivity...");
const https = require("https");

const testCDN = (url) => {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: "HEAD" }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
      });
    });

    request.on("error", (error) => {
      reject({ url, error: error.message });
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject({ url, error: "Timeout" });
    });

    request.end();
  });
};

const cdnUrls = [
  "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
  "https://source.zoom.us/lib/ZoomMtg.js",
  "https://dmogdx0jrul3u.cloudfront.net/3.13.2/lib/ZoomMtg.js",
];

Promise.allSettled(cdnUrls.map(testCDN)).then((results) => {
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(
        `✅ CDN ${index + 1}: ${result.value.status} - ${result.value.url}`
      );
    } else {
      console.log(
        `❌ CDN ${index + 1}: ${result.reason.error} - ${result.reason.url}`
      );
    }
  });

  console.log("\n=== Verification Complete ===");
});
