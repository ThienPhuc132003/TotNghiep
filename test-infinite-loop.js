// Test script to check for infinite loop patterns
import fs from "fs";
import path from "path";

// Common patterns that might cause infinite loops
const PATTERNS = [
  // useEffect with function dependency that might change on every render
  /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[\s\S]*?}\s*,\s*\[.*fetchHistory.*\]/g,
  /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[\s\S]*?}\s*,\s*\[.*fetchData.*\]/g,
  /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[\s\S]*?}\s*,\s*\[.*fetch.*\]/g,
  // useCallback with changing dependencies
  /useCallback\s*\([\s\S]*?\)\s*,\s*\[.*\].*\n.*useEffect.*\[.*\]/g,
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const issues = [];

    PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          pattern: index,
          matches: matches.length,
          file: filePath,
        });
      }
    });

    return issues;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  let allIssues = [];

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      allIssues = allIssues.concat(scanDirectory(fullPath));
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      const issues = scanFile(fullPath);
      allIssues = allIssues.concat(issues);
    }
  });

  return allIssues;
}

console.log("Scanning for potential infinite loop patterns...");
const issues = scanDirectory("./src");

if (issues.length > 0) {
  console.log("\nPotential issues found:");
  issues.forEach((issue) => {
    console.log(`File: ${issue.file}`);
    console.log(`Pattern ${issue.pattern}: ${issue.matches} matches`);
  });
} else {
  console.log("\nNo obvious infinite loop patterns detected.");
}

console.log("\nDone!");
