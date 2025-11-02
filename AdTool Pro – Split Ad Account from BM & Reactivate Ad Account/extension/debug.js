function log(message, type = 'info') {
    const logElement = document.getElementById('debugLog');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}\n`;
    logElement.textContent += logEntry;
    logElement.scrollTop = logElement.scrollHeight;
}

function clearLog() {
    document.getElementById('debugLog').textContent = '';
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="status ${type}">${message}</div>`;
}

// Kiểm tra trạng thái extension
async function checkExtensionStatus() {
    try {
        log('🔍 Kiểm tra trạng thái extension...');
        
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            showStatus('extensionStatus', '❌ Chrome Extension API không khả dụng', 'error');
            return;
        }

        const manifest = chrome.runtime.getManifest();
        log(`✅ Extension: ${manifest.name} v${manifest.version}`);
        
        showStatus('extensionStatus', 
            `✅ Extension hoạt động: ${manifest.name} v${manifest.version}`, 
            'success'
        );
        
    } catch (error) {
        log(`❌ Lỗi kiểm tra extension: ${error.message}`);
        showStatus('extensionStatus', `❌ Lỗi: ${error.message}`, 'error');
    }
}

// Kiểm tra tab Facebook
async function checkFacebookTabs() {
    try {
        log('🔍 Kiểm tra tab Facebook...');
        
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        log(`📋 Tìm thấy ${tabs.length} tab Facebook`);
        
        if (tabs.length === 0) {
            showStatus('facebookTabsStatus', 
                '❌ Không tìm thấy tab Facebook Business Manager', 
                'error'
            );
        } else {
            const tabInfo = tabs.map(tab => 
                `ID: ${tab.id}, Title: ${tab.title}`
            ).join('<br>');
            
            showStatus('facebookTabsStatus', 
                `✅ Tìm thấy ${tabs.length} tab Facebook:<br>${tabInfo}`, 
                'success'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi kiểm tra tab: ${error.message}`);
        showStatus('facebookTabsStatus', `❌ Lỗi: ${error.message}`, 'error');
    }
}

// Kiểm tra content script
async function checkContentScript() {
    try {
        log('🔍 Kiểm tra content script...');
        
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        if (tabs.length === 0) {
            showStatus('contentScriptStatus', 
                '❌ Không có tab Facebook để kiểm tra', 
                'error'
            );
            return;
        }
        
        const tabId = tabs[0].id;
        log(`📤 Gửi ping đến tab ${tabId}...`);
        
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'ping'
        });
        
        log(`📥 Nhận response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
            showStatus('contentScriptStatus', 
                '✅ Content script đã sẵn sàng và phản hồi', 
                'success'
            );
        } else {
            showStatus('contentScriptStatus', 
                '❌ Content script không phản hồi đúng cách', 
                'error'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi kiểm tra content script: ${error.message}`);
        showStatus('contentScriptStatus', 
            `❌ Content script chưa sẵn sàng: ${error.message}`, 
            'error'
        );
    }
}

// Inject content script
async function injectContentScript() {
    try {
        log('🔍 Inject content script...');
        
        const response = await chrome.runtime.sendMessage({
            action: 'injectContentScript'
        });
        
        log(`📥 Nhận response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
            showStatus('contentScriptStatus', 
                '✅ Content script đã được inject thành công', 
                'success'
            );
        } else {
            showStatus('contentScriptStatus', 
                `❌ Lỗi khi inject content script: ${response?.error || 'Không xác định'}`, 
                'error'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi khi inject content script: ${error.message}`);
        showStatus('contentScriptStatus', 
            `❌ Lỗi khi inject content script: ${error.message}`, 
            'error'
        );
    }
}

// Test kết nối
async function testConnection() {
    try {
        log('🔍 Test kết nối...');
        
        const response = await chrome.runtime.sendMessage({
            action: 'getStats'
        });
        
        log(`📥 Nhận response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
            showStatus('connectionStatus', 
                '✅ Kết nối thành công với background script', 
                'success'
            );
        } else {
            showStatus('connectionStatus', 
                `❌ Lỗi kết nối: ${response?.error || 'Không xác định'}`, 
                'error'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi test kết nối: ${error.message}`);
        showStatus('connectionStatus', 
            `❌ Lỗi kết nối: ${error.message}`, 
            'error'
        );
    }
}

// Kiểm tra injected script
async function checkInjectedScript() {
    try {
        log('🔍 Kiểm tra injected script...');
        
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        if (tabs.length === 0) {
            showStatus('injectedScriptStatus', 
                '❌ Không có tab Facebook để kiểm tra', 
                'error'
            );
            return;
        }
        
        const tabId = tabs[0].id;
        log(`📤 Gửi test message đến injected script...`);
        
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'startProcess',
            config: {
                enableKichHoat: true,
                failureThresholdToKichHoat: 500,
                delayBeforeKichHoat: 300,
                targetSuccess: 600,
                enableDelayBetweenAccounts: false,
                delayBetweenAccounts: 1,
                kichHoatBatchSize: 50
            }
        });
        
        log(`📥 Nhận response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
            showStatus('injectedScriptStatus', 
                '✅ Injected script hoạt động bình thường', 
                'success'
            );
        } else {
            showStatus('injectedScriptStatus', 
                `❌ Injected script lỗi: ${response?.error || 'Không xác định'}`, 
                'error'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi kiểm tra injected script: ${error.message}`);
        showStatus('injectedScriptStatus', 
            `❌ Injected script không phản hồi: ${error.message}`, 
            'error'
        );
    }
}

// Inject injected script
async function injectInjectedScript() {
    try {
        log('🔍 Inject injected script...');
        
        const tabs = await chrome.tabs.query({
            url: "https://business.facebook.com/*"
        });
        
        if (tabs.length === 0) {
            showStatus('injectedScriptStatus', 
                '❌ Không có tab Facebook để inject', 
                'error'
            );
            return;
        }
        
        const tabId = tabs[0].id;
        log(`📤 Gửi yêu cầu inject injected script đến tab ${tabId}...`);
        
        // Đầu tiên inject content script nếu cần
        const injectResponse = await chrome.runtime.sendMessage({
            action: 'injectContentScript'
        });
        
        log(`📥 Inject content script response: ${JSON.stringify(injectResponse)}`);
        
        // Sau đó inject injected script
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'injectInjectedScript'
        });
        
        log(`📥 Nhận response: ${JSON.stringify(response)}`);
        
        if (response && response.success) {
            showStatus('injectedScriptStatus', 
                '✅ Injected script đã được inject thành công', 
                'success'
            );
            
            // Đợi một chút rồi test lại
            setTimeout(async () => {
                log('⏰ Đợi injected script khởi tạo...');
                await checkInjectedScript();
            }, 3000);
            
        } else {
            showStatus('injectedScriptStatus', 
                `❌ Lỗi khi inject injected script: ${response?.error || 'Không xác định'}`, 
                'error'
            );
        }
        
    } catch (error) {
        log(`❌ Lỗi khi inject injected script: ${error.message}`);
        showStatus('injectedScriptStatus', 
            `❌ Lỗi khi inject injected script: ${error.message}`, 
            'error'
        );
    }
}

// Test function đơn giản
function testButtonClick(buttonName) {
    log(`🔘 Nút ${buttonName} đã được bấm!`);
    showStatus('contentScriptStatus', `✅ Nút ${buttonName} hoạt động`, 'success');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 Debug tool đã sẵn sàng');
    checkExtensionStatus();
    
    // Thêm event listeners
    try {
        log('🔧 Thêm event listeners...');
        
        const checkFacebookBtn = document.getElementById('checkFacebookBtn');
        const checkContentBtn = document.getElementById('checkContentBtn');
        const injectContentBtn = document.getElementById('injectContentBtn');
        const checkInjectedBtn = document.getElementById('checkInjectedBtn');
        const injectInjectedBtn = document.getElementById('injectInjectedBtn');
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        const clearLogBtn = document.getElementById('clearLogBtn');
        
        if (checkFacebookBtn) {
            checkFacebookBtn.addEventListener('click', () => {
                log('🔘 Nút Kiểm tra Tab Facebook được bấm');
                checkFacebookTabs();
            });
            log('✅ Event listener cho checkFacebookBtn đã thêm');
        } else {
            log('❌ Không tìm thấy checkFacebookBtn');
        }
        
        if (checkContentBtn) {
            checkContentBtn.addEventListener('click', () => {
                log('🔘 Nút Kiểm tra Content Script được bấm');
                checkContentScript();
            });
            log('✅ Event listener cho checkContentBtn đã thêm');
        } else {
            log('❌ Không tìm thấy checkContentBtn');
        }
        
        if (injectContentBtn) {
            injectContentBtn.addEventListener('click', () => {
                log('🔘 Nút Inject Content Script được bấm');
                injectContentScript();
            });
            log('✅ Event listener cho injectContentBtn đã thêm');
        } else {
            log('❌ Không tìm thấy injectContentBtn');
        }
        
        if (checkInjectedBtn) {
            checkInjectedBtn.addEventListener('click', () => {
                log('🔘 Nút Kiểm tra Injected Script được bấm');
                checkInjectedScript();
            });
            log('✅ Event listener cho checkInjectedBtn đã thêm');
        } else {
            log('❌ Không tìm thấy checkInjectedBtn');
        }
        
        if (injectInjectedBtn) {
            injectInjectedBtn.addEventListener('click', () => {
                log('🔘 Nút Inject Injected Script được bấm');
                injectInjectedScript();
            });
            log('✅ Event listener cho injectInjectedBtn đã thêm');
        } else {
            log('❌ Không tìm thấy injectInjectedBtn');
        }
        
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => {
                log('🔘 Nút Test Kết nối được bấm');
                testConnection();
            });
            log('✅ Event listener cho testConnectionBtn đã thêm');
        } else {
            log('❌ Không tìm thấy testConnectionBtn');
        }
        
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => {
                log('🔘 Nút Xóa Log được bấm');
                clearLog();
            });
            log('✅ Event listener cho clearLogBtn đã thêm');
        } else {
            log('❌ Không tìm thấy clearLogBtn');
        }
        
        log('✅ Tất cả event listeners đã được thêm');
        
    } catch (error) {
        log('❌ Lỗi khi thêm event listeners: ' + error.message);
        console.error('Lỗi event listeners:', error);
    }
}); 