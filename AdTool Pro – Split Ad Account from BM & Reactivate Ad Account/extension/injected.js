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
    },

    // Danh sách tài khoản đang xử lý
    tachCurrentAccounts: []
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

// Lấy danh sách tài khoản quảng cáo chỉ đọc
async function getReadOnlyAccountIds() {
    try {
        console.log('🔍 Bắt đầu lấy danh sách tài khoản quảng cáo...');
        
        // Phương pháp 1: Thử lấy từ Graph API trước
        try {
            console.log('📡 Thử phương pháp Graph API...');
            
            // Lấy access token từ nhiều nguồn
            let access_token;
            try {
                // Thử lấy từ WebApiApplication
                access_token = require("WebApiApplication").getAccessToken();
                console.log('✅ Lấy access token từ WebApiApplication thành công');
            } catch (e) {
                console.log('⚠️ Không thể lấy từ WebApiApplication, thử phương pháp khác...');
                
                // Thử lấy từ cookie
                const tokenMatch = document.cookie.match(/c_user=(\d+)/);
                if (tokenMatch) {
                    const uid = tokenMatch[1];
                    console.log('✅ Lấy user ID từ cookie:', uid);
                    
                    // Thử lấy access token từ localStorage hoặc sessionStorage
                    const storedToken = localStorage.getItem('access_token') || 
                                      sessionStorage.getItem('access_token') ||
                                      localStorage.getItem('fb_access_token') ||
                                      sessionStorage.getItem('fb_access_token');
                    
                    if (storedToken) {
                        access_token = storedToken;
                        console.log('✅ Lấy access token từ storage');
                    }
                }
            }
            
            // Lấy business ID từ nhiều nguồn
            let businessID;
            try {
                businessID = require("BusinessUnifiedNavigationContext").businessID;
                console.log('✅ Lấy business ID từ BusinessUnifiedNavigationContext:', businessID);
            } catch (e) {
                console.log('⚠️ Không thể lấy từ BusinessUnifiedNavigationContext, thử phương pháp khác...');
                
                // Thử lấy từ URL
                const urlMatch = window.location.href.match(/business_id=(\d+)/);
                if (urlMatch) {
                    businessID = urlMatch[1];
                    console.log('✅ Lấy business ID từ URL:', businessID);
                } else {
                    // Thử lấy từ các element trên trang
                    const businessIdElement = document.querySelector('[data-business-id]') || 
                                            document.querySelector('[data-bid]') ||
                                            document.querySelector('input[name="__bid"]');
                    
                    if (businessIdElement) {
                        businessID = businessIdElement.getAttribute('data-business-id') || 
                                   businessIdElement.getAttribute('data-bid') ||
                                   businessIdElement.value;
                        console.log('✅ Lấy business ID từ element:', businessID);
                    }
                }
            }
            
            if (access_token && businessID) {
                console.log('🚀 Sử dụng Graph API với access token và business ID');
                
                const response = await fetch(`https://graph.facebook.com/v17.0/${businessID}/owned_ad_accounts?access_token=${access_token}&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_ad_accounts&_reqSrc=BusinessConnectedOwnedAdAccountsStore.brands&date_format=U&fields=%5B%22id%22%2C%22name%22%2C%22account_id%22%2C%22account_status%22%2C%22business%22%2C%22created_time%22%2C%22currency%22%2C%22timezone_name%22%2C%22end_advertiser%22%2C%22end_advertiser_name%22%2C%22invoicing_emails%22%2C%22is_disabled_umbrella%22%2C%22last_spend_time%22%2C%22funding_source%22%2C%22can_be_blocked_from_pixel_sharing%22%2C%22disable_reason%22%2C%22bill_to_org.fields(legal_entity_name)%22%2C%22onbehalf_requests.fields(receiving_business.fields(name)%2Cstatus)%22%5D&filtering=%5B%7B%22field%22%3A%22account_status%22%2C%22operator%22%3A%22NOT_EQUAL%22%2C%22value%22%3A%226%22%7D%5D&limit=10000&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f41c4c0b703bc`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                const text = await response.text();
                console.log('📡 Graph API response status:', response.status);
                console.log('📥 Graph API response length:', text.length);
                
                if (response.ok) {
                    const data = JSON.parse(text);
                    if (data.data && Array.isArray(data.data)) {
                        // Lọc các tài khoản có "Read-Only" trong tên
                        const readOnlyIds = data.data
                            .filter(item => item.name && item.name.includes("Read-Only"))
                            .map(item => item.account_id);
                        
                        console.log('✅ Graph API thành công, tìm thấy', readOnlyIds.length, 'tài khoản Read-Only');
                        return readOnlyIds;
                    }
                }
            }
        } catch (graphError) {
            console.log('❌ Graph API thất bại:', graphError.message);
        }
        
        // Phương pháp 2: Thử lấy từ form inputs
        console.log('📡 Thử phương pháp form inputs...');
        
        // Lấy các giá trị cần thiết từ nhiều nguồn
        let fb_dtsg = document.querySelector('input[name="fb_dtsg"]')?.value || '';
        let __user = document.querySelector('input[name="__user"]')?.value || '';
        let jazoest = document.querySelector('input[name="jazoest"]')?.value || '';
        
        // Thử lấy từ các nguồn khác nếu không có
        if (!fb_dtsg) {
            try {
                fb_dtsg = require("DTSGInitData").token || require("DTSGInitialData").token;
                console.log('✅ Lấy fb_dtsg từ DTSGInitData/DTSGInitialData');
            } catch (e) {
                console.log('⚠️ Không thể lấy fb_dtsg từ DTSGInitData');
            }
        }
        
        if (!__user) {
            try {
                __user = require("CurrentUserInitialData").USER_ID;
                console.log('✅ Lấy __user từ CurrentUserInitialData');
            } catch (e) {
                // Thử lấy từ cookie
                const userMatch = document.cookie.match(/c_user=(\d+)/);
                if (userMatch) {
                    __user = userMatch[1];
                    console.log('✅ Lấy __user từ cookie');
                }
            }
        }
        
        console.log('📋 Các giá trị cần thiết:', {
            fb_dtsg: fb_dtsg ? 'Có' : 'Không có',
            __user: __user ? 'Có' : 'Không có',
            jazoest: jazoest ? 'Có' : 'Không có'
        });
        
        if (!fb_dtsg || !__user) {
            console.error('❌ Thiếu dữ liệu cần thiết để gọi API');
            return [];
        }
        
        const response = await fetch('/api/graphql/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'av': __user,
                '__user': __user,
                '__a': '1',
                '__req': '1',
                '__hs': document.querySelector('input[name="__hs"]')?.value || '',
                'dpr': '1',
                '__ccg': 'EXCELLENT',
                '__rev': document.querySelector('input[name="__rev"]')?.value || '',
                '__s': document.querySelector('input[name="__s"]')?.value || '',
                '__hsi': document.querySelector('input[name="__hsi"]')?.value || '',
                '__dyn': document.querySelector('input[name="__dyn"]')?.value || '',
                '__csr': document.querySelector('input[name="__csr"]')?.value || '',
                '__comet_req': '7',
                'fb_dtsg': fb_dtsg,
                'jazoest': jazoest,
                'lsd': document.querySelector('input[name="lsd"]')?.value || '',
                '__spin_r': document.querySelector('input[name="__spin_r"]')?.value || '',
                '__spin_b': document.querySelector('input[name="__spin_b"]')?.value || '',
                '__spin_t': document.querySelector('input[name="__spin_t"]')?.value || '',
                'fb_api_caller_class': 'RelayModern',
                'fb_api_req_friendly_name': 'AdsManagerOwnedAdAccountsQuery',
                'variables': JSON.stringify({
                    "count": 1000,
                    "cursor": null,
                    "scale": 1
                }),
                'server_timestamps': 'true',
                'doc_id': '7564018848801648'
            })
        });

        console.log('📡 Response status:', response.status);
        
        const data = await response.text();
        console.log('📥 Response data length:', data.length);
        console.log('📥 Response data preview:', data.substring(0, 200));
        
        const jsonMatch = data.match(/\["RelayModern",\s*"7564018848801648",\s*"([^"]+)"\]/);
        
        if (jsonMatch) {
            console.log('✅ Tìm thấy JSON data');
            const jsonData = JSON.parse(jsonMatch[1]);
            const edges = jsonData.data?.viewer?.owned_ad_accounts?.edges || [];
            console.log('📊 Tìm thấy', edges.length, 'tài khoản quảng cáo');
            
            // Lọc các tài khoản có "Read-Only" trong tên
            const readOnlyIds = edges
                .filter(edge => edge.node.name && edge.node.name.includes("Read-Only"))
                .map(edge => edge.node.id);
            
            console.log('📋 Danh sách Read-Only account IDs:', readOnlyIds);
            return readOnlyIds;
        } else {
            console.error('❌ Không tìm thấy JSON data trong response');
            console.log('🔍 Tìm kiếm pattern khác...');
            
            // Thử tìm pattern khác
            const alternativeMatch = data.match(/"owned_ad_accounts":\s*\{[^}]*"edges":\s*\[([^\]]+)\]/);
            if (alternativeMatch) {
                console.log('✅ Tìm thấy pattern thay thế');
                // Parse manually
                const edgesText = alternativeMatch[1];
                const accountMatches = edgesText.match(/"id":\s*"([^"]+)"/g);
                if (accountMatches) {
                    const accountIds = accountMatches.map(match => match.match(/"id":\s*"([^"]+)"/)[1]);
                    console.log('📋 Danh sách account IDs (alternative):', accountIds);
                    return accountIds;
                }
            }
        }
        
        console.log('❌ Không thể parse được dữ liệu tài khoản');
        return [];
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách tài khoản:', error);
        return [];
    }
}

