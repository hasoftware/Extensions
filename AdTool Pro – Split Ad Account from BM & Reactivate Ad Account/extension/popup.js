// AdTool Pro Extension - Popup Script
// HASoftware - Ads Solution - Auto Version

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

// Cấu hình nâng cao
let advancedConfig = {
    autoOpenTab: false,
    businessId: '',
    enableSchedule: false,
    scheduleTimes: ['09:00', '14:00', '19:00', '22:00'],
    scheduleEnabled: [false, false, false, false]
};

let pollingInterval = null;

// Khởi tạo popup
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AdTool Pro Extension Popup đã sẵn sàng!');
    
    // Khởi tạo tab system
    initTabSystem();
    
    // Load cài đặt từ storage
    loadSettings();
    
    // Thêm event listeners
    addEventListeners();
    
    // Cập nhật UI ban đầu
    updateUI();
    
    // Kết nối với background script để nhận thống kê
    connectToBackground();
    
    // Khởi tạo schedule system
    initScheduleSystem();
});

// Khởi tạo tab system
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Thêm event listeners
function addEventListeners() {
    const startButton = document.getElementById('startBtn');
    const stopButton = document.getElementById('stopBtn');
    const saveButton = document.getElementById('saveSettings');
    
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log('🚀 Bấm nút Start - Bắt đầu quá trình');
            startProcess();
        });
    }
    
    if (stopButton) {
        stopButton.addEventListener('click', function() {
            console.log('🛑 Bấm nút Stop - Dừng quá trình');
            stopProcess();
        });
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            console.log('💾 Bấm nút Save - Lưu cài đặt');
            saveSettings();
        });
    }
    
    // Thêm event listeners cho các input cấu hình
    const configInputs = document.querySelectorAll('input[type="number"], input[type="text"], input[type="checkbox"]');
    configInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Auto-save khi thay đổi
            setTimeout(saveSettings, 500);
        });
    });
}

// Kết nối với background script
function connectToBackground() {
    // Gửi message để lấy thống kê hiện tại
    chrome.runtime.sendMessage({
        action: 'getStats'
    }, function(response) {
        if (response && response.stats) {
            stats = response.stats;
            updateUI();
        }
    });
    
    // Lắng nghe cập nhật từ background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStats') {
            stats = request.stats;
            updateUI();
        }
    });
}

