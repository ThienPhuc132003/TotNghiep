# 🚀 Deployment Troubleshooting Guide

## 📋 Các lỗi đã sửa trong CI/CD Pipeline

### ❌ **Lỗi cũ**

1. **Vite not found**: `sh: 1: vite: not found`
2. **Build script failed**: `exit code: 127`
3. **Git commit info missing**: `failed to read current commit information`
4. **NPM version warnings**: Outdated npm version

### ✅ **Giải pháp đã áp dụng**

#### 1. **Sửa Dockerfile**

```dockerfile
# ✅ Cài đặt đầy đủ dependencies (bao gồm devDependencies)
RUN npm ci --silent

# ✅ Cài đặt git cho commit info
RUN apt-get update && apt-get install -y git

# ✅ Copy .git directory (không ignore trong .dockerignore)
COPY . .
```

#### 2. **Cập nhật CI/CD Pipeline**

```yaml
# ✅ Fetch full git history
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

# ✅ Setup Node.js 20 với cache
- uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"

# ✅ Verify Vite before build
- name: Verify Vite installation
  run: |
    npx vite --version
    npm ls vite

# ✅ Use production build script
- name: Build project
  run: npm run build:production
```

#### 3. **Package.json Scripts**

```json
{
  "scripts": {
    "build:production": "cross-env NODE_ENV=production NODE_OPTIONS=\"--max-old-space-size=2048\" vite build --mode production"
  }
}
```

## 🔧 **Testing Deploy Local**

### Test Dockerfile

```powershell
# Build image locally
docker build -t frontend-test .

# Run container
docker run -p 3000:80 frontend-test

# Test at http://localhost:3000
```

### Test CI/CD Steps

```powershell
# 1. Install dependencies
npm ci

# 2. Verify Vite
npx vite --version

# 3. Build production
npm run build:production

# 4. Check build output
ls -la dist/
```

## 🚨 **Common Issues & Solutions**

### Issue: "vite: not found"

**Solution**: Make sure `npm ci` includes devDependencies

```dockerfile
# ❌ Wrong
RUN npm ci --only=production

# ✅ Correct
RUN npm ci
```

### Issue: "Git not found"

**Solution**: Install git in Dockerfile

```dockerfile
RUN apt-get update && apt-get install -y git
```

### Issue: "No commit info"

**Solution**:

1. Fetch full git history in CI/CD
2. Don't ignore .git in .dockerignore
3. Copy .git directory to container

### Issue: "Build fails in Docker"

**Solution**: Use production build script with memory optimization

```json
"build:production": "cross-env NODE_ENV=production NODE_OPTIONS=\"--max-old-space-size=2048\" vite build --mode production"
```

## 📊 **Deployment Checklist**

- [ ] ✅ Git history available (`fetch-depth: 0`)
- [ ] ✅ Node.js 20 setup with cache
- [ ] ✅ All dependencies installed (`npm ci`)
- [ ] ✅ Vite available (`npx vite --version`)
- [ ] ✅ Production build works (`npm run build:production`)
- [ ] ✅ Git installed in Docker
- [ ] ✅ .git directory copied
- [ ] ✅ Updated action versions
- [ ] ✅ Improved error handling
- [ ] ✅ Container cleanup before deploy

## 🎯 **Expected Results**

After these fixes:

- ✅ No more "vite: not found" errors
- ✅ Successful builds with commit information
- ✅ Faster deployment with proper caching
- ✅ Better error reporting
- ✅ More stable Docker builds

---

_Last updated: June 2025 - Deploy Fix v1.0_
