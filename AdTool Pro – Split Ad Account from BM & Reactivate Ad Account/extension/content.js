// AdTool Pro Extension - Content Script
// HASoftware - Ads Solution - Auto Version

let injectedScript = null;
let isInjected = false;
let injectedReady = false;

// Inject the main script
function injectAdToolPro() {
    if (isInjected) {
        console.log('AdTool Pro đã được inject rồi');
        return;
    }
    
    try {
        console.log('🔄 Bắt đầu inject AdTool Pro script...');
        console.log('📂 Script URL:', chrome.runtime.getURL('injected.js'));
        
        // Create script element
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        
        script.onload = function() {
            console.log('✅ AdTool Pro script đã được inject thành công');
            console.log('📋 Script element:', script);
            isInjected = true;
            injectedScript = script;
            
            // Đợi script khởi tạo
            setTimeout(() => {
                checkInjectedReady();
            }, 1000);
        };
        
        script.onerror = function(error) {
            console.error('❌ Lỗi khi inject AdTool Pro script:', error);
            console.error('❌ Script URL:', script.src);
        };
        
        // Inject into page
        (document.head || document.documentElement).appendChild(script);
        console.log('📤 Đã append script vào DOM');
        
    } catch (error) {
        console.error('❌ Lỗi khi inject script:', error);
    }
}