// Thêm quyền cho tài khoản quảng cáo
async function addpermission(adAccountId) {
    try {
        console.log(`🔐 Bắt đầu add permission cho ${adAccountId}...`);
        
        // Lấy business ID từ nhiều nguồn
        let businessID;
        try {
            businessID = require("BusinessUnifiedNavigationContext").businessID;
            console.log('✅ Lấy business ID từ BusinessUnifiedNavigationContext:', businessID);
        } catch (e) {
            console.log('⚠️ Không thể lấy từ BusinessUnifiedNavigationContext, thử phương pháp khác...');
            
            // Thử lấy từ URL
            const urlMatch = window.location.href.match(/business_id=(\d+)/);
            if (urlMatch) {
                businessID = urlMatch[1];
                console.log('✅ Lấy business ID từ URL:', businessID);
            } else {
                // Thử lấy từ các element trên trang
                const businessIdElement = document.querySelector('[data-business-id]') || 
                                        document.querySelector('[data-bid]') ||
                                        document.querySelector('input[name="__bid"]');
                
                if (businessIdElement) {
                    businessID = businessIdElement.getAttribute('data-business-id') || 
                               businessIdElement.getAttribute('data-bid') ||
                               businessIdElement.value;
                    console.log('✅ Lấy business ID từ element:', businessID);
                }
            }
        }
        
        // Lấy user ID từ nhiều nguồn
        let userID;
        try {
            userID = require("CurrentUserInitialData").USER_ID;
            console.log('✅ Lấy user ID từ CurrentUserInitialData:', userID);
        } catch (e) {
            // Thử lấy từ cookie
            const userMatch = document.cookie.match(/c_user=(\d+)/);
            if (userMatch) {
                userID = userMatch[1];
                console.log('✅ Lấy user ID từ cookie:', userID);
            }
        }
        
        if (!businessID || !userID) {
            console.error('❌ Không thể lấy business ID hoặc user ID');
            return { status: false, error: 'Missing business ID or user ID' };
        }
        
        const rawJson = {
            input: {
                business_id: businessID,
                payment_legacy_account_id: adAccountId,
                actor_id: userID,
                client_mutation_id: "2"
            }
        };
        
        const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
        let url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=6600383160000030&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}`;
        
        // Lấy access token
        let access_token;
        try {
            access_token = require("WebApiApplication").getAccessToken();
            console.log('✅ Lấy access token từ WebApiApplication');
        } catch (e) {
            console.log('⚠️ Không thể lấy access token từ WebApiApplication');
            // Thử lấy từ storage
            access_token = localStorage.getItem('access_token') || 
                          sessionStorage.getItem('access_token') ||
                          localStorage.getItem('fb_access_token') ||
                          sessionStorage.getItem('fb_access_token');
            
            if (access_token) {
                console.log('✅ Lấy access token từ storage');
            }
        }
        
        if (access_token) {
            url += `&access_token=${access_token}`;
        }
        
        console.log(`📡 Gửi request add permission: ${url.substring(0, 100)}...`);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log(`📥 Response add permission cho ${adAccountId}:`, data);

        const billingWritePermission = data?.data?.grant_manage_ad_account?.ad_account?.viewer_permissions?.billing_write;

        if (billingWritePermission) {
            console.log(`✅ Add permission thành công cho ${adAccountId}`);
            return { status: true, error: null };
        } else {
            console.log(`❌ Add permission thất bại cho ${adAccountId}:`, data);
            return { status: false, error: data };
        }
    } catch (err) {
        console.error(`❌ Lỗi add permission cho ${adAccountId}:`, err);
        return { status: false, error: err };
    }
}

// Đóng tài khoản quảng cáo
async function CloseAdAccount(adAccountId) {
    try {
        console.log(`🔒 Bắt đầu đóng tài khoản ${adAccountId}...`);
        
        // Lấy fb_dtsg từ nhiều nguồn
        let fb_dtsg;
        try {
            fb_dtsg = require("DTSGInitData").token || require("DTSGInitialData").token;
            console.log('✅ Lấy fb_dtsg từ DTSGInitData/DTSGInitialData');
        } catch (e) {
            fb_dtsg = document.querySelector('input[name="fb_dtsg"]')?.value || '';
            if (fb_dtsg) {
                console.log('✅ Lấy fb_dtsg từ form input');
            } else {
                console.log('⚠️ Không thể lấy fb_dtsg');
            }
        }
        
        // Lấy user ID từ nhiều nguồn
        let userID;
        try {
            userID = require("CurrentUserInitialData").USER_ID;
            console.log('✅ Lấy user ID từ CurrentUserInitialData:', userID);
        } catch (e) {
            // Thử lấy từ cookie
            const userMatch = document.cookie.match(/c_user=(\d+)/);
            if (userMatch) {
                userID = userMatch[1];
                console.log('✅ Lấy user ID từ cookie:', userID);
            } else {
                userID = document.querySelector('input[name="__user"]')?.value || '';
                if (userID) {
                    console.log('✅ Lấy user ID từ form input');
                }
            }
        }
        
        // Lấy business ID từ nhiều nguồn
        let businessID;
        try {
            businessID = require("BusinessUnifiedNavigationContext").businessID;
            console.log('✅ Lấy business ID từ BusinessUnifiedNavigationContext:', businessID);
        } catch (e) {
            console.log('⚠️ Không thể lấy từ BusinessUnifiedNavigationContext, thử phương pháp khác...');
            
            // Thử lấy từ URL
            const urlMatch = window.location.href.match(/business_id=(\d+)/);
            if (urlMatch) {
                businessID = urlMatch[1];
                console.log('✅ Lấy business ID từ URL:', businessID);
            } else {
                // Thử lấy từ các element trên trang
                const businessIdElement = document.querySelector('[data-business-id]') || 
                                        document.querySelector('[data-bid]') ||
                                        document.querySelector('input[name="__bid"]');
                
                if (businessIdElement) {
                    businessID = businessIdElement.getAttribute('data-business-id') || 
                               businessIdElement.getAttribute('data-bid') ||
                               businessIdElement.value;
                    console.log('✅ Lấy business ID từ element:', businessID);
                }
            }
        }
        
        if (!fb_dtsg || !userID || !businessID) {
            console.error('❌ Thiếu dữ liệu cần thiết để đóng tài khoản');
            return { status: false, error: 'Missing required data' };
        }
        
        const StringPost = `jazoest=25524&fb_dtsg=${fb_dtsg}&account_id=${adAccountId}&__usid=6-Tskqo1h1o56glr%3APskqo1h16o00sk%3A0-Askqn631d2395g-RV%3D6%3AF%3D&__aaid=0&__bid=${businessID}&__user=${userID}&__a=1&__req=y&__hs=19998.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016990685&__s=axc5os%3A4n4eqp%3A948yz8&__hsi=7421228722412779754&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1Dxuq3mq1FxebzA3miidBxa7EiwnobES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G2mcwuE2Bz84a9DxW10wywWjxCU5-u2C2l0Fg2uwEwiUmwoErorx2aK2a4p8aHwzzXx-ewjovCxeq4o884O1fwwxefzo5G4E5yeDyU52dwyw-z8c8-5aDwQwKG13y86qbxa4o-2-qaUK2e0UFU2RwrU6CiU9E4KeCK2q5UpwDwjouxK2i2y1sDw4kwtU5K2G0BE&__csr=&lsd=h2GQa8HPsn-MsvTtASY4gX&__spin_r=1016990685&__spin_b=trunk&__spin_t=1727889460&__jssesw=1`;
        const url = `https://business.facebook.com/ads/ajax/account_close`;

        console.log(`📡 Gửi request đóng tài khoản: ${url}`);
        console.log(`📋 Post data length: ${StringPost.length}`);

        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: StringPost
        });
        
        let text = await response.text();
        console.log(`📥 Response status: ${response.status}`);
        console.log(`📥 Response length: ${text.length}`);
        
        if (text.startsWith('for (;;);')) {
            text = text.slice('for (;;);'.length);
        }
        
        const data = JSON.parse(text);
        console.log(`📥 Response data cho ${adAccountId}:`, data);

        if (Array.isArray(data?.payload) && data.payload.length === 0) {
            console.log(`✅ Đóng tài khoản thành công: ${adAccountId}`);
            return { status: true, error: null };
        } else {
            console.log(`❌ Đóng tài khoản thất bại: ${adAccountId}`, data);
            return { status: false, error: data };
        }
    } catch (err) {
        console.error(`❌ Lỗi đóng tài khoản ${adAccountId}:`, err);
        return { status: false, error: err };
    }
}

