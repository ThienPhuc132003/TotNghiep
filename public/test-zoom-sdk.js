// test-zoom-sdk.js - Minimal Zoom SDK Test for Browser Console
// This script tests if the Zoom SDK can be loaded successfully

console.log("🔍 Starting Zoom SDK Test...");

async function testZoomSDK() {
  let ZoomMtg = null;

  try {
    console.log("📦 Attempting to load Zoom SDK via import...");

    // Test 1: Try dynamic import
    try {
      const module = await import("/@zoom/meetingsdk");
      console.log("📄 Module loaded:", module);

      if (module.ZoomMtg) {
        ZoomMtg = module.ZoomMtg;
        console.log("✅ Found ZoomMtg as named export");
      } else if (module.default && module.default.ZoomMtg) {
        ZoomMtg = module.default.ZoomMtg;
        console.log("✅ Found ZoomMtg in default export");
      } else if (module.default) {
        ZoomMtg = module.default;
        console.log("✅ Using default export as ZoomMtg");
      } else {
        throw new Error("ZoomMtg not found in module");
      }

      window.ZoomMtg = ZoomMtg;
      console.log("✅ ZoomMtg set on window object");
    } catch (importError) {
      console.log("❌ Import failed:", importError.message);
      console.log("🌐 Trying CDN fallback...");

      // Test 2: Try CDN loading
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";
        script.crossOrigin = "anonymous";

        script.onload = () => {
          if (window.ZoomMtg) {
            ZoomMtg = window.ZoomMtg;
            console.log("✅ ZoomMtg loaded from CDN");
            resolve();
          } else {
            reject(new Error("CDN script loaded but ZoomMtg not found"));
          }
        };

        script.onerror = () => {
          reject(new Error("Failed to load ZoomMtg from CDN"));
        };

        setTimeout(() => {
          if (!window.ZoomMtg) {
            reject(new Error("CDN load timeout"));
          }
        }, 10000);

        document.head.appendChild(script);
      });
    }

    // Test 3: Check ZoomMtg properties
    if (ZoomMtg) {
      console.log("📋 ZoomMtg properties:");
      console.log("- init:", typeof ZoomMtg.init);
      console.log("- join:", typeof ZoomMtg.join);
      console.log("- setZoomJSLib:", typeof ZoomMtg.setZoomJSLib);
      console.log("- preLoadWasm:", typeof ZoomMtg.preLoadWasm);
      console.log("- prepareWebSDK:", typeof ZoomMtg.prepareWebSDK);

      // Test 4: Try basic initialization
      console.log("🔧 Testing basic SDK setup...");
      ZoomMtg.setZoomJSLib("https://source.zoom.us/3.13.2/lib", "/av");
      console.log("✅ setZoomJSLib successful");

      ZoomMtg.preLoadWasm();
      console.log("✅ preLoadWasm successful");

      ZoomMtg.prepareWebSDK();
      console.log("✅ prepareWebSDK successful");

      console.log("🎉 All tests passed! Zoom SDK is working correctly.");
      return true;
    } else {
      throw new Error("ZoomMtg is null after loading attempts");
    }
  } catch (error) {
    console.error("❌ Zoom SDK Test Failed:", error);
    console.error("Stack:", error.stack);
    return false;
  }
}

// Auto-run test
testZoomSDK()
  .then((success) => {
    if (success) {
      console.log("🏆 Zoom SDK Test: SUCCESS");
    } else {
      console.log("💥 Zoom SDK Test: FAILED");
    }
  })
  .catch((error) => {
    console.error("💥 Zoom SDK Test Exception:", error);
  });
