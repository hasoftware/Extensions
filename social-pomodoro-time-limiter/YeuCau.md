Yêu cầu:
Tạo một Chrome Extension giúp người dùng giới hạn thời gian sử dụng mạng xã hội như Facebook, Instagram, Twitter, TikTok bằng cách áp dụng phương pháp Pomodoro. Extension sẽ theo dõi thời gian sử dụng của người dùng trên các trang mạng xã hội và tự động chặn truy cập vào các trang này khi hết thời gian sử dụng. Người dùng có thể tùy chỉnh thời gian sử dụng mạng xã hội và thời gian nghỉ ngơi. Extension sẽ bao gồm các tính năng sau:

1. Các tính năng chính:

Pomodoro Timer:

Mỗi phiên Pomodoro sẽ là 25 phút làm việc và 5 phút nghỉ.

Sau mỗi phiên Pomodoro, extension sẽ thông báo hoặc chặn các mạng xã hội (Facebook, Instagram, Twitter, TikTok).

Người dùng có thể chỉnh sửa thời gian cho phiên Pomodoro và thời gian nghỉ trong popup của extension.

Giới hạn thời gian mạng xã hội:

Người dùng có thể thiết lập thời gian tối đa mà họ muốn dành cho từng mạng xã hội trong một ngày.

Sau khi hết thời gian sử dụng, extension sẽ chặn truy cập vào các mạng xã hội này trong một khoảng thời gian định sẵn (ví dụ: 30 phút nghỉ ngơi).

Thông báo và cảnh báo:

Khi người dùng gần hết thời gian sử dụng mạng xã hội, extension sẽ hiển thị thông báo cảnh báo (ví dụ: "Bạn đã sử dụng mạng xã hội quá lâu, hãy nghỉ ngơi!").

Khi hết thời gian, extension sẽ tự động chặn trang mạng xã hội và hiển thị thông báo cho người dùng.

Cài đặt và tùy chỉnh:

Giao diện popup cho phép người dùng tùy chỉnh các cài đặt như: thời gian Pomodoro, thời gian nghỉ ngơi, thời gian sử dụng tối đa cho mỗi mạng xã hội.

Lưu trữ cài đặt của người dùng với chrome.storage để các thay đổi có thể được giữ lại khi mở trình duyệt lại.

2. Chi tiết về cách hoạt động:

Theo dõi hoạt động người dùng:

Extension sẽ theo dõi tab hiện tại trong trình duyệt và xác định xem liệu người dùng có đang truy cập các mạng xã hội hay không (sử dụng chrome.webNavigation hoặc chrome.tabs).

Khi người dùng mở Facebook, Instagram, Twitter, hoặc TikTok, extension sẽ bắt đầu đếm thời gian.

Chặn truy cập:

Khi hết thời gian sử dụng cho các mạng xã hội, extension sẽ chặn trang web đó bằng cách thay đổi nội dung của tab (chuyển hướng đến trang thông báo “Hết thời gian sử dụng” hoặc chặn bằng chrome.tabs.update()).

3. Yêu cầu về giao diện (UI):

Popup UI:

Hiển thị thời gian còn lại cho Pomodoro và mạng xã hội.

Cung cấp các tùy chọn điều chỉnh thời gian Pomodoro, thời gian nghỉ, và thời gian sử dụng mạng xã hội tối đa.

Cảnh báo và thông báo:

Sử dụng chrome.notifications để hiển thị thông báo khi người dùng gần hết thời gian hoặc khi hết thời gian sử dụng mạng xã hội.

4. Cấu trúc và tổ chức mã nguồn:

Manifest file:

Sử dụng Manifest V3 để cấu hình quyền truy cập và chức năng của extension.

Background script:

Quản lý logic của timer Pomodoro và giới hạn thời gian.

Popup script:

Quản lý giao diện người dùng, cho phép tùy chỉnh thời gian và hiển thị thông tin.

Content script:

Theo dõi các trang mạng xã hội và thay đổi nội dung của tab khi hết thời gian.

5. Các API cần sử dụng:

chrome.tabs: Để theo dõi các tab và URL đang mở.

chrome.webNavigation: Để theo dõi sự kiện duyệt web và xác định trang web người dùng đang truy cập.

chrome.notifications: Để gửi thông báo cho người dùng khi hết thời gian.

chrome.storage: Để lưu trữ các cài đặt của người dùng.

6. Ví dụ về cấu trúc thư mục:
   social-media-time-limiter-extension/
   ├── manifest.json # Cấu hình của extension
   ├── background.js # Quản lý logic Pomodoro và giới hạn thời gian
   ├── popup.html # Giao diện popup cho người dùng
   ├── popup.js # Logic điều khiển popup
   ├── content.js # Quản lý hành động đối với các trang mạng xã hội
   ├── style.css # CSS cho giao diện người dùng
   └── icons/ # Biểu tượng của extension

7. Cách thức hoạt động:

Khi người dùng cài đặt và mở extension:

Extension sẽ yêu cầu quyền truy cập vào các tab và thông báo.

Người dùng có thể thiết lập thời gian Pomodoro, thời gian nghỉ, và số phút tối đa có thể dành cho mỗi mạng xã hội.

Khi người dùng duyệt mạng xã hội:

Extension sẽ đếm thời gian và thông báo cho người dùng khi hết thời gian.

Sau khi hết thời gian, extension sẽ tự động chặn mạng xã hội và hiển thị thông báo “Hết giờ, nghỉ ngơi nhé!”

8. Các bước triển khai:

Bước 1: Tạo cấu trúc thư mục cho extension và xây dựng file manifest.json.

Bước 2: Tạo logic trong background script để quản lý Pomodoro timer và giới hạn thời gian mạng xã hội.

Bước 3: Thiết kế giao diện người dùng trong popup.html và thêm các tùy chỉnh.

Bước 4: Xây dựng content script để chặn mạng xã hội khi hết thời gian.

Bước 5: Kiểm tra, debug, và thử nghiệm extension trên các trình duyệt.
