console.log("Copyright HASoftware - Ads solution - Auto Version");

// Thống kê chi tiết
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  processing: 0,
  current: 0
};

// Tạo giao diện hiển thị tiến trình
function createProgressUI() {
  const progressContainer = document.createElement('div');
  progressContainer.id = 'ha-progress-container';
  progressContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    padding: 24px;
    min-width: 400px;
    max-width: 600px;
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  progressContainer.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <div style="width: 40px; height: 40px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
        <span style="color: white; font-size: 18px;">⚡</span>
      </div>
      <div>
        <h3 style="margin: 0; color: #333; font-size: 18px;">HASoftware - Kích Hoạt Tài Khoản</h3>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Đang xử lý tài khoản quảng cáo...</p>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 14px; color: #666;">Tiến độ</span>
        <span id="progress-text" style="font-size: 14px; color: #333; font-weight: bold;">0/0</span>
      </div>
      <div style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
        <div id="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #2196F3, #4CAF50); transition: width 0.3s ease;"></div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
      <div style="text-align: center; padding: 12px; background: #e8f5e8; border-radius: 8px;">
        <div id="success-count" style="font-size: 24px; font-weight: bold; color: #4CAF50;">0</div>
        <div style="font-size: 12px; color: #666;">Thành công</div>
      </div>
      <div style="text-align: center; padding: 12px; background: #ffeaea; border-radius: 8px;">
        <div id="failed-count" style="font-size: 24px; font-weight: bold; color: #f44336;">0</div>
        <div style="font-size: 12px; color: #666;">Thất bại</div>
      </div>
      <div style="text-align: center; padding: 12px; background: #fff3e0; border-radius: 8px;">
        <div id="skipped-count" style="font-size: 24px; font-weight: bold; color: #ff9800;">0</div>
        <div style="font-size: 12px; color: #666;">Bỏ qua</div>
      </div>
    </div>
    
    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px;">
      <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Tài khoản đang xử lý:</div>
      <div id="current-account" style="font-size: 13px; color: #666; font-style: italic;">Đang tải...</div>
    </div>
    
    <div style="margin-top: 16px; text-align: center;">
      <button id="close-progress" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Đóng</button>
    </div>
  `;
  
  document.body.appendChild(progressContainer);
  
  // Xử lý nút đóng
  document.getElementById('close-progress').addEventListener('click', () => {
    progressContainer.remove();
  });
  
  return progressContainer;
}

// Cập nhật giao diện tiến trình
function updateProgressUI() {
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const successCount = document.getElementById('success-count');
  const failedCount = document.getElementById('failed-count');
  const skippedCount = document.getElementById('skipped-count');
  
  if (progressText && progressBar && successCount && failedCount && skippedCount) {
    const progress = stats.total > 0 ? (stats.current / stats.total) * 100 : 0;
    
    progressText.textContent = `${stats.current}/${stats.total}`;
    progressBar.style.width = `${progress}%`;
    successCount.textContent = stats.success;
    failedCount.textContent = stats.failed;
    skippedCount.textContent = stats.skipped;
  }
}

// Cập nhật tài khoản hiện tại
function updateCurrentAccount(accountInfo) {
  const currentAccount = document.getElementById('current-account');
  if (currentAccount) {
    currentAccount.textContent = accountInfo;
  }
}

// Notification system
function showNotification(title, message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Màu sắc theo loại thông báo
  switch(type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      break;
    case 'warning':
      notification.style.backgroundColor = '#ff9800';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }
  
  notification.innerHTML = `
    <div style="font-size: 16px; margin-bottom: 5px;">${title}</div>
    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Tự động ẩn sau 5 giây
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Thêm CSS cho animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

let access_token;
let fb_dtsg2 = require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value;
let uid = require("CurrentUserInitialData").USER_ID || document.cookie.match(/c_user=(\d+)/)[1];

try {
  access_token = require("WebApiApplication").getAccessToken();
} catch (error) { }

if (access_token === undefined || access_token === '') {
  showNotification('Lỗi', 'Vui lòng truy cập https://adsmanager.facebook.com và thử lại', 'error');
  window.location.href = "https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=";
}

const ver = "v14.0";
const delay = 0;

// Hàm chính để khởi chạy
function startProcess() {
  showNotification('Bắt đầu', 'Đang khởi tạo quá trình kích hoạt tài khoản...', 'info');
  
  setTimeout(() => {
    getBusinesses();
  }, 7000); // Delay 7 giây
}

async function getBusinesses() {
  console.log(`Đang lấy danh sách tài khoản quảng cáo...`);
  showNotification('Đang tải', 'Đang lấy danh sách tài khoản quảng cáo...', 'info');
  
  const json = await getBusinesses2();
  const arr = {};
  arr.data = json;
  
  // Tạo giao diện tiến trình
  createProgressUI();
  
  action1(0, arr);
}

async function getBusinesses2() {
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

async function action1(index, arr) {
  const total = arr.data.adaccounts.data.length;
  stats.total = total;
  stats.current = index;
  
  if (index >= total) {
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);
    const message = `Hoàn thành!\nThành công: ${stats.success}/${stats.total} (${successRate}%)\nThất bại: ${stats.failed}\nBỏ qua: ${stats.skipped}`;
    
    console.log(`Done!!!\n${message}\nHASoftware - Ads solution`);
    showNotification('Hoàn thành', `Kích hoạt thành công ${stats.success}/${stats.total} tài khoản`, 'success');
    
    // Ẩn giao diện tiến trình
    const progressContainer = document.getElementById('ha-progress-container');
    if (progressContainer) {
      progressContainer.remove();
    }
    
    // Hiển thị thống kê chi tiết
    setTimeout(() => {
      alert(`📊 THỐNG KÊ CHI TIẾT\n\n✅ Thành công: ${stats.success}\n❌ Thất bại: ${stats.failed}\n⏭️ Bỏ qua: ${stats.skipped}\n📈 Tỷ lệ thành công: ${successRate}%\n\nHASoftware - Ads solution`);
      window.open("https://www.facebook.com/ads/manager/accounts/?act=", "_blank");
    }, 1000);
    
    return;
  }
  
  try {
    const data = arr.data.adaccounts.data[index];
    const businessID = data.id.replace("act_", "");
    
    // Cập nhật tài khoản hiện tại
    updateCurrentAccount(`Đang xử lý: act_${businessID} (${data.name || 'Không có tên'})`);
    
    if (data.account_status === 100 || data.account_status === 101) {
      stats.processing++;
      const awaitAction2 = await action2(businessID, index, total, data.name);
      const awaitDelay = await new Promise((r) => setTimeout(r, delay * 1000));
    } else {
      stats.skipped++;
      updateCurrentAccount(`Bỏ qua: act_${businessID} (trạng thái: ${data.account_status})`);
      console.log(`${index + 1}/${total} act_${businessID} | -> Bỏ qua (trạng thái: ${data.account_status})`);
    }
    
  } catch (e) {
    stats.failed++;
    console.log(`Lỗi xử lý tài khoản ${index + 1}:`, e);
  } finally {
    ++index;
    stats.current = index;
    updateProgressUI();
    action1(index, arr);
  }
}

async function action2(businessID, index, total, accountName) {
  const url = `https://adsmanager.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=78266`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: `av=${uid}&__usid=6-Tskqef5m5416h%3APskqefx164ljb2%3A1-Askqea7pchdsm-RV%3D6%3AF%3D&__aaid=${businessID}&__user=${uid}&__a=1&__req=88&__hs=19998.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1016987598&__s=z2tt9o%3Alkfjeh%3A8vmk3x&__hsi=7421175297378821716&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF9UhK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8tKU-4U-UG7F8a898vhojCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wFjQfyoaoym9yA4Ekx24oK4Ehzawwy9pEHyU8Uiwg8KawrVV-i782bByUeoQwox3UO364GJe2q3KfzFLxny9onxDwBwXx67HxtBxO64uWg-26q2au5onADzEHDUyEkjByo4a9AwHxq5kiUarx5e8wAAAVQEhyeucyEy3aQ48B5wPDBw&__csr=&__comet_req=25&fb_dtsg=${fb_dtsg2}&jazoest=25353&lsd=_dtDtv84z9OIgGn5IXOdW2&__spin_r=1016987598&__spin_b=trunk&__spin_t=1727877021&__jssesw=1&qpl_active_flow_ids=270206671%2C270211726%2C270213183&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingReactivateAdAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22${businessID}%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A22%2C%22logging_id%22%3A%22559255213%22%7D%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22power_editor%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22BillingReactivateAdAccountMutation%22%2C%22user_session_id%22%3A%22upl_1727876994352_7d1de259-07b1-4107-8ddf-e616f492eac6%22%2C%22wizard_config_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_screen_name%22%3A%22reactivate_ad_account_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1727876994352_902bd8bd-c035-4924-9f33-94b00c9a5b20%22%2C%22wizard_state_name%22%3A%22reactivate_ad_account_state_display%22%7D%2C%22actor_id%22%3A%22${uid}%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=9984888131552276&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270206671%2C270211726%2C270213183%22%5D`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => response.text())
    .then(responseText => {
      if (responseText.includes('status":"ADMARKET_ACCOUNT_STATUS_ACTIVE')) {
        stats.success++;
        stats.processing--;
        updateCurrentAccount(`✅ Thành công: act_${businessID} (${accountName || 'Không có tên'})`);
        console.log(`${index + 1}/${total} act_${businessID} | -> ✅ Thành công`);
      } else {
        stats.failed++;
        stats.processing--;
        updateCurrentAccount(`❌ Thất bại: act_${businessID} (${accountName || 'Không có tên'})`);
        console.log(`${index + 1}/${total} act_${businessID} | -> ❌ Thất bại: ${responseText}`);
      }
    })
    .catch(error => {
      stats.failed++;
      stats.processing--;
      updateCurrentAccount(`❌ Lỗi: act_${businessID} (${accountName || 'Không có tên'})`);
      console.log(`${index + 1}/${total} act_${businessID} | -> ❌ Lỗi: ${error}`);
    });
    
  } catch (error) {
    stats.failed++;
    stats.processing--;
    updateCurrentAccount(`❌ Lỗi: act_${businessID} (${accountName || 'Không có tên'})`);
    console.log(`${index + 1}/${total} act_${businessID} | -> ❌ Lỗi ${error}`);
  }
}

// Khởi chạy script
startProcess(); 