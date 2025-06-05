# 🧠 Memory Management & Cache Optimization Guide

## 📋 Tổng quan vấn đề

Khi deploy React app nhiều lần, có thể gặp phải:

- **Memory Leak**: Bộ nhớ không được giải phóng
- **Cache Overflow**: Cache tích tụ quá nhiều
- **Server Overload**: Deploy 2 lần là tràn server
- **Bundle Size**: Các file build quá lớn

## 🔧 Giải pháp đã triển khai

### **1. Vite Configuration Optimization**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          // ... code splitting
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ["@zoom/meetingsdk", "lib-jitsi-meet"],
  },
});
```

### **2. Redux Store Memory Management**

```javascript
// Separate persist configs for different data types
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["profile", "token", "isAuthenticated"], // Only essential data
  version: 1,
};
```

### **3. Multi-stage Docker Build**

```dockerfile
# Multi-stage build giảm image size
FROM node:20-slim AS builder
# ... build process
FROM nginx:alpine AS production
# ... production setup với resource limits
```

### **4. Memory Service**

Tự động quản lý memory và cleanup:

```javascript
import memoryService from "./services/memoryService";

// Đăng ký timer để track
const timerId = setTimeout(() => {}, 1000);
memoryService.registerTimer(timerId);

// Đăng ký event listener để track
memoryService.registerEventListener(element, "click", handler);
```

### **5. Memory Monitor Component**

- **Development**: Hiển thị real-time memory usage
- **Keyboard shortcut**: `Ctrl+Shift+M` để toggle
- **Cleanup button**: Manual garbage collection

## 🚀 Cách sử dụng

### **Development Mode**

```bash
# Chạy với memory monitoring
npm run dev

# Check memory usage
npm run memory:check

# Clean cache
npm run clean:cache
```

### **Production Deployment**

```powershell
# Deploy với memory management
.\deploy.ps1 -Environment production -CleanCache

# Force cleanup nếu có vấn đề
.\deploy.ps1 -ForceCleanup

# Skip build nếu đã build
.\deploy.ps1 -SkipBuild
```

### **Memory Monitoring**

1. **Real-time**: Memory monitor component (Ctrl+Shift+M)
2. **Console**: `memoryService.logMemoryStatus()`
3. **Docker**: Resource limits trong container

## 📊 Memory Optimization Features

### **Automatic Cleanup**

- **Timer Management**: Auto-clear intervals/timeouts
- **Event Listeners**: Track và remove khi không dùng
- **LocalStorage**: Clear expired và corrupted data
- **Browser Cache**: Clear service workers và caches

### **Resource Limits**

- **Docker Memory**: 1GB limit với swap 1.5GB
- **Node.js**: `--max-old-space-size=2048`
- **Nginx Cache**: Auto cleanup mỗi giờ
- **API Rate Limiting**: Prevent abuse

### **Code Splitting**

- **Vendor chunks**: React, Redux, UI libraries riêng
- **Lazy loading**: Tất cả pages đều lazy load
- **Dynamic imports**: Chỉ load khi cần

## 🛠️ Troubleshooting

### **Memory Warning**

```javascript
// Kiểm tra memory usage
const memInfo = memoryService.getMemoryInfo();
console.log(`Memory: ${memInfo.used}/${memInfo.limit}MB`);

// Manual cleanup
memoryService.cleanup();
```

### **High Memory Usage**

1. **Check memory monitor**: Ctrl+Shift+M
2. **Clear cache**: `npm run clean:cache`
3. **Restart containers**: `docker restart container_name`
4. **Force garbage collection**: `memoryService.performGarbageCollection()`

### **Deploy Issues**

```powershell
# Cleanup trước khi deploy
docker system prune -f

# Deploy với force cleanup
.\deploy.ps1 -ForceCleanup

# Monitor memory trong quá trình deploy
Get-Process node | Measure-Object WorkingSet -Sum
```

## 📈 Performance Monitoring

### **Memory Metrics**

- **Used Heap**: Bộ nhớ đang sử dụng
- **Total Heap**: Tổng bộ nhớ allocated
- **Heap Limit**: Giới hạn bộ nhớ V8
- **Warning Threshold**: 80% của limit

### **Cache Metrics**

- **LocalStorage**: Theo dõi kích thước
- **SessionStorage**: Auto-clear on reload
- **Browser Cache**: Expire policies
- **API Cache**: 2-5 phút TTL

### **Build Metrics**

- **Bundle Size**: < 1MB per chunk
- **Gzip Compression**: ~60-70% reduction
- **Code Splitting**: 5-10 chunks tối ưu
- **Tree Shaking**: Remove unused code

## 🔍 Debug Commands

```bash
# Development debugging
npm run dev                    # Start with memory monitoring
npm run build:analyze         # Analyze bundle size
npm run memory:check          # Check current memory

# Production debugging
docker stats container_name    # Container resource usage
docker logs container_name     # Check for memory errors
docker system df              # Disk space usage
```

## ⚠️ Best Practices

### **Development**

1. **Always use memory monitor** trong development
2. **Clean cache thường xuyên** khi debug
3. **Monitor bundle size** khi thêm dependencies
4. **Use lazy loading** cho tất cả pages

### **Production**

1. **Deploy script** luôn dùng resource limits
2. **Monitor memory** sau mỗi deploy
3. **Cleanup old containers** trước deploy mới
4. **Use CDN** cho static assets

### **Code Quality**

1. **Register timers** với memoryService
2. **Cleanup effect dependencies** trong useEffect
3. **Avoid memory leaks** trong event listeners
4. **Use proper prop validation** để tránh re-renders

## 📝 Configuration Files

### **Vite Config**

- ✅ Code splitting configured
- ✅ Dependency optimization
- ✅ Cache directory setup
- ✅ Build size warnings

### **Docker Config**

- ✅ Multi-stage build
- ✅ Resource limits
- ✅ Cache cleanup script
- ✅ Proper signal handling

### **Nginx Config**

- ✅ Gzip compression
- ✅ Cache headers
- ✅ Rate limiting
- ✅ Static file optimization

### **Redux Config**

- ✅ Selective persistence
- ✅ Garbage collection
- ✅ Memory-safe middleware
- ✅ Development-only DevTools

---

## 🎯 Kết quả mong đợi

Sau khi implement toàn bộ hệ thống:

- **Giảm 60-70%** memory usage
- **Giảm 50%** bundle size
- **Tăng 30-40%** performance
- **Zero memory leaks** trong production
- **Stable deployment** không bị crash server

---

_Cập nhật: June 2025 - Memory Management System v1.0_
