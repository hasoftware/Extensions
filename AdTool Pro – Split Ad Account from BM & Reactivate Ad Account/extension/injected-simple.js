// AD TOOL PRO - SIMPLE VERSION FOR TESTING
// HASoftware - Ads Solution - Auto Version

console.log('🚀 Loading AdTool Pro Simple Injected Script...');

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
    
    // Thống kê kích hoạt tài khoản
    kichHoatTotal: 0,
    kichHoatSuccess: 0,
    kichHoatFailed: 0,
    kichHoatSkipped: 0,
    kichHoatProcessing: 0,
    kichHoatStartTime: null,
    kichHoatIsRunning: false,
    
    // Trạng thái tổng thể
    currentPhase: 'idle', // 'idle', 'tach', 'kichhoat', 'completed'
    isRunning: false,
    failureThreshold: 500,
    
    // Cấu hình
    config: {
        enableKichHoat: true,
        failureThresholdToKichHoat: 500,
        delayBeforeKichHoat: 300,
        targetSuccess: 600,
        enableDelayBetweenAccounts: false,
        delayBetweenAccounts: 1,
        kichHoatBatchSize: 50
    }
};

// Cấu hình hiện tại
let currentConfig = {
    enableKichHoat: true,
    failureThresholdToKichHoat: 500,
    delayBeforeKichHoat: 300,
    targetSuccess: 600,
    enableDelayBetweenAccounts: false,
    delayBetweenAccounts: 1,
    kichHoatBatchSize: 50
};

// Gửi cập nhật thống kê đến extension
function sendStatsUpdate() {
    try {
        console.log('📊 Gửi cập nhật thống kê:', stats);
        const event = new CustomEvent('adtoolProStatsUpdate', {
            detail: { stats: stats }
        });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('❌ Lỗi gửi cập nhật thống kê:', error);
    }
}

// Cập nhật thống kê và gửi đến extension
function updateStats() {
    sendStatsUpdate();
}

// Bắt đầu AdTool Pro
function startAdToolPro() {
    console.log('🚀 BẮT ĐẦU AD TOOL PRO');
    console.log('⚙️ Cấu hình:', currentConfig);
    
    // Reset thống kê
    stats.tachTotalProcessed = 0;
    stats.tachSuccessCount = 0;
    stats.tachFailureCount = 0;
    stats.kichHoatTotal = 0;
    stats.kichHoatSuccess = 0;
    stats.kichHoatFailed = 0;
    stats.kichHoatSkipped = 0;
    stats.kichHoatProcessing = 0;
    stats.currentPhase = 'idle';
    stats.isRunning = true;
    
    updateStats();
    
    console.log('✅ AdTool Pro đã bắt đầu (simple version)');
}

// Dừng AdTool Pro
function stopAdToolPro() {
    console.log('🛑 DỪNG AD TOOL PRO');
    stats.isRunning = false;
    stats.tachIsRunning = false;
    stats.kichHoatIsRunning = false;
    updateStats();
}

// Cập nhật cấu hình
function updateConfig(newConfig) {
    if (newConfig) {
        currentConfig = { ...currentConfig, ...newConfig };
        stats.config = { ...stats.config, ...newConfig };
        console.log('⚙️ Đã cập nhật cấu hình:', currentConfig);
    }
}

// PHẦN XỬ LÝ MESSAGE CHO EXTENSION
document.addEventListener('adtoolProMessage', function(event) {
    const message = event.detail;
    console.log('📨 Injected script nhận message:', message);
    
    let response = { id: message.id };
    
    try {
        switch (message.action) {
            case 'ping':
                console.log('🏓 Ping received, responding...');
                response.success = true;
                response.message = 'pong';
                break;
                
            case 'startAdToolPro':
                console.log('🚀 Bắt đầu startAdToolPro...');
                if (message.config) {
                    console.log('⚙️ Cập nhật config:', message.config);
                    updateConfig(message.config);
                }
                startAdToolPro();
                response.success = true;
                response.message = 'Đã bắt đầu AdTool Pro';
                break;
                
            case 'stopAdToolPro':
                console.log('🛑 Bắt đầu stopAdToolPro...');
                stopAdToolPro();
                response.success = true;
                response.message = 'Đã dừng AdTool Pro';
                break;
                
            case 'getStats':
                console.log('📊 Trả về stats...');
                response.success = true;
                response.stats = stats;
                break;
                
            default:
                console.error('❌ Unknown action:', message.action);
                response.success = false;
                response.error = 'Unknown action: ' + message.action;
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý message:', error);
        response.success = false;
        response.error = error.message;
    }
    
    // Gửi response ngay lập tức
    console.log('📤 Gửi response:', response);
    const responseEvent = new CustomEvent('adtoolProResponse', {
        detail: response
    });
    document.dispatchEvent(responseEvent);
});

console.log('✅ AdTool Pro Simple Injected Script đã sẵn sàng!'); 