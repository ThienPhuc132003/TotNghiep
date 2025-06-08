/**
 * ZOOM MEETING JOIN STUCK - DIAGNOSTIC TOOL
 * Debug script for "Joining Meeting..." infinite loading issue
 * Date: 2025-06-09
 */

// ============================================================================
// DIAGNOSTIC FUNCTIONS FOR STUCK MEETING JOIN
// ============================================================================

const ZOOM_JOIN_DIAGNOSTICS = {
  // Check Zoom SDK parameters
  validateParameters: function (
    sdkKey,
    signature,
    meetingNumber,
    userName,
    passWord
  ) {
    console.log("🔍 ZOOM PARAMETER VALIDATION");
    console.log("============================");

    const results = {
      sdkKey: {
        present: !!sdkKey,
        length: sdkKey ? sdkKey.length : 0,
        format: sdkKey ? /^[A-Za-z0-9_-]+$/.test(sdkKey) : false,
        sample: sdkKey ? `${sdkKey.substring(0, 8)}...` : "MISSING",
      },
      signature: {
        present: !!signature,
        length: signature ? signature.length : 0,
        isJWT: signature ? signature.split(".").length === 3 : false,
        sample: signature ? `${signature.substring(0, 20)}...` : "MISSING",
      },
      meetingNumber: {
        present: !!meetingNumber,
        value: meetingNumber,
        type: typeof meetingNumber,
        isValid: /^\d+$/.test(String(meetingNumber)),
      },
      userName: {
        present: !!userName,
        value: userName,
        length: userName ? userName.length : 0,
      },
      passWord: {
        present: !!passWord,
        hasValue: passWord && passWord.length > 0,
      },
    };

    console.log("📋 Parameter Check Results:");
    Object.entries(results).forEach(([key, data]) => {
      console.log(`  ${key}:`, data);
    });

    // Check for common issues
    const issues = [];
    if (!results.sdkKey.present) issues.push("❌ SDK Key missing");
    if (!results.signature.present) issues.push("❌ Signature missing");
    if (!results.signature.isJWT)
      issues.push("⚠️ Signature may not be valid JWT");
    if (!results.meetingNumber.present)
      issues.push("❌ Meeting Number missing");
    if (!results.meetingNumber.isValid)
      issues.push("⚠️ Meeting Number format invalid");
    if (!results.userName.present) issues.push("❌ User Name missing");

    if (issues.length > 0) {
      console.log("🚨 FOUND ISSUES:");
      issues.forEach((issue) => console.log(`  ${issue}`));
    } else {
      console.log("✅ All parameters look good");
    }

    return results;
  },

  // Check JWT signature validity
  analyzeSignature: function (signature) {
    console.log("🔐 JWT SIGNATURE ANALYSIS");
    console.log("=========================");

    if (!signature) {
      console.log("❌ No signature provided");
      return false;
    }

    try {
      const parts = signature.split(".");
      if (parts.length !== 3) {
        console.log("❌ Invalid JWT format (should have 3 parts)");
        return false;
      }

      // Decode header
      const header = JSON.parse(
        atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))
      );
      console.log("📄 JWT Header:", header);

      // Decode payload
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      console.log("📦 JWT Payload:", payload);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;
      const timeLeft = exp - now;

      console.log("⏰ Token Timing:");
      console.log(`  Current time: ${new Date(now * 1000).toISOString()}`);
      console.log(`  Expires at: ${new Date(exp * 1000).toISOString()}`);
      console.log(`  Time left: ${timeLeft} seconds`);

      if (timeLeft <= 0) {
        console.log("❌ TOKEN EXPIRED!");
        return false;
      } else if (timeLeft < 300) {
        console.log("⚠️ Token expires soon (< 5 minutes)");
      } else {
        console.log("✅ Token is valid and not expired");
      }

      return true;
    } catch (error) {
      console.log("❌ Failed to decode JWT:", error.message);
      return false;
    }
  },

  // Check network connectivity to Zoom
  checkZoomConnectivity: async function () {
    console.log("🌐 ZOOM CONNECTIVITY CHECK");
    console.log("==========================");

    const endpoints = [
      "https://api.zoom.us",
      "https://source.zoom.us",
      "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint}...`);
        const start = performance.now();

        const response = await fetch(endpoint, {
          method: "HEAD",
          mode: "no-cors", // Avoid CORS issues for basic connectivity test
        });

        const duration = performance.now() - start;
        console.log(`  ✅ Reachable (${duration.toFixed(0)}ms)`);
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }
  },

  // Monitor Zoom SDK state
  monitorSDKState: function () {
    console.log("📊 ZOOM SDK STATE MONITOR");
    console.log("=========================");

    const state = {
      windowZoomMtg: !!window.ZoomMtg,
      sdkMethods: {},
      zoomRoot: null,
      activeElements: [],
    };

    if (window.ZoomMtg) {
      state.sdkMethods = {
        init: typeof window.ZoomMtg.init === "function",
        join: typeof window.ZoomMtg.join === "function",
        leaveMeeting: typeof window.ZoomMtg.leaveMeeting === "function",
        getCurrentUser: typeof window.ZoomMtg.getCurrentUser === "function",
      };
    }

    const zoomRoot = document.getElementById("zmmtg-root");
    if (zoomRoot) {
      state.zoomRoot = {
        exists: true,
        visible: zoomRoot.style.display !== "none",
        hasChildren: zoomRoot.children.length > 0,
        dimensions: {
          width: zoomRoot.offsetWidth,
          height: zoomRoot.offsetHeight,
        },
        styles: window.getComputedStyle(zoomRoot),
      };
    }

    // Check for Zoom-related elements
    const zoomElements = document.querySelectorAll(
      '[id*="zoom"], [class*="zoom"], [class*="zm-"]'
    );
    state.activeElements = Array.from(zoomElements).map((el) => ({
      tag: el.tagName,
      id: el.id,
      class: el.className,
      visible: window.getComputedStyle(el).display !== "none",
    }));

    console.log("SDK State:", state);
    return state;
  },

  // Run complete diagnostic
  runFullDiagnostic: async function (
    sdkKey,
    signature,
    meetingNumber,
    userName,
    passWord
  ) {
    console.log("🚀 RUNNING FULL ZOOM DIAGNOSTIC");
    console.log("===============================");
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    // 1. Parameter validation
    const paramResults = this.validateParameters(
      sdkKey,
      signature,
      meetingNumber,
      userName,
      passWord
    );
    console.log("\n");

    // 2. Signature analysis
    const sigValid = this.analyzeSignature(signature);
    console.log("\n");

    // 3. Connectivity check
    await this.checkZoomConnectivity();
    console.log("\n");

    // 4. SDK state
    const sdkState = this.monitorSDKState();
    console.log("\n");

    // 5. Summary and recommendations
    console.log("📋 DIAGNOSTIC SUMMARY");
    console.log("=====================");

    const issues = [];
    const recommendations = [];

    if (!paramResults.sdkKey.present) {
      issues.push("Missing SDK Key");
      recommendations.push("Verify SDK Key is properly passed to component");
    }

    if (!paramResults.signature.present || !sigValid) {
      issues.push("Invalid or expired signature");
      recommendations.push(
        "Generate new signature with correct expiration time"
      );
    }

    if (!sdkState.windowZoomMtg) {
      issues.push("Zoom SDK not loaded");
      recommendations.push(
        "Check SDK loading process and network connectivity"
      );
    }

    if (sdkState.zoomRoot && !sdkState.zoomRoot.visible) {
      issues.push("Zoom container hidden");
      recommendations.push("Check CSS styling of zmmtg-root element");
    }

    console.log("🚨 Issues Found:", issues.length > 0 ? issues : ["None"]);
    console.log(
      "💡 Recommendations:",
      recommendations.length > 0 ? recommendations : ["Everything looks good"]
    );

    return {
      paramResults,
      signatureValid: sigValid,
      sdkState,
      issues,
      recommendations,
    };
  },
};

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

