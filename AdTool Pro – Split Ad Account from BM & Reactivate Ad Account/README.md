# �� AdTool Pro - Split Ad Account from BM & Reactivate Ad Account

> **Công cụ tự động hóa quản lý tài khoản quảng cáo Facebook Business Manager**

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Facebook](https://img.shields.io/badge/Facebook-Business%20Manager-blue.svg)](https://business.facebook.com)

## 📋 Mô tả

AdTool Pro là một công cụ mạnh mẽ giúp tự động hóa các tác vụ quản lý tài khoản quảng cáo trong Facebook Business Manager. Tool được thiết kế với giao diện thân thiện và các tính năng tự động hóa tiên tiến.

## ✨ Tính năng chính

### 🔧 **Tách tài khoản quảng cáo khỏi Business Manager**

- Tự động tách nhiều tài khoản quảng cáo cùng lúc
- Xử lý song song để tăng tốc độ
- Theo dõi tiến trình real-time
- Xử lý lỗi thông minh

### 🔄 **Kích hoạt lại tài khoản quảng cáo**

- Kích hoạt hàng loạt tài khoản bị vô hiệu hóa
- Tự động xử lý các bước kích hoạt
- Báo cáo chi tiết kết quả

### 🏷️ **Đổi tên tài khoản quảng cáo**

- Đổi tên hàng loạt theo pattern
- Tự động thêm prefix/suffix
- Xử lý tên trùng lặp

### 👥 **Quản lý quyền admin**

- Xóa admin khỏi tài khoản quảng cáo
- Xóa analysts và các role khác
- Bảo mật tài khoản cá nhân

### 📊 **Giao diện thân thiện**

- Dashboard trực quan
- Theo dõi tiến trình real-time
- Thông báo kết quả chi tiết
- Responsive design

## 🚀 Cách sử dụng

### Phương pháp 1: Bookmarklet (Khuyến nghị)

1. **Tạo bookmark mới**
   - Nhấn `Ctrl+D` để bookmark trang hiện tại
   - Đổi tên thành "AdTool Pro"
   - Thay đổi URL thành:

```javascript
javascript: (function () {
  var script = document.createElement("script");
  script.src =
    "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/AdTool_Pro_Combined.js";
  document.head.appendChild(script);
  script.onload = function () {
    startAdToolPro();
  };
})();
```

2. **Sử dụng**
   - Vào [Facebook Business Manager](https://business.facebook.com)
   - Click bookmark "AdTool Pro"
   - Tool sẽ tự động khởi động

### Phương pháp 2: Console trực tiếp

1. **Mở Developer Tools**

   - Vào Facebook Business Manager
   - Nhấn `F12` hoặc `Ctrl+Shift+I`
   - Chọn tab **Console**

2. **Chạy tool**

```javascript
fetch(
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/AdTool_Pro_Combined.js"
)
  .then((response) => response.text())
  .then((code) => {
    eval(code);
    startAdToolPro();
  });
```

### Phương pháp 3: Tampermonkey

1. **Cài đặt Tampermonkey**

   - Tải từ [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. **Tạo script mới**

```javascript
// ==UserScript==
// @name         AdTool Pro
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  AdTool Pro - Split Ad Account from BM & Reactivate Ad Account
// @author       Your Name
// @match        https://business.facebook.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  var script = document.createElement("script");
  script.src =
    "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/AdTool_Pro_Combined.js";
  document.head.appendChild(script);
  script.onload = function () {
    if (typeof startAdToolPro === "function") {
      startAdToolPro();
    }
  };
})();
```

## 🛠️ Hướng dẫn sử dụng chi tiết

### 1. **Tách tài khoản quảng cáo**

1. Mở tool và chọn tab **"Tách tài khoản"**
2. Nhập Business ID cần tách
3. Chọn tài khoản quảng cáo muốn tách
4. Click **"Bắt đầu tách"**
5. Theo dõi tiến trình và kết quả

### 2. **Kích hoạt tài khoản**

1. Chọn tab **"Kích hoạt tài khoản"**
2. Nhập danh sách tài khoản cần kích hoạt
3. Click **"Bắt đầu kích hoạt"**
4. Đợi quá trình hoàn tất

### 3. **Đổi tên tài khoản**

1. Chọn tab **"Đổi tên tài khoản"**
2. Nhập pattern tên mới
3. Chọn tài khoản cần đổi tên
4. Click **"Bắt đầu đổi tên"**

### 4. **Xóa admin**

1. Chọn tab **"Xóa admin"**
2. Chọn tài khoản cần xóa admin
3. Click **"Bắt đầu xóa"**

## ⚙️ Cấu hình

### Cài đặt cơ bản

- **Delay giữa các request**: 1000-3000ms (khuyến nghị)
- **Số lượng xử lý song song**: 1-5 tài khoản
- **Timeout**: 30-60 giây

### Cài đặt nâng cao

- **Retry failed requests**: 3 lần
- **Log level**: INFO/DEBUG/ERROR
- **Auto save settings**: Bật/Tắt

## 🔒 Bảo mật

- ✅ Chỉ chạy trên Facebook Business Manager
- ✅ Không lưu trữ thông tin nhạy cảm
- ✅ Xác thực quyền truy cập
- ✅ Mã hóa dữ liệu local

## ⚠️ Lưu ý quan trọng

### Trước khi sử dụng

- **Backup dữ liệu**: Sao lưu thông tin quan trọng
- **Kiểm tra quyền**: Đảm bảo có quyền admin
- **Test nhỏ**: Thử nghiệm với 1-2 tài khoản trước

### Trong quá trình sử dụng

- **Không refresh trang**: Tránh làm gián đoạn quá trình
- **Theo dõi tiến trình**: Quan sát log để phát hiện lỗi
- **Xử lý lỗi**: Dừng tool nếu có lỗi nghiêm trọng

### Sau khi sử dụng

- **Kiểm tra kết quả**: Xác nhận các thay đổi
- **Lưu log**: Ghi lại kết quả để tham khảo
- **Dọn dẹp**: Xóa cache và dữ liệu tạm

## 🐛 Troubleshooting

### Lỗi thường gặp

**"Không thể tải AdTool Pro"**

```javascript
// Kiểm tra URL GitHub
console.log("Kiểm tra URL:", script.src);
```

**"Không tìm thấy hàm startAdToolPro"**

```javascript
// Kiểm tra script đã load chưa
console.log("Script loaded:", typeof startAdToolPro);
```

**"Lỗi CORS"**

- Sử dụng Tampermonkey thay vì bookmarklet
- Hoặc host file trên CDN

### Debug mode

```javascript
// Bật debug mode
localStorage.setItem("adtool_debug", "true");
```

## 📞 Hỗ trợ

### Liên hệ hỗ trợ

- **Zalo**: Quét mã QR trong tool
- **Telegram**: Quét mã QR trong tool
- **Email**: [your-email@domain.com]

### Báo cáo lỗi

1. Mô tả lỗi chi tiết
2. Cung cấp log lỗi
3. Screenshot nếu có thể
4. Thông tin môi trường

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📈 Changelog

### Version 1.0

- ✅ Tách tài khoản quảng cáo
- ✅ Kích hoạt tài khoản
- ✅ Đổi tên tài khoản
- ✅ Xóa admin
- ✅ Giao diện responsive
- ✅ Xử lý lỗi thông minh

---

**⭐ Nếu tool hữu ích, hãy cho một star nhé!**