// Xử lý một tài khoản
async function processSingleAccount(accountId, index) {
    console.log(`🔄 [${index}] ===== BẮT ĐẦU XỬ LÝ TÀI KHOẢN ${accountId} =====`);
    
    stats.tachActiveRequests++;
    
    // Thêm tài khoản vào danh sách đang xử lý
    const accountDisplay = `${accountId} (${index} - Thành công: ${stats.tachSuccessCount}/${stats.config.targetSuccess})`;
    stats.tachCurrentAccounts.push(accountDisplay);
    updateStats();
    
    try {
        console.log(`🔄 [${index}] Bước 1: Thêm quyền cho ${accountId}...`);
        
        const addpermissionResult = await addpermission(accountId);
        console.log(`📋 [${index}] Kết quả add permission:`, addpermissionResult);
        
        if (addpermissionResult.status) {
            console.log(`✅ [${index}] ADD People ${accountId}: SUCCESS`);
            
            console.log(`🔄 [${index}] Bước 2: Đóng tài khoản ${accountId}...`);
            const TachAds = await CloseAdAccount(accountId);
            console.log(`📋 [${index}] Kết quả đóng tài khoản:`, TachAds);
            
            if (TachAds.status) {
                console.log(`✅ [${index}] TÁCH ${accountId}: SUCCESS`);
                stats.tachSuccessCount++;
                console.log(`📊 [${index}] Cập nhật số tài khoản thành công: ${stats.tachSuccessCount}/${stats.config.targetSuccess}`);
                
                // Kiểm tra nếu đã đạt đủ số tài khoản thành công
                if (stats.tachSuccessCount >= stats.config.targetSuccess) {
                    console.log(`🎯 [${index}] Đã đạt đủ số tài khoản thành công! Dừng quá trình.`);
                    stats.tachTotalProcessed++;
                    updateStats();
                    return { completed: true, reason: 'target_reached' };
                }
            } else {
                console.error(`❌ [${index}] TÁCH ${accountId} THẤT BẠI:`, TachAds.error);
                stats.tachFailureCount++;
                console.log(`📊 [${index}] Cập nhật số tài khoản thất bại: ${stats.tachFailureCount}/${stats.config.failureThresholdToKichHoat}`);
                
                // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
                if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
                    console.log(`⚠️ [${index}] Số lần thất bại vượt quá ngưỡng! Dừng quá trình.`);
                    stats.tachTotalProcessed++;
                    updateStats();
                    return { completed: true, reason: 'failure_threshold' };
                }
            }
        } else {
            console.error(`❌ [${index}] ADD People ${accountId} THẤT BẠI:`, addpermissionResult.error);
            stats.tachFailureCount++;
            console.log(`📊 [${index}] Cập nhật số tài khoản thất bại: ${stats.tachFailureCount}/${stats.config.failureThresholdToKichHoat}`);
            
            // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
            if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
                console.log(`⚠️ [${index}] Số lần thất bại vượt quá ngưỡng! Dừng quá trình.`);
                stats.tachTotalProcessed++;
                updateStats();
                return { completed: true, reason: 'failure_threshold' };
            }
        }
        
        stats.tachTotalProcessed++;
        console.log(`📊 [${index}] Cập nhật tổng số tài khoản đã xử lý: ${stats.tachTotalProcessed}`);
        
        // Delay giữa các tài khoản nếu được bật
        if (stats.config.enableDelayBetweenAccounts && stats.config.delayBetweenAccounts > 0) {
            console.log(`⏰ [${index}] Delay ${stats.config.delayBetweenAccounts} giây trước khi xử lý tài khoản tiếp theo...`);
            await new Promise(resolve => setTimeout(resolve, stats.config.delayBetweenAccounts * 1000));
        }
        
        console.log(`✅ [${index}] ===== HOÀN THÀNH XỬ LÝ TÀI KHOẢN ${accountId} =====`);
        
    } catch (error) {
        console.error(`❌ [${index}] LỖI XỬ LÝ ${accountId}:`, error);
        stats.tachFailureCount++;
        stats.tachTotalProcessed++;
        console.log(`📊 [${index}] Cập nhật số tài khoản thất bại: ${stats.tachFailureCount}/${stats.config.failureThresholdToKichHoat}`);
        
        // Kiểm tra nếu số lần thất bại vượt quá ngưỡng
        if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
            console.log(`⚠️ [${index}] Số lần thất bại vượt quá ngưỡng! Dừng quá trình.`);
            updateStats();
            return { completed: true, reason: 'failure_threshold' };
        }
    } finally {
        // Xóa tài khoản khỏi danh sách đang xử lý
        const accountIndex = stats.tachCurrentAccounts.indexOf(accountDisplay);
        if (accountIndex > -1) {
            stats.tachCurrentAccounts.splice(accountIndex, 1);
        }
        stats.tachActiveRequests--;
        updateStats();
        console.log(`📊 [${index}] Cập nhật số tài khoản đang xử lý: ${stats.tachActiveRequests}`);
    }
    
    return { completed: false, reason: null };
}

