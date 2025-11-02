function log(message) {
    const logElement = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}\n`;
    logElement.textContent += logEntry;
    logElement.scrollTop = logElement.scrollHeight;
    console.log(message);
}

function showResult(message, type = 'info') {
    const resultElement = document.getElementById('result');
    resultElement.textContent = message;
    resultElement.className = `result ${type}`;
}

async function testPing() {
    try {
        log('🏓 Test ping...');
        const message = {
            id: 'ping-' + Date.now(),
            action: 'ping'
        };
        
        // Setup response handler TRƯỚC khi gửi message
        const response = await new Promise((resolve, reject) => {
            const handler = function(event) {
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', handler);
                    log('📥 Nhận ping response: ' + JSON.stringify(event.detail));
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', handler);
            
            // Gửi message SAU khi đã setup handler
            const event = new CustomEvent('adtoolProMessage', {
                detail: message
            });
            document.dispatchEvent(event);
            
            log('📤 Đã gửi ping message');
            
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', handler);
                reject(new Error('Timeout'));
            }, 5000);
        });
        
        if (response && response.success) {
            showResult('✅ Ping test thành công', 'success');
        } else {
            showResult('❌ Ping test thất bại: ' + (response?.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        log('❌ Ping test thất bại: ' + error.message);
        showResult('❌ Ping test thất bại: ' + error.message, 'error');
    }
}

async function testGetStats() {
    try {
        log('📊 Test get stats...');
        const message = {
            id: 'stats-' + Date.now(),
            action: 'getStats'
        };
        
        // Setup response handler TRƯỚC khi gửi message
        const response = await new Promise((resolve, reject) => {
            const handler = function(event) {
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', handler);
                    log('📥 Nhận get stats response: ' + JSON.stringify(event.detail));
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', handler);
            
            // Gửi message SAU khi đã setup handler
            const event = new CustomEvent('adtoolProMessage', {
                detail: message
            });
            document.dispatchEvent(event);
            
            log('📤 Đã gửi get stats message');
            
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', handler);
                reject(new Error('Timeout'));
            }, 5000);
        });
        
        if (response && response.success) {
            showResult('✅ Get stats test thành công', 'success');
        } else {
            showResult('❌ Get stats test thất bại: ' + (response?.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        log('❌ Get stats test thất bại: ' + error.message);
        showResult('❌ Get stats test thất bại: ' + error.message, 'error');
    }
}

// Listen for responses
document.addEventListener('adtoolProResponse', function(event) {
    log('📥 Nhận response: ' + JSON.stringify(event.detail));
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    log('🧪 Simple test page đã sẵn sàng');
    
    // Thêm event listeners
    document.getElementById('testPingBtn').addEventListener('click', testPing);
    document.getElementById('testGetStatsBtn').addEventListener('click', testGetStats);
}); 