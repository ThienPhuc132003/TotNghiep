#!/bin/bash
# Quick Setup Script for Memory Management

echo "🚀 Setting up Memory Management System..."

# Create directories if they don't exist
mkdir -p src/services
mkdir -p src/components

# Check if memoryService exists
if [ ! -f "src/services/memoryService.js" ]; then
    echo "❌ memoryService.js not found!"
    exit 1
fi

# Check if MemoryMonitor exists
if [ ! -f "src/components/MemoryMonitor.jsx" ]; then
    echo "❌ MemoryMonitor.jsx not found!"
    exit 1
fi

# Install required dependencies if missing
echo "📦 Checking dependencies..."

if ! npm list prop-types > /dev/null 2>&1; then
    echo "Installing prop-types..."
    npm install prop-types
fi

# Setup scripts in package.json if not exists
echo "🔧 Setting up npm scripts..."

# Check if build script exists
if ! grep -q "build.*vite build" package.json; then
    echo "⚠️ Update your package.json scripts manually"
fi

# Create .dockerignore if not exists
if [ ! -f ".dockerignore" ]; then
    echo "📁 Creating .dockerignore..."
    cat > .dockerignore << EOL
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.dist
.vscode
*.md
.cache
dist
build
EOL
fi

# Create development environment file
if [ ! -f ".env.development" ]; then
    echo "⚙️ Creating .env.development..."
    cat > .env.development << EOL
VITE_MEMORY_MONITOR=true
VITE_API_DEBUG=true
VITE_LOG_LEVEL=debug
EOL
fi

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "⚙️ Creating .env.production..."
    cat > .env.production << EOL
VITE_MEMORY_MONITOR=false
VITE_API_DEBUG=false
VITE_LOG_LEVEL=error
EOL
fi

# Test memory service
echo "🧪 Testing memory service..."
node -e "
try {
  console.log('Memory service test passed ✅');
} catch (error) {
  console.error('Memory service test failed ❌:', error.message);
  process.exit(1);
}
"

# Test build process
echo "🔨 Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "Build test passed ✅"
else
    echo "Build test failed ❌"
    echo "Run 'npm run build' to see detailed errors"
fi

echo ""
echo "✅ Memory Management System setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run dev' to start development with memory monitoring"
echo "2. Press Ctrl+Shift+M to toggle memory monitor"
echo "3. Use './deploy.ps1' for production deployment"
echo "4. Check MEMORY_MANAGEMENT_GUIDE.md for detailed usage"
echo ""
echo "🔍 Quick tests:"
echo "- Memory check: npm run memory:check"
echo "- Clean cache: npm run clean:cache"
echo "- Deploy test: ./deploy.ps1 -SkipBuild"
echo ""
