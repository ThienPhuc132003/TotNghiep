# Enhanced Deploy Script with Memory Management
# PowerShell script for safe deployment

param(
    [string]$Environment = "production",
    [switch]$CleanCache = $false,
    [switch]$SkipBuild = $false,
    [switch]$ForceCleanup = $false
)

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Function to check memory usage
function Check-MemoryUsage {
    $memory = Get-Process -Name "node" -ErrorAction SilentlyContinue | Measure-Object WorkingSet -Sum
    if ($memory.Sum) {
        $memoryMB = [math]::Round($memory.Sum / 1MB, 2)
        Write-Host "Current Node.js Memory Usage: $memoryMB MB" -ForegroundColor Cyan
        
        if ($memoryMB -gt 2048) {
            Write-Warning "High memory usage detected! Consider restarting Node processes."
            return $false
        }
    }
    return $true
}

# Function to cleanup old deployments
function Cleanup-OldDeployments {
    Write-Host "🧹 Cleaning up old deployments..." -ForegroundColor Yellow
    
    # Stop existing containers
    docker ps -q --filter "ancestor=my-app" | ForEach-Object {
        Write-Host "Stopping container: $_"
        docker stop $_
        docker rm $_
    }
    
    # Remove old images (keep last 2)
    $oldImages = docker images my-app -q | Select-Object -Skip 2
    if ($oldImages) {
        Write-Host "Removing old images..."
        $oldImages | ForEach-Object { docker rmi $_ -f }
    }
    
    # Clean Docker system
    docker system prune -f
    
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
}

# Function to prepare build environment
function Prepare-BuildEnvironment {
    Write-Host "🛠️ Preparing build environment..." -ForegroundColor Yellow
    
    # Check if cleanup is needed
    if ($CleanCache -or $ForceCleanup) {
        Write-Host "Cleaning cache and node_modules..."
        npm run clean
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        npm install --silent
    }
    
    # Set memory limits
    $env:NODE_OPTIONS = "--max-old-space-size=2048"
    $env:NODE_ENV = $Environment
    
    # Check memory before build
    if (-not (Check-MemoryUsage)) {
        Write-Error "Memory usage too high! Aborting deployment."
        exit 1
    }
}

# Function to build application
function Build-Application {
    if ($SkipBuild) {
        Write-Host "⏭️ Skipping build process" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    
    # Run prebuild cleanup
    npm run prebuild
    
    # Build with memory monitoring
    $buildJob = Start-Job -ScriptBlock {
        npm run build
    }
    
    # Monitor build process
    do {
        Start-Sleep -Seconds 5
        $memory = Get-Process -Name "node" -ErrorAction SilentlyContinue | Measure-Object WorkingSet -Sum
        if ($memory.Sum) {
            $memoryMB = [math]::Round($memory.Sum / 1MB, 2)
            Write-Host "Build Memory Usage: $memoryMB MB" -ForegroundColor Cyan
            
            if ($memoryMB -gt 3072) {
                Write-Warning "Build process using too much memory!"
                Stop-Job $buildJob
                Remove-Job $buildJob
                throw "Build aborted due to high memory usage"
            }
        }
    } while ($buildJob.State -eq "Running")
    
    # Check build result
    $buildResult = Receive-Job $buildJob
    Remove-Job $buildJob
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit 1
    }
    
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}

# Function to deploy with Docker
function Deploy-WithDocker {
    Write-Host "🐳 Deploying with Docker..." -ForegroundColor Yellow
    
    # Build Docker image
    Write-Host "Building Docker image..."
    docker build -t my-app:latest -t my-app:$(Get-Date -Format "yyyyMMdd-HHmmss") .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed!"
        exit 1
    }
    
    # Run container with resource limits
    Write-Host "Starting container with resource limits..."
    docker run -d `
        --name "my-app-$(Get-Date -Format "yyyyMMdd-HHmmss")" `
        --memory="1g" `
        --memory-swap="1.5g" `
        --cpus="1.0" `
        --restart=unless-stopped `
        -p 80:80 `
        my-app:latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Container start failed!"
        exit 1
    }
    
    Write-Host "✅ Docker deployment completed" -ForegroundColor Green
}

# Function to verify deployment
function Verify-Deployment {
    Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
    
    # Wait for service to start
    Start-Sleep -Seconds 10
    
    # Check if container is running
    $containerStatus = docker ps --filter "ancestor=my-app:latest" --format "table {{.Status}}"
    
    if ($containerStatus -like "*Up*") {
        Write-Host "✅ Container is running" -ForegroundColor Green
        
        # Test HTTP endpoint
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/nginx-status" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Application is responding" -ForegroundColor Green
            }
        } catch {
            Write-Warning "Application may not be fully ready yet"
        }
    } else {
        Write-Error "Container is not running!"
        exit 1
    }
}

# Main deployment process
try {
    # Step 1: Cleanup old deployments
    Cleanup-OldDeployments
    
    # Step 2: Prepare environment
    Prepare-BuildEnvironment
    
    # Step 3: Build application
    Build-Application
    
    # Step 4: Deploy
    Deploy-WithDocker
    
    # Step 5: Verify
    Verify-Deployment
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Application available at: http://localhost" -ForegroundColor Cyan
    
    # Final memory check
    Check-MemoryUsage
    
} catch {
    Write-Error "Deployment failed: $_"
    
    # Cleanup on failure
    Write-Host "🧹 Cleaning up failed deployment..." -ForegroundColor Red
    docker ps -q --filter "ancestor=my-app" | ForEach-Object {
        docker stop $_
        docker rm $_
    }
    
    exit 1
}

Write-Host "📝 Deployment completed at: $(Get-Date)" -ForegroundColor Green