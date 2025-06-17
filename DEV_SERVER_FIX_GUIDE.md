# Hướng Dẫn Khắc Phục Lỗi npm run dev

## ✅ **Đã khắc phục thành công!**

Các vấn đề đã được giải quyết:

### 🔧 **Vấn đề gặp phải:**

1. **Syntax Error trong vite**: `result = y\await` - Lỗi cache vite
2. **Missing @mui/icons-material**: Package thiếu cho components
3. **Missing date-fns**: Package thiếu cho một số pages khác

### 🛠️ **Các bước đã thực hiện:**

1. **Xóa cache:**

   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
   npm cache clean --force
   ```

2. **Cập nhật vite:**

   ```powershell
   npm update vite
   ```

3. **Cài đặt packages thiếu:**
   ```powershell
   npm install @mui/icons-material@^6.4.4 --legacy-peer-deps
   npm install date-fns
   ```

### 🚀 **Server hiện đang chạy tại:**

- **Local**: http://localhost:5174/
- **Network**: http://192.168.199.1:5174/

### 📍 **Truy cập trang thống kê gia sư:**

```
http://localhost:5174/tai-khoan/ho-so/thong-ke-tong-hop
```

### ⚠️ **Lưu ý quan trọng:**

- Server đang chạy trên port **5174** thay vì 5173 (do port conflict)
- Cần đăng nhập với tài khoản có role **TUTOR** để truy cập trang thống kê

### 🧪 **Kiểm tra hoạt động:**

1. **Mở browser và truy cập:** http://localhost:5174/
2. **Đăng nhập với tài khoản gia sư**
3. **Vào:** Tài khoản → Hồ sơ → Thống kê tổng hợp
4. **Kiểm tra 3 tabs:**
   - 📊 Thống kê doanh thu
   - 📚 Thống kê lượt thuê
   - ⭐ Thống kê đánh giá

### 🔍 **Nếu gặp lỗi khác:**

**1. Lỗi CORS:**

```javascript
// Kiểm tra trong browser console
// Đảm bảo backend API đang chạy
```

**2. Lỗi API:**

```javascript
// Kiểm tra Network tab trong DevTools
// Verify API endpoints trả về đúng format
```

**3. Lỗi Permission:**

```javascript
// Đảm bảo user có role TUTOR
// Kiểm tra userProfile trong Redux store
```

### 📦 **Dependencies đã cài:**

- ✅ vite (updated)
- ✅ @mui/icons-material@6.4.4
- ✅ date-fns
- ✅ All existing packages

### 🎯 **Tình trạng hiện tại:**

- ✅ Server khởi động thành công
- ✅ No build errors
- ✅ All components compile
- ✅ Ready for testing!

---

**Chúc mừng! Ứng dụng đã sẵn sàng để sử dụng! 🎉**
