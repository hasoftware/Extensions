// REMOVE ANOTHER ADMIN AD ACCOUNT
// Chương trình xóa quản trị viên khác khỏi tài khoản quảng cáo cá nhân
// HASoftware - Ads Solution

// Biến thống kê
let stats = {
    totalAccounts: 0,
    processedAccounts: 0,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    totalAdminsRemoved: 0,
    totalAnalystsRemoved: 0,
    isRunning: false,
    currentAccount: null,
    currentAdmin: null,
    
    // Cấu hình
    config: {
        enableDelay: false,
        delaySeconds: 2,
        removeAdmins: true,      // Xóa admin (role 1001)
        removeAnalysts: true     // Xóa nhà phân tích (role 1003)
    }
};

// Tạo giao diện web
function createWebUI() {
    const style = document.createElement('style');
    style.textContent = `
        .remove-admin-modal {
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
        
        .remove-admin-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 95%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            color: white;
            position: relative;
        }
        
        .remove-admin-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .remove-admin-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .remove-admin-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .remove-admin-progress {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .remove-admin-progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .remove-admin-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .remove-admin-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .remove-admin-stat-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        
        .remove-admin-stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        
        .remove-admin-stat-label {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 5px;
        }
        
        .remove-admin-current {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .remove-admin-current-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .remove-admin-current-info {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .remove-admin-controls {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .remove-admin-btn {
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .remove-admin-btn.start {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }
        
        .remove-admin-btn.start:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
        }
        
        .remove-admin-btn.stop {
            background: linear-gradient(45deg, #f44336, #d32f2f);
            color: white;
        }
        
        .remove-admin-btn.stop:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
        }
        
        .remove-admin-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .remove-admin-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s ease;
        }
        
        .remove-admin-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .remove-admin-log {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .remove-admin-config {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .remove-admin-config-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .remove-admin-config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .remove-admin-config-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .remove-admin-config-item label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            cursor: pointer;
        }
        
        .remove-admin-config-item input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
        
        .remove-admin-config-item input[type="number"] {
            width: 60px;
            padding: 5px;
            border: none;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-align: center;
        }
        
        .remove-admin-config-item input[type="number"]:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    
    document.head.appendChild(style);
    
    const modal = document.createElement('div');
    modal.className = 'remove-admin-modal';
    modal.innerHTML = `
        <div class="remove-admin-container">
            <button class="remove-admin-close" onclick="closeWebUI()">×</button>
            
            <div class="remove-admin-header">
                <div class="remove-admin-title">🗑️ Xóa Quản Trị Viên Khác</div>
                <div class="remove-admin-subtitle">Xóa tất cả quản trị viên khác khỏi tài khoản quảng cáo cá nhân</div>
            </div>
            
            <div class="remove-admin-progress">
                <div class="remove-admin-progress-bar">
                    <div class="remove-admin-progress-fill" id="progressFill"></div>
                </div>
                <div id="progressText">Sẵn sàng bắt đầu</div>
            </div>
            
            <div class="remove-admin-stats">
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="totalAccounts">0</div>
                    <div class="remove-admin-stat-label">Tổng TKQC</div>
                </div>
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="processedAccounts">0</div>
                    <div class="remove-admin-stat-label">Đã xử lý</div>
                </div>
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="successCount">0</div>
                    <div class="remove-admin-stat-label">Thành công</div>
                </div>
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="failedCount">0</div>
                    <div class="remove-admin-stat-label">Thất bại</div>
                </div>
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="totalAdminsRemoved">0</div>
                    <div class="remove-admin-stat-label">Admin đã xóa</div>
                </div>
                <div class="remove-admin-stat-item">
                    <div class="remove-admin-stat-number" id="totalAnalystsRemoved">0</div>
                    <div class="remove-admin-stat-label">Nhà phân tích đã xóa</div>
                </div>
            </div>
            
            <div class="remove-admin-config">
                <div class="remove-admin-config-title">⚙️ Cấu hình</div>
                <div class="remove-admin-config-grid">
                    <div class="remove-admin-config-item">
                        <label>
                            <input type="checkbox" id="removeAdminsCheckbox" checked>
                            Xóa Admin (Role 1001)
                        </label>
                    </div>
                    <div class="remove-admin-config-item">
                        <label>
                            <input type="checkbox" id="removeAnalystsCheckbox" checked>
                            Xóa Nhà phân tích (Role 1003)
                        </label>
                    </div>
                    <div class="remove-admin-config-item">
                        <label>
                            <input type="checkbox" id="enableDelayCheckbox">
                            Bật delay giữa các tài khoản
                        </label>
                    </div>
                    <div class="remove-admin-config-item">
                        <label>
                            Delay (giây):
                            <input type="number" id="delaySecondsInput" value="2" min="1" max="60" disabled>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="remove-admin-current">
                <div class="remove-admin-current-title">🔄 Đang xử lý:</div>
                <div class="remove-admin-current-info" id="currentInfo">Chưa bắt đầu</div>
            </div>
            
            <div class="remove-admin-controls">
                <button class="remove-admin-btn start" id="startBtn" onclick="startRemoveProcess()">🚀 Bắt đầu</button>
                <button class="remove-admin-btn stop" id="stopBtn" onclick="stopRemoveProcess()" disabled>⏹️ Dừng</button>
            </div>
            
            <div class="remove-admin-log" id="logContainer">
                <div>📋 Log hoạt động sẽ hiển thị ở đây...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addEventListeners();
}

