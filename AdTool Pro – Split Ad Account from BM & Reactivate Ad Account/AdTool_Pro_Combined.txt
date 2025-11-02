// AD TOOL PRO - CHƯƠNG TRÌNH TỔNG HỢP TÁCH VÀ KÍCH HOẠT TÀI KHOẢN QUẢNG CÁO
// HASoftware - Ads Solution - Auto Version

// Biến thống kê toàn cục
let stats = {
    // Thống kê tách tài khoản
    tachTotalProcessed: 0,
    tachSuccessCount: 0,
    tachFailureCount: 0,
    tachTargetSuccess: 600,
    tachStartTime: null,
    tachActiveRequests: 0,
    tachMaxConcurrentRequests: 200,
    tachIsRunning: false,
    tachCurrentAccounts: [],
    
    // Thống kê kích hoạt tài khoản
    kichHoatTotal: 0,
    kichHoatSuccess: 0,
    kichHoatFailed: 0,
    kichHoatSkipped: 0,
    kichHoatProcessing: 0,
    kichHoatCurrent: 0,
    kichHoatStartTime: null,
    kichHoatIsRunning: false,
    
    // Thống kê đổi tên tài khoản
    renameTotal: 0,
    renameSuccess: 0,
    renameFailed: 0,
    renameSkipped: 0,
    renameProcessing: 0,
    renameCurrent: 0,
    renameStartTime: null,
    renameIsRunning: false,
    renameRetryCount: 0, // Số lần retry tổng cộng
    
    // Thống kê xóa admin & analysts
    removeAdminTotal: 0,
    removeAdminSuccess: 0,
    removeAdminFailed: 0,
    removeAdminSkipped: 0,
    removeAdminCurrent: 0,
    removeAdminStartTime: null,
    removeAdminIsRunning: false,
    removeAdminAdminsRemoved: 0,
    removeAdminAnalystsRemoved: 0,
    
    // Trạng thái tổng thể
    currentPhase: 'idle', // 'idle', 'tach', 'kichhoat', 'rename', 'removeadmin', 'completed'
    isRunning: false,
    failureThreshold: 500,
    
    // Cấu hình mới
    config: {
        // Tích chọn chính cho từng chức năng
        enableTach: true, // Bật chức năng tách TKQC
        enableKichHoat: true, // Bật chức năng kích hoạt TKQC
        enableRename: false, // Bật chức năng đổi tên TKQC
        enableRemoveAdmin: false, // Bật chức năng xóa admin & analysts
        
        // Cấu hình tách
        failureThresholdToKichHoat: 500, // Số tài khoản thất bại thì chuyển sang kích hoạt
        targetSuccess: 600, // Số TKQC cần tách thành công
        enableDelayBetweenAccounts: false, // Có delay giữa mỗi tài khoản không
        delayBetweenAccounts: 1, // Delay giữa mỗi tài khoản (giây)
        
        // Cấu hình kích hoạt
        delayBeforeKichHoat: 300, // Thời gian delay trước khi kích hoạt (giây)
        kichHoatBatchSize: 50, // Số tài khoản kích hoạt đồng thời
        
        // Cấu hình đổi tên
        renameMode: 'fixed', // 'fixed' hoặc 'business'
        fixedName: 'HoangAnh TKQC', // Tên cố định
        businessName: '', // Tên doanh nghiệp (sẽ được lấy tự động)
        onlyPersonalAccounts: true, // Chỉ áp dụng với TKQC cá nhân
        
        // Cấu hình xóa admin & analysts
        removeAdminOnly: true, // Chỉ xóa admin (role 1001)
        removeAnalystOnly: false, // Chỉ xóa analyst (role 1003)
        removeBoth: false, // Xóa cả admin và analyst
        removeAdminDelay: 2 // Delay giữa các tài khoản (giây)
    }
};

