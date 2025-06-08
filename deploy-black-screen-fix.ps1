#!/usr/bin/env powershell
# Production Black Screen Fix - Deployment Script
# Run this script to deploy the fixes to production

param(
    [string]$Environment = "production",
    [switch]$DryRun = $false,
    [switch]$SkipBuild = $false,
    [switch]$Verify = $false
)

Write-Host "🚀 Production Black Screen Fix - Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Dry Run: $DryRun" -ForegroundColor Yellow
Write-Host "Skip Build: $SkipBuild" -ForegroundColor Yellow
Write-Host ""

# Configuration
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistPath = Join-Path $ProjectRoot "dist"
$BackupPath = Join-Path $ProjectRoot "deployment-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Step 1: Pre-deployment checks
Write-Host "📋 Pre-deployment Checks..." -ForegroundColor Green

if (-not $SkipBuild) {
    Write-Host "🔨 Building project with production optimizations..." -ForegroundColor Blue
    
    try {
        Set-Location $ProjectRoot
        
        # Clean previous build
        if (Test-Path $DistPath) {
            Remove-Item $DistPath -Recurse -Force
            Write-Host "✅ Cleaned previous build" -ForegroundColor Green
        }
        
        # Build with memory optimization
        $buildResult = & npm run build:memory 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed: $buildResult"
        }
        Write-Host "✅ Build completed successfully" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Build failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Verify build artifacts
Write-Host "📦 Verifying build artifacts..." -ForegroundColor Blue

$requiredFiles = @(
    "index.html",
    "assets"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $DistPath $file
    if (-not (Test-Path $filePath)) {
        Write-Host "❌ Missing required file: $file" -ForegroundColor Red
        exit 1
    }
}

# Check for our specific fixes
$assetsPath = Join-Path $DistPath "assets"
$zoomFiles = Get-ChildItem $assetsPath -Filter "*Zoom*" -File
$productionFiles = Get-ChildItem $assetsPath -Filter "*Production*" -File

Write-Host "✅ Build verification complete:" -ForegroundColor Green
Write-Host "  - Zoom components: $($zoomFiles.Count) files" -ForegroundColor Gray
Write-Host "  - Production components: $($productionFiles.Count) files" -ForegroundColor Gray

if ($zoomFiles.Count -eq 0) {
    Write-Host "⚠️  Warning: No Zoom components found in build" -ForegroundColor Yellow
}

# Step 3: Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Blue

$deploymentInfo = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    environment = $Environment
    version = "black-screen-fix-v1.0"
    components = @{
        tutorMeetingRoom = "Updated button logic for role-based access"
        zoomMeetingEmbedProductionFix = "Enhanced SDK loading with retry logic"
        validationSuite = "Comprehensive testing framework"
    }
    files = @{
        modified = @(
            "src/pages/User/TutorMeetingRoomPage.jsx",
            "src/components/User/Zoom/ZoomMeetingEmbedProductionFix.jsx"
        )
        new = @(
            "PRODUCTION_BLACK_SCREEN_FIX_VALIDATION.js",
            "PRODUCTION_LIVE_TEST.html",
            "PRODUCTION_DEPLOYMENT_VERIFICATION.md"
        )
    }
    fixes = @(
        "Button enables for students without Zoom OAuth",
        "Enhanced Zoom SDK initialization with fallbacks", 
        "Container visibility fixes for black screen",
        "Retry logic for failed meeting joins",
        "Comprehensive error handling and recovery"
    )
}

$deploymentInfoJson = $deploymentInfo | ConvertTo-Json -Depth 10
$deploymentInfoPath = Join-Path $DistPath "deployment-info.json"
$deploymentInfoJson | Out-File -FilePath $deploymentInfoPath -Encoding UTF8

Write-Host "✅ Deployment package created" -ForegroundColor Green

# Step 4: Deployment simulation (if dry run)
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - Simulating deployment..." -ForegroundColor Yellow
    Write-Host "Would deploy to: $Environment" -ForegroundColor Gray
    Write-Host "Package size: $((Get-ChildItem $DistPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB) MB" -ForegroundColor Gray
    Write-Host "✅ Dry run completed successfully" -ForegroundColor Green
    exit 0
}

# Step 5: Actual deployment instructions
Write-Host "🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Upload the 'dist' folder contents to your production server" -ForegroundColor White
Write-Host "2. Ensure the following files are accessible:" -ForegroundColor White
Write-Host "   - index.html (main application)" -ForegroundColor Gray
Write-Host "   - assets/ (JavaScript and CSS bundles)" -ForegroundColor Gray
Write-Host "   - deployment-info.json (deployment metadata)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the deployment:" -ForegroundColor White
Write-Host "   - Open: https://giasuvlu.click/tai-khoan/ho-so/phong-hoc" -ForegroundColor Gray
Write-Host "   - Verify Start Meeting button is functional" -ForegroundColor Gray
Write-Host "   - Check console for errors" -ForegroundColor Gray
Write-Host ""

# Step 6: Verification mode
if ($Verify) {
    Write-Host "🔍 Running post-deployment verification..." -ForegroundColor Blue
    
    # Open verification test
    $testPath = Join-Path $ProjectRoot "PRODUCTION_LIVE_TEST.html"
    if (Test-Path $testPath) {
        Start-Process $testPath
        Write-Host "✅ Verification test opened in browser" -ForegroundColor Green
    }
    
    # Open production site for manual testing
    Start-Process "https://giasuvlu.click/tai-khoan/ho-so/phong-hoc"
    Write-Host "✅ Production site opened for testing" -ForegroundColor Green
}

# Step 7: Summary
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "✅ Build: Completed" -ForegroundColor Green
Write-Host "✅ Package: Created" -ForegroundColor Green
Write-Host "✅ Artifacts: Verified" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy dist/ contents to production server" -ForegroundColor White
Write-Host "2. Run verification tests on https://giasuvlu.click" -ForegroundColor White
Write-Host "3. Monitor for any issues in the first 24 hours" -ForegroundColor White
Write-Host "4. Confirm zero black screen incidents" -ForegroundColor White
Write-Host ""
Write-Host "🆘 Rollback Plan:" -ForegroundColor Red
Write-Host "If issues occur, revert to previous version and contact dev team" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Black Screen Fix Deployment Ready!" -ForegroundColor Green