// Thêm event listeners
function addEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const removeAdminsCheckbox = document.getElementById('removeAdminsCheckbox');
    const removeAnalystsCheckbox = document.getElementById('removeAnalystsCheckbox');
    const enableDelayCheckbox = document.getElementById('enableDelayCheckbox');
    const delaySecondsInput = document.getElementById('delaySecondsInput');
    
    if (startBtn) {
        startBtn.addEventListener('click', startRemoveProcess);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopRemoveProcess);
    }
    
    if (removeAdminsCheckbox) {
        removeAdminsCheckbox.addEventListener('change', function() {
            stats.config.removeAdmins = this.checked;
            addLog(`⚙️ ${this.checked ? 'Bật' : 'Tắt'} xóa Admin`);
        });
    }
    
    if (removeAnalystsCheckbox) {
        removeAnalystsCheckbox.addEventListener('change', function() {
            stats.config.removeAnalysts = this.checked;
            addLog(`⚙️ ${this.checked ? 'Bật' : 'Tắt'} xóa Nhà phân tích`);
        });
    }
    
    if (enableDelayCheckbox) {
        enableDelayCheckbox.addEventListener('change', function() {
            stats.config.enableDelay = this.checked;
            if (delaySecondsInput) {
                delaySecondsInput.disabled = !this.checked;
            }
            addLog(`⚙️ ${this.checked ? 'Bật' : 'Tắt'} delay giữa các tài khoản`);
        });
    }
    
    if (delaySecondsInput) {
        delaySecondsInput.addEventListener('input', function() {
            stats.config.delaySeconds = parseInt(this.value) || 2;
            addLog(`⚙️ Cập nhật delay: ${stats.config.delaySeconds} giây`);
        });
    }
}

// Cập nhật giao diện
function updateWebUI() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const totalAccounts = document.getElementById('totalAccounts');
    const processedAccounts = document.getElementById('processedAccounts');
    const successCount = document.getElementById('successCount');
    const failedCount = document.getElementById('failedCount');
    const totalAdminsRemoved = document.getElementById('totalAdminsRemoved');
    const totalAnalystsRemoved = document.getElementById('totalAnalystsRemoved');
    const currentInfo = document.getElementById('currentInfo');
    
    if (progressFill && progressText) {
        const progress = stats.totalAccounts > 0 ? (stats.processedAccounts / stats.totalAccounts) * 100 : 0;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${stats.processedAccounts}/${stats.totalAccounts} tài khoản (${progress.toFixed(1)}%)`;
    }
    
    if (totalAccounts) totalAccounts.textContent = stats.totalAccounts;
    if (processedAccounts) processedAccounts.textContent = stats.processedAccounts;
    if (successCount) successCount.textContent = stats.successCount;
    if (failedCount) failedCount.textContent = stats.failedCount;
    if (totalAdminsRemoved) totalAdminsRemoved.textContent = stats.totalAdminsRemoved;
    if (totalAnalystsRemoved) totalAnalystsRemoved.textContent = stats.totalAnalystsRemoved;
    
    if (currentInfo) {
        if (stats.currentAccount && stats.currentAdmin) {
            currentInfo.innerHTML = `
                <strong>Tài khoản:</strong> ${stats.currentAccount}<br>
                <strong>Admin:</strong> ${stats.currentAdmin}
            `;
        } else if (stats.currentAccount) {
            currentInfo.innerHTML = `<strong>Tài khoản:</strong> ${stats.currentAccount}`;
        } else {
            currentInfo.textContent = 'Chưa bắt đầu';
        }
    }
    
    // Cập nhật trạng thái nút
    updateButtonStates();
}

// Thêm log
function addLog(message) {
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `<span style="color: #888;">[${timestamp}]</span> ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    console.log(message);
}

