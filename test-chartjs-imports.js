// Test Chart.js imports to identify the exact issue
console.log("🧪 Testing Chart.js imports...");

try {
  console.log("Testing chart.js import...");
  // This simulates the import from the component

  // Check if Chart.js is available
  if (typeof Chart !== "undefined") {
    console.log("✅ Chart.js is available globally");
  } else {
    console.log("❌ Chart.js is not available globally");
  }

  // Test if the module can be imported (this would normally be done by bundler)
  console.log("💡 In a React component, you would import Chart.js like:");
  console.log(`
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
  `);

  console.log("🔍 The error is likely:");
  console.log("1. react-chartjs-2 package not installed");
  console.log(
    "2. Version incompatibility between chart.js and react-chartjs-2"
  );
  console.log("3. Import path issues");
} catch (error) {
  console.error("❌ Chart.js test failed:", error);
}

// Check if Chart.js package is installed
console.log("📦 Checking package.json for chart dependencies...");

fetch("/package.json")
  .then((response) => response.json())
  .then((pkg) => {
    console.log("Chart.js version:", pkg.dependencies["chart.js"]);
    console.log(
      "React-chartjs-2 version:",
      pkg.dependencies["react-chartjs-2"] || "NOT INSTALLED"
    );

    if (!pkg.dependencies["react-chartjs-2"]) {
      console.error("❌ react-chartjs-2 is not installed!");
      console.log("💡 Run: npm install react-chartjs-2");
    }
  })
  .catch((err) => {
    console.log("❌ Could not check package.json:", err.message);
  });
