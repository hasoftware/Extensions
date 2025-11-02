// AdTool Pro Extension - Background Script
// HASoftware - Ads Solution - Auto Version

let currentStats = {
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

let activeTabId = null;

// Khởi tạo extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('🚀 AdTool Pro Extension đã được cài đặt');
    await injectContentScriptToAllFacebookTabs();
});

// Khởi tạo khi extension startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('🚀 AdTool Pro Extension đã khởi động');
    await injectContentScriptToAllFacebookTabs();
});

// Lắng nghe khi tab được cập nhật
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('business.facebook.com')) {
        console.log('🔄 Tab Facebook được cập nhật:', tabId);
        // Đợi một chút để trang load hoàn toàn
        setTimeout(async () => {
            await injectContentScriptToTab(tabId);
        }, 1000);
    }
});

// Inject content script vào tất cả tab Facebook
async function injectContentScriptToAllFacebookTabs() {
    try {
        console.log('🔍 Tìm kiếm tất cả tab Facebook...');
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        console.log(`📋 Tìm thấy ${tabs.length} tab Facebook`);
        
        for (const tab of tabs) {
            await injectContentScriptToTab(tab.id);
        }
    } catch (error) {
        console.error('❌ Lỗi inject content script vào tất cả tab:', error);
    }
}