console.log(`
🔧 ZOOM JOIN DIAGNOSTIC TOOL LOADED
====================================

To use this tool, call:

1. Quick parameter check:
   ZOOM_JOIN_DIAGNOSTICS.validateParameters(sdkKey, signature, meetingNumber, userName, passWord);

2. Check if signature is valid/expired:
   ZOOM_JOIN_DIAGNOSTICS.analyzeSignature(signature);

3. Test Zoom connectivity:
   await ZOOM_JOIN_DIAGNOSTICS.checkZoomConnectivity();

4. Monitor SDK state:
   ZOOM_JOIN_DIAGNOSTICS.monitorSDKState();

5. Run complete diagnostic:
   await ZOOM_JOIN_DIAGNOSTICS.runFullDiagnostic(sdkKey, signature, meetingNumber, userName, passWord);

Example usage in browser console:
await ZOOM_JOIN_DIAGNOSTICS.runFullDiagnostic(
  "your_sdk_key",
  "your_jwt_signature", 
  "123456789",
  "User Name",
  "password"
);
`);

// Export for use in browser
if (typeof window !== "undefined") {
  window.ZOOM_JOIN_DIAGNOSTICS = ZOOM_JOIN_DIAGNOSTICS;
}

export default ZOOM_JOIN_DIAGNOSTICS;