// Xử lý tài khoản song song
async function processAccountsParallel(accountIds) {
    console.log(`🚀 ===== BẮT ĐẦU XỬ LÝ SONG SONG =====`);
    console.log(`📊 Tổng số tài khoản: ${accountIds.length}`);
    console.log(`🎯 Cần thêm: ${stats.config.targetSuccess - stats.tachSuccessCount} tài khoản thành công`);
    console.log(`⚡ Xử lý đồng thời tối đa: ${stats.tachMaxConcurrentRequests} tài khoản`);
    console.log(`📋 Danh sách tài khoản:`, accountIds);
    
    // Tạo tất cả promises cùng lúc
    console.log(`🔄 Tạo ${accountIds.length} promises để xử lý song song...`);
    const promises = accountIds.map((accountId, index) => {
        const globalIndex = stats.tachTotalProcessed + index + 1;
        console.log(`📝 Tạo promise cho tài khoản ${accountId} (index: ${globalIndex})`);
        return processSingleAccount(accountId, globalIndex);
    });
    
    console.log(`⏳ Chờ tất cả ${promises.length} promises hoàn thành...`);
    
    // Chờ tất cả hoàn thành
    const results = await Promise.all(promises);
    
    console.log(`📊 Kết quả xử lý song song:`, results);
    
    // Kiểm tra kết quả
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log(`🔍 Kiểm tra kết quả ${i + 1}/${results.length}:`, result);
        
        if (result.completed) {
            console.log(`🎯 Tìm thấy kết quả hoàn thành: ${result.reason}`);
            return result;
        }
    }
    
    console.log(`✅ Tất cả tài khoản đã được xử lý, không có kết quả hoàn thành đặc biệt`);
    return { completed: false, reason: null };
}