// Inject content script vào một tab cụ thể
async function injectContentScriptToTab(tabId) {
    try {
        console.log(`🔄 Injecting content script vào tab: ${tabId}`);
        
        // Kiểm tra xem content script đã có chưa
        const isReady = await checkContentScriptReady(tabId);
        if (isReady) {
            console.log(`✅ Content script đã có trong tab ${tabId}`);
            return true;
        }
        
        // Inject content script
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        
        console.log(`✅ Content script đã được inject thành công vào tab ${tabId}`);
        
        // Đợi content script khởi tạo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Kiểm tra lại
        const isReadyAfter = await checkContentScriptReady(tabId);
        if (isReadyAfter) {
            console.log(`✅ Content script đã sẵn sàng trong tab ${tabId}`);
        } else {
            console.log(`⚠️ Content script chưa sẵn sàng trong tab ${tabId}`);
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Lỗi inject content script vào tab ${tabId}:`, error);
        return false;
    }
}

// Lắng nghe messages từ popup và content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Background nhận message:', request);
    
    switch (request.action) {
        case 'startProcess':
            handleStartProcess(request, sendResponse);
            break;
            
        case 'stopProcess':
            handleStopProcess(request, sendResponse);
            break;
            
        case 'getStats':
            handleGetStats(request, sendResponse);
            break;
            
        case 'injectContentScript':
            handleInjectContentScript(request, sendResponse);
            break;
            
        case 'updateStats':
            // Xử lý cập nhật stats từ content script
            if (request.stats) {
                console.log('📊 Nhận cập nhật stats từ content script');
                currentStats = request.stats;
                
                // Gửi cập nhật đến tất cả popup đang mở
                chrome.runtime.sendMessage({
                    action: 'updateStats',
                    stats: currentStats
                }).catch(error => {
                    // Ignore errors when popup is not open
                    console.log('Popup không mở, bỏ qua cập nhật thống kê');
                });
            }
            break;
            
        default:
            console.error('❌ Unknown action:', request.action);
            sendResponse({
                success: false,
                error: 'Unknown action: ' + request.action
            });
    }
    
    return true; // Keep message channel open for async response
});

// Inject content script vào tab
async function injectContentScript(tabId) {
    try {
        console.log('🔄 Injecting content script vào tab:', tabId);
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        console.log('✅ Content script đã được inject thành công');
        return true;
    } catch (error) {
        console.error('❌ Lỗi inject content script:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}

// Kiểm tra content script đã sẵn sàng chưa
async function checkContentScriptReady(tabId) {
    try {
        console.log('🏓 Kiểm tra content script sẵn sàng...');
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'ping'
        });
        console.log('✅ Content script đã sẵn sàng:', response);
        return true;
    } catch (error) {
        console.log('❌ Content script chưa sẵn sàng:', error.message);
        return false;
    }
}

// Xử lý bắt đầu quá trình
async function handleStartProcess(request, sendResponse) {
    try {
        console.log('🚀 Bắt đầu xử lý startProcess...');
        
        // Cập nhật cấu hình
        if (request.config) {
            currentStats.config = { ...currentStats.config, ...request.config };
            console.log('⚙️ Cấu hình đã cập nhật:', currentStats.config);
        }
        
        // Tìm tab Facebook Business Manager
        console.log('🔍 Tìm kiếm tab Facebook...');
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        console.log('📋 Tìm thấy tabs:', tabs.length);
        
        if (tabs.length === 0) {
            console.error('❌ Không tìm thấy tab Facebook');
            sendResponse({
                success: false,
                error: 'Không tìm thấy tab Facebook Business Manager. Vui lòng mở trang business.facebook.com'
            });
            return;
        }
        
        // Sử dụng tab đầu tiên
        activeTabId = tabs[0].id;
        console.log('🔍 Sử dụng tab Facebook:', activeTabId);
        
        // Đảm bảo content script đã được inject
        await injectContentScriptToTab(activeTabId);
        
        // Kiểm tra content script đã sẵn sàng chưa
        let isReady = await checkContentScriptReady(activeTabId);
        
        if (!isReady) {
            console.log('🔄 Content script chưa sẵn sàng, thử inject...');
            const injected = await injectContentScript(activeTabId);
            
            if (!injected) {
                console.error('❌ Không thể inject content script');
                sendResponse({
                    success: false,
                    error: 'Không thể inject content script vào tab'
                });
                return;
            }
            
            // Đợi content script khởi tạo
            console.log('⏰ Đợi content script khởi tạo...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Kiểm tra lại
            isReady = await checkContentScriptReady(activeTabId);
            if (!isReady) {
                console.error('❌ Content script không phản hồi sau khi inject');
                sendResponse({
                    success: false,
                    error: 'Content script không phản hồi sau khi inject'
                });
                return;
            }
        }
        
        console.log('✅ Content script đã sẵn sàng');
        
        // Gửi message đến content script
        console.log('📤 Gửi message startProcess đến content script...');
        const response = await chrome.tabs.sendMessage(activeTabId, {
            action: 'startProcess',
            config: currentStats.config
        });
        
        console.log('📥 Nhận response từ content script:', response);
        
        if (response && response.success) {
            console.log('✅ Quá trình đã bắt đầu thành công');
            sendResponse({
                success: true,
                message: 'Quá trình đã bắt đầu thành công'
            });
        } else {
            console.error('❌ Lỗi từ content script:', response?.error);
            sendResponse({
                success: false,
                error: response?.error || 'Lỗi không xác định từ content script'
            });
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi bắt đầu quá trình:', error);
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

// Xử lý dừng quá trình
async function handleStopProcess(request, sendResponse) {
    try {
        console.log('🛑 Bắt đầu xử lý stopProcess...');
        
        if (!activeTabId) {
            console.log('❌ Không có tab active');
            sendResponse({
                success: false,
                error: 'Không có quá trình nào đang chạy'
            });
            return;
        }
        
        console.log('📤 Gửi message stopProcess đến content script...');
        const response = await chrome.tabs.sendMessage(activeTabId, {
            action: 'stopProcess'
        });
        
        console.log('📥 Nhận response từ content script:', response);
        
        if (response && response.success) {
            console.log('✅ Quá trình đã dừng thành công');
            sendResponse({
                success: true,
                message: 'Đã dừng quá trình thành công'
            });
        } else {
            console.error('❌ Lỗi từ content script:', response?.error);
            sendResponse({
                success: false,
                error: response?.error || 'Không thể dừng quá trình'
            });
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi dừng quá trình:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Xử lý lấy thống kê
async function handleGetStats(request, sendResponse) {
    try {
        console.log('📊 Bắt đầu xử lý getStats...');
        
        if (!activeTabId) {
            console.log('📊 Trả về stats local vì không có tab active');
            sendResponse({
                success: true,
                stats: currentStats
            });
            return;
        }
        
        console.log('📤 Gửi message getStats đến content script...');
        const response = await chrome.tabs.sendMessage(activeTabId, {
            action: 'getStats'
        });
        
        console.log('📥 Nhận response từ content script:', response);
        
        if (response && response.stats) {
            currentStats = response.stats;
            console.log('📊 Stats đã cập nhật:', currentStats);
            sendResponse({
                success: true,
                stats: currentStats
            });
        } else {
            console.log('📊 Trả về stats local vì không nhận được từ content script');
            sendResponse({
                success: true,
                stats: currentStats
            });
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi lấy thống kê:', error);
        sendResponse({
            success: true,
            stats: currentStats
        });
    }
}

// Xử lý inject content script
async function handleInjectContentScript(request, sendResponse) {
    try {
        console.log('🔄 Bắt đầu xử lý injectContentScript...');
        
        // Tìm tab Facebook
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        if (tabs.length === 0) {
            console.error('❌ Không tìm thấy tab Facebook');
            sendResponse({
                success: false,
                error: 'Không tìm thấy tab Facebook Business Manager'
            });
            return;
        }
        
        const tabId = tabs[0].id;
        console.log(`🔄 Injecting content script vào tab ${tabId}...`);
        
        const result = await injectContentScriptToTab(tabId);
        
        if (result) {
            console.log('✅ Inject content script thành công');
            sendResponse({
                success: true,
                message: 'Content script đã được inject thành công'
            });
        } else {
            console.error('❌ Inject content script thất bại');
            sendResponse({
                success: false,
                error: 'Không thể inject content script'
            });
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi inject content script:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Lắng nghe khi tab được đóng
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (tabId === activeTabId) {
        activeTabId = null;
        console.log('🔄 Tab Facebook đã đóng, reset activeTabId');
    }
});

// Lắng nghe khi tab được cập nhật
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabId === activeTabId && changeInfo.status === 'complete') {
        // Tab đã load xong, có thể inject script nếu cần
        console.log('🔄 Tab Facebook đã load xong');
    }
});

console.log('✅ AdTool Pro Background Script đã sẵn sàng!'); 