// Start process
async function startProcess() {
    try {
        console.log('🚀 Bắt đầu quá trình...');
        
        // Load config from UI
        const config = loadConfigFromUI();
        console.log('⚙️ Cấu hình đã load:', config);
        
        // Show loading state
        updateButtonStates(true);
        showMessage('Đang khởi tạo...', 'info');
        
        // Send message to background script
        console.log('📤 Gửi message đến background script...');
        const response = await chrome.runtime.sendMessage({
            action: 'startProcess',
            config: config
        });
        
        console.log('📥 Nhận response từ background script:', response);
        
        if (response && response.success) {
            console.log('✅ Quá trình đã bắt đầu thành công');
            showMessage('Đã bắt đầu quá trình!', 'success');
            
            // Start polling for updates
            startPolling();
        } else {
            console.error('❌ Lỗi từ background script:', response?.error);
            showMessage('Lỗi: ' + (response?.error || 'Không xác định'), 'error');
            updateButtonStates(false);
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi bắt đầu quá trình:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        let errorMessage = 'Lỗi khi bắt đầu quá trình';
        
        if (error.message.includes('Could not establish connection')) {
            errorMessage = 'Không thể kết nối với Facebook tab. Vui lòng đảm bảo đã mở trang business.facebook.com';
        } else if (error.message.includes('Timeout')) {
            errorMessage = 'Hết thời gian chờ phản hồi. Vui lòng thử lại';
        } else {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
        updateButtonStates(false);
    }
}

// Dừng quá trình
function stopProcess() {
    chrome.runtime.sendMessage({
        action: 'stopProcess'
    }, function(response) {
        if (response && response.success) {
            console.log('🛑 Đã dừng quá trình');
            showMessage('Đã dừng quá trình thành công!', 'info');
            updateButtonStates();
        }
    });
}

// Load cấu hình từ UI
function loadConfigFromUI() {
    try {
        const targetSuccess = parseInt(document.getElementById('targetSuccess').value) || 600;
        const maxConcurrent = parseInt(document.getElementById('maxConcurrent').value) || 200;
        const failureThreshold = parseInt(document.getElementById('failureThreshold').value) || 500;
        const enableKichHoat = document.getElementById('enableKichHoat').checked;
        const delayBeforeKichHoat = parseInt(document.getElementById('delayBeforeKichHoat').value) || 300;
        const enableDelayBetweenAccounts = document.getElementById('enableDelayBetweenAccounts').checked;
        const delayBetweenAccounts = parseInt(document.getElementById('delayBetweenAccounts').value) || 1;
        const kichHoatBatchSize = parseInt(document.getElementById('kichHoatBatchSize').value) || 50;
        
        // Cập nhật cấu hình
        stats.config.targetSuccess = targetSuccess;
        stats.tachMaxConcurrentRequests = maxConcurrent;
        stats.config.failureThresholdToKichHoat = failureThreshold;
        stats.config.enableKichHoat = enableKichHoat;
        stats.config.delayBeforeKichHoat = delayBeforeKichHoat;
        stats.config.enableDelayBetweenAccounts = enableDelayBetweenAccounts;
        stats.config.delayBetweenAccounts = delayBetweenAccounts;
        stats.config.kichHoatBatchSize = kichHoatBatchSize;
        
        // Cấu hình nâng cao
        advancedConfig.autoOpenTab = document.getElementById('autoOpenTab').checked;
        advancedConfig.businessId = document.getElementById('businessId').value;
        advancedConfig.enableSchedule = document.getElementById('enableSchedule').checked;
        
        console.log('⚙️ Đã load cấu hình từ giao diện:', stats.config);
        return stats.config; // Return the config object
    } catch (error) {
        console.error('❌ Lỗi load cấu hình:', error);
        return null; // Return null on error
    }
}

// Cập nhật UI
function updateUI() {
    // Cập nhật status
    updateStatus();
    
    // Cập nhật progress bars
    updateProgressBars();
    
    // Cập nhật thống kê
    updateStats();
    
    // Cập nhật trạng thái nút
    updateButtonStates();
}

// Cập nhật status
function updateStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (statusDot && statusText) {
        switch(stats.currentPhase) {
            case 'tach':
                statusDot.className = 'status-dot running';
                statusText.textContent = 'Đang tách tài khoản...';
                break;
            case 'kichhoat':
                statusDot.className = 'status-dot running';
                statusText.textContent = 'Đang kích hoạt tài khoản...';
                break;
            case 'completed':
                statusDot.className = 'status-dot completed';
                statusText.textContent = 'Hoàn thành';
                break;
            default:
                statusDot.className = 'status-dot idle';
                statusText.textContent = 'Sẵn sàng';
        }
    }
}

// Cập nhật progress bars
function updateProgressBars() {
    // Progress bar tách tài khoản
    const tachProgress = document.getElementById('tachProgress');
    const tachProgressText = document.getElementById('tachProgressText');
    
    if (tachProgress && tachProgressText) {
        const percentage = Math.round((stats.tachSuccessCount / stats.config.targetSuccess) * 100);
        tachProgress.style.width = percentage + '%';
        tachProgressText.textContent = `Tách: ${percentage}% (${stats.tachSuccessCount}/${stats.config.targetSuccess})`;
    }
    
    // Progress bar kích hoạt tài khoản
    const kichHoatProgress = document.getElementById('kichHoatProgress');
    const kichHoatProgressText = document.getElementById('kichHoatProgressText');
    
    if (kichHoatProgress && kichHoatProgressText) {
        const kichHoatProcessed = stats.kichHoatSuccess + stats.kichHoatFailed;
        const percentage = stats.kichHoatTotal > 0 ? Math.round((kichHoatProcessed / stats.kichHoatTotal) * 100) : 0;
        kichHoatProgress.style.width = percentage + '%';
        kichHoatProgressText.textContent = `Kích hoạt: ${percentage}% (${kichHoatProcessed}/${stats.kichHoatTotal})`;
    }
}

// Cập nhật thống kê
function updateStats() {
    const tachSuccess = document.getElementById('tachSuccess');
    const kichHoatSuccess = document.getElementById('kichHoatSuccess');
    const tachTotal = document.getElementById('tachTotal');
    const kichHoatTotal = document.getElementById('kichHoatTotal');
    
    if (tachSuccess) tachSuccess.textContent = stats.tachSuccessCount;
    if (kichHoatSuccess) kichHoatSuccess.textContent = stats.kichHoatSuccess;
    if (tachTotal) tachTotal.textContent = stats.tachTotalProcessed;
    if (kichHoatTotal) kichHoatTotal.textContent = stats.kichHoatTotal;
}

// Cập nhật trạng thái nút
function updateButtonStates(isLoading = false) {
    const startButton = document.getElementById('startBtn');
    const stopButton = document.getElementById('stopBtn');
    
    if (startButton && stopButton) {
        if (isLoading) {
            startButton.disabled = true;
            stopButton.disabled = true;
            startButton.textContent = 'Đang khởi tạo...';
            stopButton.textContent = 'Đang khởi tạo...';
        } else if (stats.isRunning) {
            startButton.disabled = true;
            stopButton.disabled = false;
        } else {
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    }
}

// Start polling for updates
function startPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getStats'
            });
            
            if (response && response.success && response.stats) {
                stats = response.stats;
                updateUI();
                
                // Stop polling if process is complete
                if (!stats.isRunning) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                    updateButtonStates(false);
                    showMessage('Quá trình đã hoàn thành!', 'success');
                }
            }
        } catch (error) {
            console.error('❌ Lỗi khi polling stats:', error);
        }
    }, 1000); // Poll every second
}

