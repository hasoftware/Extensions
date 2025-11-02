// CODE TÁCH ADS WHATSAPP - XỬ LÝ SONG SONG VỚI GIỚI HẠN TÀI KHOẢN THÀNH CÔNG
// Cải tiến: Giới hạn theo số tài khoản thành công, Web UI, Parallel processing, Thống kê

// Biến thống kê toàn cục
let stats = {
    totalProcessed: 0,
    successCount: 0,
    failureCount: 0,
    targetSuccess: 600, // Giới hạn 200 tài khoản THÀNH CÔNG cần tạo.
    startTime: null,
    activeRequests: 0,
    maxConcurrentRequests: 200, // Số lượng xử lý đồng thời tối đa
    isRunning: false,
    currentAccounts: []
};

// Tạo giao diện web
function createWebUI() {
    const style = document.createElement('style');
    style.textContent = `
        .tach-tkqc-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .tach-tkqc-container {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 700px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            color: white;
            position: relative;
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .tach-tkqc-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .tach-tkqc-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .tach-tkqc-subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .tach-tkqc-progress-container {
            margin: 25px 0;
        }
        
        .tach-tkqc-progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .tach-tkqc-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d2ff, #3a7bd5);
            border-radius: 10px;
            transition: width 0.5s ease;
            position: relative;
            overflow: hidden;
        }
        
        .tach-tkqc-progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .tach-tkqc-progress-text {
            text-align: center;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
        }
        
        .tach-tkqc-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 25px 0;
        }
        
        .tach-tkqc-stat-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        
        .tach-tkqc-stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .tach-tkqc-stat-label {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .tach-tkqc-current {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        
        .tach-tkqc-current-title {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .tach-tkqc-current-accounts {
            max-height: 120px;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .tach-tkqc-current-account {
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 8px;
            margin: 2px 0;
            border-radius: 5px;
            font-family: monospace;
        }
        
        .tach-tkqc-close {
            position: absolute;
            top: 15px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
        }
        
        .tach-tkqc-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .tach-tkqc-completion {
            text-align: center;
            padding: 20px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }
        
        .tach-tkqc-completion.show {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .tach-tkqc-completion-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .tach-tkqc-completion-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .tach-tkqc-completion-stats {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .tach-tkqc-speed-indicator {
            text-align: center;
            margin: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #00d2ff;
            text-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
        }
        
        .tach-tkqc-target-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: center;
            backdrop-filter: blur(10px);
        }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'tach-tkqc-modal';
    modal.innerHTML = `
        <div class="tach-tkqc-container">
            <button class="tach-tkqc-close" onclick="closeWebUI()">×</button>
            
            <div class="tach-tkqc-header">
                <div class="tach-tkqc-title">⚡ TÁCH TÀI KHOẢN QUẢNG CÁO (SONG SONG - GIỚI HẠN THÀNH CÔNG)</div>
                <div class="tach-tkqc-subtitle">Xử lý đồng thời - Mục tiêu: ${stats.targetSuccess} tài khoản THÀNH CÔNG</div>
            </div>
            
            <div class="tach-tkqc-target-info">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">🎯 Mục tiêu: ${stats.targetSuccess} tài khoản thành công</div>
                <div style="font-size: 12px; opacity: 0.8;">Script sẽ dừng khi đạt đủ số tài khoản thành công, bất kể số lần thất bại</div>
            </div>
            
            <div class="tach-tkqc-speed-indicator" id="speedIndicator">
                🚀 TỐC ĐỘ CAO - XỬ LÝ SONG SONG
            </div>
            
            <div class="tach-tkqc-progress-container">
                <div class="tach-tkqc-progress-bar">
                    <div class="tach-tkqc-progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <div class="tach-tkqc-progress-text" id="progressText">0% (0/${stats.targetSuccess})</div>
            </div>
            
            <div class="tach-tkqc-stats">
                <div class="tach-tkqc-stat-item">
                    <div class="tach-tkqc-stat-number" id="successCount">0</div>
                    <div class="tach-tkqc-stat-label">✅ Thành công</div>
                </div>
                <div class="tach-tkqc-stat-item">
                    <div class="tach-tkqc-stat-number" id="failureCount">0</div>
                    <div class="tach-tkqc-stat-label">❌ Thất bại</div>
                </div>
                <div class="tach-tkqc-stat-item">
                    <div class="tach-tkqc-stat-number" id="totalProcessed">0</div>
                    <div class="tach-tkqc-stat-label">⏱️ Đã xử lý</div>
                </div>
                <div class="tach-tkqc-stat-item">
                    <div class="tach-tkqc-stat-number" id="activeRequests">0</div>
                    <div class="tach-tkqc-stat-label">🔄 Đang xử lý</div>
                </div>
            </div>
            
            <div class="tach-tkqc-current">
                <div class="tach-tkqc-current-title">⚡ Đang xử lý đồng thời:</div>
                <div class="tach-tkqc-current-accounts" id="currentAccounts">
                    <div class="tach-tkqc-current-account">Chờ bắt đầu...</div>
                </div>
            </div>
            
            <div class="tach-tkqc-completion" id="completionSection">
                <div class="tach-tkqc-completion-icon">🎉</div>
                <div class="tach-tkqc-completion-title">HOÀN THÀNH!</div>
                <div class="tach-tkqc-completion-stats" id="completionStats"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Cập nhật giao diện
function updateWebUI() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const successCount = document.getElementById('successCount');
    const failureCount = document.getElementById('failureCount');
    const totalProcessed = document.getElementById('totalProcessed');
    const activeRequests = document.getElementById('activeRequests');
    const currentAccounts = document.getElementById('currentAccounts');
    
    if (progressFill && progressText) {
        const percentage = Math.round((stats.successCount / stats.targetSuccess) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${percentage}% (${stats.successCount}/${stats.targetSuccess})`;
    }
    
    if (successCount) successCount.textContent = stats.successCount;
    if (failureCount) failureCount.textContent = stats.failureCount;
    if (totalProcessed) totalProcessed.textContent = stats.totalProcessed;
    if (activeRequests) activeRequests.textContent = stats.activeRequests;
    
    if (currentAccounts) {
        if (stats.currentAccounts.length > 0) {
            currentAccounts.innerHTML = stats.currentAccounts
                .slice(0, 10) // Hiển thị tối đa 10 tài khoản
                .map(account => `<div class="tach-tkqc-current-account">${account}</div>`)
                .join('');
            
            if (stats.currentAccounts.length > 10) {
                currentAccounts.innerHTML += `<div class="tach-tkqc-current-account">... và ${stats.currentAccounts.length - 10} tài khoản khác</div>`;
            }
        } else {
            currentAccounts.innerHTML = '<div class="tach-tkqc-current-account">Chờ bắt đầu...</div>';
        }
    }
}

// Hiển thị thông báo hoàn thành
function showCompletionWebUI() {
    const completionSection = document.getElementById('completionSection');
    const completionStats = document.getElementById('completionStats');
    
    if (completionSection && completionStats) {
        const endTime = new Date();
        const duration = Math.round((endTime - stats.startTime) / 1000);
        const successRate = Math.round((stats.successCount / stats.totalProcessed) * 100);
        
        completionStats.innerHTML = `
            <div>🎯 Mục tiêu đạt được: <strong>${stats.successCount}/${stats.targetSuccess} tài khoản thành công</strong></div>
            <div>📈 Tổng tài khoản đã xử lý: <strong>${stats.totalProcessed}</strong></div>
            <div>✅ Thành công: <strong>${stats.successCount}</strong></div>
            <div>❌ Thất bại: <strong>${stats.failureCount}</strong></div>
            <div>📊 Tỷ lệ thành công: <strong>${successRate}%</strong></div>
            <div>⏱️ Thời gian thực hiện: <strong>${duration} giây</strong></div>
            <div>🚀 Tốc độ trung bình: <strong>${Math.round(stats.totalProcessed / duration)} TKQC/giây</strong></div>
            <div>⚡ Xử lý song song hoàn thành!</div>
        `;
        
        completionSection.classList.add('show');
        
        // Tự động ẩn sau 10 giây
        setTimeout(() => {
            closeWebUI();
        }, 10000);
    }
}

// Đóng giao diện
function closeWebUI() {
    const modal = document.querySelector('.tach-tkqc-modal');
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

async function addpermission(adAccountId) {
    const rawJson = {
        input: {
            business_id: require("BusinessUnifiedNavigationContext").businessID,
            payment_legacy_account_id: adAccountId,
            actor_id: require("CurrentUserInitialData").USER_ID,
            client_mutation_id: "2"
        }
    };
    const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
    const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=6600383160000030&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${require("WebApiApplication").getAccessToken()}`;
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
    stats.activeRequests++;
    
    // Thêm tài khoản vào danh sách đang xử lý
    const accountDisplay = `${accountId} (${index} - Thành công: ${stats.successCount}/${stats.targetSuccess})`;
    stats.currentAccounts.push(accountDisplay);
    updateWebUI();
    
    try {
        console.log(`🔄 [${index}] Bắt đầu xử lý ${accountId}...`);
        
        const addpermissionResult = await addpermission(accountId);
        if (addpermissionResult.status) {
            console.log(`✅ [${index}] ADD People ${accountId}: SUCCESS`);
            const TachAds = await CloseAdAccount(accountId);
            if (TachAds.status) {
                console.log(`✅ [${index}] TÁCH ${accountId}: SUCCESS`);
                stats.successCount++;
                
                // Kiểm tra nếu đã đạt đủ số tài khoản thành công
                if (stats.successCount >= stats.targetSuccess) {
                    stats.totalProcessed++;
                    updateWebUI();
                    showCompletionWebUI();
                    return true; // Báo hiệu đã hoàn thành
                }
            } else {
                console.error(`❌ [${index}] TÁCH ${accountId} error:`, TachAds.error);
                stats.failureCount++;
            }
        } else {
            console.error(`❌ [${index}] ADD People ${accountId} error:`, addpermissionResult.error);
            stats.failureCount++;
        }
        
        stats.totalProcessed++;
        
    } catch (error) {
        console.error(`❌ [${index}] Lỗi xử lý ${accountId}:`, error);
        stats.failureCount++;
        stats.totalProcessed++;
    } finally {
        // Xóa tài khoản khỏi danh sách đang xử lý
        const accountIndex = stats.currentAccounts.indexOf(accountDisplay);
        if (accountIndex > -1) {
            stats.currentAccounts.splice(accountIndex, 1);
        }
        stats.activeRequests--;
        updateWebUI();
    }
    
    return false; // Chưa hoàn thành
}

async function processAccountsParallel(accountIds) {
    console.log(`🚀 Bắt đầu xử lý SONG SONG ${accountIds.length} tài khoản (Cần thêm ${stats.targetSuccess - stats.successCount} tài khoản thành công)`);
    console.log(`⚡ Xử lý đồng thời tối đa: ${stats.maxConcurrentRequests} tài khoản`);
    
    // Tạo tất cả promises cùng lúc
    const promises = accountIds.map((accountId, index) => {
        const globalIndex = stats.totalProcessed + index + 1;
        return processSingleAccount(accountId, globalIndex);
    });
    
    // Chờ tất cả hoàn thành
    const results = await Promise.all(promises);
    
    // Kiểm tra nếu có bất kỳ promise nào hoàn thành mục tiêu
    if (results.some(result => result === true)) {
        return true; // Báo hiệu đã hoàn thành
    }
    
    return false; // Chưa đạt đủ số tài khoản thành công
}

async function mainLoop() {
    stats.startTime = new Date();
    stats.isRunning = true;
    
    // Tạo giao diện web
    createWebUI();
    
    console.log('🎯 BẮT ĐẦU TÁCH TÀI KHOẢN QUẢNG CÁO (SONG SONG - GIỚI HẠN THEO THÀNH CÔNG)');
    console.log(`📋 Mục tiêu: ${stats.targetSuccess} tài khoản THÀNH CÔNG`);
    console.log(`⚡ Chế độ: Xử lý đồng thời tối đa ${stats.maxConcurrentRequests} tài khoản`);
    console.log(`⏰ Thời gian bắt đầu: ${stats.startTime.toLocaleString()}`);
    console.log('=====================================\n');
    
    while (stats.isRunning) {
        const accountIds = await getReadOnlyAccountIds();
        if (accountIds.length > 0) {
            const isCompleted = await processAccountsParallel(accountIds);
            if (isCompleted) {
                console.log('🎉 Đã đạt đủ số tài khoản thành công! Dừng script.');
                break;
            }
        } else {
            console.log("Không tìm thấy tài khoản Read-Only nào.");
            stats.currentAccounts = ["Không tìm thấy tài khoản Read-Only"];
            updateWebUI();
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây
    }
}

mainLoop(); 