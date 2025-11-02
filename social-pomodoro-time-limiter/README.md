# Social Pomodoro Time Limiter - Chrome Extension

Chrome Extension giúp bạn giới hạn thời gian sử dụng mạng xã hội bằng phương pháp Pomodoro.

## Tính năng

- **Pomodoro Timer**: Quản lý thời gian làm việc và nghỉ ngơi theo phương pháp Pomodoro
- **Giới hạn thời gian mạng xã hội**: Theo dõi và giới hạn thời gian sử dụng Facebook, Instagram, Twitter, TikTok
- **Cảnh báo**: Thông báo khi bạn gần hết thời gian sử dụng
- **Tự động chặn**: Chặn truy cập mạng xã hội khi hết thời gian hoặc trong thời gian nghỉ Pomodoro
- **Tùy chỉnh**: Cài đặt thời gian Pomodoro, thời gian nghỉ, và thời gian tối đa cho mỗi mạng xã hội

## Cài đặt

### Cách 1: Cài đặt từ file (Development Mode)

1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật chế độ "Developer mode" ở góc trên bên phải
3. Nhấn "Load unpacked"
4. Chọn thư mục chứa extension này
5. Extension sẽ được cài đặt và hiển thị trong danh sách extensions

## Sử dụng

### Cài đặt ban đầu

1. Click vào icon extension trên thanh công cụ Chrome
2. Popup sẽ hiển thị các tùy chọn:
   - **Pomodoro Timer**: Đặt thời gian làm việc (mặc định: 25 phút) và thời gian nghỉ (mặc định: 5 phút)
   - **Giới hạn thời gian**: Đặt thời gian tối đa sử dụng mỗi mạng xã hội trong ngày (mặc định: 60 phút/ngày)
   - **Cài đặt chung**: Đặt thời gian nghỉ sau khi hết thời gian và thời gian cảnh báo trước

### Pomodoro Timer

- Pomodoro timer sẽ tự động bắt đầu khi bạn cài đặt extension
- Trong thời gian làm việc (work): Bạn có thể sử dụng mạng xã hội theo giới hạn đã đặt
- Trong thời gian nghỉ (break): Tất cả mạng xã hội sẽ bị chặn

### Giới hạn thời gian mạng xã hội

- Extension tự động theo dõi thời gian bạn sử dụng mỗi mạng xã hội
- Khi gần hết thời gian (theo cài đặt cảnh báo), bạn sẽ nhận được thông báo
- Khi hết thời gian, trang mạng xã hội sẽ bị chặn và hiển thị trang "Hết thời gian sử dụng"
- Sau thời gian nghỉ (theo cài đặt), bạn có thể sử dụng lại

### Reset

- **Reset Pomodoro**: Bắt đầu lại Pomodoro timer từ đầu
- **Reset thời gian hôm nay**: Xóa thời gian sử dụng trong ngày (sẽ tự động reset vào ngày mới)

## Các mạng xã hội được hỗ trợ

- Facebook (facebook.com)
- Instagram (instagram.com)
- Twitter/X (twitter.com, x.com)
- TikTok (tiktok.com)

## Cấu trúc thư mục

```
social-media-time-limiter-extension/
├── manifest.json          # Cấu hình extension
├── background.js          # Quản lý logic Pomodoro và giới hạn thời gian
├── popup.html             # Giao diện popup
├── popup.js               # Logic điều khiển popup
├── content.js             # Quản lý hành động trên trang mạng xã hội
├── blocked.html           # Trang hiển thị khi bị chặn
├── style.css              # CSS cho giao diện
└── README.md              # File này
```

## Quyền sử dụng

Extension yêu cầu các quyền sau:

- `tabs`: Để theo dõi các tab đang mở
- `webNavigation`: Để theo dõi sự kiện duyệt web
- `notifications`: Để gửi thông báo cảnh báo
- `storage`: Để lưu trữ cài đặt và thống kê
- `activeTab`: Để truy cập tab hiện tại

## Phát triển

Extension được phát triển bằng:

- Manifest V3
- Vanilla JavaScript (không dùng framework)
- Chrome Extensions API

## Lưu ý

- Extension tự động reset thời gian sử dụng hàng ngày vào lúc 0:00
- Khi extension bị tắt, Pomodoro timer sẽ được lưu và tiếp tục khi bạn mở lại trình duyệt
- Thời gian nghỉ sau khi hết giới hạn là cố định theo cài đặt (không tích lũy)

## Giấy phép

Dự án này là mã nguồn mở và miễn phí sử dụng.

## Liên hệ và đóng góp

Nếu bạn gặp vấn đề hoặc muốn đóng góp, vui lòng tạo issue hoặc pull request trên repository.