// Đóng giao diện
function closeWebUI() {
    const modal = document.querySelector('.remove-admin-modal');
    if (modal) {
        modal.remove();
    }
}

// Bước 1: Lấy UID hoặc Actor ID
async function getCurrentUserID() {
    try {
        // Thử lấy từ WebApiApplication trước
        const uid = require("WebApiApplication").getUserId();
        if (uid) {
            addLog(`✅ Lấy được User ID: ${uid}`);
            return uid;
        }
    } catch (error) {
        addLog(`⚠️ Không thể lấy User ID từ WebApiApplication: ${error.message}`);
    }
    
    try {
        // Thử lấy từ CurrentUserInitialData
        const uid = require("CurrentUserInitialData").USER_ID;
        if (uid) {
            addLog(`✅ Lấy được User ID từ CurrentUserInitialData: ${uid}`);
            return uid;
        }
    } catch (error) {
        addLog(`⚠️ Không thể lấy User ID từ CurrentUserInitialData: ${error.message}`);
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
            addLog(`✅ Lấy được User ID từ Graph API: ${data.id}`);
            return data.id;
        }
    } catch (error) {
        addLog(`❌ Không thể lấy User ID từ Graph API: ${error.message}`);
    }
    
    throw new Error('Không thể lấy User ID');
}

// Bước 2: Lấy danh sách tài khoản quảng cáo cá nhân
async function getPersonalAdAccounts() {
    try {
        const accessToken = require("WebApiApplication").getAccessToken();
        const uid = await getCurrentUserID();
        
        addLog('📋 Đang lấy danh sách tài khoản quảng cáo...');
        
        const response = await fetch(`https://graph.facebook.com/v14.0/me/adaccounts?summary=1&access_token=${accessToken}&limit=1000&fields=account_id,name,adtrust_dsl,account_status,users%7Bid,role%7D&locale=en_US`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            addLog('❌ Không tìm thấy tài khoản quảng cáo nào');
            return [];
        }
        
        addLog(`📊 Tìm thấy ${data.data.length} tài khoản quảng cáo`);
        
        // Lọc chỉ lấy tài khoản cá nhân (có thể dựa vào tên hoặc trạng thái)
        const personalAccounts = data.data.filter(item => {
            // Kiểm tra xem có phải tài khoản cá nhân không
            // Có thể dựa vào tên chứa "Read-Only" hoặc các tiêu chí khác
            const isPersonal = !item.name.includes('Business') && 
                              !item.name.includes('Manager') && 
                              (item.name.includes('Read-Only') || item.account_status === 1);
            return isPersonal;
        });
        
        addLog(`👤 Trong đó có ${personalAccounts.length} tài khoản cá nhân`);
        
        // Log danh sách tài khoản để kiểm tra
        personalAccounts.forEach((account, index) => {
            addLog(`📋 [${index + 1}] ${account.account_id} - ${account.name} (Status: ${account.account_status})`);
        });
        
        return personalAccounts;
        
    } catch (error) {
        addLog(`❌ Lỗi khi lấy danh sách tài khoản: ${error.message}`);
        return [];
    }
}