// Tạo giao diện web tổng hợp
function createCombinedWebUI() {
    const style = document.createElement('style');
    style.textContent = `
        .adtool-pro-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .adtool-pro-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 95%;
            max-width: 1000px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            color: white;
            position: relative;
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .adtool-pro-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .adtool-pro-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .adtool-pro-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .adtool-pro-phase-indicator {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .adtool-pro-phase-text {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .adtool-pro-phase-description {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .adtool-pro-sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        
        .adtool-pro-section {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .adtool-pro-section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .adtool-pro-progress-container {
            margin: 15px 0;
        }
        
        .adtool-pro-progress-bar {
            width: 100%;
            height: 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        }
        
        .adtool-pro-progress-fill {
            height: 100%;
            border-radius: 8px;
            transition: width 0.5s ease;
            position: relative;
            overflow: hidden;
        }
        
        .adtool-pro-progress-fill.tach {
            background: linear-gradient(90deg, #ff6b6b, #ee5a24);
        }
        
        .adtool-pro-progress-fill.kichhoat {
            background: linear-gradient(90deg, #4CAF50, #45a049);
        }
        
        .adtool-pro-progress-text {
            text-align: center;
            margin-top: 8px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .adtool-pro-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }
        
        .adtool-pro-stat-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }
        
        .adtool-pro-stat-number {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .adtool-pro-stat-label {
            font-size: 11px;
            opacity: 0.8;
        }
        
        .adtool-pro-current {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
        }
        
        .adtool-pro-current-title {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .adtool-pro-current-accounts {
            max-height: 100px;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .adtool-pro-current-account {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            margin: 2px 0;
            border-radius: 4px;
            font-family: monospace;
        }
        
        .adtool-pro-close {
            position: absolute;
            top: 15px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s ease;
        }
        
        .adtool-pro-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .adtool-pro-completion {
            text-align: center;
            padding: 25px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 15px;
            margin-top: 25px;
            display: none;
        }
        
        .adtool-pro-completion.show {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .adtool-pro-completion-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .adtool-pro-completion-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .adtool-pro-completion-stats {
            font-size: 16px;
            line-height: 1.8;
        }
        
        .adtool-pro-completion-stat-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
        
        .adtool-pro-timer {
            text-align: center;
            margin: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .adtool-pro-controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
        }
        
        .adtool-pro-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .adtool-pro-btn.start {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
        }
        
        .adtool-pro-btn.start:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
        
        .adtool-pro-btn.stop {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .adtool-pro-btn.stop:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }
        
        .adtool-pro-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .adtool-pro-config {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .adtool-pro-config .adtool-pro-config-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            color: #ffffff !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .adtool-pro-config-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .adtool-pro-config-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .adtool-pro-config .adtool-pro-config-label,
        .adtool-pro-config label {
            font-size: 14px;
            font-weight: bold;
            color: #ffffff !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            -webkit-text-fill-color: #ffffff !important;
            fill: #ffffff !important;
        }
        
        .adtool-pro-config-input {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            font-size: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        .adtool-pro-config-input:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
        }
        
        .adtool-pro-config-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 5px;
        }
        
        .adtool-pro-config-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #4CAF50;
            cursor: pointer;
        }
        
        .adtool-pro-config .adtool-pro-config-checkbox label,
        .adtool-pro-config-checkbox label {
            font-size: 14px;
            cursor: pointer;
            color: #ffffff !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            font-weight: 500;
            -webkit-text-fill-color: #ffffff !important;
            fill: #ffffff !important;
        }
        
        .adtool-pro-config-radio {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 5px;
        }
        
        .adtool-pro-config-radio input[type="radio"] {
            width: 16px;
            height: 16px;
            accent-color: #4CAF50;
            cursor: pointer;
        }
        
        .adtool-pro-config .adtool-pro-config-radio label,
        .adtool-pro-config-radio label {
            font-size: 14px;
            cursor: pointer;
            color: #ffffff !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            font-weight: 500;
            -webkit-text-fill-color: #ffffff !important;
            fill: #ffffff !important;
        }
        
        .adtool-pro-config-conditional {
            margin-left: 20px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-top: 10px;
            display: none;
        }
        
        .adtool-pro-config-conditional.show {
            display: block;
        }
        
        /* Đảm bảo tất cả text trong config đều có màu trắng */
        .adtool-pro-config * {
            color: #ffffff !important;
        }
        
        /* Ngoại lệ cho input fields */
        .adtool-pro-config input[type="number"],
        .adtool-pro-config input[type="text"] {
            color: #333 !important;
            -webkit-text-fill-color: #333 !important;
        }
        
        /* CSS cho section ủng hộ */
        .adtool-pro-support-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
        }
        
        .adtool-pro-support-left,
        .adtool-pro-support-right {
            flex: 1;
            text-align: center;
            padding: 15px;
        }
        
        .adtool-pro-support-title {
            font-size: 16px;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .adtool-pro-qr-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 10px;
        }
        
        .adtool-pro-qr-code {
            transition: transform 0.3s ease;
        }
        
        .adtool-pro-qr-code:hover {
            transform: scale(1.1);
        }
        
        .adtool-pro-qr-placeholder {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }
        
        .adtool-pro-qr-placeholder:hover {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        
        /* Divider giữa 2 khoảng */
        .adtool-pro-support-section::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 20px;
            bottom: 20px;
            width: 2px;
            background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5), transparent);
        }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'adtool-pro-modal';
    modal.innerHTML = `
        <div class="adtool-pro-container">
            <button class="adtool-pro-close" id="closeButton">×</button>
            
            <div class="adtool-pro-header">
                <div class="adtool-pro-title">SCRIPTS TÁCH - KÍCH HOẠT - ĐỔI TÊN</div>
                <div class="adtool-pro-title">XÓA ADMIN & ANALYSTS TÀI KHOẢN QUẢNG CÁO</div>
                <div class="adtool-pro-subtitle">Copyright by HASoftware Ads Solution</div>
                <div class="adtool-pro-subtitle">Liên hệ Telegram Admin nếu gặp sự cố: @HoangAnhDev</div>
                <div class="adtool-pro-subtitle">Developer:Trịnh Hoàng Anh</div>
                <div class="adtool-pro-subtitle">Đóng góp API: Ban Do & Tánh Gold</div>
                
                <div class="adtool-pro-support-section">
                    <div class="adtool-pro-support-left">
                        <div class="adtool-pro-support-title">💝 Ủng hộ chúng tôi nếu thấy Code ngon</div>
                        <div class="adtool-pro-qr-container">
                            <!-- 
                            CÁCH SỬ DỤNG QR CODE PNG:
                            1. Chuyển PNG thành Base64: https://www.base64-image.de/
                            2. Thay thế div bên dưới bằng:
                            <img src="data:image/png;base64,YOUR_BASE64_STRING_HERE" 
                                 alt="QR Code Ủng hộ" 
                                 class="adtool-pro-qr-code" 
                                 style="width: 80px; height: 80px; border: 2px solid #fff; border-radius: 8px;">
                            -->
                            <img src="data:image/png;base64,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VWRRv9+mTJmiKzPq91ugixds3LhRmjZtqisz6udTLeoSiLA1xw8XJ7QvaXJ8pTFs2DC9dWiNHz/e8/j+xqBBg/TW5iZOnOi5L9ujX79++oiRZ/r06Z63+XodkdwcPxiLFi3yvJ+RMGiOHz7r16/3vM3+hvMiVm9tjub4AADcQAhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALDAWnN81dj6q6++0pUZ1eC9Y8eOujIzbtw4efjhh3VlZtiwYe52gdixY4csWbJEV2ZUA+233npLV2Y6dOggjz32mK7MrFy5Ut544w1dmalVq5Z07txZV2YqVaokLVq00FVkWbdunfzjH//QVehUr15dunfvrqvQUU34n376aV1d/7744gvp0qWLrsxUrlxZevXqpavQKVOmjLRt21ZXZtQCFn/84x91ZSZczfFr164tf/jDH3RlRjWgv+eee3RlRi2WMWPGDF2Z2bNnj7zwwgu6MlOjRg156aWXdGVm//798rvf/U5XZiK6Of6oUaMuaT58pTF8+HC9tblwNcf/4IMPPPd1vY77779f3zNzU6ZM8dxXURrJycn60UAggmmOn5SUpLcOraVLl3oe3/YIV3P8YEarVq30Ec05L2I993W9DprjAwAQoQhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALDAWnP8RYsWydtvv60rM3fccYf8/Oc/15WZYJrjJyUlBdyAfunSpTJy5EhdmalZs6YkJibqKnR2794d8EIEqgn/U089pSszBw4ccBvxB2Lv3r3y5Zdf6sqMakCv/o0iUcuWLeXZZ5/VVegcPHjQfQ7dKFTT8UCbyatm5S+++KKuzKgFHAJdvEA9dwJdlCMYwTTHV034A20mHwy1QECgixeo3zvPPPOMrkJH3bbk5GRdhU61atXk1Vdf1ZWZsDXHD5dgmuOHawwZMkTfytCaOHGi5/Ftj379+ukjmps6darnvvyNPn366K2Lrrlz53o+Ngz/o1OnTvoRNBfJzfHDZe3atZ63ORJGs2bN9K2MPDTHBwAgDAhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALDAWnP8YKhmy2vWrNGVGdVA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+sMMFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwIJrGqjDhw/3bI5clMaECRP0o3Fj6Nu3r+f9tD2mT5+ujxhac+bM8WxI7m8kJyfrrc317NnT8376G88884zn8f2N7t276yOGVufOnT1vs7+xePFivXXR1a5dO8/Hxt9YvXq13jryfPPNN54/h/7GkCFDPO+nv5GamqqPeG0xQwUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALCAQAUAwAICFQAACwhUAAAsIFABALDgugvUcePGeTZUjoTxwAMP6FsZeSZPnux5m/2N/v37663NTZs2zXNf/oZqqB+oe++917NJtr8xc+ZMvXVoffrpp57309+466679NbmevTo4Xk/I2EsWrRI38rQ+vLLLz0fT9vj9ttv10c0t3LlSs99RcJo3bq1vpWh1aJFC8+fD38jJSVFb22uSZMmnvvyNzZt2qS3tocZKgAAFhCoAABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUEKi7r448/9mys7W/86Ec/0luH1owZMzyP72/cc889emtzycnJno21/Y05c+borUNr/vz5nvfT9ujWrZs+YmglJSV5Pp7+xpIlS/TWRVebNm08Hxt/Y+3atXrryLNhwwbPn0Pbo3HjxvqI9hCoAABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUEKgAAFhCoRcT9998vubm5AY0pU6borc316dPHc1/+xogRIyQ6OjqgoY4TDqrRvdfx/Y27775bb23us88+89yXv9GzZ0+9tbmuXbt6/hv4G7///e89jx8J44477tD3zFxiYqLn/fQ3vvrqK711aLVr187z+P7G22+/7fnY+BuPPPKI5778jbFjx3ruy/Zo0aKFfjSuPwRqEeK14oK/EQyv/VxpKF4rYlxphIvXsa80guG1nyuNQHk9/lcaitexI2UEw+t+XmmEi9ex/Q3F63HxNxSvffkbite+QjGuVwQqAAAWEKgAAFhAoAIAYAGBCgCABQQqAAAWEKgAAFhAoAIAYAGBCgCABQQqAAAWEKgAAFhAoAIAYEFU3kWNE1en7JIBT7zrfv3OS0OlR2Ij9+srGT16tNtwORDDhw+XMWPG6MpMTk6OZGdn6yqyqMbOsbGxujIzceJEGTx4sK7MDBw40N0uEFOnTpUhQ4boyoxqiJ2VlaUrM8E8BqqZ/EcffaQrM7NmzZL+/fvrykxycrL7OBRlixcvlnvvvVdXZoL5OQgX1eh+4cKFujITzM/o8uXL5fbbb9dV6KieuXFxcboyo36FZ2Zm6spMuI4TLo0bN5avv/5aV2aCeQy27zki3R96zf365f/tK4N6t3G/LnDdzVBjYmIkPj4+IkegT9JwUi9EMjIyAhrB/BJVv3y99uVvqG28Hk9/I5jHWv0i9dpXURrq+eP1b+BvRGqYKsH8m0by81SFlte/gb8RTMiF6zjhosLR69/a3wg0TE1wyhcAAAsIVAAALCBQAQCwgEAFAMACAhUAAAsIVAAALCBQAQCwgEAFAMACAhUAAAsIVAAALCBQAQCw4Jo2x1c9NRMSEnRVNKk+qWlpaboyE0xz/MmTJ8uAAQN0FTq9e/eW8ePH68rMZ599FvDPjlog4dy5c7oyo27bzJkzdRU68+fPD7hxfzC6dOkin3zyia7MqEby3bt315WZpKSkgB+3pUuXuoseBEI1n//00091ZWbVqlXSr18/XZnp0KGD+zMXCNUL++zZs7qKLOvWrZPOnTvrKrI0bdpUvvrqK12Z2bRpk9x22226MtOkSRNJTU3VVehcqTm+apJ8gVXf7Myr3eUFd8xbukl/98pGjRqlgpkRhuEEqn7UzU2aNMlzX7ZH37599RHNTZs2zXNftocTqPqIoTVnzhzP49sePXr00Ec0t2DBAs99+Rtdu3bVW5tbtGiR5778DSe49dbmlixZ4rkvfyMxMVFvfWNYvXq15/2MhNGiRQt9K82lpKR47svfcAJVbx1a23YfPp+PE2au1t/9Aad8AQCwgEAFAMACAhUAAAsIVAAALCBQAQCwgEAFAMACAhUAAAsIVAAALCBQAQCwgEAFAMACAhUAAAusNcdPT0+X06dP6wqhFB8fL6VLl9aVmYyMDDl16pSuQieY25aZmSknT57UVejExcVJmTJldBU6kXx/1GIMJ06c0JUZtYhF2bJldWXmRjtOJFMLRRw/flxXkcXn80m5cuV0ZSaY+xPMcYJxpeb41gIVAIAb2ZUClVO+AABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUEKgAAFhCoAABYQKACAGABgQoAgAUX9PJNz8iSv/57roybtsKty5YuLsXifO7XAAAUZdk5uXLk+Bn36ys2x09Lz5IX/zVTJs1Zq78DAAAKi4qKcgK1jwy820+gZmRmy78/WiLzl36rvwMAAAqrWL6kPD70DmnbvJb+Tr5Llm8DAACB46IkAAAsIFABALhqIv8fDsPoVTwt8O0AAAAASUVORK5CYII=" 
                                 alt="QR Code Ủng hộ" 
                                 class="adtool-pro-qr-code" 
                                 style="width: 120px; height: 120px; border: 2px solid #fff; border-radius: 8px;">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="adtool-pro-phase-indicator" id="phaseIndicator">
                <div class="adtool-pro-phase-text">⏳ Đang khởi tạo...</div>
                <div class="adtool-pro-phase-description">Chuẩn bị bắt đầu quá trình</div>
            </div>
            
            <div class="adtool-pro-timer" id="timerDisplay" style="display: none;">
                ⏰ Chờ kích hoạt: <span id="timerCountdown">300</span>s
            </div>
            
            <div class="adtool-pro-controls">
                <button class="adtool-pro-btn start" id="startButton">Bắt đầu</button>
                <button class="adtool-pro-btn stop" id="stopButton" disabled>Dừng</button>
            </div>

            <div class="adtool-pro-config">
                <div class="adtool-pro-config-title">⚙️ Cài đặt</div>
                
                <!-- Tích chọn chính cho từng chức năng -->
                <div class="adtool-pro-config-section">
                    <div class="adtool-pro-config-title" style="font-size: 16px; margin-bottom: 10px;">🎯 Tích chọn chức năng</div>
                    <div class="adtool-pro-config-grid">
                        <div class="adtool-pro-config-item">
                            <label for="enableTach">⛏️ Tách TKQC:</label>
                            <div class="adtool-pro-config-checkbox">
                                <input type="checkbox" id="enableTach" ${stats.config.enableTach ? 'checked' : ''}>
                                <label for="enableTach">Bật chức năng tách</label>
                            </div>
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="enableKichHoat">🔓 Kích hoạt lại TKQC:</label>
                            <div class="adtool-pro-config-checkbox">
                                <input type="checkbox" id="enableKichHoat" ${stats.config.enableKichHoat ? 'checked' : ''}>
                                <label for="enableKichHoat">Bật chức năng kích hoạt</label>
                            </div>
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="enableRename">🏷️ Đổi tên TKQC:</label>
                            <div class="adtool-pro-config-checkbox">
                                <input type="checkbox" id="enableRename" ${stats.config.enableRename ? 'checked' : ''}>
                                <label for="enableRename">Bật chức năng đổi tên</label>
                            </div>
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="enableRemoveAdmin">👤 Xóa admin & analysts:</label>
                            <div class="adtool-pro-config-checkbox">
                                <input type="checkbox" id="enableRemoveAdmin" ${stats.config.enableRemoveAdmin ? 'checked' : ''}>
                                <label for="enableRemoveAdmin">Bật chức năng xóa admin & analysts</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="adtool-pro-config-grid">
                    <div class="adtool-pro-config-item">
                        <label for="tachTargetSuccess">🎯 Số tài khoản thành công cần tách:</label>
                        <input type="number" id="tachTargetSuccess" value="${stats.tachTargetSuccess}" min="1" class="adtool-pro-config-input">
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="maxConcurrentRequests">⚡ Số tài khoản xử lý đồng thời:</label>
                        <input type="number" id="maxConcurrentRequests" value="${stats.tachMaxConcurrentRequests}" min="1" class="adtool-pro-config-input">
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="failureThreshold">⚠️ Số lần thất bại tối đa trước khi kích hoạt:</label>
                        <input type="number" id="failureThreshold" value="${stats.failureThreshold}" min="1" class="adtool-pro-config-input">
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="delayBeforeKichHoat">⏰ Thời gian delay trước khi kích hoạt (giây):</label>
                        <input type="number" id="delayBeforeKichHoat" value="${stats.config.delayBeforeKichHoat}" min="0" class="adtool-pro-config-input">
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="enableDelayBetweenAccounts">⏱️ Bật delay giữa các tài khoản:</label>
                        <div class="adtool-pro-config-checkbox">
                            <input type="checkbox" id="enableDelayBetweenAccounts" ${stats.config.enableDelayBetweenAccounts ? 'checked' : ''}>
                            <label for="enableDelayBetweenAccounts">Bật</label>
                        </div>
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="delayBetweenAccounts">⏱️ Thời gian delay giữa các tài khoản (giây):</label>
                        <input type="number" id="delayBetweenAccounts" value="${stats.config.delayBetweenAccounts}" min="0" class="adtool-pro-config-input">
                    </div>
                    <div class="adtool-pro-config-item">
                        <label for="kichHoatBatchSize">🚀 Số tài khoản kích hoạt đồng thời:</label>
                        <input type="number" id="kichHoatBatchSize" value="50" min="10" max="200" class="adtool-pro-config-input">
                    </div>
                    
                    <!-- Cấu hình đổi tên -->
                    <div class="adtool-pro-config-item">
                        <label for="onlyPersonalAccounts">👤 Chỉ áp dụng với TKQC cá nhân:</label>
                        <div class="adtool-pro-config-checkbox">
                            <input type="checkbox" id="onlyPersonalAccounts" ${stats.config.onlyPersonalAccounts ? 'checked' : ''}>
                            <label for="onlyPersonalAccounts">Bật</label>
                        </div>
                    </div>
                </div>
                
                <!-- Cấu hình đổi tên chi tiết -->
                <div class="adtool-pro-config-conditional" id="renameConfigSection">
                    <div class="adtool-pro-config-title">🏷️ Cấu hình đổi tên</div>
                    <div class="adtool-pro-config-grid">
                        <div class="adtool-pro-config-item">
                            <label>📝 Chế độ đổi tên:</label>
                            <div class="adtool-pro-config-radio">
                                <input type="radio" id="renameModeFixed" name="renameMode" value="fixed" ${stats.config.renameMode === 'fixed' ? 'checked' : ''}>
                                <label for="renameModeFixed">Tên cố định</label>
                            </div>
                            <div class="adtool-pro-config-radio">
                                <input type="radio" id="renameModeBusiness" name="renameMode" value="business" ${stats.config.renameMode === 'business' ? 'checked' : ''}>
                                <label for="renameModeBusiness">Tên doanh nghiệp</label>
                            </div>
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="fixedName">📝 Tên cố định:</label>
                            <input type="text" id="fixedName" value="${stats.config.fixedName}" placeholder="Nhập tên cố định" class="adtool-pro-config-input">
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="businessName">🏢 Tên doanh nghiệp:</label>
                            <input type="text" id="businessName" value="${stats.config.businessName}" placeholder="Tự động lấy từ BM" class="adtool-pro-config-input" readonly>
                        </div>
                    </div>
                </div>
                
                <!-- Cấu hình xóa admin & analysts chi tiết -->
                <div class="adtool-pro-config-conditional" id="removeAdminConfigSection">
                    <div class="adtool-pro-config-title">👤 Cấu hình xóa admin & analysts</div>
                    <div class="adtool-pro-config-grid">
                        <div class="adtool-pro-config-item">
                            <label>🗑️ Loại user cần xóa:</label>
                            <div class="adtool-pro-config-radio">
                                <input type="radio" id="removeAdminOnly" name="removeAdminType" value="admin" ${stats.config.removeAdminOnly ? 'checked' : ''}>
                                <label for="removeAdminOnly">Chỉ xóa Admin (Role 1001)</label>
                            </div>
                            <div class="adtool-pro-config-radio">
                                <input type="radio" id="removeAnalystOnly" name="removeAdminType" value="analyst" ${stats.config.removeAnalystOnly ? 'checked' : ''}>
                                <label for="removeAnalystOnly">Chỉ xóa Nhà phân tích (Role 1003)</label>
                            </div>
                            <div class="adtool-pro-config-radio">
                                <input type="radio" id="removeBoth" name="removeAdminType" value="both" ${stats.config.removeBoth ? 'checked' : ''}>
                                <label for="removeBoth">Xóa cả admin và analyst</label>
                            </div>
                        </div>
                        <div class="adtool-pro-config-item">
                            <label for="removeAdminDelay">⏱️ Delay giữa các tài khoản (giây):</label>
                            <input type="number" id="removeAdminDelay" value="${stats.config.removeAdminDelay}" min="1" max="60" class="adtool-pro-config-input">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="adtool-pro-sections">
                <div class="adtool-pro-section">
                    <div class="adtool-pro-section-title">TÁCH TÀI KHOẢN QUẢNG CÁO</div>
                    
                    <div class="adtool-pro-progress-container">
                        <div class="adtool-pro-progress-bar">
                            <div class="adtool-pro-progress-fill tach" id="tachProgressFill" style="width: 0%"></div>
                        </div>
                        <div class="adtool-pro-progress-text" id="tachProgressText">0% (0/${stats.tachTargetSuccess})</div>
                    </div>
                    
                    <div class="adtool-pro-stats">
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="tachSuccessCount">0</div>
                            <div class="adtool-pro-stat-label">✅ Thành công</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="tachFailureCount">0</div>
                            <div class="adtool-pro-stat-label">❌ Thất bại</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="tachTotalProcessed">0</div>
                            <div class="adtool-pro-stat-label">⏱️ Đã xử lý</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="tachActiveRequests">0</div>
                            <div class="adtool-pro-stat-label">🔄 Đang xử lý</div>
                        </div>
                    </div>
                    
                    <div class="adtool-pro-current">
                        <div class="adtool-pro-current-title">⚡ Đang tách:</div>
                        <div class="adtool-pro-current-accounts" id="tachCurrentAccounts">
                            <div class="adtool-pro-current-account">Chờ bắt đầu...</div>
                        </div>
                    </div>
                </div>
                
                <div class="adtool-pro-section">
                    <div class="adtool-pro-section-title">REACTIVE TÀI KHOẢN</div>
                    
                    <div class="adtool-pro-progress-container">
                        <div class="adtool-pro-progress-bar">
                            <div class="adtool-pro-progress-fill kichhoat" id="kichHoatProgressFill" style="width: 0%"></div>
                        </div>
                        <div class="adtool-pro-progress-text" id="kichHoatProgressText">0% (0/0)</div>
                    </div>
                    
                    <div class="adtool-pro-stats">
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="kichHoatSuccess">0</div>
                            <div class="adtool-pro-stat-label">✅ Thành công</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="kichHoatFailed">0</div>
                            <div class="adtool-pro-stat-label">❌ Thất bại</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="kichHoatSkipped">0</div>
                            <div class="adtool-pro-stat-label">⏭️ Bỏ qua</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="kichHoatCurrent">0</div>
                            <div class="adtool-pro-stat-label">📊 Đang xử lý</div>
                        </div>
                    </div>
                    
                    <div class="adtool-pro-current">
                        <div class="adtool-pro-current-title">⚡ Đang kích hoạt:</div>
                        <div class="adtool-pro-current-accounts" id="kichHoatCurrentAccounts">
                            <div class="adtool-pro-current-account">Chờ bắt đầu...</div>
                        </div>
                    </div>
                </div>
                
                <!-- Thống kê đổi tên -->
                <div class="adtool-pro-stats-section" id="renameStatsSection">
                    <div class="adtool-pro-stats-title">🏷️ THỐNG KÊ ĐỔI TÊN</div>
                    <div class="adtool-pro-stats-grid">
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="renameSuccess">0</div>
                            <div class="adtool-pro-stat-label">✅ Thành công</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="renameFailed">0</div>
                            <div class="adtool-pro-stat-label">❌ Thất bại</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="renameTotal">0</div>
                            <div class="adtool-pro-stat-label">📊 Tổng cộng</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="renameCurrent">0</div>
                            <div class="adtool-pro-stat-label">📊 Đang xử lý</div>
                        </div>
                    </div>
                    
                    <div class="adtool-pro-current">
                        <div class="adtool-pro-current-title">🏷️ Đang đổi tên:</div>
                        <div class="adtool-pro-current-accounts" id="renameCurrentAccounts">
                            <div class="adtool-pro-current-account">Chờ bắt đầu...</div>
                        </div>
                    </div>
                </div>
                
                <!-- Thống kê xóa admin & analysts -->
                <div class="adtool-pro-stats-section" id="removeAdminStatsSection">
                    <div class="adtool-pro-stats-title">👤 THỐNG KÊ XÓA ADMIN & ANALYSTS</div>
                    <div class="adtool-pro-stats-grid">
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminSuccess">0</div>
                            <div class="adtool-pro-stat-label">✅ Thành công</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminFailed">0</div>
                            <div class="adtool-pro-stat-label">❌ Thất bại</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminTotal">0</div>
                            <div class="adtool-pro-stat-label">📊 Tổng cộng</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminCurrent">0</div>
                            <div class="adtool-pro-stat-label">📊 Đang xử lý</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminAdminsRemoved">0</div>
                            <div class="adtool-pro-stat-label">👑 Admin đã xóa</div>
                        </div>
                        <div class="adtool-pro-stat-item">
                            <div class="adtool-pro-stat-number" id="removeAdminAnalystsRemoved">0</div>
                            <div class="adtool-pro-stat-label">📊 Analyst đã xóa</div>
                        </div>
                    </div>
                    
                    <div class="adtool-pro-current">
                        <div class="adtool-pro-current-title">👤 Đang xóa admin:</div>
                        <div class="adtool-pro-current-accounts" id="removeAdminCurrentAccounts">
                            <div class="adtool-pro-current-account">Chờ bắt đầu...</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="adtool-pro-completion" id="completionSection">
                <div class="adtool-pro-completion-icon">🎉</div>
                <div class="adtool-pro-completion-title">HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH!</div>
                <div class="adtool-pro-completion-stats" id="completionStats"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Thêm event listeners cho các nút
    addEventListeners();
    
    return modal;
}

