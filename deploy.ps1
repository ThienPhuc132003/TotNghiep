# Deploy script for DAKL Frontend
Write-Host "=== DAKL Frontend Deploy Script ===" -ForegroundColor Green

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker ps | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
if (-not (Test-DockerRunning)) {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    
    # Try to start Docker Desktop
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "Waiting for Docker to start (this may take a few minutes)..." -ForegroundColor Yellow
        
        # Wait for Docker to start (max 60 seconds)
        $timeout = 60
        $elapsed = 0
        while (-not (Test-DockerRunning) -and $elapsed -lt $timeout) {
            Start-Sleep -Seconds 5
            $elapsed += 5
            Write-Host "." -NoNewline
        }
        Write-Host ""
        
        if (-not (Test-DockerRunning)) {
            Write-Host "Docker failed to start within $timeout seconds. Please start Docker Desktop manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Docker Desktop not found at expected path. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Docker is running!" -ForegroundColor Green

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Clean up old images (optional)
Write-Host "Cleaning up old Docker resources..." -ForegroundColor Yellow
docker system prune -f

# Build and start the application
Write-Host "Building and starting the application..." -ForegroundColor Yellow
docker-compose up --build -d

# Check if the container is running
Write-Host "Checking deployment status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$container = docker ps --filter "name=DAKLFE" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
if ($container) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host $container
    Write-Host "Application is available at: http://localhost:4590" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed. Checking logs..." -ForegroundColor Red
    docker-compose logs
}

Write-Host "Deploy script completed." -ForegroundColor Green
