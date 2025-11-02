# HƯỚNG DẪN CHẠY ADTOOL PRO TRÊN CONSOLE

## ⚠️ LỖI CORS VÀ GIẢI PHÁP

**Vấn đề**: Facebook Business Manager chặn việc tải script từ GitHub raw do chính sách bảo mật (CORS).

**Giải pháp**: Sử dụng localStorage để lưu trữ script locally.

## Cách 1: Chạy trực tiếp từ Console (Khuyến nghị)

### Bước 1: Mở Console trên Facebook

1. Vào Facebook Business Manager
2. Nhấn `F12` hoặc `Ctrl+Shift+I` để mở Developer Tools
3. Chọn tab **Console**

### Bước 2: Copy và Paste Code

```javascript
// Copy toàn bộ nội dung từ file AdTool_Pro_Combined.js
// Paste vào console và nhấn Enter
```

### Bước 3: Chạy Tool

```javascript
// Gọi hàm khởi động
startAdToolPro();
```

## Cách 2: Sử dụng Bookmarklet với localStorage

### Bước 1: Tạo Bookmark mới

1. Nhấn `Ctrl+D` để bookmark trang hiện tại
2. Đổi tên bookmark thành "AdTool Pro"
3. Thay đổi URL thành nội dung từ file `AdTool_Pro_Bookmarklet_No_CORS.js`

### Bước 2: Cài đặt script

1. Copy nội dung file `AdTool_Pro_Combined.js`
2. Paste vào console và nhấn Enter
3. Script sẽ được lưu vào localStorage

### Bước 3: Sử dụng

- Vào Facebook Business Manager
- Click bookmark "AdTool Pro"
- Tool sẽ tự động chạy từ localStorage

## Cách 3: Sử dụng Tampermonkey (Chuyên nghiệp)

### Bước 1: Cài đặt Tampermonkey

1. Tải Tampermonkey từ Chrome Web Store
2. Cài đặt extension

### Bước 2: Tạo Script mới

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

  // Kiểm tra xem script đã được lưu chưa
  if (!localStorage.getItem("AdToolProScript")) {
    console.log(
      "Vui lòng paste nội dung AdTool_Pro_Combined.js vào console trước"
    );
    return;
  }

  // Load script từ localStorage
  try {
    eval(localStorage.getItem("AdToolProScript"));
    if (typeof startAdToolPro === "function") {
      startAdToolPro();
    }
  } catch (error) {
    console.error("Lỗi khi chạy AdTool Pro:", error);
  }
})();
```

## Cách 4: Sử dụng Extension (Nâng cao)

### Tạo Extension đơn giản:

1. Tạo thư mục `extension/`
2. Tạo file `manifest.json`:

```json
{
  "manifest_version": 2,
  "name": "AdTool Pro",
  "version": "1.0",
  "description": "AdTool Pro - Split Ad Account from BM & Reactivate Ad Account",
  "permissions": ["activeTab", "storage"],
  "content_scripts": [
    {
      "matches": ["https://business.facebook.com/*"],
      "js": ["content.js"]
    }
  ]
}
```

3. Tạo file `content.js`:

```javascript
// Load script từ storage
chrome.storage.local.get(["AdToolProScript"], function (result) {
  if (result.AdToolProScript) {
    eval(result.AdToolProScript);
    if (typeof startAdToolPro === "function") {
      startAdToolPro();
    }
  }
});
```

## Cách 5: Sử dụng CDN (Nếu có)

### Nếu bạn có CDN:

```javascript
// Load từ CDN
var script = document.createElement("script");
script.src =
  "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/AdTool_Pro_Combined.js";
document.head.appendChild(script);

script.onload = function () {
  startAdToolPro();
};
```

## 🔧 Hướng dẫn chi tiết cho người mới

### Lần đầu sử dụng:

1. **Tải script**:

   ```javascript
   // Copy toàn bộ nội dung file AdTool_Pro_Combined.js
   // Paste vào console và nhấn Enter
   ```

2. **Lưu script** (tùy chọn):

   ```javascript
   // Lưu script vào localStorage để dùng lần sau
   localStorage.setItem("AdToolProScript", "NỘI_DUNG_SCRIPT_Ở_ĐÂY");
   ```

3. **Chạy tool**:
   ```javascript
   startAdToolPro();
   ```

### Lần sau sử dụng:

1. **Nếu đã lưu localStorage**:

   ```javascript
   // Chạy trực tiếp
   eval(localStorage.getItem("AdToolProScript"));
   startAdToolPro();
   ```

2. **Nếu chưa lưu**:
   - Làm lại bước 1 của "Lần đầu sử dụng"

## 🐛 Troubleshooting

### Lỗi CORS

**Triệu chứng**: "Refused to connect to 'https://raw.githubusercontent.com/...'"

**Giải pháp**:

- Sử dụng localStorage thay vì fetch từ GitHub
- Hoặc dùng Tampermonkey
- Hoặc host file trên CDN

### Lỗi "Không tìm thấy hàm startAdToolPro"

**Nguyên nhân**: Script chưa được load đúng cách

**Giải pháp**:

```javascript
// Kiểm tra script đã load chưa
console.log("Script loaded:", typeof startAdToolPro);

// Nếu chưa, load lại
if (localStorage.getItem("AdToolProScript")) {
  eval(localStorage.getItem("AdToolProScript"));
}
```

### Lỗi localStorage

**Triệu chứng**: "localStorage is not available"

**Giải pháp**:

- Sử dụng cách 1 (paste trực tiếp vào console)
- Hoặc dùng Tampermonkey

## 📋 Checklist sử dụng

### Trước khi chạy:

- [ ] Đã copy nội dung AdTool_Pro_Combined.js
- [ ] Đã paste vào console
- [ ] Không có lỗi trong console
- [ ] Đã vào Facebook Business Manager

### Khi chạy:

- [ ] Tool hiển thị giao diện
- [ ] Không có lỗi JavaScript
- [ ] Các chức năng hoạt động bình thường

### Sau khi chạy:

- [ ] Lưu script vào localStorage (nếu muốn)
- [ ] Kiểm tra kết quả
- [ ] Dọn dẹp console nếu cần

## Khuyến nghị:

- **Cách 1 (Console)**: Đơn giản, nhanh, không bị lỗi CORS
- **Cách 2 (Bookmarklet)**: Tiện lợi sau khi setup
- **Cách 3 (Tampermonkey)**: Chuyên nghiệp, ổn định
- **Cách 4 (Extension)**: Phù hợp cho team lớn