// Hàm thêm event listeners
function addEventListeners() {
    try {
        console.log('🔧 Đang thêm event listeners...');
        
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const closeButton = document.getElementById('closeButton');
        
        console.log('🔍 Tìm thấy các nút:', {
            startButton: !!startButton,
            stopButton: !!stopButton,
            closeButton: !!closeButton
        });
        
        if (startButton) {
            startButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🚀 Bấm nút Start - Bắt đầu quá trình');
                mainCombinedProcess();
            });
            console.log('✅ Đã thêm event listener cho nút Start');
        }
        
        if (stopButton) {
            stopButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🛑 Bấm nút Stop - Dừng quá trình');
                stopAdToolPro();
            });
            console.log('✅ Đã thêm event listener cho nút Stop');
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('❌ Bấm nút Close - Đóng giao diện');
                closeCombinedWebUI();
            });
            console.log('✅ Đã thêm event listener cho nút Close');
        }
        
        // Thêm event listeners cho các tùy chọn mới
        const enableTachCheckbox = document.getElementById('enableTach');
        const enableKichHoatCheckbox = document.getElementById('enableKichHoat');
        const enableRenameCheckbox = document.getElementById('enableRename');
        const renameModeRadios = document.querySelectorAll('input[name="renameMode"]');
        const fixedNameInput = document.getElementById('fixedName');
        const businessNameInput = document.getElementById('businessName');
        
        if (enableTachCheckbox) {
            enableTachCheckbox.addEventListener('change', function() {
                console.log('⛏️ Tích chọn tách TKQC:', this.checked);
            });
        }
        
        if (enableKichHoatCheckbox) {
            enableKichHoatCheckbox.addEventListener('change', function() {
                console.log('🔓 Tích chọn kích hoạt TKQC:', this.checked);
            });
        }
        
        if (enableRenameCheckbox) {
            enableRenameCheckbox.addEventListener('change', function() {
                const renameConfigSection = document.getElementById('renameConfigSection');
                if (this.checked) {
                    renameConfigSection.classList.add('show');
                    // Tự động lấy tên doanh nghiệp nếu chưa có
                    if (!stats.config.businessName) {
                        getBusinessName();
                    }
                } else {
                    renameConfigSection.classList.remove('show');
                }
                console.log('🏷️ Tích chọn đổi tên TKQC:', this.checked);
            });
        }
        
        if (renameModeRadios.length > 0) {
            renameModeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'business') {
                        getBusinessName();
                    }
                });
            });
        }
        
        if (fixedNameInput) {
            fixedNameInput.addEventListener('input', function() {
                stats.config.fixedName = this.value;
            });
        }
        
        // Thêm event listeners cho xóa admin & analysts
        const enableRemoveAdminCheckbox = document.getElementById('enableRemoveAdmin');
        const removeAdminTypeRadios = document.querySelectorAll('input[name="removeAdminType"]');
        const removeAdminDelayInput = document.getElementById('removeAdminDelay');
        
        if (enableRemoveAdminCheckbox) {
            enableRemoveAdminCheckbox.addEventListener('change', function() {
                const removeAdminConfigSection = document.getElementById('removeAdminConfigSection');
                if (this.checked) {
                    removeAdminConfigSection.classList.add('show');
                } else {
                    removeAdminConfigSection.classList.remove('show');
                }
                console.log('👤 Tích chọn xóa admin & analysts:', this.checked);
            });
        }
        
        if (removeAdminTypeRadios.length > 0) {
            removeAdminTypeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    // Reset tất cả config
                    stats.config.removeAdminOnly = false;
                    stats.config.removeAnalystOnly = false;
                    stats.config.removeBoth = false;
                    
                    // Set config theo radio được chọn
                    switch(this.value) {
                        case 'admin':
                            stats.config.removeAdminOnly = true;
                            break;
                        case 'analyst':
                            stats.config.removeAnalystOnly = true;
                            break;
                        case 'both':
                            stats.config.removeBoth = true;
                            break;
                    }
                    console.log('👤 Chọn loại user xóa:', this.value);
                });
            });
        }
        
        if (removeAdminDelayInput) {
            removeAdminDelayInput.addEventListener('input', function() {
                stats.config.removeAdminDelay = parseInt(this.value) || 2;
                console.log('⏱️ Cập nhật delay xóa admin:', stats.config.removeAdminDelay);
            });
        }
        
        console.log('✅ Đã thêm event listeners thành công');
    } catch (error) {
        console.error('❌ Lỗi khi thêm event listeners:', error);
    }
}

// Hàm lấy tên doanh nghiệp
async function getBusinessName() {
    try {
        const businessId = require("BusinessUnifiedNavigationContext").businessID;
        const accessToken = require("WebApiApplication").getAccessToken();
        
        const response = await fetch(`https://graph.facebook.com/v19.0/${businessId}?fields=name&access_token=${accessToken}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data && data.name) {
            stats.config.businessName = data.name;
            const businessNameInput = document.getElementById('businessName');
            if (businessNameInput) {
                businessNameInput.value = data.name;
            }
            console.log('✅ Đã lấy tên doanh nghiệp:', data.name);
        }
    } catch (error) {
        console.error('❌ Lỗi khi lấy tên doanh nghiệp:', error);
    }
}

// Cập nhật giao diện tổng hợp
function updateCombinedWebUI() {
    // Cập nhật phần tách tài khoản
    const tachProgressFill = document.getElementById('tachProgressFill');
    const tachProgressText = document.getElementById('tachProgressText');
    const tachSuccessCount = document.getElementById('tachSuccessCount');
    const tachFailureCount = document.getElementById('tachFailureCount');
    const tachTotalProcessed = document.getElementById('tachTotalProcessed');
    const tachActiveRequests = document.getElementById('tachActiveRequests');
    const tachCurrentAccounts = document.getElementById('tachCurrentAccounts');
    
    if (tachProgressFill && tachProgressText) {
        const percentage = Math.round((stats.tachSuccessCount / stats.config.targetSuccess) * 100);
        tachProgressFill.style.width = percentage + '%';
        tachProgressText.textContent = `${percentage}% (${stats.tachSuccessCount}/${stats.config.targetSuccess})`;
    }
    
    if (tachSuccessCount) tachSuccessCount.textContent = stats.tachSuccessCount;
    if (tachFailureCount) tachFailureCount.textContent = stats.tachFailureCount;
    if (tachTotalProcessed) tachTotalProcessed.textContent = stats.tachTotalProcessed;
    if (tachActiveRequests) tachActiveRequests.textContent = stats.tachActiveRequests;
    
    if (tachCurrentAccounts) {
        if (stats.tachCurrentAccounts.length > 0) {
            tachCurrentAccounts.innerHTML = stats.tachCurrentAccounts
                .slice(0, 8)
                .map(account => `<div class="adtool-pro-current-account">${account}</div>`)
                .join('');
            
            if (stats.tachCurrentAccounts.length > 8) {
                tachCurrentAccounts.innerHTML += `<div class="adtool-pro-current-account">... và ${stats.tachCurrentAccounts.length - 8} tài khoản khác</div>`;
            }
        } else {
            tachCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Chờ bắt đầu...</div>';
        }
    }
    
    // Cập nhật phần kích hoạt tài khoản
    const kichHoatProgressFill = document.getElementById('kichHoatProgressFill');
    const kichHoatProgressText = document.getElementById('kichHoatProgressText');
    const kichHoatSuccess = document.getElementById('kichHoatSuccess');
    const kichHoatFailed = document.getElementById('kichHoatFailed');
    const kichHoatSkipped = document.getElementById('kichHoatSkipped');
    const kichHoatCurrent = document.getElementById('kichHoatCurrent');
    const kichHoatCurrentAccounts = document.getElementById('kichHoatCurrentAccounts');
    
    if (kichHoatProgressFill && kichHoatProgressText) {
        // Tính số tài khoản đã xử lý (thành công + thất bại)
        const kichHoatProcessed = stats.kichHoatSuccess + stats.kichHoatFailed;
        const percentage = stats.kichHoatTotal > 0 ? Math.round((kichHoatProcessed / stats.kichHoatTotal) * 100) : 0;
        kichHoatProgressFill.style.width = percentage + '%';
        kichHoatProgressText.textContent = `${percentage}% (${kichHoatProcessed}/${stats.kichHoatTotal})`;
    }
    
    if (kichHoatSuccess) kichHoatSuccess.textContent = stats.kichHoatSuccess;
    if (kichHoatFailed) kichHoatFailed.textContent = stats.kichHoatFailed;
    if (kichHoatSkipped) kichHoatSkipped.textContent = stats.kichHoatSkipped;
    if (kichHoatCurrent) kichHoatCurrent.textContent = stats.kichHoatCurrent;
    
    if (kichHoatCurrentAccounts) {
        if (stats.kichHoatIsRunning) {
            kichHoatCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đang xử lý tài khoản...</div>';
        } else if (stats.kichHoatSuccess > 0 || stats.kichHoatFailed > 0) {
            kichHoatCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đã hoàn thành xử lý</div>';
        } else {
            kichHoatCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Chờ bắt đầu...</div>';
        }
    }
    
    // Cập nhật phần đổi tên
    const renameSuccess = document.getElementById('renameSuccess');
    const renameFailed = document.getElementById('renameFailed');
    const renameTotal = document.getElementById('renameTotal');
    const renameCurrent = document.getElementById('renameCurrent');
    const renameCurrentAccounts = document.getElementById('renameCurrentAccounts');
    
    if (renameSuccess) renameSuccess.textContent = stats.renameSuccess;
    if (renameFailed) renameFailed.textContent = stats.renameFailed;
    if (renameTotal) renameTotal.textContent = stats.renameTotal;
    if (renameCurrent) renameCurrent.textContent = stats.renameCurrent;
    
    if (renameCurrentAccounts) {
        if (stats.renameIsRunning) {
            renameCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đang đổi tên tài khoản...</div>';
        } else if (stats.renameSuccess > 0 || stats.renameFailed > 0) {
            renameCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đã hoàn thành đổi tên</div>';
        } else {
            renameCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Chờ bắt đầu...</div>';
        }
    }
    
    // Cập nhật phần xóa admin & analysts
    const removeAdminSuccess = document.getElementById('removeAdminSuccess');
    const removeAdminFailed = document.getElementById('removeAdminFailed');
    const removeAdminTotal = document.getElementById('removeAdminTotal');
    const removeAdminCurrent = document.getElementById('removeAdminCurrent');
    const removeAdminAdminsRemoved = document.getElementById('removeAdminAdminsRemoved');
    const removeAdminAnalystsRemoved = document.getElementById('removeAdminAnalystsRemoved');
    const removeAdminCurrentAccounts = document.getElementById('removeAdminCurrentAccounts');
    
    if (removeAdminSuccess) removeAdminSuccess.textContent = stats.removeAdminSuccess;
    if (removeAdminFailed) removeAdminFailed.textContent = stats.removeAdminFailed;
    if (removeAdminTotal) removeAdminTotal.textContent = stats.removeAdminTotal;
    if (removeAdminCurrent) removeAdminCurrent.textContent = stats.removeAdminCurrent;
    if (removeAdminAdminsRemoved) removeAdminAdminsRemoved.textContent = stats.removeAdminAdminsRemoved;
    if (removeAdminAnalystsRemoved) removeAdminAnalystsRemoved.textContent = stats.removeAdminAnalystsRemoved;
    
    if (removeAdminCurrentAccounts) {
        if (stats.removeAdminIsRunning) {
            removeAdminCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đang xóa admin & analysts...</div>';
        } else if (stats.removeAdminSuccess > 0 || stats.removeAdminFailed > 0) {
            removeAdminCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Đã hoàn thành xóa admin & analysts</div>';
        } else {
            removeAdminCurrentAccounts.innerHTML = '<div class="adtool-pro-current-account">Chờ bắt đầu...</div>';
        }
    }
}

// Cập nhật chỉ báo pha
function updatePhaseIndicator(phase, description) {
    const phaseIndicator = document.getElementById('phaseIndicator');
    const phaseText = document.getElementById('phaseIndicator').querySelector('.adtool-pro-phase-text');
    const phaseDescription = document.getElementById('phaseIndicator').querySelector('.adtool-pro-phase-description');
    
    if (phaseIndicator && phaseText && phaseDescription) {
        stats.currentPhase = phase;
        
        switch(phase) {
            case 'tach':
                phaseText.textContent = '⛏ ĐANG TÁCH TÀI KHOẢN';
                phaseDescription.textContent = description || 'Đang tách tài khoản quảng cáo từ Business Manager';
                break;
            case 'kichhoat':
                phaseText.textContent = '🔓 ĐANG KÍCH HOẠT TÀI KHOẢN';
                phaseDescription.textContent = description || 'Đang kích hoạt lại các tài khoản đã tách';
                break;
            case 'rename':
                phaseText.textContent = '🏷️ ĐANG ĐỔI TÊN TÀI KHOẢN';
                phaseDescription.textContent = description || 'Đang đổi tên các tài khoản đã tách';
                break;
            case 'removeadmin':
                phaseText.textContent = '👤 ĐANG XÓA ADMIN & ANALYSTS';
                phaseDescription.textContent = description || 'Đang xóa admin và nhà phân tích khác khỏi tài khoản';
                break;
            case 'completed':
                phaseText.textContent = '✅ HOÀN THÀNH';
                phaseDescription.textContent = description || 'Tất cả quá trình đã hoàn tất';
                break;
            default:
                phaseText.textContent = '⏳ ĐANG KHỞI TẠO';
                phaseDescription.textContent = description || 'Chuẩn bị bắt đầu quá trình';
        }
    }
}

// Hiển thị timer đếm ngược
function showTimer(seconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerCountdown = document.getElementById('timerCountdown');
    
    if (timerDisplay && timerCountdown) {
        timerDisplay.style.display = 'block';
        timerCountdown.textContent = seconds;
        
        const countdown = setInterval(() => {
            seconds--;
            timerCountdown.textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(countdown);
                timerDisplay.style.display = 'none';
            }
        }, 1000);
    }
}

// Hiển thị thông báo hoàn thành
function showCompletionCombinedWebUI() {
    const completionSection = document.getElementById('completionSection');
    const completionStats = document.getElementById('completionStats');
    
    if (completionSection && completionStats) {
        const tachEndTime = new Date();
        const tachDuration = Math.round((tachEndTime - stats.tachStartTime) / 1000);
        const tachSuccessRate = stats.tachTotalProcessed > 0 ? Math.round((stats.tachSuccessCount / stats.tachTotalProcessed) * 100) : 0;
        
        const kichHoatEndTime = new Date();
        const kichHoatDuration = stats.kichHoatStartTime ? Math.round((kichHoatEndTime - stats.kichHoatStartTime) / 1000) : 0;
        
        // Tính tỷ lệ thành công cho kích hoạt
        const kichHoatProcessed = stats.kichHoatSuccess + stats.kichHoatFailed;
        const kichHoatSuccessRate = kichHoatProcessed > 0 ? Math.round((stats.kichHoatSuccess / kichHoatProcessed) * 100) : 0;
        
        completionStats.innerHTML = `
            <div class="adtool-pro-completion-stat-row">
                <span>🔧 TÁCH TÀI KHOẢN:</span>
                <span><strong>${stats.tachSuccessCount}/${stats.config.targetSuccess} thành công</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📊 Tổng xử lý:</span>
                <span><strong>${stats.tachTotalProcessed}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>✅ Thành công:</span>
                <span><strong>${stats.tachSuccessCount}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>❌ Thất bại:</span>
                <span><strong>${stats.tachFailureCount}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📈 Tỷ lệ thành công:</span>
                <span><strong>${tachSuccessRate}%</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏱️ Thời gian tách:</span>
                <span><strong>${tachDuration} giây</strong></span>
            </div>
            
            <div style="margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;"></div>
            
            <div class="adtool-pro-completion-stat-row">
                <span>🔓 KÍCH HOẠT TÀI KHOẢN:</span>
                <span><strong>${stats.kichHoatSuccess}/${kichHoatProcessed} thành công</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📊 Tổng tài khoản:</span>
                <span><strong>${stats.kichHoatTotal}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>✅ Thành công:</span>
                <span><strong>${stats.kichHoatSuccess}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>❌ Thất bại:</span>
                <span><strong>${stats.kichHoatFailed}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏭️ Bỏ qua:</span>
                <span><strong>${stats.kichHoatSkipped}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📈 Tỷ lệ thành công:</span>
                <span><strong>${kichHoatSuccessRate}%</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏱️ Thời gian kích hoạt:</span>
                <span><strong>${kichHoatDuration} giây</strong></span>
            </div>
            
            <div style="margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;"></div>
            
            <div class="adtool-pro-completion-stat-row">
                <span>🏷️ ĐỔI TÊN TÀI KHOẢN:</span>
                <span><strong>${stats.renameSuccess}/${stats.renameTotal} thành công</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📊 Tổng tài khoản:</span>
                <span><strong>${stats.renameTotal}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>✅ Thành công:</span>
                <span><strong>${stats.renameSuccess}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>❌ Thất bại:</span>
                <span><strong>${stats.renameFailed}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏭️ Bỏ qua:</span>
                <span><strong>${stats.renameSkipped}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📈 Tỷ lệ thành công:</span>
                <span><strong>${Math.round((stats.renameSuccess / stats.renameTotal) * 100)}%</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏱️ Thời gian đổi tên:</span>
                <span><strong>${stats.renameStartTime ? Math.round((new Date() - stats.renameStartTime) / 1000) : 0} giây</strong></span>
            </div>
            
            <div style="margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;"></div>
            
            <div class="adtool-pro-completion-stat-row">
                <span>👤 XÓA ADMIN & ANALYSTS:</span>
                <span><strong>${stats.removeAdminSuccess}/${stats.removeAdminTotal} thành công</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📊 Tổng tài khoản:</span>
                <span><strong>${stats.removeAdminTotal}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>✅ Thành công:</span>
                <span><strong>${stats.removeAdminSuccess}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>❌ Thất bại:</span>
                <span><strong>${stats.removeAdminFailed}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>👑 Admin đã xóa:</span>
                <span><strong>${stats.removeAdminAdminsRemoved}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📊 Analyst đã xóa:</span>
                <span><strong>${stats.removeAdminAnalystsRemoved}</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>📈 Tỷ lệ thành công:</span>
                <span><strong>${Math.round((stats.removeAdminSuccess / stats.removeAdminTotal) * 100)}%</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⏱️ Thời gian xóa admin:</span>
                <span><strong>${stats.removeAdminStartTime ? Math.round((new Date() - stats.removeAdminStartTime) / 1000) : 0} giây</strong></span>
            </div>
            
            <div style="margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;"></div>
            
            <div class="adtool-pro-completion-stat-row">
                <span>🎯 TỔNG KẾT:</span>
                <span><strong>${stats.tachSuccessCount + stats.kichHoatSuccess + stats.renameSuccess + stats.removeAdminSuccess} tài khoản hoàn tất</strong></span>
            </div>
            <div class="adtool-pro-completion-stat-row">
                <span>⚡ Tổng thời gian:</span>
                <span><strong>${(stats.tachStartTime ? Math.round((new Date() - stats.tachStartTime) / 1000) : 0) + (stats.kichHoatStartTime ? Math.round((new Date() - stats.kichHoatStartTime) / 1000) : 0) + (stats.renameStartTime ? Math.round((new Date() - stats.renameStartTime) / 1000) : 0) + (stats.removeAdminStartTime ? Math.round((new Date() - stats.removeAdminStartTime) / 1000) : 0)} giây</strong></span>
            </div>
        `;
        
        completionSection.classList.add('show');
    }
}

// Đóng giao diện
function closeCombinedWebUI() {
    const modal = document.querySelector('.adtool-pro-modal');
    if (modal) {
        modal.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Thêm CSS cho animation đóng
const closeStyle = document.createElement('style');
closeStyle.textContent = `
    @keyframes slideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-50px); opacity: 0; }
    }
