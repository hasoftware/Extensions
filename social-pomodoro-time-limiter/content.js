// Content script chạy trên các trang mạng xã hội
// Theo dõi thời gian người dùng sử dụng trang

(function() {
  'use strict';
  
  // Kiểm tra xem extension context có còn hợp lệ không
  function isExtensionContextValid() {
    try {
      return chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  // Kiểm tra xem trang có đang bị chặn không
  function checkIfBlocked() {
    // Kiểm tra extension context trước khi gửi message
    if (!isExtensionContextValid()) {
      // Extension đã bị reload/uninstall, dừng kiểm tra
      return;
    }

    try {
      chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
        // Kiểm tra lỗi runtime
        if (chrome.runtime.lastError) {
          // Extension context đã bị invalidated, bỏ qua lỗi
          return;
        }

        if (!response) return;
        
        const currentSite = getCurrentSite();
        if (!currentSite) return;
        
        // Kiểm tra xem có bị chặn do Pomodoro break không
        const blockedUntil = response.blockedUntil || {};
        if (blockedUntil[currentSite]) {
          const blockedUntilTime = new Date(blockedUntil[currentSite]);
          if (new Date() < blockedUntilTime) {
            // Đã bị chặn, redirect sẽ được xử lý bởi background script
            showBlockMessage(currentSite, blockedUntilTime);
            return;
          }
        }
        
        // Kiểm tra xem có hết thời gian sử dụng không
        const dailyUsage = response.dailyUsage || {};
        const maxDailyTime = response.settings?.maxDailyTime || {};
        const usedTime = dailyUsage[currentSite] || 0;
        const maxTime = maxDailyTime[currentSite] || 60;
        
        if (usedTime >= maxTime) {
          showLimitReachedMessage(currentSite);
        } else if (usedTime >= maxTime - (response.settings?.warningThreshold || 5)) {
          showWarningMessage(currentSite, maxTime - usedTime);
        }
      });
    } catch (e) {
      // Bắt lỗi nếu extension context bị invalidated
      console.log('Extension context invalidated, stopping checks');
    }
  }
  
  // Lấy tên mạng xã hội hiện tại
  function getCurrentSite() {
    const hostname = window.location.hostname.toLowerCase().replace('www.', '');
    
    const siteMap = {
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'tiktok.com': 'TikTok'
    };
    
    for (const [domain, name] of Object.entries(siteMap)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return name;
      }
    }
    
    return null;
  }
  
  // Hiển thị cảnh báo
  function showWarningMessage(site, remainingMinutes) {
    // Kiểm tra xem đã có banner cảnh báo chưa
    if (document.getElementById('pomodoro-warning-banner')) {
      return;
    }
    
    const banner = document.createElement('div');
    banner.id = 'pomodoro-warning-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideDown 0.3s ease-out;
    `;
    
    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <span>Bạn đã sử dụng ${site} quá lâu! Còn lại ${remainingMinutes} phút. Hãy nghỉ ngơi!</span>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Thêm animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Tự động ẩn sau 10 giây
    setTimeout(() => {
      if (banner.parentNode) {
        banner.style.transition = 'opacity 0.3s ease-out';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
      }
    }, 10000);
  }
  
  // Hiển thị thông báo hết thời gian
  function showLimitReachedMessage(site) {
    // Banner sẽ được hiển thị khi trang bị chặn
    // Nội dung này chủ yếu để thông báo người dùng
  }
  
  // Hiển thị thông báo bị chặn
  function showBlockMessage(site, blockedUntil) {
    const remainingMinutes = Math.ceil((blockedUntil - new Date()) / 60000);
    
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.id = 'pomodoro-block-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;
    
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
      background: white;
      border-radius: 15px;
      padding: 40px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      animation: fadeIn 0.3s ease-out;
    `;
    
    messageBox.innerHTML = `
      <h2 style="color: #333; margin-bottom: 15px; font-size: 28px;">Hết thời gian sử dụng ${site}!</h2>
      <p style="color: #666; font-size: 18px; margin-bottom: 25px;">
        Bạn đã hết thời gian sử dụng mạng xã hội này.
      </p>
      <p style="color: #888; font-size: 16px; margin-bottom: 30px;">
        Vui lòng nghỉ ngơi trong <strong style="color: #ff6b6b; font-size: 20px;">${remainingMinutes}</strong> phút.
      </p>
      <p style="color: #999; font-size: 14px;">
        Đây là thời gian nghỉ Pomodoro của bạn!
      </p>
    `;
    
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    // Thêm animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Kiểm tra định kỳ (chỉ khi extension context hợp lệ)
  let checkInterval = setInterval(() => {
    if (isExtensionContextValid()) {
      checkIfBlocked();
    } else {
      // Dừng interval nếu extension context không còn hợp lệ
      clearInterval(checkInterval);
    }
  }, 5000); // Kiểm tra mỗi 5 giây
  
  // Kiểm tra ngay khi load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isExtensionContextValid()) {
        checkIfBlocked();
      }
    });
  } else {
    if (isExtensionContextValid()) {
      checkIfBlocked();
    }
  }
})();

