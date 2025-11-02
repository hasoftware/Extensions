function log(message) {
    const logElement = document.getElementById('testLog');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}\n`;
    logElement.textContent += logEntry;
    logElement.scrollTop = logElement.scrollHeight;
}

function clearLog() {
    document.getElementById('testLog').textContent = '';
}

function showResult(message, type = 'info') {
    const resultElement = document.getElementById('testResult');
    resultElement.textContent = message;
    resultElement.className = `result ${type}`;
}

// Test ping
async function testPing() {
    try {
        log('🏓 Test ping...');
        const message = {
            id: 'ping-' + Date.now(),
            action: 'ping'
        };
        
        const event = new CustomEvent('adtoolProMessage', {
            detail: message
        });
        document.dispatchEvent(event);
        
        log('📤 Đã gửi ping message');
        
        // Đợi response
        await new Promise((resolve, reject) => {
            const handler = function(event) {
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', handler);
                    log('📥 Nhận ping response: ' + JSON.stringify(event.detail));
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', handler);
            
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', handler);
                reject(new Error('Timeout'));
            }, 5000);
        });
        
        showResult('✅ Ping test thành công', 'success');
        
    } catch (error) {
        log('❌ Ping test thất bại: ' + error.message);
        showResult('❌ Ping test thất bại: ' + error.message, 'error');
    }
}

// Test start process
async function testStartProcess() {
    try {
        log('🚀 Test start process...');
        const message = {
            id: 'start-' + Date.now(),
            action: 'startAdToolPro',
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
        
        const event = new CustomEvent('adtoolProMessage', {
            detail: message
        });
        document.dispatchEvent(event);
        
        log('📤 Đã gửi start process message');
        
        // Đợi response
        await new Promise((resolve, reject) => {
            const handler = function(event) {
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', handler);
                    log('📥 Nhận start process response: ' + JSON.stringify(event.detail));
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', handler);
            
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', handler);
                reject(new Error('Timeout'));
            }, 10000);
        });
        
        showResult('✅ Start process test thành công', 'success');
        
    } catch (error) {
        log('❌ Start process test thất bại: ' + error.message);
        showResult('❌ Start process test thất bại: ' + error.message, 'error');
    }
}

// Test get stats
async function testGetStats() {
    try {
        log('📊 Test get stats...');
        const message = {
            id: 'stats-' + Date.now(),
            action: 'getStats'
        };
        
        const event = new CustomEvent('adtoolProMessage', {
            detail: message
        });
        document.dispatchEvent(event);
        
        log('📤 Đã gửi get stats message');
        
        // Đợi response
        await new Promise((resolve, reject) => {
            const handler = function(event) {
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', handler);
                    log('📥 Nhận get stats response: ' + JSON.stringify(event.detail));
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', handler);
            
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', handler);
                reject(new Error('Timeout'));
            }, 5000);
        });
        
        showResult('✅ Get stats test thành công', 'success');
        
    } catch (error) {
        log('❌ Get stats test thất bại: ' + error.message);
        showResult('❌ Get stats test thất bại: ' + error.message, 'error');
    }
}

// Listen for stats updates
document.addEventListener('adtoolProStatsUpdate', function(event) {
    log('📊 Nhận stats update: ' + JSON.stringify(event.detail));
});

// Listen for responses
document.addEventListener('adtoolProResponse', function(event) {
    log('📥 Nhận response: ' + JSON.stringify(event.detail));
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    log('🧪 Test page đã sẵn sàng');
    log('🔍 Kiểm tra injected script...');
    
    // Kiểm tra xem injected script đã load chưa
    if (typeof startAdToolPro === 'function') {
        log('✅ Injected script đã load thành công');
    } else {
        log('❌ Injected script chưa load');
    }
    
    // Thêm event listeners
    document.getElementById('testPingBtn').addEventListener('click', testPing);
    document.getElementById('testStartBtn').addEventListener('click', testStartProcess);
    document.getElementById('testGetStatsBtn').addEventListener('click', testGetStats);
    document.getElementById('clearLogBtn').addEventListener('click', clearLog);
}); 