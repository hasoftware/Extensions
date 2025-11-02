# HƯỚNG DẪN SỬA LỖI BỐ CỤC QR CODE

## Vấn đề hiện tại:

- Khi thêm 2 ảnh QR code từ base64, bố cục giao diện bị thay đổi
- Ảnh QR code có kích thước cố định không responsive
- Container không thích ứng với màn hình nhỏ

## Cách sửa:

### Bước 1: Thay thế CSS

Tìm và thay thế phần CSS từ dòng 519-580 trong file `AdTool_Pro_Combined.js` bằng nội dung từ file `qr_code_fix.css`

### Bước 2: Xoá CSS cũ (dòng 581-590)

Xoá phần CSS này:

```css
.adtool-pro-qr-placeholder {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.adtool-pro-qr-placeholder:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}
```

### Bước 3: Thay thế HTML

Tìm và thay thế phần HTML từ dòng 590-620 trong file `AdTool_Pro_Combined.js` bằng nội dung từ file `qr_code_template_clean.html`

### Bước 4: Thay thế base64 QR code

Thay thế các placeholder sau trong template:

- `YOUR_QR_CODE_1_BASE64` → Base64 của QR code Zalo 1
- `YOUR_QR_CODE_2_BASE64` → Base64 của QR code Zalo 2
- `YOUR_QR_CODE_3_BASE64` → Base64 của QR code Telegram 1
- `YOUR_QR_CODE_4_BASE64` → Base64 của QR code Telegram 2

## Các cải tiến:

1. **Responsive design**: Tự động điều chỉnh theo màn hình
2. **Flexible layout**: Sử dụng flexbox với wrap
3. **Mobile friendly**: Tối ưu cho màn hình nhỏ
4. **Hover effects**: Hiệu ứng khi hover vào QR code
5. **Better spacing**: Khoảng cách hợp lý giữa các phần tử
6. **Clean design**: Không có text ủng hộ, giao diện sạch sẽ

## Lưu ý:

- Backup file gốc trước khi sửa
- Test trên nhiều kích thước màn hình
- Đảm bảo base64 QR code hợp lệ
