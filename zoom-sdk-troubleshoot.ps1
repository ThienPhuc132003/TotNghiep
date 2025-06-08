# Zoom SDK Troubleshooting Script
Write-Host "🔧 Zoom SDK Troubleshooting Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Check if npm package is installed
Write-Host "`n📦 Testing @zoom/meetingsdk package..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $zoomPackage = $packageJson.dependencies."@zoom/meetingsdk"
    if ($zoomPackage) {
        Write-Host "✅ @zoom/meetingsdk version: $zoomPackage" -ForegroundColor Green
    } else {
        Write-Host "❌ @zoom/meetingsdk not found in dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

# Test 2: Check node_modules
Write-Host "`n📁 Checking node_modules..." -ForegroundColor Yellow
$zoomModulePath = "node_modules/@zoom/meetingsdk"
if (Test-Path $zoomModulePath) {
    Write-Host "✅ Zoom SDK module exists in node_modules" -ForegroundColor Green
    $moduleFiles = Get-ChildItem $zoomModulePath -Name
    Write-Host "📋 Module contains: $($moduleFiles -join ', ')" -ForegroundColor Gray
} else {
    Write-Host "❌ Zoom SDK module not found in node_modules" -ForegroundColor Red
    Write-Host "💡 Try running: npm install" -ForegroundColor Yellow
}

# Test 3: Check internet connectivity
Write-Host "`n🌐 Testing internet connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.google.com" -Method Head -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ Internet connectivity working" -ForegroundColor Green
} catch {
    Write-Host "❌ Internet connectivity issues: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test Zoom CDN accessibility
Write-Host "`n📡 Testing Zoom CDN accessibility..." -ForegroundColor Yellow
$cdnUrls = @(
    "https://source.zoom.us/3.13.2/lib/ZoomMtg.js",
    "https://source.zoom.us/lib/ZoomMtg.js",
    "https://dmogdx0jrul3u.cloudfront.net/3.13.2/lib/ZoomMtg.js"
)

foreach ($url in $cdnUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15 -UseBasicParsing
        Write-Host "✅ CDN accessible: $url (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ CDN failed: $url - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Check if development server is running
Write-Host "`n🚀 Checking development server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Development server running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Development server not accessible" -ForegroundColor Red
    Write-Host "💡 Try running: npm run dev" -ForegroundColor Yellow
}

# Test 6: Check Windows firewall and antivirus
Write-Host "`n🛡️ Checking security software..." -ForegroundColor Yellow
try {
    $processes = Get-Process | Where-Object { $_.ProcessName -match "antivirus|firewall|security" }
    if ($processes) {
        Write-Host "⚠️ Security software detected:" -ForegroundColor Yellow
        $processes | ForEach-Object { Write-Host "  - $($_.ProcessName)" -ForegroundColor Gray }
        Write-Host "💡 If SDK loading fails, try temporarily disabling or adding exceptions" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️ No obvious security software interference detected" -ForegroundColor Gray
    }
} catch {
    Write-Host "ℹ️ Could not check security software" -ForegroundColor Gray
}

# Test 7: Check DNS resolution
Write-Host "`n🔍 Testing DNS resolution..." -ForegroundColor Yellow
$domains = @("source.zoom.us", "zoom.us", "dmogdx0jrul3u.cloudfront.net")
foreach ($domain in $domains) {
    try {
        $result = Resolve-DnsName $domain -ErrorAction Stop
        Write-Host "✅ DNS resolution working for $domain" -ForegroundColor Green
    } catch {
        Write-Host "❌ DNS resolution failed for $domain" -ForegroundColor Red
    }
}

# Test 8: Check browser compatibility
Write-Host "`n🌐 Browser compatibility check..." -ForegroundColor Yellow
Write-Host "ℹ️ Make sure you're using a modern browser:" -ForegroundColor Gray
Write-Host "  - Chrome 80+" -ForegroundColor Gray
Write-Host "  - Firefox 75+" -ForegroundColor Gray
Write-Host "  - Safari 13+" -ForegroundColor Gray
Write-Host "  - Edge 80+" -ForegroundColor Gray

# Recommendations
Write-Host "`n💡 Troubleshooting Recommendations:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache and cookies" -ForegroundColor Gray
Write-Host "2. Disable browser extensions temporarily" -ForegroundColor Gray
Write-Host "3. Try in incognito/private mode" -ForegroundColor Gray
Write-Host "4. Check if company firewall blocks Zoom domains" -ForegroundColor Gray
Write-Host "5. Try using a VPN if in a restricted network" -ForegroundColor Gray
Write-Host "6. Restart the development server" -ForegroundColor Gray

Write-Host "`n🔧 Quick fixes to try:" -ForegroundColor Yellow
Write-Host "npm install                    # Reinstall dependencies" -ForegroundColor Gray
Write-Host "npm run dev                    # Start development server" -ForegroundColor Gray
Write-Host "npx browserslist               # Check browser support" -ForegroundColor Gray

Write-Host "`n✅ Troubleshooting complete!" -ForegroundColor Green