// Bắt đầu quá trình tách
async function startTachProcess() {
    console.log('🔧 ===== BẮT ĐẦU TÁCH TÀI KHOẢN QUẢNG CÁO =====');
    console.log('⏰ Thời gian bắt đầu:', new Date().toLocaleString());
    console.log('⚙️ Cấu hình hiện tại:', stats.config);
    console.log('=====================================');
    
    stats.tachStartTime = new Date();
    stats.currentPhase = 'tach';
    stats.tachIsRunning = true;
    updateStats();
    
    try {
        console.log('📡 Bước 1: Lấy danh sách tài khoản quảng cáo...');
        const accountIds = await getReadOnlyAccountIds();
        console.log('📊 Kết quả lấy danh sách:', accountIds.length, 'tài khoản');
        
        if (accountIds.length > 0) {
            console.log('📋 Danh sách tài khoản chi tiết:', accountIds);
        }
        
        stats.tachTotalProcessed = accountIds.length;
        updateStats();
        
        if (accountIds.length === 0) {
            console.log('❌ Không tìm thấy tài khoản quảng cáo nào');
            console.log('💡 Có thể bạn chưa đăng nhập hoặc không có quyền truy cập');
            console.log('🔍 Hãy kiểm tra:');
            console.log('   - Đã đăng nhập Facebook Business Manager');
            console.log('   - Có tài khoản quảng cáo với tên chứa "Read-Only"');
            console.log('   - Trang đã load hoàn toàn');
            return;
        }
        
        console.log(`📊 Tổng số tài khoản: ${accountIds.length}`);
        console.log('🚀 Bước 2: Bắt đầu xử lý song song...');
        
        // Xử lý song song
        const result = await processAccountsParallel(accountIds);
        console.log('📊 Kết quả xử lý song song:', result);
        
        console.log('✅ Hoàn thành tách:', stats.tachSuccessCount, 'tài khoản thành công');
        console.log('📊 Thống kê chi tiết:');
        console.log('   - Tổng xử lý:', stats.tachTotalProcessed);
        console.log('   - Thành công:', stats.tachSuccessCount);
        console.log('   - Thất bại:', stats.tachFailureCount);
        
        // Kiểm tra điều kiện chuyển sang kích hoạt
        if (stats.config.enableKichHoat) {
            if (stats.tachSuccessCount >= stats.config.targetSuccess) {
                console.log('✅ Đã đạt đủ số tài khoản thành công! Chuyển sang kích hoạt...');
            } else if (stats.tachFailureCount >= stats.config.failureThresholdToKichHoat) {
                console.log('⚠️ Số lần thất bại vượt quá ngưỡng! Chuyển sang kích hoạt...');
            } else {
                console.log('ℹ️ Chưa đạt điều kiện chuyển sang kích hoạt');
            }
        }
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình tách:', error);
        console.error('📋 Chi tiết lỗi:', error.stack);
    } finally {
        stats.tachIsRunning = false;
        if (stats.currentPhase === 'tach') {
            stats.currentPhase = 'completed';
        }
        updateStats();
        console.log('🔧 ===== KẾT THÚC QUÁ TRÌNH TÁCH =====');
    }
}

