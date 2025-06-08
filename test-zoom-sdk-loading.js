// Test Zoom SDK Loading - Debug Script
console.log("🔍 Starting Zoom SDK Loading Test...");

// Test 1: Check if Zoom SDK package is accessible
console.log("\n=== Test 1: Package Import ===");
try {
  import("@zoom/meetingsdk")
    .then((module) => {
      console.log("✅ @zoom/meetingsdk package imported successfully");
      console.log("📦 Module content:", Object.keys(module));

      if (module.ZoomMtg) {
        console.log("✅ ZoomMtg found in package");
        console.log(
          "🔧 ZoomMtg methods:",
          Object.getOwnPropertyNames(module.ZoomMtg)
        );
      } else {
        console.log("❌ ZoomMtg not found in package");
      }
    })
    .catch((error) => {
      console.log("❌ Failed to import @zoom/meetingsdk:", error.message);
      console.log("📋 This might be normal - will test CDN loading");
    });
} catch (error) {
  console.log("❌ Import syntax error:", error.message);
}

// Test 2: Test CDN URLs accessibility
console.log("\n=== Test 2: CDN URLs Test ===");
const cdnUrls = [
  "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
  "https://source.zoom.us/lib/ZoomMtg.js",
  "https://dmogdx0jrul3u.cloudfront.net/3.13.2/lib/ZoomMtg.js",
];

cdnUrls.forEach((url, index) => {
  fetch(url, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        console.log(`✅ CDN ${index + 1} accessible: ${url}`);
      } else {
        console.log(`❌ CDN ${index + 1} returned ${response.status}: ${url}`);
      }
    })
    .catch((error) => {
      console.log(`❌ CDN ${index + 1} failed: ${url}`, error.message);
    });
});

// Test 3: Network connectivity
console.log("\n=== Test 3: Basic Network Test ===");
fetch("https://www.google.com", { method: "HEAD" })
  .then((response) => {
    console.log("✅ Basic internet connectivity working");
  })
  .catch((error) => {
    console.log("❌ No internet connectivity:", error.message);
  });

// Test 4: Check if running in secure context
console.log("\n=== Test 4: Security Context ===");
console.log("🔒 Is Secure Context:", window.isSecureContext);
console.log("🌐 Protocol:", window.location.protocol);
console.log("🏠 Origin:", window.location.origin);

// Test 5: Simulate ZoomDebugComponent loading logic
console.log("\n=== Test 5: Simulate ZoomDebugComponent Loading ===");

const simulateZoomSDKLoad = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ZoomMtg) {
      console.log("✅ Zoom SDK already loaded");
      resolve(window.ZoomMtg);
      return;
    }

    console.log("📡 Starting CDN load simulation...");

    const script = document.createElement("script");
    script.src = "https://source.zoom.us/3.13.2/lib/ZoomMtg.js";

    script.onload = () => {
      console.log("✅ CDN script loaded successfully");
      if (window.ZoomMtg) {
        console.log("✅ ZoomMtg is now available on window");
        console.log(
          "🔧 ZoomMtg methods:",
          Object.getOwnPropertyNames(window.ZoomMtg)
        );
        resolve(window.ZoomMtg);
      } else {
        console.log("❌ Script loaded but ZoomMtg not found on window");
        reject(new Error("ZoomMtg not found after script load"));
      }
    };

    script.onerror = (error) => {
      console.log("❌ Script failed to load:", error);
      reject(new Error("Failed to load Zoom SDK script"));
    };

    console.log("📎 Appending script to head...");
    document.head.appendChild(script);

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!window.ZoomMtg) {
        console.log("⏱️ Timeout: ZoomMtg not loaded after 15 seconds");
        reject(new Error("Timeout loading Zoom SDK"));
      }
    }, 15000);
  });
};

// Run the simulation
setTimeout(() => {
  console.log("\n🚀 Running simulation...");
  simulateZoomSDKLoad()
    .then((ZoomMtg) => {
      console.log("🎉 Simulation successful! ZoomMtg loaded");
      console.log("📋 Available methods:", Object.getOwnPropertyNames(ZoomMtg));
    })
    .catch((error) => {
      console.log("💥 Simulation failed:", error.message);

      // Additional debugging
      console.log("\n=== Additional Debug Info ===");
      console.log("📊 Navigator info:", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
      });

      console.log("🌐 Window location:", {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
      });
    });
}, 2000);

// Test 6: Check CORS headers
console.log("\n=== Test 6: CORS Headers Check ===");
fetch("https://source.zoom.us/3.13.2/lib/ZoomMtg.js", {
  method: "HEAD",
  mode: "cors",
})
  .then((response) => {
    console.log("✅ CORS request successful");
    console.log("📋 Headers:", [...response.headers.entries()]);
  })
  .catch((error) => {
    console.log("❌ CORS request failed:", error.message);
  });

console.log("\n🏁 Test script setup complete. Check results above.");