`;
document.head.appendChild(closeStyle); 

// ==================== PHẦN TÁCH TÀI KHOẢN ====================

async function getReadOnlyAccountIds() {
    const request = await fetch(`https://graph.facebook.com/v17.0/${require('BusinessUnifiedNavigationContext').businessID}/owned_ad_accounts?access_token=${require('WebApiApplication').getAccessToken()}&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_ad_accounts&_reqSrc=BusinessConnectedOwnedAdAccountsStore.brands&date_format=U&fields=%5B%22id%22%2C%22name%22%2C%22account_id%22%2C%22account_status%22%2C%22business%22%2C%22created_time%22%2C%22currency%22%2C%22timezone_name%22%2C%22end_advertiser%22%2C%22end_advertiser_name%22%2C%22invoicing_emails%22%2C%22is_disabled_umbrella%22%2C%22last_spend_time%22%2C%22funding_source%22%2C%22can_be_blocked_from_pixel_sharing%22%2C%22disable_reason%22%2C%22bill_to_org.fields(legal_entity_name)%22%2C%22onbehalf_requests.fields(receiving_business.fields(name)%2Cstatus)%22%5D&filtering=%5B%7B%22field%22%3A%22account_status%22%2C%22operator%22%3A%22NOT_EQUAL%22%2C%22value%22%3A%226%22%7D%5D&limit=10000&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f41c4c0b703bc`, 
    {
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });

    const text = await request.text();
    const data = JSON.parse(text).data;

    // Lọc các tài khoản có "Read-Only" trong tên
    const readOnlyIds = data
        .filter(item => item.name && item.name.includes("Read-Only"))
        .map(item => item.account_id);

    return readOnlyIds;
}

// Cập nhật API addpermission để đồng bộ với tài liệu
async function addpermission(adAccountId) {
    const rawJson = {
        input: {
            business_id: require("BusinessUnifiedNavigationContext").businessID,
            payment_legacy_account_id: adAccountId,
            actor_id: require("CurrentUserInitialData").USER_ID,
            client_mutation_id: "3" // Cập nhật từ "2" thành "3" theo tài liệu
        }
    };
    const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
    const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=24037132059206200&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${require("WebApiApplication").getAccessToken()}`; // Cập nhật doc_id từ 6600383160000030 thành 24037132059206200
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        const billingWritePermission = data?.data?.grant_manage_ad_account?.ad_account?.viewer_permissions?.billing_write;

        if (billingWritePermission) {
            return { status: true, error: null };
        } else {
            return { status: false, error: data };
        }
    } catch (err) {
        return { status: false, error: err };
    }
}

async function CloseAdAccount(adAccountId) {
    const StringPost = `jazoest=25524&fb_dtsg=${require("DTSGInitData").token}&account_id=${adAccountId}&__usid=6-Tskqo1h1o56glr%3APskqo1h16o00sk%3A0-Askqn631d2395g-RV%3D6%3AF%3D&__aaid=0&__bid=${require("BusinessUnifiedNavigationContext").businessID}&__user=${require("CurrentUserInitialData").USER_ID}&__a=1&__req=y&__hs=19998.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016990685&__s=axc5os%3A4n4eqp%3A948yz8&__hsi=7421228722412779754&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1Dxuq3mq1FxebzA3miidBxa7EiwnobES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G2mcwuE2Bz84a9DxW10wywWjxCU5-u2C2l0Fg2uwEwiUmwoErorx2aK2a4p8aHwzzXx-ewjovCxeq4o884O1fwwxefzo5G4E5yeDyU52dwyw-z8c8-5aDwQwKG13y86qbxa4o-2-qaUK2e0UFU2RwrU6CiU9E4KeCK2q5UpwDwjouxK2i2y1sDw4kwtU5K2G0BE&__csr=&lsd=h2GQa8HPsn-MsvTtASY4gX&__spin_r=1016990685&__spin_b=trunk&__spin_t=1727889460&__jssesw=1`;
    const url = `https://business.facebook.com/ads/ajax/account_close`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: StringPost
        });
        let text = await response.text();
        if (text.startsWith('for (;;);')) {
            text = text.slice('for (;;);'.length);
        }
        const data = JSON.parse(text);

        if (Array.isArray(data?.payload) && data.payload.length === 0) {
            return { status: true, error: null };
        } else {
            return { status: false, error: data };
        }
    } catch (err) {
        return { status: false, error: err };
    }
}

// Hàm xử lý một tài khoản (song song)
async function processSingleAccount(accountId, index) {
    stats.tachActiveRequests++;
    
    // Thêm tài khoản vào danh sách đang xử lý
    const accountDisplay = `${accountId} (${index} - Thành công: ${stats.tachSuccessCount}/${stats.config.targetSuccess})`;
    stats.tachCurrentAccounts.push(accountDisplay);
    updateCombinedWebUI();
    
    try {
        console.log(`🔄 [${index}] Bắt đầu xử lý ${accountId}...`);
        
        const addpermissionResult = await addpermission(accountId);
        if (addpermissionResult.status) {
            console.log(`✅ [${index}] ADD People ${accountId}: SUCCESS`);
            const TachAds = await CloseAdAccount(accountId);
            if (TachAds.status) {
                console.log(`✅ [${index}] TÁCH ${accountId}: SUCCESS`);
                stats.tachSuccessCount++;
                
                // Kiểm tra nếu đã đạt đủ số tài khoản thành công
                if (stats.tachSuccessCount >= stats.config.targetSuccess) {
                    stats.tachTotalProcessed++;
                    updateCombinedWebUI();
                    return { completed: true, reason: 'target_reached' };
                }
            } else {
                console.error(`❌ [${index}] TÁCH ${accountId} error:`, TachAds.error);
                stats.tachFailureCount++;
                
                // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
                if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
                    stats.tachTotalProcessed++;
                    updateCombinedWebUI();
                    return { completed: true, reason: 'failure_threshold' };
                }
            }
        } else {
            console.error(`❌ [${index}] ADD People ${accountId} error:`, addpermissionResult.error);
            stats.tachFailureCount++;
            
            // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
            if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
                stats.tachTotalProcessed++;
                updateCombinedWebUI();
                return { completed: true, reason: 'failure_threshold' };
            }
        }
        
        stats.tachTotalProcessed++;
        
        // Delay giữa các tài khoản nếu được bật
        if (stats.config.enableDelayBetweenAccounts && stats.config.delayBetweenAccounts > 0) {
            await new Promise(resolve => setTimeout(resolve, stats.config.delayBetweenAccounts * 1000));
        }
        
    } catch (error) {
        console.error(`❌ [${index}] Lỗi xử lý ${accountId}:`, error);
        stats.tachFailureCount++;
        stats.tachTotalProcessed++;
        
        // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
        if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
            updateCombinedWebUI();
            return { completed: true, reason: 'failure_threshold' };
        }
    } finally {
        // Xóa tài khoản khỏi danh sách đang xử lý
        const accountIndex = stats.tachCurrentAccounts.indexOf(accountDisplay);
        if (accountIndex > -1) {
            stats.tachCurrentAccounts.splice(accountIndex, 1);
        }
        stats.tachActiveRequests--;
        updateCombinedWebUI();
    }
    
    return { completed: false, reason: null };
}

async function processAccountsParallel(accountIds) {
    console.log(`🚀 Bắt đầu xử lý SONG SONG ${accountIds.length} tài khoản (Cần thêm ${stats.tachTargetSuccess - stats.tachSuccessCount} tài khoản thành công)`);
    console.log(`⚡ Xử lý đồng thời tối đa: ${stats.tachMaxConcurrentRequests} tài khoản`);
    
    // Tạo tất cả promises cùng lúc
    const promises = accountIds.map((accountId, index) => {
        const globalIndex = stats.tachTotalProcessed + index + 1;
        return processSingleAccount(accountId, globalIndex);
    });
    
    // Chờ tất cả hoàn thành
    const results = await Promise.all(promises);
    
    // Kiểm tra kết quả
    for (const result of results) {
        if (result.completed) {
            return result;
        }
    }
    
    return { completed: false, reason: null };
}