// Lấy access token và các thông tin cần thiết
function getRequiredData() {
    let access_token;
    let fb_dtsg2;
    let uid;

    try {
        access_token = require("WebApiApplication").getAccessToken();
        console.log('✅ Lấy access token từ WebApiApplication');
    } catch (error) {
        console.log('⚠️ Không thể lấy access token từ WebApiApplication');
    }

    try {
        fb_dtsg2 = require("DTSGInitData").token || require("DTSGInitialData").token;
        console.log('✅ Lấy fb_dtsg2 từ DTSGInitData/DTSGInitialData');
    } catch (error) {
        fb_dtsg2 = document.querySelector('[name="fb_dtsg"]')?.value || '';
        if (fb_dtsg2) {
            console.log('✅ Lấy fb_dtsg2 từ form input');
        }
    }

    try {
        uid = require("CurrentUserInitialData").USER_ID;
        console.log('✅ Lấy uid từ CurrentUserInitialData');
    } catch (error) {
        const userMatch = document.cookie.match(/c_user=(\d+)/);
        if (userMatch) {
            uid = userMatch[1];
            console.log('✅ Lấy uid từ cookie');
        }
    }

    if (access_token === undefined || access_token === '') {
        console.error('❌ Lỗi: Không thể lấy access token. Vui lòng đảm bảo đã đăng nhập Facebook và thử lại');
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

// Kích hoạt tài khoản quảng cáo
async function action2(businessID, index, total, accountName, access_token, fb_dtsg2, uid) {
    if (!stats.isRunning) return;
    
    try {
        stats.kichHoatProcessing++;
        updateStats();
        
        const response = await fetch('/api/graphql/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'av': document.querySelector('input[name="jazoest"]')?.value || '',
                '__user': uid,
                '__a': '1',
                '__req': '1',
                '__hs': document.querySelector('input[name="__hs"]')?.value || '',
                'dpr': '1',
                '__ccg': 'EXCELLENT',
                '__rev': document.querySelector('input[name="__rev"]')?.value || '',
                '__s': document.querySelector('input[name="__s"]')?.value || '',
                '__hsi': document.querySelector('input[name="__hsi"]')?.value || '',
                '__dyn': document.querySelector('input[name="__dyn"]')?.value || '',
                '__csr': document.querySelector('input[name="__csr"]')?.value || '',
                '__comet_req': '7',
                'fb_dtsg': fb_dtsg2,
                'jazoest': document.querySelector('input[name="jazoest"]')?.value || '',
                'lsd': document.querySelector('input[name="lsd"]')?.value || '',
                '__spin_r': document.querySelector('input[name="__spin_r"]')?.value || '',
                '__spin_b': document.querySelector('input[name="__spin_b"]')?.value || '',
                '__spin_t': document.querySelector('input[name="__spin_t"]')?.value || '',
                'fb_api_caller_class': 'RelayModern',
                'fb_api_req_friendly_name': 'useBillingSelfGrantManageAdAccountMutation',
                'variables': JSON.stringify({
                    "input": {
                        "ad_account_id": accountName,
                        "actor_id": businessID,
                        "client_mutation_id": "1"
                    }
                }),
                'server_timestamps': 'true',
                'doc_id': '7564018848801648'
            })
        });

        const data = await response.text();
        
        if (data.includes('"success":true')) {
            console.log(`${index + 1}/${total} ${accountName} | -> ✅ Thành công`);
            stats.kichHoatSuccess++;
        } else {
            console.log(`${index + 1}/${total} ${accountName} | -> ❌ Thất bại`);
            stats.kichHoatFailed++;
        }
        
    } catch (error) {
        console.error(`❌ Lỗi kích hoạt tài khoản ${accountName}:`, error);
        stats.kichHoatFailed++;
    } finally {
        stats.kichHoatProcessing--;
        updateStats();
    }
}

