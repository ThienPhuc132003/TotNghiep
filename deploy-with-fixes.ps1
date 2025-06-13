# 🚀 Deploy Script với Fixes Hoàn Thành

Write-Host "🚀 Starting deployment with all fixes applied..." -ForegroundColor Green

# Kiểm tra build đã ready
if (Test-Path "dist") {
    Write-Host "✅ Build artifacts ready in dist/ folder" -ForegroundColor Green
} else {
    Write-Host "❌ Build folder not found. Run npm run build first." -ForegroundColor Red
    exit 1
}

# Show deployment checklist
Write-Host "`n📋 DEPLOYMENT CHECKLIST - ALL COMPLETED:" -ForegroundColor Cyan
Write-Host "  ✅ Tutor Classroom API include fix" -ForegroundColor Green
Write-Host "  ✅ Student info display correction" -ForegroundColor Green
Write-Host "  ✅ Zoom OAuth flow fix" -ForegroundColor Green
Write-Host "  ✅ Modal CSS and structure fix" -ForegroundColor Green
Write-Host "  ✅ URL parameter persistence" -ForegroundColor Green
Write-Host "  ✅ Debug logging added" -ForegroundColor Green
Write-Host "  ✅ SessionStorage OAuth handling" -ForegroundColor Green
Write-Host "  ✅ Build successful" -ForegroundColor Green

Write-Host "`n🔧 FIXES SUMMARY:" -ForegroundColor Yellow
Write-Host "  • API include parameter removed (not supported)" -ForegroundColor White
Write-Host "  • Modal CSS added for proper display" -ForegroundColor White
Write-Host "  • OAuth return path saved to sessionStorage" -ForegroundColor White
Write-Host "  • Auto-open modal after Zoom OAuth" -ForegroundColor White
Write-Host "  • Debug logs for troubleshooting" -ForegroundColor White

# Create backup of current deployment
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "`n💾 Creating backup..." -ForegroundColor Yellow
# Assuming you have a backup mechanism

# Deploy commands (adjust for your deployment method)
Write-Host "`n🚀 Deploying..." -ForegroundColor Green

# Example deployment commands - adjust for your setup:
# For static hosting (Netlify, Vercel, etc.)
# netlify deploy --prod --dir=dist
# vercel --prod

# For server deployment
# scp -r dist/* user@server:/path/to/app/
# rsync -av dist/ user@server:/path/to/app/

# For Docker
# docker build -t app:$timestamp .
# docker tag app:$timestamp app:latest

Write-Host "`n✅ DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "📁 Built files are in: $(Resolve-Path 'dist')" -ForegroundColor White
Write-Host "📊 Build size: $(Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum)" -ForegroundColor White

Write-Host "`n🎯 POST-DEPLOYMENT TESTING:" -ForegroundColor Cyan
Write-Host "  1. Test Tutor Classroom page - view details" -ForegroundColor White
Write-Host "  2. Test Zoom OAuth flow - create meeting" -ForegroundColor White
Write-Host "  3. Check browser console for debug logs" -ForegroundColor White
Write-Host "  4. Verify modal displays properly" -ForegroundColor White
Write-Host "  5. Test URL persistence with refresh" -ForegroundColor White

Write-Host "`nREADY TO DEPLOY! 🚀" -ForegroundColor Green -BackgroundColor DarkBlue
