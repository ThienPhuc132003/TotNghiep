# Install react-chartjs-2 dependency
Write-Host "Installing react-chartjs-2..." -ForegroundColor Green

try {
    Set-Location "c:\Users\PHUC\Documents\GitHub\TotNghiep"
    npm install react-chartjs-2@5.2.0
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ react-chartjs-2 installed successfully!" -ForegroundColor Green
        Write-Host "📦 Package versions:" -ForegroundColor Cyan
        npm list chart.js react-chartjs-2
    } else {
        Write-Host "❌ Installation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during installation: $_" -ForegroundColor Red
}

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