// Xử lý kích hoạt tài khoản
async function action1(index, arr, access_token, fb_dtsg2, uid) {
    if (!stats.isRunning) return;
    
    try {
        const accountName = arr[index];
        const businesses = await getBusinesses2(access_token);
        
        if (businesses.length > 0) {
            const businessID = businesses[0].id;
            await action2(businessID, index, arr.length, accountName, access_token, fb_dtsg2, uid);
        } else {
            console.log(`${index + 1}/${arr.length} ${accountName} | -> ❌ Không tìm thấy business`);
            stats.kichHoatFailed++;
            updateStats();
        }
        
        // Xử lý tài khoản tiếp theo
        if (index + 1 < arr.length && stats.isRunning) {
            setTimeout(() => action1(index + 1, arr, access_token, fb_dtsg2, uid), 100);
        }
        
    } catch (error) {
        console.error(`❌ Lỗi xử lý kích hoạt ${index}:`, error);
        stats.kichHoatFailed++;
        updateStats();
    }
}

// Bắt đầu quá trình kích hoạt
async function startKichHoatProcess() {
    console.log('🔓 BƯỚC 2: KÍCH HOẠT TÀI KHOẢN QUẢNG CÁO');
    console.log('🔓 BẮT ĐẦU KÍCH HOẠT TÀI KHOẢN QUẢNG CÁO');
    console.log('⏰ Thời gian bắt đầu:', new Date().toLocaleString());
    console.log('=====================================');
    
    stats.kichHoatStartTime = new Date();
    stats.currentPhase = 'kichhoat';
    stats.kichHoatIsRunning = true;
    updateStats();
    
    try {
        const { access_token, fb_dtsg2, uid } = getRequiredData();
        
        // Lấy danh sách tài khoản đã tách
        const accountIds = await getReadOnlyAccountIds();
        stats.kichHoatTotal = accountIds.length;
        updateStats();
        
        if (accountIds.length === 0) {
            console.log('❌ Không có tài khoản nào để kích hoạt');
            return;
        }
        
        console.log(`📊 Tổng số tài khoản cần kích hoạt: ${accountIds.length}`);
        
        // Bắt đầu xử lý
        await action1(0, accountIds, access_token, fb_dtsg2, uid);
        
        console.log('✅ Hoàn thành kích hoạt:', stats.kichHoatSuccess, 'tài khoản thành công');
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình kích hoạt:', error);
    } finally {
        stats.kichHoatIsRunning = false;
        stats.currentPhase = 'completed';
        updateStats();
    }
}