// Bước 3: Xóa quản trị viên khác
async function removeOtherAdmins(account, currentUserID) {
    try {
        if (!account.users || !account.users.data) {
            addLog(`⚠️ Tài khoản ${account.account_id} không có thông tin users`);
            return { success: false, adminsRemoved: 0, analystsRemoved: 0, error: 'No users data' };
        }
        
        let usersToRemove = [];
        
        // Lọc admin (role 1001) nếu được bật
        if (stats.config.removeAdmins) {
            const admins = account.users.data.filter(user => user.role === 1001);
            const otherAdmins = admins.filter(admin => admin.id !== currentUserID);
            usersToRemove.push(...otherAdmins.map(admin => ({ ...admin, type: 'admin' })));
        }
        
        // Lọc nhà phân tích (role 1003) nếu được bật
        if (stats.config.removeAnalysts) {
            const analysts = account.users.data.filter(user => user.role === 1003);
            const otherAnalysts = analysts.filter(analyst => analyst.id !== currentUserID);
            usersToRemove.push(...otherAnalysts.map(analyst => ({ ...analyst, type: 'analyst' })));
        }
        
        if (usersToRemove.length === 0) {
            addLog(`✅ Tài khoản ${account.account_id} không có user khác cần xóa`);
            return { success: true, adminsRemoved: 0, analystsRemoved: 0, error: null };
        }
        
        const adminCount = usersToRemove.filter(u => u.type === 'admin').length;
        const analystCount = usersToRemove.filter(u => u.type === 'analyst').length;
        
        addLog(`🔍 Tìm thấy ${adminCount} admin và ${analystCount} nhà phân tích khác trong tài khoản ${account.account_id}`);
        addLog(`📋 Danh sách user cần xóa: ${usersToRemove.map(u => `${u.id} (${u.type})`).join(', ')}`);
        
        let adminsRemoved = 0;
        let analystsRemoved = 0;
        
        for (const user of usersToRemove) {
            if (!stats.isRunning) {
                addLog('🛑 Đã dừng quá trình xóa user');
                break;
            }
            
            const userType = user.type === 'admin' ? 'Admin' : 'Nhà phân tích';
            stats.currentAdmin = `ID: ${user.id} (${userType} - Role: ${user.role})`;
            updateWebUI();
            
            try {
                const result = await removeAdminFromAccount(account.account_id, user.id);
                if (result.success) {
                    if (user.type === 'admin') {
                        adminsRemoved++;
                    } else {
                        analystsRemoved++;
                    }
                    addLog(`✅ Đã xóa ${userType} ${user.id} khỏi tài khoản ${account.account_id}`);
                } else {
                    addLog(`❌ Không thể xóa ${userType} ${user.id}: ${result.error}`);
                }
                
                // Delay nhỏ giữa các request
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                addLog(`❌ Lỗi khi xóa ${userType} ${user.id}: ${error.message}`);
            }
        }
        
        stats.currentAdmin = null;
        updateWebUI();
        
        return { success: true, adminsRemoved, analystsRemoved, error: null };
        
    } catch (error) {
        addLog(`❌ Lỗi khi xử lý tài khoản ${account.account_id}: ${error.message}`);
        return { success: false, adminsRemoved: 0, analystsRemoved: 0, error: error.message };
    }
}