// Stop polling
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// Khởi tạo schedule system
function initScheduleSystem() {
    // Cập nhật UI schedule
    updateScheduleUI();
    
    // Kiểm tra schedule mỗi phút
    setInterval(checkSchedule, 60000);
}

// Cập nhật UI schedule
function updateScheduleUI() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (scheduleGrid) {
        scheduleGrid.innerHTML = '';
        
        advancedConfig.scheduleTimes.forEach((time, index) => {
            const isEnabled = advancedConfig.scheduleEnabled[index];
            const status = isEnabled ? 'Bật' : 'Tắt';
            const statusClass = isEnabled ? 'active' : '';
            
            const scheduleItem = document.createElement('div');
            scheduleItem.className = `schedule-item ${statusClass}`;
            scheduleItem.innerHTML = `
                <div class="schedule-time">${time}</div>
                <div class="schedule-status">${status}</div>
            `;
            
            scheduleItem.addEventListener('click', function() {
                advancedConfig.scheduleEnabled[index] = !advancedConfig.scheduleEnabled[index];
                updateScheduleUI();
                saveSettings();
            });
            
            scheduleGrid.appendChild(scheduleItem);
        });
    }
}

// Kiểm tra schedule
function checkSchedule() {
    if (!advancedConfig.enableSchedule) return;
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    advancedConfig.scheduleTimes.forEach((time, index) => {
        if (advancedConfig.scheduleEnabled[index] && currentTime === time) {
            console.log(`⏰ Đến giờ schedule: ${time}`);
            startProcess();
        }
    });
}