// Quá trình chính
async function mainCombinedProcess() {
    console.log('🎯 ===== BẮT ĐẦU QUÁ TRÌNH CHÍNH =====');
    console.log('⏰ Thời gian bắt đầu:', new Date().toLocaleString());
    
    try {
        console.log('🔧 Bước 1: Bắt đầu quá trình tách tài khoản...');
        await startTachProcess();
        
        console.log('🎉 HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH!');
        console.log('📊 THỐNG KÊ TỔNG HỢP:');
        console.log('🔧 Tách tài khoản:', stats.tachSuccessCount + '/' + currentConfig.targetSuccess, 'thành công');
        console.log('🔓 Kích hoạt tài khoản:', stats.kichHoatSuccess + '/' + stats.kichHoatTotal, 'thành công');
        console.log('🎯 Tổng cộng:', stats.tachSuccessCount + stats.kichHoatSuccess, 'tài khoản hoàn tất');
        
        const endTime = new Date();
        const totalDuration = Math.round((endTime - stats.tachStartTime) / 1000);
        console.log('⏱️ Tổng thời gian:', totalDuration, 'giây');
        console.log('HASoftware - Ads Solution - Auto Version');
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình chính:', error);
        console.error('📋 Chi tiết lỗi:', error.stack);
    } finally {
        console.log('🎯 ===== KẾT THÚC QUÁ TRÌNH CHÍNH =====');
    }
}

// Bắt đầu AdTool Pro
function startAdToolPro() {
    console.log('🚀 ===== BẮT ĐẦU AD TOOL PRO =====');
    console.log('⏰ Thời gian bắt đầu:', new Date().toLocaleString());
    
    if (stats.isRunning) {
        console.log('⚠️ Quá trình đang chạy. Vui lòng đợi hoàn thành.');
        return;
    }
    
    console.log('⚙️ Cấu hình:', currentConfig);
    console.log('📊 Trạng thái hiện tại:', {
        isRunning: stats.isRunning,
        currentPhase: stats.currentPhase,
        tachSuccessCount: stats.tachSuccessCount,
        tachFailureCount: stats.tachFailureCount
    });
    
    // Reset thống kê
    console.log('🔄 Reset thống kê...');
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
    stats.tachCurrentAccounts = []; // Reset danh sách đang xử lý
    
    console.log('📊 Thống kê sau reset:', {
        tachTotalProcessed: stats.tachTotalProcessed,
        tachSuccessCount: stats.tachSuccessCount,
        tachFailureCount: stats.tachFailureCount,
        isRunning: stats.isRunning
    });
    
    updateStats();
    
    // Bắt đầu quá trình trong setTimeout để không block message handling
    console.log('⏳ Bắt đầu quá trình trong 100ms...');
    setTimeout(() => {
        console.log('🚀 Gọi mainCombinedProcess...');
        mainCombinedProcess();
    }, 100);
    
    console.log('✅ ===== KHỞI TẠO AD TOOL PRO HOÀN TẤT =====');
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

// Thông báo khi script được load
console.log('🚀 AdTool Pro Injected Script đã sẵn sàng!');
console.log('📋 Hướng dẫn sử dụng:');
console.log('1. Đảm bảo bạn đã đăng nhập Facebook Business Manager');
console.log('2. Mở extension popup và bấm "Bắt đầu"');
console.log('3. Script sẽ tự động lấy danh sách tài khoản Read-Only');
console.log('4. Quá trình tách và kích hoạt sẽ diễn ra tự động');
console.log('⚠️ Lưu ý: Nếu không tìm thấy tài khoản, hãy kiểm tra:');
console.log('   - Đã đăng nhập đúng tài khoản Business Manager');
console.log('   - Có quyền truy cập vào tài khoản quảng cáo');
console.log('   - Trang đã load hoàn toàn');

// Gửi thông báo sẵn sàng
document.dispatchEvent(new CustomEvent('adtoolProReady', {
    detail: { 
        success: true, 
        message: 'AdTool Pro Injected Script đã sẵn sàng',
        timestamp: new Date().toISOString()
    }
})); 