// Kiểm tra injected script đã sẵn sàng
function checkInjectedReady() {
    try {
        console.log('🔍 Kiểm tra injected script sẵn sàng...');
        console.log('📋 Script status:', { isInjected, injectedReady });
        
        // Kiểm tra xem script đã load chưa
        const scriptElement = document.querySelector('script[src*="injected.js"]');
        if (scriptElement) {
            console.log('✅ Tìm thấy script element:', scriptElement);
        } else {
            console.log('❌ Không tìm thấy script element');
        }
        
        // Gửi test message
        const testEvent = new CustomEvent('adtoolProMessage', {
            detail: { id: 'test', action: 'ping' }
        });
        document.dispatchEvent(testEvent);
        console.log('📤 Đã gửi test event');
        
        // Đợi response
        setTimeout(() => {
            if (injectedReady) {
                console.log('✅ Injected script đã sẵn sàng');
            } else {
                console.log('⚠️ Injected script chưa sẵn sàng, thử lại...');
                checkInjectedReady();
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra injected script:', error);
    }
}

// Remove injected script
function removeAdToolPro() {
    if (injectedScript && isInjected) {
        try {
            injectedScript.remove();
            isInjected = false;
            injectedScript = null;
            injectedReady = false;
            console.log('🗑️ Đã xóa AdTool Pro script');
        } catch (error) {
            console.error('❌ Lỗi khi xóa script:', error);
        }
    }
}

// Send message to injected script
function sendMessageToInjected(message) {
    return new Promise((resolve, reject) => {
        try {
            console.log('📤 Gửi message đến injected script:', message);
            
            // Kiểm tra injected script đã sẵn sàng
            if (!isInjected || !injectedReady) {
                console.log('⚠️ Injected script chưa sẵn sàng, đợi...');
                setTimeout(() => {
                    sendMessageToInjected(message).then(resolve).catch(reject);
                }, 1000);
                return;
            }
            
            // Setup response handler TRƯỚC khi gửi message
            const responseHandler = function(event) {
                console.log('📥 Nhận event adtoolProResponse:', event.detail);
                if (event.detail && event.detail.id === message.id) {
                    document.removeEventListener('adtoolProResponse', responseHandler);
                    console.log('📥 Nhận response từ injected script:', event.detail);
                    resolve(event.detail);
                }
            };
            
            document.addEventListener('adtoolProResponse', responseHandler);
            
            // Gửi message SAU khi đã setup handler
            const event = new CustomEvent('adtoolProMessage', {
                detail: message
            });
            document.dispatchEvent(event);
            
            console.log('📤 Đã dispatch event adtoolProMessage');
            
            // Timeout after 15 seconds
            setTimeout(() => {
                document.removeEventListener('adtoolProResponse', responseHandler);
                console.error('⏰ Timeout waiting for response from injected script');
                console.error('📋 Message sent:', message);
                console.error('📋 Injected script status:', { isInjected, injectedReady });
                reject(new Error('Timeout waiting for response'));
            }, 15000);
            
        } catch (error) {
            console.error('❌ Lỗi gửi message:', error);
            reject(error);
        }
    });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Content script nhận message:', request);
    
    // Đợi một chút để đảm bảo script đã sẵn sàng
    setTimeout(() => {
        handleMessage(request, sendResponse);
    }, 1000);
    
    return true; // Keep message channel open for async response
});

// Handle different message types
async function handleMessage(request, sendResponse) {
    try {
        console.log('🔄 Xử lý message:', request.action);
        
        switch (request.action) {
            case 'ping':
                console.log('🏓 Ping received, responding...');
                sendResponse({
                    success: true,
                    message: 'pong'
                });
                break;
                
            case 'injectInjectedScript':
                console.log('🔄 Force inject injected script...');
                injectAdToolPro();
                sendResponse({
                    success: true,
                    message: 'Đã inject injected script'
                });
                break;
                
            case 'startProcess':
                await handleStartProcess(request, sendResponse);
                break;
                
            case 'stopProcess':
                await handleStopProcess(request, sendResponse);
                break;
                
            case 'getStats':
                await handleGetStats(request, sendResponse);
                break;
                
            default:
                console.error('❌ Unknown action:', request.action);
                sendResponse({
                    success: false,
                    error: 'Unknown action: ' + request.action
                });
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý message:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle start process
async function handleStartProcess(request, sendResponse) {
    try {
        console.log('🚀 Bắt đầu xử lý startProcess');
        console.log('📋 Request config:', request.config);
        
        const message = {
            id: Date.now().toString(),
            action: 'startAdToolPro',
            config: request.config
        };
        
        console.log('📤 Gửi message đến injected script:', message);
        
        // Kiểm tra injected script trước khi gửi
        if (!isInjected) {
            console.log('⚠️ Injected script chưa được inject, thử inject...');
            injectAdToolPro();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (!injectedReady) {
            console.log('⚠️ Injected script chưa sẵn sàng, đợi...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Test ping trước
        console.log('🏓 Test ping trước khi gửi startProcess...');
        try {
            const pingMessage = {
                id: 'ping-test-' + Date.now(),
                action: 'ping'
            };
            const pingResponse = await sendMessageToInjected(pingMessage);
            console.log('✅ Ping test thành công:', pingResponse);
        } catch (pingError) {
            console.error('❌ Ping test thất bại:', pingError);
            sendResponse({
                success: false,
                error: 'Injected script không phản hồi ping test: ' + pingError.message
            });
            return;
        }
        
        const response = await sendMessageToInjected(message);
        
        console.log('📥 Nhận response từ injected script:', response);
        
        if (response && response.success) {
            console.log('✅ Start process thành công');
            sendResponse({
                success: true,
                message: 'Đã bắt đầu quá trình'
            });
        } else {
            console.error('❌ Start process thất bại:', response?.error);
            sendResponse({
                success: false,
                error: response?.error || 'Không thể bắt đầu quá trình'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi start process:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle stop process
async function handleStopProcess(request, sendResponse) {
    try {
        console.log('🛑 Bắt đầu xử lý stopProcess');
        
        const message = {
            id: Date.now().toString(),
            action: 'stopAdToolPro'
        };
        
        const response = await sendMessageToInjected(message);
        
        if (response && response.success) {
            console.log('✅ Stop process thành công');
            sendResponse({
                success: true,
                message: 'Đã dừng quá trình'
            });
        } else {
            console.error('❌ Stop process thất bại:', response?.error);
            sendResponse({
                success: false,
                error: response?.error || 'Không thể dừng quá trình'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi stop process:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle get stats
async function handleGetStats(request, sendResponse) {
    try {
        console.log('📊 Bắt đầu xử lý getStats');
        
        const message = {
            id: Date.now().toString(),
            action: 'getStats'
        };
        
        const response = await sendMessageToInjected(message);
        
        if (response && response.stats) {
            console.log('✅ Get stats thành công');
            sendResponse({
                success: true,
                stats: response.stats
            });
        } else {
            console.error('❌ Get stats thất bại');
            sendResponse({
                success: false,
                error: 'Không thể lấy thống kê'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi get stats:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Listen for stats updates from injected script
document.addEventListener('adtoolProStatsUpdate', function(event) {
    if (event.detail && event.detail.stats) {
        console.log('📊 Nhận cập nhật thống kê từ injected script');
        // Forward stats update to background script
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: event.detail.stats
        }).catch(error => {
            // Ignore errors when background script is not available
            console.log('Background script không khả dụng, bỏ qua cập nhật thống kê');
        });
    }
});

// Listen for response from injected script to mark as ready
document.addEventListener('adtoolProResponse', function(event) {
    console.log('📥 Nhận adtoolProResponse event:', event.detail);
    if (event.detail && event.detail.id === 'test') {
        injectedReady = true;
        console.log('✅ Injected script đã sẵn sàng');
    }
});

// Debug listener cho tất cả events từ injected script
document.addEventListener('adtoolProStatsUpdate', function(event) {
    console.log('📊 Nhận adtoolProStatsUpdate event:', event.detail);
    if (event.detail && event.detail.stats) {
        console.log('📊 Nhận cập nhật thống kê từ injected script');
        // Forward stats update to background script
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: event.detail.stats
        }).catch(error => {
            // Ignore errors when background script is not available
            console.log('Background script không khả dụng, bỏ qua cập nhật thống kê');
        });
    }
});

// Auto-inject when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.hostname.includes('facebook.com')) {
            console.log('🚀 Tự động inject AdTool Pro trên Facebook');
            injectAdToolPro();
        }
    });
} else {
    if (window.location.hostname.includes('facebook.com')) {
        console.log('🚀 Tự động inject AdTool Pro trên Facebook');
        injectAdToolPro();
    }
}

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    removeAdToolPro();
});

console.log('✅ AdTool Pro Content Script đã sẵn sàng!'); 