// Xóa admin khỏi tài khoản
async function removeAdminFromAccount(accountId, userId) {
    try {
        // Lấy fb_dtsg token
        const fb_dtsg = require("DTSGInitData").token;
        const currentUserID = require("CurrentUserInitialData").USER_ID;
        
        // Request 1: Confirm
        const confirmUrl = `https://adsmanager.facebook.com/ads/manage/settings/remove_user/confirm/?user_id=${userId}&act=${accountId}&is_new_account_settings=true&fb_dtsg_ag=${encodeURIComponent(fb_dtsg)}&__asyncDialog=1&__aaid=${accountId}&__user=${currentUserID}&__a=1&__req=1y&__hs=20299.BP%3Aads_manager_comet_pkg.2.0...0&dpr=1&__ccg=UNKNOWN&__rev=1025299733&__s=n586gt%3Avyuy0h%3Ali44py&__hsi=7532767328083407025&__dyn=7AgSXgWGgWEjgCu6mudg9omosyUqDBBh96EnK49o9EeUaVoWFGV8kG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU-4ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW7A78O4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJ3rG2PCG9DDl0zlBwyzp8KUWcwxyU29xep3bBAzEW9lpubwIxecAwXzogyo464Xy-cwuEnxaFo5a7EN1O79UCumbz8KiewwBK68eF8pK1Nxebxa4AbxR2V8cE8Q3mbgOUGfgeEmwJCxSegroG48gyHxSi4p8y7rKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAwLzUS327EG4E949BCxK9J7yUnwUzpUqy8doHxe78-5aCCyogyoC2GZ3UC2C8ByoK4Ekx24oK4Ehz8C6oWqaUK2e4E4OawtV-i782bByUeoQwox3UO364GJe2q2B12uueC-5u8Bxu6o9UeUhxWUl-2a64uWg-26q7p9UlxuiueyKvyUkgC9xq2K3GUixl4wNx5e8wAAAVQEhy8myFUpzEGQ48Cq4E8888oAgCi2aawVy8khEkxyEoypopxKU-GoigK6K224kifyo&__hsdp=gbcdMN8MT0jHcwmmk998424RMSCg4Oal4gJApwN93CjdcIXh48132ch34qjnP8IIY0KI4IncOli8fK8Quil1CVk1jwqo6y2K2e8AgfE17U9U1l8&__hblp=0Ywgoao8oizbK2e48vm9KuU8awTwNzFolx-rwgGwAyWBxbaaCmd6YQCzRAHxnSy9Yh2c9Mz6DEh6gV1r5Mg8Y7a7Yl2WYmziNl8IHTVp1qBh4boxibUx4WJllhqgiDgiQmimKnOT5Za7km4YZlLVQ4oGte842fHBWkwiG4pszVBpkUJ4xOiq1vUxm6UGmfx6fm8xeloUJtk_yHgTRy84994cXXFxbhUpyQumyfl4BAXVpbCK4keUBaiVEC8nGRYBcBaGJbGmW-55VowGyFUTxC6EsDABAOAVrj-ut5jAVZ9xhFlU-8-bgsF1GUkxybGqu5FaCx16xh29Q4UWqi58aFpoReV-y4zovzF8CSjSZ5y8x4lClqBG12xWnpGH4mJzArqXUypi4mWgyCKh58FpqAKu_AZ3oCheicy8V2CAbQimh92t3VvKt3ppeEolk548AQGV8yKq6XS1vLh4plAGKJ0MkyLRgOj-6td3aoKWx3Kjm9h6GhO0jA4bZlXGLcZxGYxojwApAahifF0Z86sHiQjS8ADmVeFQWgGm9GHABjxqp28hyHD8AGmeLuWriLp28ER7ppExEzbZ5V4C9U8pppiCyCWGEyVTF28Gi4FBgjG9GJ5xCDA_Gi9giAyHBCyppGmryStHjKeABcly21d2948yrVaLgmyUyrDpt2oC4omAWUmUG5poC4VeFcSG4S8Aqaaj8yh2h4BliNcGBhZha7jKYLGDgC48yp4Gdxh25GqqAcHCVRyESfgx5hapadUJqE-JAih94AidBhEC4tDjWhqpapGlml5jilDyKA4vlkmcAZkF22qFpkK9LWzVFeZmBxK6fWAwk8sh25AzKFoWaJaFoeCHx6q9AGXAh_F7BWiuGCBGitbgTEBniHVJ6GG_fBp95GDGEOpeqJoxaijZelejaF9eiSEHhFoOucXWUgTAV5yKX_l7ppAjGumchVvy9V4vxXzVlgqQ6VVU&__comet_req=58&jazoest=24801&__spin_r=1025299733&__spin_b=trunk&__spin_t=1753859065&__jssesw=1&_callFlowletID=0&_triggerFlowletID=4722&qpl_active_e2e_trace_ids=`;
        
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

// Bắt đầu quá trình xóa
async function startRemoveProcess() {
    try {
        addLog('🚀 BẮT ĐẦU QUÁ TRÌNH XÓA QUẢN TRỊ VIÊN KHÁC');
        addLog('=====================================');
        
        // Reset thống kê
        stats.totalAccounts = 0;
        stats.processedAccounts = 0;
        stats.successCount = 0;
        stats.failedCount = 0;
        stats.skippedCount = 0;
        stats.totalAdminsRemoved = 0;
        stats.totalAnalystsRemoved = 0;
        stats.isRunning = true;
        stats.currentAccount = null;
        stats.currentAdmin = null;
        
        // Cập nhật UI
        updateWebUI();
        
        // Bước 1: Lấy User ID
        const currentUserID = await getCurrentUserID();
        addLog(`👤 User ID hiện tại: ${currentUserID}`);
        
        // Bước 2: Lấy danh sách tài khoản
        const accounts = await getPersonalAdAccounts();
        
        if (accounts.length === 0) {
            addLog('❌ Không có tài khoản nào để xử lý');
            stats.isRunning = false;
            updateWebUI();
            return;
        }
        
        stats.totalAccounts = accounts.length;
        addLog(`🎯 Bắt đầu xử lý ${stats.totalAccounts} tài khoản cá nhân`);
        
        // Hiển thị cấu hình hiện tại
        addLog(`⚙️ Cấu hình:`);
        addLog(`   - Xóa Admin: ${stats.config.removeAdmins ? 'Bật' : 'Tắt'}`);
        addLog(`   - Xóa Nhà phân tích: ${stats.config.removeAnalysts ? 'Bật' : 'Tắt'}`);
        addLog(`   - Delay: ${stats.config.enableDelay ? `${stats.config.delaySeconds}s` : 'Tắt'}`);
        
        // Bước 3: Xử lý từng tài khoản
        for (let i = 0; i < accounts.length; i++) {
            if (!stats.isRunning) {
                addLog('🛑 Đã dừng quá trình xóa user');
                break;
            }
            
            const account = accounts[i];
            stats.currentAccount = `${account.account_id} (${account.name || 'Không có tên'})`;
            stats.processedAccounts = i + 1;
            updateWebUI();
            
            addLog(`🔄 [${i + 1}/${accounts.length}] Đang xử lý tài khoản: ${account.account_id}`);
            
            try {
                const result = await removeOtherAdmins(account, currentUserID);
                
                if (result.success) {
                    stats.successCount++;
                    stats.totalAdminsRemoved += result.adminsRemoved;
                    stats.totalAnalystsRemoved += result.analystsRemoved;
                    addLog(`✅ [${i + 1}/${accounts.length}] Hoàn thành: ${result.adminsRemoved} admin và ${result.analystsRemoved} nhà phân tích đã được xóa`);
                } else {
                    stats.failedCount++;
                    addLog(`❌ [${i + 1}/${accounts.length}] Thất bại: ${result.error}`);
                }
                
            } catch (error) {
                stats.failedCount++;
                addLog(`❌ [${i + 1}/${accounts.length}] Lỗi: ${error.message}`);
            }
            
            // Delay giữa các tài khoản nếu được bật
            if (i < accounts.length - 1 && stats.config.enableDelay) {
                addLog(`⏳ Delay ${stats.config.delaySeconds} giây trước khi xử lý tài khoản tiếp theo...`);
                await new Promise(resolve => setTimeout(resolve, stats.config.delaySeconds * 1000));
            }
        }
        
        // Hoàn thành
        stats.currentAccount = null;
        stats.currentAdmin = null;
        stats.isRunning = false;
        
        addLog('🎉 HOÀN THÀNH QUÁ TRÌNH XÓA QUẢN TRỊ VIÊN KHÁC');
        addLog('=====================================');
        addLog(`📊 Tổng kết:`);
        addLog(`   - Tổng tài khoản: ${stats.totalAccounts}`);
        addLog(`   - Thành công: ${stats.successCount}`);
        addLog(`   - Thất bại: ${stats.failedCount}`);
        addLog(`   - Admin đã xóa: ${stats.totalAdminsRemoved}`);
        addLog(`   - Nhà phân tích đã xóa: ${stats.totalAnalystsRemoved}`);
        
        updateWebUI();
        
    } catch (error) {
        addLog(`❌ Lỗi trong quá trình xóa: ${error.message}`);
        stats.isRunning = false;
        updateWebUI();
    }
}

// Dừng quá trình
function stopRemoveProcess() {
    stats.isRunning = false;
    addLog('🛑 Đã dừng quá trình xóa admin');
    updateWebUI();
}

// Cập nhật trạng thái nút
function updateButtonStates() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (startBtn && stopBtn) {
        if (stats.isRunning) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }
}

// Khởi tạo chương trình
function initRemoveAdminProgram() {
    createWebUI();
    updateWebUI();
    updateButtonStates();
    addLog('✅ Chương trình xóa quản trị viên khác đã sẵn sàng');
}

// Thêm các hàm vào global scope
window.initRemoveAdminProgram = initRemoveAdminProgram;
window.startRemoveProcess = startRemoveProcess;
window.stopRemoveProcess = stopRemoveProcess;
window.closeWebUI = closeWebUI;
window.updateWebUI = updateWebUI;
window.addLog = addLog;

// Tự động khởi tạo khi load
if (typeof window !== 'undefined') {
    initRemoveAdminProgram();
} 