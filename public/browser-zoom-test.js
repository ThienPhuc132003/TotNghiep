// Browser-based Zoom SDK Loading Test
// Run this in browser console at http://localhost:3000

console.log("🔧 Starting Browser Zoom SDK Test...");

// Test function to run in browser
window.testZoomSDK = async function () {
  const results = {
    networkTest: false,
    cdnTest: false,
    packageImport: false,
    cdnLoad: false,
    sdkReady: false,
  };

  // Test 1: Basic Network Connectivity
  console.log("1️⃣ Testing network connectivity...");
  try {
    await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
    });
    results.networkTest = true;
    console.log("✅ Network connectivity OK");
  } catch (error) {
    console.log("❌ Network connectivity failed:", error.message);
  }

  // Test 2: Zoom CDN Accessibility
  console.log("2️⃣ Testing Zoom CDN accessibility...");
  try {
    const response = await fetch(
      "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
      { method: "HEAD" }
    );
    if (response.ok) {
      results.cdnTest = true;
      console.log("✅ Zoom CDN accessible, status:", response.status);
    } else {
      console.log("❌ Zoom CDN returned status:", response.status);
    }
  } catch (error) {
    console.log("❌ Zoom CDN test failed:", error.message);
  }

  // Test 3: Package Import
  console.log("3️⃣ Testing package import...");
  try {
    const module = await import("@zoom/meetingsdk");
    if (module.ZoomMtg) {
      results.packageImport = true;
      window.ZoomMtg = module.ZoomMtg;
      console.log("✅ Package import successful");
    } else if (module.default && module.default.ZoomMtg) {
      results.packageImport = true;
      window.ZoomMtg = module.default.ZoomMtg;
      console.log("✅ Package import successful (default export)");
    } else {
      console.log(
        "❌ Package imported but ZoomMtg not found",
        Object.keys(module)
      );
    }
  } catch (error) {
    console.log("❌ Package import failed:", error.message);
  }

  // Test 4: CDN Fallback (if package import failed)
  if (!results.packageImport) {
    console.log("4️⃣ Testing CDN fallback...");
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
        script.crossOrigin = "anonymous";

        script.onload = () => {
          if (window.ZoomMtg) {
            results.cdnLoad = true;
            console.log("✅ CDN load successful");
            resolve();
          } else {
            console.log("❌ CDN loaded but ZoomMtg not found");
            reject(new Error("ZoomMtg not found after CDN load"));
          }
        };

        script.onerror = () => {
          console.log("❌ CDN script load failed");
          reject(new Error("CDN script load failed"));
        };

        document.head.appendChild(script);

        // Timeout after 15 seconds
        setTimeout(() => {
          if (!window.ZoomMtg) {
            reject(new Error("CDN load timeout"));
          }
        }, 15000);
      });
    } catch (error) {
      console.log("❌ CDN fallback failed:", error.message);
    }
  }

  // Test 5: SDK Readiness
  console.log("5️⃣ Testing SDK readiness...");
  if (window.ZoomMtg) {
    try {
      console.log("✅ ZoomMtg object available");
      console.log(
        "🔍 ZoomMtg methods:",
        Object.getOwnPropertyNames(window.ZoomMtg)
      );

      if (typeof window.ZoomMtg.preLoadWasm === "function") {
        console.log("✅ preLoadWasm method available");
      }
      if (typeof window.ZoomMtg.prepareWebSDK === "function") {
        console.log("✅ prepareWebSDK method available");
      }
      if (typeof window.ZoomMtg.init === "function") {
        console.log("✅ init method available");
      }

      results.sdkReady = true;
    } catch (error) {
      console.log("❌ SDK readiness check failed:", error.message);
    }
  } else {
    console.log("❌ ZoomMtg not available");
  }

  // Summary
  console.log("\n📊 Test Summary:");
  console.log("Network:", results.networkTest ? "✅" : "❌");
  console.log("CDN Access:", results.cdnTest ? "✅" : "❌");
  console.log("Package Import:", results.packageImport ? "✅" : "❌");
  console.log("CDN Load:", results.cdnLoad ? "✅" : "❌");
  console.log("SDK Ready:", results.sdkReady ? "✅" : "❌");

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Overall: ${successCount}/5 tests passed`);

  return results;
};

// Auto-run test
console.log("💡 Run window.testZoomSDK() to execute the test suite");
console.log("💡 Or wait 3 seconds for auto-execution...");

setTimeout(() => {
  console.log("🚀 Auto-running test...");
  window.testZoomSDK();
}, 3000);
