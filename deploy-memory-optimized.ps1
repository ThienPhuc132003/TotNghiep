# Memory-Optimized Deployment Script
# This script addresses the 50MB memory limit issue

Write-Host "🚀 Starting Memory-Optimized Deployment..." -ForegroundColor Green

# Step 1: Clean everything to free up space
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
npm run clean:all
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }

# Step 2: Set memory limits
$env:NODE_OPTIONS = "--max-old-space-size=3072"
$env:GENERATE_SOURCEMAP = "false"
$env:NODE_ENV = "production"

Write-Host "📦 Building with memory optimization..." -ForegroundColor Yellow

# Step 3: Build with memory monitoring
$buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build:memory" -NoNewWindow -PassThru -Wait

if ($buildProcess.ExitCode -ne 0) {
    Write-Error "❌ Build failed!"
    exit 1
}

# Step 4: Check build size
$distSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
Write-Host "📊 Build size: $distSizeMB MB" -ForegroundColor Cyan

# Step 5: Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker stop DAKLFE 2>$null
docker rm DAKLFE 2>$null

# Step 6: Build and deploy with proper memory limits
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t dakl-fe:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Docker build failed!"
    exit 1
}

# Step 7: Run with updated memory limits
Write-Host "🚀 Starting container with 512MB memory..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Container start failed!"
    exit 1
}

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Application running at: http://localhost:4590" -ForegroundColor Cyan

# Step 8: Show container stats
Write-Host "📊 Container Stats:" -ForegroundColor Yellow
docker stats DAKLFE --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