async function startTachProcess() {
    stats.tachStartTime = new Date();
    stats.tachIsRunning = true;
    stats.currentPhase = 'tach';
    
    updatePhaseIndicator('tach', 'Đang tách tài khoản quảng cáo từ Business Manager');
    
    console.log('🎯 BẮT ĐẦU TÁCH TÀI KHOẢN QUẢNG CÁO (SONG SONG - GIỚI HẠN THEO THÀNH CÔNG)');
    console.log(`�� Mục tiêu: ${stats.config.targetSuccess} tài khoản THÀNH CÔNG`);
    console.log(`⚡ Chế độ: Xử lý đồng thời tối đa ${stats.tachMaxConcurrentRequests} tài khoản`);
    console.log(`⏰ Thời gian bắt đầu: ${stats.tachStartTime.toLocaleString()}`);
    console.log('=====================================\n');
    
    while (stats.tachIsRunning && stats.isRunning) {
        const accountIds = await getReadOnlyAccountIds();
        if (accountIds.length > 0) {
            const result = await processAccountsParallel(accountIds);
            if (result.completed) {
                console.log(`🎉 Dừng quá trình tách: ${result.reason}`);
                if (result.reason === 'target_reached') {
                    console.log('✅ Đã đạt đủ số tài khoản thành công!');
                } else if (result.reason === 'failure_threshold') {
                    console.log('⚠️ Số lần thất bại vượt quá ngưỡng! Chuyển sang kích hoạt tài khoản.');
                }
                break;
            }
        } else {
            console.log("Không tìm thấy tài khoản Read-Only nào.");
            stats.tachCurrentAccounts = ["Không tìm thấy tài khoản Read-Only"];
            updateCombinedWebUI();
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây
    }
    
    stats.tachIsRunning = false;
    return stats.tachSuccessCount;
} 

// ==================== PHẦN KÍCH HOẠT TÀI KHOẢN ====================

// Lấy access token và các thông tin cần thiết
function getRequiredData() {
    let access_token;
    let fb_dtsg2 = require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value;
    let uid = require("CurrentUserInitialData").USER_ID || document.cookie.match(/c_user=(\d+)/)[1];

    try {
        access_token = require("WebApiApplication").getAccessToken();
    } catch (error) { }

    if (access_token === undefined || access_token === '') {
        console.error('Lỗi: Không thể lấy access token. Vui lòng đảm bảo đã đăng nhập Facebook và thử lại');
        return null;
    }

    return { access_token, fb_dtsg2, uid };
}

async function getBusinesses2(access_token) {
    const ver = "v14.0";
    const response = await fetch(
        `https://graph.facebook.com/${ver}/me?fields=id,name,adaccounts.limit(1000){account_status,created_time,owner,name}&access_token=${access_token}`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );
    const json = await response.json();
    return json;
}

async function action2(businessID, index, total, accountName, access_token, fb_dtsg2, uid) {const url = `https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=78266`;

    try {
        console.log(`🔄 [${index + 1}/${total}] Gửi request kích hoạt act_${businessID}`);
    
        const response = await fetch(url, {
            method: 'POST',
            body: `av=${uid}&__usid=...&fb_dtsg=${fb_dtsg2}&...&doc_id=9984888131552276...`, // viết ngắn lại phần dài dòng
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
        const responseText = await response.text();
        console.log(`📄 [${index + 1}/${total}] Response cho act_${businessID}: ${responseText.substring(0, 200)}...`);
    
        if (responseText.includes('status":"ADMARKET_ACCOUNT_STATUS_ACTIVE')) {
            stats.kichHoatSuccess++;
            console.log(`${index + 1}/${total} act_${businessID} | -> ✅ Thành công`);
    
            // Thêm chức năng đổi tên sau khi kích hoạt thành công
            if (stats.config.enableRename) {
                try {
                    const accountInfo = await getAccountInfo(businessID);
                    let shouldRename = true;
    
                    if (stats.config.onlyPersonalAccounts && !window.isPersonalAccount(accountInfo)) {
                        shouldRename = false;
                        console.log(`${index + 1}/${total} act_${businessID} | -> ⏭️ Bỏ qua đổi tên (TKQC thuộc Business Manager)`);
                    }
    
                    if (shouldRename) {
                        const newName = window.generateNewAccountName(`act_${businessID}`, accountInfo);
                        console.log(`${index + 1}/${total} act_${businessID} | -> 🏷️ Đang đổi tên thành: ${newName}`);
    
                        const renameResult = await window.renameAds(businessID, newName);
    
                        if (renameResult.status) {
                            stats.renameSuccess++;
                            if (renameResult.retryCount > 0) {
                                stats.renameRetryCount += renameResult.retryCount;
                            }
                            const retryInfo = renameResult.retryCount > 0 ? ` (sau ${renameResult.retryCount} lần thử)` : '';
                            console.log(`✅ [${index + 1}/${total}] ${businessID} | -> ✅ Đổi tên thành công: ${newName}${retryInfo}`);
                        } else {
                            if (renameResult.noPermission) {
                                stats.renameSkipped++;
                                console.log(`⏭️ [${index + 1}/${total}] ${businessID} | -> ⏭️ Bỏ qua (không có quyền): ${renameResult.error}`);
                            } else {
                                stats.renameFailed++;
                                if (renameResult.retryCount > 0) {
                                    stats.renameRetryCount += renameResult.retryCount;
                                }
                                const retryInfo = renameResult.retryCount > 0 ? ` (đã thử ${renameResult.retryCount} lần)` : '';
                                console.log(`❌ [${index + 1}/${total}] ${businessID} | -> ❌ Đổi tên thất bại${retryInfo}:`, renameResult.error);
                            }
                        }
                    }
                } catch (renameError) {
                    console.log(`${index + 1}/${total} act_${businessID} | -> ⚠️ Lỗi khi đổi tên:`, renameError);
                }
            }
        } else {
            stats.kichHoatFailed++;
            console.log(`${index + 1}/${total} act_${businessID} | -> ❌ Thất bại: ${responseText.substring(0, 100)}`);
        }
    
        stats.kichHoatProcessing--;
    
    } catch (error) {
        stats.kichHoatFailed++;
        stats.kichHoatProcessing--;
        console.log(`${index + 1}/${total} act_${businessID} | -> ❌ Lỗi: ${error.message}`);
    }
}

// Hàm lấy thông tin tài khoản quảng cáo
async function getAccountInfo(accountId) {
    try {
        const accessToken = require("WebApiApplication").getAccessToken();
        const response = await fetch(`https://graph.facebook.com/v19.0/act_${accountId}?fields=id,name,owner_business,account_status&access_token=${accessToken}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin tài khoản:', error);
        return { owner_business: null }; // Fallback
    }
}

// Thay đổi logic kích hoạt từ tuần tự sang song song
async function action1(index, arr, access_token, fb_dtsg2, uid) {
    const total = arr.data.adaccounts.data.length;
    stats.kichHoatTotal = total;
    stats.kichHoatCurrent = index;
    
    if (index >= total) {
        console.log(`🎉 Hoàn thành kích hoạt! Thành công: ${stats.kichHoatSuccess}/${stats.kichHoatTotal}`);
        stats.kichHoatIsRunning = false;
        return;
    }
    
    // Kiểm tra nếu đã dừng
    if (!stats.isRunning) {
        console.log('🛑 Đã dừng chương trình kích hoạt');
        stats.kichHoatIsRunning = false;
        return;
    }
    
    try {
        const data = arr.data.adaccounts.data[index];
        const businessID = data.id.replace("act_", "");
        
        if (data.account_status === 100 || data.account_status === 101) {
            stats.kichHoatProcessing++;
            console.log(`🔄 [${index + 1}/${total}] Bắt đầu kích hoạt act_${businessID}`);
            
            // Kiểm tra lại trạng thái dừng trước khi gọi action2
            if (!stats.isRunning) {
                console.log('🛑 Đã dừng chương trình kích hoạt');
                stats.kichHoatIsRunning = false;
                return;
            }
            
            // Gọi action2 không await để xử lý song song
            action2(businessID, index, total, data.name, access_token, fb_dtsg2, uid);
            
        } else {
            stats.kichHoatSkipped++;
            console.log(`${index + 1}/${total} act_${businessID} | -> Bỏ qua (trạng thái: ${data.account_status})`);
        }
        
    } catch (e) {
        stats.kichHoatFailed++;
        console.log(`❌ Lỗi xử lý tài khoản ${index + 1}:`, e);
    } finally {
        // Tăng index và cập nhật UI
        const nextIndex = index + 1;
        stats.kichHoatCurrent = nextIndex;
        updateCombinedWebUI();
        
        // Giảm delay để tăng tốc độ
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Kiểm tra nếu đã dừng trước khi tiếp tục
        if (stats.isRunning) {
            // Gọi đệ quy với nextIndex
            action1(nextIndex, arr, access_token, fb_dtsg2, uid);
        } else {
            console.log('🛑 Đã dừng chương trình kích hoạt');
            stats.kichHoatIsRunning = false;
        }
    }
}

// Thêm hàm xử lý song song cho kích hoạt
async function processKichHoatParallel(accounts, access_token, fb_dtsg2, uid) {
    console.log(`🚀 Bắt đầu xử lý SONG SONG ${accounts.length} tài khoản kích hoạt`);
    
    // Lấy batch size từ cấu hình
    const batchSize = parseInt(document.getElementById('kichHoatBatchSize')?.value) || 50;
    
    // Chia thành các batch nhỏ để tránh quá tải
    const batches = [];
    
    for (let i = 0; i < accounts.length; i += batchSize) {
        batches.push(accounts.slice(i, i + batchSize));
    }
    
    console.log(`📦 Chia thành ${batches.length} batch, mỗi batch ${batchSize} tài khoản`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (!stats.isRunning) {
            console.log('🛑 Đã dừng chương trình kích hoạt');
            break;
        }
        
        const batch = batches[batchIndex];
        console.log(`🔄 Xử lý batch ${batchIndex + 1}/${batches.length} (${batch.length} tài khoản)`);
        
        // Xử lý song song trong batch
        const promises = batch.map((account, index) => {
            const globalIndex = batchIndex * batchSize + index;
            const businessID = account.id.replace("act_", "");
            
            if (account.account_status === 100 || account.account_status === 101) {
                stats.kichHoatProcessing++;
                return action2(businessID, globalIndex, accounts.length, account.name, access_token, fb_dtsg2, uid);
            } else {
                stats.kichHoatSkipped++;
                console.log(`${globalIndex + 1}/${accounts.length} act_${businessID} | -> Bỏ qua (trạng thái: ${account.account_status})`);
                return Promise.resolve();
            }
        });
        
        // Chờ batch hiện tại hoàn thành
        await Promise.all(promises);
        
        // Cập nhật UI sau mỗi batch
        updateCombinedWebUI();
        
        // Delay nhỏ giữa các batch
        if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    console.log(`✅ Hoàn thành xử lý song song! Thành công: ${stats.kichHoatSuccess}/${stats.kichHoatTotal}`);
}

async function startKichHoatProcess() {
    const requiredData = getRequiredData();
    if (!requiredData) {
        console.error('Không thể lấy dữ liệu cần thiết');
        return 0;
    }
    
    const { access_token, fb_dtsg2, uid } = requiredData;
    
    stats.kichHoatStartTime = new Date();
    stats.kichHoatIsRunning = true;
    stats.currentPhase = 'kichhoat';
    
    updatePhaseIndicator('kichhoat', 'Đang kích hoạt lại các tài khoản đã tách');
    
    console.log('🔓 BẮT ĐẦU KÍCH HOẠT TÀI KHOẢN QUẢNG CÁO (SONG SONG)');
    console.log(`⏰ Thời gian bắt đầu: ${stats.kichHoatStartTime.toLocaleString()}`);
    console.log('=====================================\n');
    
    try {
        console.log('📡 Đang lấy danh sách tài khoản quảng cáo...');
        const json = await getBusinesses2(access_token);
        const arr = { data: json };
        
        console.log(`📊 Tìm thấy ${arr.data.adaccounts.data.length} tài khoản quảng cáo`);
        
        // Kiểm tra nếu đã dừng
        if (!stats.isRunning) {
            console.log('🛑 Đã dừng chương trình');
            stats.kichHoatIsRunning = false;
            return 0;
        }
        
        console.log('🚀 Bắt đầu xử lý song song...');
        
        // Sử dụng xử lý song song thay vì tuần tự
        await processKichHoatParallel(arr.data.adaccounts.data, access_token, fb_dtsg2, uid);
        
        console.log(`✅ Hoàn thành kích hoạt! Tổng kết: ${stats.kichHoatSuccess}/${stats.kichHoatTotal} thành công`);
        return stats.kichHoatSuccess;
    } catch (error) {
        console.error('❌ Lỗi trong quá trình kích hoạt:', error);
        stats.kichHoatIsRunning = false;
        return 0;
    }
} 

// ==================== HÀM CHÍNH ĐIỀU PHỐI ====================

async function mainCombinedProcess() {
    // Lấy cấu hình từ giao diện
    loadConfigFromUI();
    
    stats.isRunning = true;
    stats.tachStartTime = new Date(); // Khởi tạo thời gian bắt đầu
    
    // Cập nhật trạng thái nút
    updateButtonStates();
    
    console.log('🚀 AD TOOL PRO - BẮT ĐẦU QUÁ TRÌNH TỔNG HỢP');
    console.log('=====================================');
    console.log('📋 Cấu hình chức năng:');
    console.log(`⛏️ Tách TKQC: ${stats.config.enableTach ? '✅ Bật' : '❌ Tắt'}`);
    console.log(`🔓 Kích hoạt TKQC: ${stats.config.enableKichHoat ? '✅ Bật' : '❌ Tắt'}`);
    console.log(`🏷️ Đổi tên TKQC: ${stats.config.enableRename ? '✅ Bật' : '❌ Tắt'}`);
    console.log('=====================================');
    
    try {
        // Bước 1: Tách tài khoản (nếu được bật)
        if (stats.config.enableTach) {
            console.log('\n🔧 BƯỚC 1: TÁCH TÀI KHOẢN QUẢNG CÁO');
            updatePhaseIndicator('tach', 'Đang tách tài khoản quảng cáo từ Business Manager');
            
            const tachResult = await startTachProcess();
            console.log(`✅ Hoàn thành tách: ${tachResult} tài khoản thành công`);
        } else {
            console.log('\n⏭️ BƯỚC 1: BỎ QUA TÁCH TÀI KHOẢN (Đã tắt)');
            updatePhaseIndicator('tach', 'Bỏ qua chức năng tách tài khoản');
        }
        
        // Kiểm tra nếu đã dừng
        if (!stats.isRunning) {
            console.log('🛑 Đã dừng chương trình');
            updatePhaseIndicator('idle', 'Đã dừng chương trình');
            updateButtonStates();
            return;
        }
        
        // Bước 2: Kích hoạt tài khoản (nếu được bật)
        if (stats.config.enableKichHoat) {
            // Hiển thị timer đếm ngược nếu có delay
            if (stats.config.delayBeforeKichHoat > 0) {
                console.log(`\n⏰ Chờ ${stats.config.delayBeforeKichHoat} giây trước khi kích hoạt...`);
                updatePhaseIndicator('tach', `Chờ ${stats.config.delayBeforeKichHoat} giây trước khi kích hoạt...`);
                showTimer(stats.config.delayBeforeKichHoat);
                
                // Đợi theo cấu hình
                await new Promise(resolve => setTimeout(resolve, stats.config.delayBeforeKichHoat * 1000));
            }
            
            // Kiểm tra nếu đã dừng
            if (!stats.isRunning) {
                console.log('🛑 Đã dừng chương trình');
                updatePhaseIndicator('idle', 'Đã dừng chương trình');
                updateButtonStates();
                return;
            }
            
            console.log('\n🔓 BƯỚC 2: KÍCH HOẠT TÀI KHOẢN QUẢNG CÁO');
            updatePhaseIndicator('kichhoat', 'Đang kích hoạt lại các tài khoản đã tách');
            
            const kichHoatResult = await startKichHoatProcess();
            console.log(`✅ Hoàn thành kích hoạt: ${kichHoatResult} tài khoản thành công`);
        } else {
            console.log('\n⏭️ BƯỚC 2: BỎ QUA KÍCH HOẠT TÀI KHOẢN (Đã tắt)');
            updatePhaseIndicator('kichhoat', 'Bỏ qua chức năng kích hoạt tài khoản');
        }
        
        // Bước 3: Đổi tên tài khoản (nếu được bật)
        if (stats.config.enableRename) {
            console.log('\n🏷️ BƯỚC 3: ĐỔI TÊN TÀI KHOẢN QUẢNG CÁO');
            updatePhaseIndicator('rename', 'Đang đổi tên các tài khoản quảng cáo cá nhân');
            
            const renameResult = await startRenameProcess();
            console.log(`✅ Hoàn thành đổi tên: ${renameResult} tài khoản thành công`);
        } else {
            console.log('\n⏭️ BƯỚC 3: BỎ QUA ĐỔI TÊN TÀI KHOẢN (Đã tắt)');
            updatePhaseIndicator('rename', 'Bỏ qua chức năng đổi tên tài khoản');
        }
        
        // Kiểm tra nếu đã dừng
        if (!stats.isRunning) {
            console.log('🛑 Đã dừng chương trình');
            updatePhaseIndicator('idle', 'Đã dừng chương trình');
            updateButtonStates();
            return;
        }
        
        // Bước 4: Xóa admin & analysts (nếu được bật)
        if (stats.config.enableRemoveAdmin) {
            console.log('\n👤 BƯỚC 4: XÓA ADMIN & ANALYSTS KHỎI TÀI KHOẢN');
            updatePhaseIndicator('removeadmin', 'Đang xóa admin và nhà phân tích khác khỏi tài khoản');
            
            const removeAdminResult = await startRemoveAdminProcess();
            console.log(`✅ Hoàn thành xóa admin: ${removeAdminResult} tài khoản thành công`);
        } else {
            console.log('\n⏭️ BƯỚC 4: BỎ QUA XÓA ADMIN & ANALYSTS (Đã tắt)');
            updatePhaseIndicator('removeadmin', 'Bỏ qua chức năng xóa admin & analysts');
        }
        
        // Hoàn thành toàn bộ quá trình
        console.log('\n🎉 HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH!');
        updatePhaseIndicator('completed', 'Tất cả quá trình đã hoàn tất thành công');
        
        // Hiển thị báo cáo tổng hợp
        showCompletionCombinedWebUI();
        
        // Thống kê cuối cùng
        const totalSuccess = stats.tachSuccessCount + stats.kichHoatSuccess + stats.renameSuccess + stats.removeAdminSuccess;
        const totalTime = Math.round((new Date() - (stats.tachStartTime || new Date())) / 1000);
        
        console.log('\n📊 THỐNG KÊ TỔNG HỢP:');
        if (stats.config.enableTach) {
            console.log(`🔧 Tách tài khoản: ${stats.tachSuccessCount}/${stats.config.targetSuccess} thành công`);
        }
        if (stats.config.enableKichHoat) {
            console.log(`🔓 Kích hoạt tài khoản: ${stats.kichHoatSuccess}/${stats.kichHoatTotal} thành công`);
        }
        if (stats.config.enableRename) {
            console.log(`🏷️ Đổi tên tài khoản: ${stats.renameSuccess}/${stats.renameTotal} thành công`);
        }
        if (stats.config.enableRemoveAdmin) {
            console.log(`👤 Xóa admin & analysts: ${stats.removeAdminSuccess}/${stats.removeAdminTotal} thành công`);
            console.log(`   - Admin đã xóa: ${stats.removeAdminAdminsRemoved}`);
            console.log(`   - Analyst đã xóa: ${stats.removeAdminAnalystsRemoved}`);
        }
        console.log(`🎯 Tổng cộng: ${totalSuccess} tài khoản hoàn tất`);
        console.log(`⏱️ Tổng thời gian: ${totalTime} giây`);
        console.log('\nHASoftware - Ads Solution - Auto Version');
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình tổng hợp:', error);
        updatePhaseIndicator('completed', 'Có lỗi xảy ra trong quá trình xử lý');
    } finally {
        stats.isRunning = false;
        updateButtonStates();
    }
}

// Hàm khởi chạy chương trình
function startAdToolPro() {
    if (stats.isRunning) {
        console.log('⚠️ Chương trình đang chạy. Vui lòng đợi hoàn thành.');
        return;
    }
    
    // Tạo giao diện web nếu chưa có
    if (!document.querySelector('.adtool-pro-modal')) {
        createCombinedWebUI();
        console.log('🎨 Đã tạo giao diện AdTool Pro');
    } else {
        console.log('ℹ️ Giao diện AdTool Pro đã tồn tại');
    }
    
    // Reset thống kê
    stats = {
        // Thống kê tách tài khoản
        tachTotalProcessed: 0,
        tachSuccessCount: 0,
        tachFailureCount: 0,
        tachTargetSuccess: 600,
        tachStartTime: null,
        tachActiveRequests: 0,
        tachMaxConcurrentRequests: 200,
        tachIsRunning: false,
        tachCurrentAccounts: [],
        
        // Thống kê kích hoạt tài khoản
        kichHoatTotal: 0,
        kichHoatSuccess: 0,
        kichHoatFailed: 0,
        kichHoatSkipped: 0,
        kichHoatProcessing: 0,
        kichHoatCurrent: 0,
        kichHoatStartTime: null,
        kichHoatIsRunning: false,
        
        // Thống kê đổi tên tài khoản
        renameTotal: 0,
        renameSuccess: 0,
        renameFailed: 0,
        renameSkipped: 0,
        renameProcessing: 0,
        renameCurrent: 0,
        renameStartTime: null,
        renameIsRunning: false,
        renameRetryCount: 0, // Số lần retry tổng cộng
        
        // Thống kê xóa admin & analysts
        removeAdminTotal: 0,
        removeAdminSuccess: 0,
        removeAdminFailed: 0,
        removeAdminSkipped: 0,
        removeAdminCurrent: 0,
        removeAdminStartTime: null,
        removeAdminIsRunning: false,
        removeAdminAdminsRemoved: 0,
        removeAdminAnalystsRemoved: 0,
        
        // Trạng thái tổng thể
        currentPhase: 'idle',
        isRunning: false,
        failureThreshold: 500,
        
        // Cấu hình mới
        config: {
            enableTach: true,
            enableKichHoat: true,
            enableRename: false,
            enableRemoveAdmin: false,
            
            failureThresholdToKichHoat: 500,
            targetSuccess: 600,
            enableDelayBetweenAccounts: false,
            delayBetweenAccounts: 1,
            
            delayBeforeKichHoat: 300,
            kichHoatBatchSize: 50,
            
            renameMode: 'fixed',
            fixedName: 'HoangAnh TKQC',
            businessName: '',
            onlyPersonalAccounts: true,
            
            removeAdminOnly: true,
            removeAnalystOnly: false,
            removeBoth: false,
            removeAdminDelay: 2
        }
    };
    
    // Khởi chạy quá trình tổng hợp
    mainCombinedProcess();
}

// Hàm dừng chương trình
function stopAdToolPro() {
    stats.isRunning = false;
    stats.tachIsRunning = false;
    stats.kichHoatIsRunning = false;
    console.log('🛑 Đã dừng chương trình AD TOOL PRO');
    updateButtonStates();
}

// Hàm cập nhật cài đặt
function updateSettings(newSettings) {
    if (newSettings.tachTargetSuccess) {
        stats.tachTargetSuccess = newSettings.tachTargetSuccess;
    }
    if (newSettings.maxConcurrentRequests) {
        stats.tachMaxConcurrentRequests = newSettings.maxConcurrentRequests;
    }
    if (newSettings.failureThreshold) {
        stats.failureThreshold = newSettings.failureThreshold;
    }
    console.log('⚙️ Đã cập nhật cài đặt:', newSettings);
}

// Hàm load cấu hình từ giao diện
function loadConfigFromUI() {
    try {
        // Tích chọn chính
        const enableTach = document.getElementById('enableTach').checked;
        const enableKichHoat = document.getElementById('enableKichHoat').checked;
        const enableRename = document.getElementById('enableRename').checked;
        
        // Cấu hình tách
        const tachTargetSuccess = parseInt(document.getElementById('tachTargetSuccess').value) || 600;
        const maxConcurrentRequests = parseInt(document.getElementById('maxConcurrentRequests').value) || 200;
        const failureThreshold = parseInt(document.getElementById('failureThreshold').value) || 500;
        const enableDelayBetweenAccounts = document.getElementById('enableDelayBetweenAccounts').checked;
        const delayBetweenAccounts = parseInt(document.getElementById('delayBetweenAccounts').value) || 1;
        
        // Cấu hình kích hoạt
        const delayBeforeKichHoat = parseInt(document.getElementById('delayBeforeKichHoat').value) || 300;
        const kichHoatBatchSize = parseInt(document.getElementById('kichHoatBatchSize').value) || 50;
        
        // Cấu hình đổi tên
        const onlyPersonalAccounts = document.getElementById('onlyPersonalAccounts').checked;
        const fixedName = document.getElementById('fixedName').value || 'HoangAnh TKQC';
        
        // Lấy chế độ đổi tên từ radio buttons
        const renameModeFixed = document.getElementById('renameModeFixed');
        const renameModeBusiness = document.getElementById('renameModeBusiness');
        let renameMode = 'fixed';
        if (renameModeBusiness && renameModeBusiness.checked) {
            renameMode = 'business';
        }
        
        // Cấu hình xóa admin & analysts
        const enableRemoveAdmin = document.getElementById('enableRemoveAdmin').checked;
        const removeAdminDelay = parseInt(document.getElementById('removeAdminDelay').value) || 2;
        
        // Lấy loại user cần xóa từ radio buttons
        const removeAdminOnly = document.getElementById('removeAdminOnly');
        const removeAnalystOnly = document.getElementById('removeAnalystOnly');
        const removeBoth = document.getElementById('removeBoth');
        
        let removeAdminType = 'admin'; // default
        if (removeAnalystOnly && removeAnalystOnly.checked) {
            removeAdminType = 'analyst';
        } else if (removeBoth && removeBoth.checked) {
            removeAdminType = 'both';
        }
        
        // Cập nhật cấu hình
        stats.config.enableTach = enableTach;
        stats.config.enableKichHoat = enableKichHoat;
        stats.config.enableRename = enableRename;
        stats.config.enableRemoveAdmin = enableRemoveAdmin;
        
        stats.config.targetSuccess = tachTargetSuccess;
        stats.tachMaxConcurrentRequests = maxConcurrentRequests;
        stats.config.failureThresholdToKichHoat = failureThreshold;
        stats.config.enableDelayBetweenAccounts = enableDelayBetweenAccounts;
        stats.config.delayBetweenAccounts = delayBetweenAccounts;
        
        stats.config.delayBeforeKichHoat = delayBeforeKichHoat;
        stats.config.kichHoatBatchSize = kichHoatBatchSize;
        
        // Cập nhật cấu hình đổi tên
        stats.config.onlyPersonalAccounts = onlyPersonalAccounts;
        stats.config.fixedName = fixedName;
        stats.config.renameMode = renameMode;
        
        // Cập nhật cấu hình xóa admin
        stats.config.removeAdminDelay = removeAdminDelay;
        stats.config.removeAdminOnly = removeAdminType === 'admin';
        stats.config.removeAnalystOnly = removeAdminType === 'analyst';
        stats.config.removeBoth = removeAdminType === 'both';
        
        console.log('⚙️ Đã load cấu hình từ giao diện:', {
            ...stats.config,
            tachMaxConcurrentRequests: stats.tachMaxConcurrentRequests
        });
    } catch (error) {
        console.error('❌ Lỗi load cấu hình:', error);
    }
}

// Hàm cập nhật trạng thái nút
function updateButtonStates() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const closeButton = document.getElementById('closeButton');
    
    if (startButton && stopButton && closeButton) {
        if (stats.isRunning) {
            startButton.disabled = true;
            stopButton.disabled = false;
            closeButton.disabled = true; // Disable close button when running
        } else {
            startButton.disabled = false;
            stopButton.disabled = true;
            closeButton.disabled = false; // Enable close button when idle
        }
    }
}

// Export các hàm để sử dụng
window.AdToolPro = {
    start: startAdToolPro,
    stop: stopAdToolPro,
    updateSettings: updateSettings,
    stats: stats
};

// Thêm hàm renameAds vào global scope
window.renameAds = renameAds;
window.isPersonalAccount = isPersonalAccount;
window.generateNewAccountName = generateNewAccountName;

// Tự động khởi chạy khi load script
console.log('🚀 AD TOOL PRO đã sẵn sàng!');
console.log('Sử dụng: AdToolPro.start() để bắt đầu');
console.log('Sử dụng: AdToolPro.stop() để dừng');
console.log('Sử dụng: AdToolPro.updateSettings({...}) để cập nhật cài đặt');

// Tạo giao diện và hiển thị ngay khi load script
if (!document.querySelector('.adtool-pro-modal')) {
    createCombinedWebUI();
    console.log('🎨 Đã tạo giao diện AdTool Pro');
} else {
    console.log('ℹ️ Giao diện AdTool Pro đã tồn tại');
} 

// Hàm kiểm tra xem tài khoản có phải là cá nhân không
function isPersonalAccount(accountData) {
    return !accountData.owner_business; // Không có owner_business = tài khoản cá nhân
}

// Hàm tạo tên mới cho tài khoản quảng cáo
function generateNewAccountName(accountId, accountData) {
    const accountIdOnly = accountId.replace("act_", "");
    
    if (stats.config.renameMode === 'fixed') {
        return `${stats.config.fixedName} ${accountIdOnly}`;
    } else if (stats.config.renameMode === 'business') {
        return `${stats.config.businessName} ${accountIdOnly}`;
    }
    
    return `Account ${accountIdOnly}`; // Fallback
} 

// Hàm đổi tên tài khoản quảng cáo với retry mechanism
async function renameAds(adAccountId, newName, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 giây
    
    try {
        const accessToken = require("WebApiApplication").getAccessToken();
        
        // Sử dụng API đúng cho tài khoản cá nhân
        const url = `https://graph.facebook.com/v14.0/${adAccountId}?name=${encodeURIComponent(newName)}&access_token=${accessToken}&method=post`;
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();

        // Log response để debug
        console.log(`🔍 [${adAccountId}] API Response:`, JSON.stringify(data, null, 2));

        // Kiểm tra lỗi từ Facebook API
        if (data.error) {
            const errorMessage = data.error.message || 'Lỗi không xác định';
            const errorCode = data.error.code || 'UNKNOWN';
            const errorSubcode = data.error.error_subcode || null;
            
            // Danh sách lỗi có thể retry
            const retryableErrors = [
                1675030, // field_exception server error
                1,       // API Unknown
                2,       // API Service
                4,       // API Too Many Calls
                17,      // API User Too Many Calls
                102,     // API Session has expired
                190,     // API Invalid OAuth 2.0 Access Token
                613,     // API Hits User Rate Limit
            ];
            
            // Danh sách lỗi không có quyền (không retry)
            const permissionErrors = [
                { code: 100, subcode: 1487828 }, // Không có quyền cập nhật tài khoản quảng cáo
                { code: 190, subcode: 1 },       // Không có quyền truy cập
                { code: 200, subcode: 1 },       // Không có quyền admin
            ];
            
            // Kiểm tra nếu là lỗi không có quyền
            const isPermissionError = permissionErrors.some(err => 
                err.code === errorCode && (err.subcode === errorSubcode || !err.subcode)
            );
            
            if (isPermissionError) {
                console.log(`⚠️ [${adAccountId}] Không có quyền đổi tên tài khoản này: ${errorMessage}`);
                return { 
                    status: false, 
                    error: `Không có quyền: ${errorMessage}`,
                    details: data.error,
                    retryCount: retryCount,
                    noPermission: true
                };
            }
            
            // Thử lại nếu là lỗi có thể retry
            if (retryableErrors.includes(errorCode) && retryCount < maxRetries) {
                console.log(`�� [${adAccountId}] Lỗi ${errorCode}, thử lại lần ${retryCount + 1}/${maxRetries} sau ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return await renameAds(adAccountId, newName, retryCount + 1);
            }
            
            return { 
                status: false, 
                error: `Facebook API Error (${errorCode}): ${errorMessage}`,
                details: data.error,
                retryCount: retryCount
            };
        }

        // Kiểm tra nếu có name trong response hoặc success
        if (data.name === newName || data.success === true || data.id) {
            if (retryCount > 0) {
                console.log(`✅ [${adAccountId}] Đổi tên thành công sau ${retryCount} lần thử lại`);
            }
            return { status: true, error: null, retryCount: retryCount };
        } else {
            return { 
                status: false, 
                error: `Tên không được cập nhật. Expected: ${newName}, Got: ${data.name || 'undefined'}`,
                details: data,
                retryCount: retryCount
            };
        }
    } catch (err) {
        // Thử lại nếu là lỗi network và chưa hết số lần retry
        if (retryCount < maxRetries) {
            console.log(`🔄 [${adAccountId}] Network error, thử lại lần ${retryCount + 1}/${maxRetries} sau ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return await renameAds(adAccountId, newName, retryCount + 1);
        }
        
        return { 
            status: false, 
            error: `Network Error: ${err.message}`,
            details: err,
            retryCount: retryCount
        };
    }
}

// Hàm xử lý đổi tên một tài khoản
async function processRenameAccount(account, index, total) {
    try {
        const accountId = account.id;
        const currentName = account.name;
        
        console.log(`🔄 [${index + 1}/${total}] Đang xử lý ${accountId} (${currentName})`);
        
        // Tạo tên mới
        const newName = window.generateNewAccountName(accountId, account);
        
        console.log(`🏷️ [${index + 1}/${total}] Đổi tên từ "${currentName}" thành "${newName}"`);
        
        // Thực hiện đổi tên
        const renameResult = await window.renameAds(accountId, newName);
        
        if (renameResult.status) {
            stats.renameSuccess++;
            if (renameResult.retryCount > 0) {
                stats.renameRetryCount += renameResult.retryCount;
            }
            const retryInfo = renameResult.retryCount > 0 ? ` (sau ${renameResult.retryCount} lần thử)` : '';
            console.log(`✅ [${index + 1}/${total}] ${accountId} | -> ✅ Đổi tên thành công: ${newName}${retryInfo}`);
        } else {
            if (renameResult.noPermission) {
                stats.renameSkipped++;
                console.log(`⏭️ [${index + 1}/${total}] ${accountId} | -> ⏭️ Bỏ qua (không có quyền): ${renameResult.error}`);
            } else {
                stats.renameFailed++;
                if (renameResult.retryCount > 0) {
                    stats.renameRetryCount += renameResult.retryCount;
                }
                const retryInfo = renameResult.retryCount > 0 ? ` (đã thử ${renameResult.retryCount} lần)` : '';
                console.log(`❌ [${index + 1}/${total}] ${accountId} | -> ❌ Đổi tên thất bại${retryInfo}:`, renameResult.error);
            }
        }
        
    } catch (error) {
        stats.renameFailed++;
        console.log(`❌ [${index + 1}/${total}] ${account.id} | -> ❌ Lỗi: ${error.message}`);
    }
}

// Hàm bắt đầu quá trình đổi tên độc lập
async function startRenameProcess() {
    try {
        console.log('🏷️ BẮT ĐẦU QUÁ TRÌNH ĐỔI TÊN TÀI KHOẢN QUẢNG CÁO');
        console.log('=====================================');
        
        // Reset thống kê đổi tên
        stats.renameTotal = 0;
        stats.renameSuccess = 0;
        stats.renameFailed = 0;
        stats.renameSkipped = 0;
        stats.renameProcessing = 0;
        stats.renameCurrent = 0;
        stats.renameRetryCount = 0;
        stats.renameStartTime = new Date();
        stats.renameIsRunning = true;
        stats.currentPhase = 'rename';
        
        updatePhaseIndicator('rename', 'Đang đổi tên các tài khoản quảng cáo cá nhân');
        
        // Lấy access token
        const accessToken = require("WebApiApplication").getAccessToken();
        
        // Lấy User ID từ access token hoặc sử dụng cách khác
        let uid;
        try {
            uid = require("WebApiApplication").getUserId();
        } catch (error) {
            // Nếu không lấy được User ID, thử lấy từ access token
            try {
                const tokenResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const tokenData = await tokenResponse.json();
                uid = tokenData.id;
            } catch (tokenError) {
                console.error('❌ Không thể lấy User ID:', tokenError);
                stats.renameIsRunning = false;
                return 0;
            }
        }
        
        console.log('📋 Đang lấy danh sách tài khoản quảng cáo...');
        
        // Lấy danh sách tài khoản quảng cáo
        const response = await fetch(`https://graph.facebook.com/v19.0/${uid}/adaccounts?access_token=${accessToken}&pretty=1&fields=account_status,created_time,owner,owner_business,name,adtrust_dsl,currency,userpermissions.user(${uid})%7Brole%7D&limit=300`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log('❌ Không tìm thấy tài khoản quảng cáo nào');
            stats.renameIsRunning = false;
            return 0;
        }
        
        // Lọc chỉ lấy tài khoản cá nhân (không thuộc Business Manager)
        const personalAccounts = data.data.filter(item => !item.owner_business);
        
        console.log(`📊 Tìm thấy ${data.data.length} tài khoản quảng cáo`);
        console.log(`👤 Trong đó có ${personalAccounts.length} tài khoản cá nhân`);
        
        if (personalAccounts.length === 0) {
            console.log('❌ Không tìm thấy tài khoản cá nhân nào để đổi tên');
            stats.renameIsRunning = false;
            return 0;
        }
        
        stats.renameTotal = personalAccounts.length;
        console.log(`🎯 Bắt đầu đổi tên ${stats.renameTotal} tài khoản cá nhân`);
        
        // Xử lý đổi tên song song
        const batchSize = 10; // Số tài khoản xử lý đồng thời
        let processedCount = 0;
        
        for (let i = 0; i < personalAccounts.length; i += batchSize) {
            const batch = personalAccounts.slice(i, i + batchSize);
            const promises = batch.map(async (account, batchIndex) => {
                const globalIndex = i + batchIndex;
                return await processRenameAccount(account, globalIndex, personalAccounts.length);
            });
            
            await Promise.all(promises);
            processedCount += batch.length;
            
            // Cập nhật tiến trình
            stats.renameCurrent = processedCount;
            updateCombinedWebUI();
            
            // Kiểm tra nếu đã dừng
            if (!stats.isRunning) {
                console.log('🛑 Đã dừng quá trình đổi tên');
                break;
            }
            
            // Delay nhỏ giữa các batch
            if (i + batchSize < personalAccounts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`✅ Hoàn thành đổi tên: ${stats.renameSuccess}/${stats.renameTotal} thành công`);
        console.log(`🔄 Tổng số lần retry: ${stats.renameRetryCount}`);
        stats.renameIsRunning = false;
        
        return stats.renameSuccess;
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình đổi tên:', error);
        stats.renameIsRunning = false;
        return 0;
    }
}

// Thêm các hàm vào global scope
window.isPersonalAccount = isPersonalAccount;
window.generateNewAccountName = generateNewAccountName;
window.renameAds = renameAds;
window.startRenameProcess = startRenameProcess;
window.processRenameAccount = processRenameAccount;

// ==================== PHẦN XÓA ADMIN & ANALYSTS ====================

// Lấy danh sách tài khoản quảng cáo cá nhân
async function getPersonalAdAccountsForRemove() {
    try {
        const accessToken = require("WebApiApplication").getAccessToken();
        const uid = await getCurrentUserID();
        
        console.log('📋 Đang lấy danh sách tài khoản quảng cáo...');
        
        const response = await fetch(`https://graph.facebook.com/v14.0/me/adaccounts?summary=1&access_token=${accessToken}&limit=1000&fields=account_id,name,adtrust_dsl,account_status,users%7Bid,role%7D&locale=en_US`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log('❌ Không tìm thấy tài khoản quảng cáo nào');
            return [];
        }
        
        // Lọc chỉ lấy tài khoản cá nhân
        const personalAccounts = data.data.filter(item => {
            const isPersonal = !item.name.includes('Business') && 
                              !item.name.includes('Manager') && 
                              (item.name.includes('Read-Only') || item.account_status === 1);
            return isPersonal;
        });
        
        console.log(`📊 Tìm thấy ${data.data.length} tài khoản quảng cáo`);
        console.log(`👤 Trong đó có ${personalAccounts.length} tài khoản cá nhân`);
        
        return personalAccounts;
        
    } catch (error) {
        console.error(`❌ Lỗi khi lấy danh sách tài khoản: ${error.message}`);
        return [];
    }
}

// Lấy User ID hiện tại
async function getCurrentUserID() {
    try {
        // Thử lấy từ WebApiApplication trước
        const uid = require("WebApiApplication").getUserId();
        if (uid) {
            console.log(`✅ Lấy được User ID: ${uid}`);
            return uid;
        }
    } catch (error) {
        console.log(`⚠️ Không thể lấy User ID từ WebApiApplication: ${error.message}`);
    }
    
    try {
        // Thử lấy từ CurrentUserInitialData
        const uid = require("CurrentUserInitialData").USER_ID;
        if (uid) {
            console.log(`✅ Lấy được User ID từ CurrentUserInitialData: ${uid}`);
            return uid;
        }
    } catch (error) {
        console.log(`⚠️ Không thể lấy User ID từ CurrentUserInitialData: ${error.message}`);
    }
    
    try {
        // Thử lấy từ access token
        const accessToken = require("WebApiApplication").getAccessToken();
        const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.id) {
            console.log(`✅ Lấy được User ID từ Graph API: ${data.id}`);
            return data.id;
        }
    } catch (error) {
        console.log(`❌ Không thể lấy User ID từ Graph API: ${error.message}`);
    }
    
    throw new Error('Không thể lấy User ID');
}

// Xóa admin khỏi tài khoản
async function removeAdminFromAccount(accountId, userId) {
    try {
        // Lấy fb_dtsg token
        const fb_dtsg = require("DTSGInitData").token;
        const currentUserID = require("CurrentUserInitialData").USER_ID;
        
        // Request 1: Confirm
        const confirmUrl = `https://adsmanager.facebook.com/ads/manage/settings/remove_user/confirm/?user_id=${userId}&act=${accountId}&is_new_account_settings=true&fb_dtsg_ag=${encodeURIComponent(fb_dtsg)}&__asyncDialog=1&__aaid=${accountId}&__user=${currentUserID}&__a=1&__req=1y&__hs=20299.BP%3Aads_manager_comet_pkg.2.0...0&dpr=1&__ccg=UNKNOWN&__rev=1025299733&__s=n586gt%3Avyuy0h%3Ali44py&__hsi=7532767328083407025&__dyn=7AgSXgWGgWEjgCu6mudg9omosyUqDBBh96EnK49o9EeUaVoWFGV8kG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU-4ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW7A78O4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJ3rG2PCG9DDl0zlBwyzp8KUWcwxyU29xep3bBAzEW9lpubwIxecAwXzogyo464Xy-cwuEnxaFo5a7EN1O79UCumbz8KiewwBK68eF8pK1Nxebxa4AbxR2V8cE8Q3mbgOUGfgeEmwJCxSegroG48gyHxSi4p8y7rKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAwLzUS327EG4E949BCxK9J7yUnwUzpUqy8doHxe78-5aCCyogyoC2GZ3UC2C8ByoK4Ekx24oK4Ehz8C6oWqaUK2e4E4OawtV-i782bByUeoQwox3UO364GJe2q2B12uueC-5u8Bxu6o9UeUhxWUl-2a64uWg-26q7p9UlxuiueyKvyUkgC9xq2K3GUixl4wNx5e8wAAAVQEhy8myFUpzEGQ48Cq4E8888oAgCi2aawVy8khEkxyEoypopxKU-GoigK6K224kifyo&__hsdp=gbcdMN8MT0jHcwmmk998424RMSCg4Oal4gJApwN93CjdcIXh48132ch34qjnP8IIY0KI4IncOli8fK8Quil1CVk1jwqo6y2K2e8AgfE17U9U1l80er8&__hblp=0Ywgoao8oizbK2e48vm9KuU8awTwNzFolx-rwgGwAyWBxbaaCmd6YQCzRAHxnSy9Yh2c9Mz6DEh6gV1r5Mg8Y7a7Yl2WYmziNl8IHTVp1qBh4boxibUx4WJllhqgiDgiQmimKnOT5Za7km4YZlLVQ4oGte842fHBWkwiG4pszVBpkUJ4xOiq1vUxm6UGmfx6fm8xeloUJtk_yHgTRy84994cXXFxbhUpyQumyfl4BAXVpbCK4keUBaiVEC8nGRYBcBaGJbGmW-55VowGyFUTxC6EsDABAOAVrj-ut5jAVZ9xhFlU-8-bgsF1GUkxybGqu5FaCx16xh29Q4UWqi58aFpoReV-y4zovzF8CSjSZ5y8x4lClqBG12xWnpGH4mJzArqXUypi4mWgyCKh58FpqAKu_AZ3oCheicy8V2CAbQimh92t3VvKt3ppeEolk548AQGV8yKq6XS1vLh4plAGKJ0MkyLRgOj-6td3aoKWx3Kjm9h6GhO0jA4bZlXGLcZxGYxojwApAahifF0Z86sHiQjS8ADmVeFQWgGm9GHABjxqp28hyHD8AGmeLuWriLp28ER7ppExEzbZ5V4C9U8pppiCyCWGEyVTF28Gi4FBgjG9GJ5xCDA_Gi9giAyHBCyppGmryStHjKeABcly21d2948yrVaLgmyUyrDpt2oC4omAWUmUG5poC4VeFcSG4S8Aqaaj8yh2h4BliNcGBhZha7jKYLGDgC48yp4Gdxh25GqqAcHCVRyESfgx5hapadUJqE-JAih94AidBhEC4tDjWhqpapGlml5jilDyKA4vlkmcAZkF22qFpkK9LWzVFeZmBxK6fWAwk8sh25AzKFoWaJaFoeCHx6q9AGXAh_F7BWiuGCBGitbgTEBniHVJ6GG_fBp95GDGEOpeqJoxaijZelejaF9eiSEHhFoOucXWUgTAV5yKX_l7ppAjGumchVvy9V4vxXzVlgqQ6VVU&__comet_req=58&jazoest=24801&__spin_r=1025299733&__spin_b=trunk&__spin_t=1753859065&__jssesw=1&_callFlowletID=0&_triggerFlowletID=4722&qpl_active_e2e_trace_ids=`;
        
        const confirmResponse = await fetch(confirmUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-prefers-color-scheme': 'light',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            }
        });
        
        if (!confirmResponse.ok) {
            throw new Error(`Confirm request failed: ${confirmResponse.status}`);
        }
        
        // Request 2: Remove user
        const removeUrl = `https://adsmanager.facebook.com/ads/manage/settings/remove_user/?user_id=${userId}&act=${accountId}&is_new_account_settings=1&ads_manager_write_regions=true&_callFlowletID=0&_triggerFlowletID=5180&qpl_active_e2e_trace_ids=`;
        
        const removeBody = `jazoest=25069&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__aaid=${accountId}&__user=${currentUserID}&__a=1&__req=20&__hs=20299.BP%3Aads_manager_comet_pkg.2.0...0&dpr=1&__ccg=UNKNOWN&__rev=1025299733&__s=n586gt%3Avyuy0h%3Ali44py&__hsi=7532767328083407025&__dyn=7AgSXgWGgWEjgCu6mudg9omosyUqDBBh96EnK49o9EeUaVoWFGV8kG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU-4ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW7A78O4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJ3rG2PCG9DDl0zlBwyzp8KUWcwxyU29xep3bBAzEW9lpubwIxecAwXzogyo464Xy-cwuEnxaFo5a7EN1O79UCumbz8KiewwBK68eF8pK1Nxebxa4AbxR2V8cE8Q3mbgOUGfgeEmwJCxSegroG48gyHxSi4p8y7rKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAwLzUS327EG4E949BCxK9J7yUnwUzpUqy8doHxe78-5aCCyogyoC2GZ3UC2C8ByoK4Ekx24oK4Ehz8C6oWqaUK2e4E4OawtV-i782bByUeoQwox3UO364GJe2q2B12uueC-5u8Bxu6o9UeUhxWUl-2a64uWg-26q7p9UlxuiueyKvyUkgC9xq2K3GUixl4wNx5e8wAAAVQEhy8myFUpzEGQ48Cq4E8888oAgCi2aawVy8khEkxyEoypopxKU-GoigK6K224kifyo&__hsdp=gbcdMN8MT0jHcwmmk998424RMSCg4Och4gJApwN93CjdcIXh48132ch34qjnP8IIY0KI4IncOli8fK8Quil1CVk1jwqo6y7VF88m8AgcQ9wdoi8xaVbG589U1l80er8&__hblp=0Ywgoao8oizbK2e48vm9KuU8awTwNzFolx-rwgGwAyWBxbaaCmd6YQCzRAHxnSy9Yh2c9Mz6DEh6gV1r5Mg8Y7a7Yl2WYmziNl8IHTVp1qBh4boxibUx4WJllhqgiDgiQmimKnOT5Za7km4YZlLVQ4oGte842fHBWkwiG4pszVBpkUJ4xOiq1vUxm6UGmfx6fm8xeloUJtk_yHgTRy84994cXXFxbhUpyQumyfl4BAXVpbCK4keUBaiVEC8nGRYBcBaGJbGmW-55VowGyFUTxC6EsDABAOAVrj-ut5jAVZ9xhFlU-8-bgsF1GUkxybGqu5FaCx16xh29Q4UWqi58aFpoReV-y4zovzF8CSjSZ5y8x4lClqBG12xWnpGH4mJzArqXUypi4mWgyCKh58FpqAKu_AZ3oCheicy8V2CAbQimh92t3VvKt3ppeEolk548AQGV8yKq6XS1vLh4plAGKJ0MkyLRgOj-6td3aoKWx3Kjm9h6GhO0jA4bZlXGLcZxGYxojwApAahifF0Z86sHiQjS8ADmVeFQWgGm9GHABjxqp28hyHD8AGmeLuWriLp28ER7ppExEzbZ5V4C9U8pppiCyCWGEyVTF28Gi4FBgjG9GJ5xCDA_Gi9giAyHBCyppGmryStHjKeABcly21d2948yrVaLgmyUyrDpt2oC4omAWUmUG5poC4VeFcSG4S8Aqaaj8yh2h4BliNcGBhZha7jKYLGDgC48yp4Gdxh25GqqAcHCVRyESfgx5hapadUJqE-JAih94AidBhEC4tDjWhqpapGlml5jilDyKA4vlkmcAZkF22qFpkK9LWzVFeZmBxK6fWAwk8sh25AzKFoWaJaFoeCHx6q9AGXAh_F7BWiuGCBGitbgTEBniHVJ6GG_fBp95GDGEOpeqJoxaijZelejaF9eiSEHhFoOucXWUgTAV5yKX_l7ppAjGumchVvy9V4vxXzVlgqQ6VVU&__comet_req=58&lsd=RUbO3Wa_Or1oEH9-Omq85m&__spin_r=1025299733&__spin_b=trunk&__spin_t=1753859065&__jssesw=1`;
        
        const removeResponse = await fetch(removeUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/x-www-form-urlencoded',
                'sec-ch-prefers-color-scheme': 'light',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            },
            body: removeBody
        });
        
        if (!removeResponse.ok) {
            throw new Error(`Remove request failed: ${removeResponse.status}`);
        }
        
        const responseText = await removeResponse.text();
        
        // Kiểm tra response để xác định thành công
        if (responseText.includes('success') || responseText.includes('removed') || removeResponse.status === 200) {
            return { success: true, error: null };
        } else {
            return { success: false, error: 'Unknown response' };
        }
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Xóa admin & analysts khỏi tài khoản
async function removeOtherAdmins(account, currentUserID) {
    try {
        if (!account.users || !account.users.data) {
            console.log(`⚠️ Tài khoản ${account.account_id} không có thông tin users`);
            return { success: false, adminsRemoved: 0, analystsRemoved: 0, error: 'No users data' };
        }
        
        let usersToRemove = [];
        
        // Lọc admin (role 1001) nếu được bật
        if (stats.config.removeAdminOnly || stats.config.removeBoth) {
            const admins = account.users.data.filter(user => user.role === 1001);
            const otherAdmins = admins.filter(admin => admin.id !== currentUserID);
            usersToRemove.push(...otherAdmins.map(admin => ({ ...admin, type: 'admin' })));
        }
        
        // Lọc nhà phân tích (role 1003) nếu được bật
        if (stats.config.removeAnalystOnly || stats.config.removeBoth) {
            const analysts = account.users.data.filter(user => user.role === 1003);
            const otherAnalysts = analysts.filter(analyst => analyst.id !== currentUserID);
            usersToRemove.push(...otherAnalysts.map(analyst => ({ ...analyst, type: 'analyst' })));
        }
        
        if (usersToRemove.length === 0) {
            console.log(`✅ Tài khoản ${account.account_id} không có user khác cần xóa`);
            return { success: true, adminsRemoved: 0, analystsRemoved: 0, error: null };
        }
        
        const adminCount = usersToRemove.filter(u => u.type === 'admin').length;
        const analystCount = usersToRemove.filter(u => u.type === 'analyst').length;
        
        console.log(`🔍 Tìm thấy ${adminCount} admin và ${analystCount} nhà phân tích khác trong tài khoản ${account.account_id}`);
        console.log(`📋 Danh sách user cần xóa: ${usersToRemove.map(u => `${u.id} (${u.type})`).join(', ')}`);
        
        let adminsRemoved = 0;
        let analystsRemoved = 0;
        
        for (const user of usersToRemove) {
            if (!stats.isRunning) {
                console.log('🛑 Đã dừng quá trình xóa user');
                break;
            }
            
            const userType = user.type === 'admin' ? 'Admin' : 'Nhà phân tích';
            console.log(`🔄 Đang xóa ${userType} ${user.id} khỏi tài khoản ${account.account_id}`);
            
            try {
                const result = await removeAdminFromAccount(account.account_id, user.id);
                if (result.success) {
                    if (user.type === 'admin') {
                        adminsRemoved++;
                    } else {
                        analystsRemoved++;
                    }
                    console.log(`✅ Đã xóa ${userType} ${user.id} khỏi tài khoản ${account.account_id}`);
                } else {
                    console.log(`❌ Không thể xóa ${userType} ${user.id}: ${result.error}`);
                }
                
                // Delay nhỏ giữa các request
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`❌ Lỗi khi xóa ${userType} ${user.id}: ${error.message}`);
            }
        }
        
        return { success: true, adminsRemoved, analystsRemoved, error: null };
        
    } catch (error) {
        console.log(`❌ Lỗi khi xử lý tài khoản ${account.account_id}: ${error.message}`);
        return { success: false, adminsRemoved: 0, analystsRemoved: 0, error: error.message };
    }
}

// Bắt đầu quá trình xóa admin & analysts
async function startRemoveAdminProcess() {
    try {
        console.log('👤 BẮT ĐẦU QUÁ TRÌNH XÓA ADMIN & ANALYSTS');
        console.log('=====================================');
        
        // Reset thống kê xóa admin
        stats.removeAdminTotal = 0;
        stats.removeAdminSuccess = 0;
        stats.removeAdminFailed = 0;
        stats.removeAdminSkipped = 0;
        stats.removeAdminCurrent = 0;
        stats.removeAdminAdminsRemoved = 0;
        stats.removeAdminAnalystsRemoved = 0;
        stats.removeAdminStartTime = new Date();
        stats.removeAdminIsRunning = true;
        stats.currentPhase = 'removeadmin';
        
        updatePhaseIndicator('removeadmin', 'Đang xóa admin và nhà phân tích khác khỏi tài khoản');
        
        // Bước 1: Lấy User ID
        const currentUserID = await getCurrentUserID();
        console.log(`👤 User ID hiện tại: ${currentUserID}`);
        
        // Bước 2: Lấy danh sách tài khoản
        const accounts = await getPersonalAdAccountsForRemove();
        
        if (accounts.length === 0) {
            console.log('❌ Không có tài khoản nào để xử lý');
            stats.removeAdminIsRunning = false;
            return 0;
        }
        
        stats.removeAdminTotal = accounts.length;
        console.log(`🎯 Bắt đầu xử lý ${stats.removeAdminTotal} tài khoản cá nhân`);
        
        // Hiển thị cấu hình hiện tại
        console.log(`⚙️ Cấu hình:`);
        console.log(`   - Xóa Admin: ${stats.config.removeAdminOnly ? 'Bật' : 'Tắt'}`);
        console.log(`   - Xóa Nhà phân tích: ${stats.config.removeAnalystOnly ? 'Bật' : 'Tắt'}`);
        console.log(`   - Xóa cả hai: ${stats.config.removeBoth ? 'Bật' : 'Tắt'}`);
        console.log(`   - Delay: ${stats.config.removeAdminDelay}s`);
        
        // Bước 3: Xử lý từng tài khoản
        for (let i = 0; i < accounts.length; i++) {
            if (!stats.isRunning) {
                console.log('🛑 Đã dừng quá trình xóa admin');
                break;
            }
            
            const account = accounts[i];
            stats.removeAdminCurrent = i + 1;
            updateCombinedWebUI();
            
            console.log(`🔄 [${i + 1}/${accounts.length}] Đang xử lý tài khoản: ${account.account_id}`);
            
            try {
                const result = await removeOtherAdmins(account, currentUserID);
                
                if (result.success) {
                    stats.removeAdminSuccess++;
                    stats.removeAdminAdminsRemoved += result.adminsRemoved;
                    stats.removeAdminAnalystsRemoved += result.analystsRemoved;
                    console.log(`✅ [${i + 1}/${accounts.length}] Hoàn thành: ${result.adminsRemoved} admin và ${result.analystsRemoved} nhà phân tích đã được xóa`);
                } else {
                    stats.removeAdminFailed++;
                    console.log(`❌ [${i + 1}/${accounts.length}] Thất bại: ${result.error}`);
                }
                
            } catch (error) {
                stats.removeAdminFailed++;
                console.log(`❌ [${i + 1}/${accounts.length}] Lỗi: ${error.message}`);
            }
            
            // Delay giữa các tài khoản
            if (i < accounts.length - 1) {
                console.log(`⏳ Delay ${stats.config.removeAdminDelay} giây trước khi xử lý tài khoản tiếp theo...`);
                await new Promise(resolve => setTimeout(resolve, stats.config.removeAdminDelay * 1000));
            }
        }
        
        // Hoàn thành
        stats.removeAdminIsRunning = false;
        
        console.log('🎉 HOÀN THÀNH QUÁ TRÌNH XÓA ADMIN & ANALYSTS');
        console.log('=====================================');
        console.log(`📊 Tổng kết:`);
        console.log(`   - Tổng tài khoản: ${stats.removeAdminTotal}`);
        console.log(`   - Thành công: ${stats.removeAdminSuccess}`);
        console.log(`   - Thất bại: ${stats.removeAdminFailed}`);
        console.log(`   - Admin đã xóa: ${stats.removeAdminAdminsRemoved}`);
        console.log(`   - Nhà phân tích đã xóa: ${stats.removeAdminAnalystsRemoved}`);
        
        return stats.removeAdminSuccess;
        
    } catch (error) {
        console.error(`❌ Lỗi trong quá trình xóa admin: ${error.message}`);
        stats.removeAdminIsRunning = false;
        return 0;
    }
}

// Thêm các hàm vào global scope
window.getPersonalAdAccountsForRemove = getPersonalAdAccountsForRemove;
window.getCurrentUserID = getCurrentUserID;
window.removeAdminFromAccount = removeAdminFromAccount;
window.removeOtherAdmins = removeOtherAdmins;
window.startRemoveAdminProcess = startRemoveAdminProcess;