// Load cài đặt từ storage
function loadSettings() {
    chrome.storage.sync.get(['adtoolProSettings', 'adtoolProAdvancedSettings'], function(result) {
        // Load cài đặt cơ bản
        if (result.adtoolProSettings) {
            const settings = result.adtoolProSettings;
            
            if (settings.targetSuccess) {
                document.getElementById('targetSuccess').value = settings.targetSuccess;
                stats.config.targetSuccess = settings.targetSuccess;
            }
            if (settings.maxConcurrent) {
                document.getElementById('maxConcurrent').value = settings.maxConcurrent;
                stats.tachMaxConcurrentRequests = settings.maxConcurrent;
            }
            if (settings.failureThreshold) {
                document.getElementById('failureThreshold').value = settings.failureThreshold;
                stats.config.failureThresholdToKichHoat = settings.failureThreshold;
            }
            if (settings.enableKichHoat !== undefined) {
                document.getElementById('enableKichHoat').checked = settings.enableKichHoat;
                stats.config.enableKichHoat = settings.enableKichHoat;
            }
            if (settings.delayBeforeKichHoat) {
                document.getElementById('delayBeforeKichHoat').value = settings.delayBeforeKichHoat;
                stats.config.delayBeforeKichHoat = settings.delayBeforeKichHoat;
            }
            if (settings.enableDelayBetweenAccounts !== undefined) {
                document.getElementById('enableDelayBetweenAccounts').checked = settings.enableDelayBetweenAccounts;
                stats.config.enableDelayBetweenAccounts = settings.enableDelayBetweenAccounts;
            }
            if (settings.delayBetweenAccounts) {
                document.getElementById('delayBetweenAccounts').value = settings.delayBetweenAccounts;
                stats.config.delayBetweenAccounts = settings.delayBetweenAccounts;
            }
            if (settings.kichHoatBatchSize) {
                document.getElementById('kichHoatBatchSize').value = settings.kichHoatBatchSize;
                stats.config.kichHoatBatchSize = settings.kichHoatBatchSize;
            }
        }
        
        // Load cài đặt nâng cao
        if (result.adtoolProAdvancedSettings) {
            const advancedSettings = result.adtoolProAdvancedSettings;
            
            if (advancedSettings.autoOpenTab !== undefined) {
                document.getElementById('autoOpenTab').checked = advancedSettings.autoOpenTab;
                advancedConfig.autoOpenTab = advancedSettings.autoOpenTab;
            }
            if (advancedSettings.businessId) {
                document.getElementById('businessId').value = advancedSettings.businessId;
                advancedConfig.businessId = advancedSettings.businessId;
            }
            if (advancedSettings.enableSchedule !== undefined) {
                document.getElementById('enableSchedule').checked = advancedSettings.enableSchedule;
                advancedConfig.enableSchedule = advancedSettings.enableSchedule;
            }
            if (advancedSettings.scheduleEnabled) {
                advancedConfig.scheduleEnabled = advancedSettings.scheduleEnabled;
            }
        }
        
        // Cập nhật UI schedule
        updateScheduleUI();
    });
}

// Lưu cài đặt vào storage
function saveSettings() {
    loadConfigFromUI();
    
    const settings = {
        targetSuccess: stats.config.targetSuccess,
        maxConcurrent: stats.tachMaxConcurrentRequests,
        failureThreshold: stats.config.failureThresholdToKichHoat,
        enableKichHoat: stats.config.enableKichHoat,
        delayBeforeKichHoat: stats.config.delayBeforeKichHoat,
        enableDelayBetweenAccounts: stats.config.enableDelayBetweenAccounts,
        delayBetweenAccounts: stats.config.delayBetweenAccounts,
        kichHoatBatchSize: stats.config.kichHoatBatchSize
    };
    
    const advancedSettings = {
        autoOpenTab: advancedConfig.autoOpenTab,
        businessId: advancedConfig.businessId,
        enableSchedule: advancedConfig.enableSchedule,
        scheduleEnabled: advancedConfig.scheduleEnabled
    };
    
    chrome.storage.sync.set({
        adtoolProSettings: settings,
        adtoolProAdvancedSettings: advancedSettings
    }, function() {
        console.log('💾 Đã lưu cài đặt');
        showMessage('Đã lưu cài đặt thành công!', 'success');
    });
}

// Hiển thị thông báo
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
} 