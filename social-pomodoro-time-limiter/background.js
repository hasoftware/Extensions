// Danh sách các mạng xã hội cần theo dõi
const socialMediaSites = {
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'twitter.com': 'Twitter',
  'x.com': 'Twitter',
  'tiktok.com': 'TikTok'
};

// Cài đặt mặc định
const defaultSettings = {
  pomodoroWorkTime: 25, // phút
  pomodoroBreakTime: 5, // phút
  maxDailyTime: {
    Facebook: 60, // phút/ngày
    Instagram: 60,
    Twitter: 60,
    TikTok: 60
  },
  breakDuration: 30, // phút nghỉ sau khi hết thời gian
  warningThreshold: 5 // cảnh báo trước 5 phút
};

// Trạng thái hiện tại
let state = {
  pomodoroState: 'idle', // idle, work, break
  pomodoroStartTime: null,
  pomodoroEndTime: null,
  activeSocialMedia: null,
  activeTabId: null,
  dailyUsage: {},
  blockedUntil: {},
  settings: {}
};

// Khởi tạo
chrome.runtime.onInstalled.addListener(async () => {
  // Load cài đặt
  const result = await chrome.storage.local.get(['settings', 'dailyUsage', 'blockedUntil']);
  
  if (!result.settings) {
    state.settings = defaultSettings;
    await chrome.storage.local.set({ settings: defaultSettings });
  } else {
    state.settings = { ...defaultSettings, ...result.settings };
  }
  
  state.dailyUsage = result.dailyUsage || {};
  state.blockedUntil = result.blockedUntil || {};
  
  // Reset daily usage nếu đã qua ngày mới
  await resetDailyUsageIfNeeded();
  
  // Bắt đầu Pomodoro
  startPomodoroWork();
});

// Reset daily usage khi qua ngày mới
async function resetDailyUsageIfNeeded() {
  const today = new Date().toDateString();
  const result = await chrome.storage.local.get('lastResetDate');
  const lastReset = result.lastResetDate;
  
  if (lastReset !== today) {
    state.dailyUsage = {};
    state.blockedUntil = {};
    await chrome.storage.local.set({ 
      dailyUsage: {}, 
      blockedUntil: {},
      lastResetDate: today 
    });
  }
}

// Kiểm tra xem URL có phải mạng xã hội không
function isSocialMedia(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
    
    for (const [domain, name] of Object.entries(socialMediaSites)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return name;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Theo dõi tab khi thay đổi
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await handleTabChange(tabId);
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    await handleTabChange(details.tabId);
  }
});

// Xử lý khi tab thay đổi
async function handleTabChange(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!tab || !tab.url) return;
  
  const socialMedia = isSocialMedia(tab.url);
  
  if (socialMedia) {
    // Kiểm tra xem có bị chặn không
    if (isBlocked(socialMedia)) {
      blockTab(tabId, socialMedia);
      return;
    }
    
    // Bắt đầu theo dõi thời gian
    if (state.activeSocialMedia !== socialMedia || state.activeTabId !== tabId) {
      state.activeSocialMedia = socialMedia;
      state.activeTabId = tabId;
      startTracking(socialMedia);
    }
  } else {
    // Dừng theo dõi nếu rời khỏi mạng xã hội
    if (state.activeSocialMedia) {
      stopTracking();
    }
  }
}

// Kiểm tra xem mạng xã hội có bị chặn không
function isBlocked(socialMedia) {
  if (!state.blockedUntil[socialMedia]) return false;
  
  const blockedUntil = new Date(state.blockedUntil[socialMedia]);
  return new Date() < blockedUntil;
}

// Chặn tab
async function blockTab(tabId, socialMedia) {
  const blockedUntil = state.blockedUntil[socialMedia];
  const remainingMinutes = Math.ceil((new Date(blockedUntil) - new Date()) / 60000);
  
  const blockUrl = chrome.runtime.getURL('blocked.html') + 
    `?site=${encodeURIComponent(socialMedia)}&time=${remainingMinutes}`;
  
  try {
    await chrome.tabs.update(tabId, { url: blockUrl });
  } catch (e) {
    console.error('Error blocking tab:', e);
  }
}

// Bắt đầu theo dõi thời gian sử dụng
function startTracking(socialMedia) {
  // Nếu đã có thời gian sử dụng hôm nay, tiếp tục đếm
  if (!state.dailyUsage[socialMedia]) {
    state.dailyUsage[socialMedia] = 0;
  }
  
  // Cập nhật mỗi phút
  if (state.trackingInterval) {
    clearInterval(state.trackingInterval);
  }
  
  state.trackingStartTime = Date.now();
  
  state.trackingInterval = setInterval(() => {
    updateUsageTime(socialMedia);
  }, 60000); // Cập nhật mỗi phút
  
  // Cập nhật ngay lập tức
  updateUsageTime(socialMedia);
}

// Dừng theo dõi
function stopTracking() {
  if (state.activeSocialMedia) {
    updateUsageTime(state.activeSocialMedia, true);
  }
  
  if (state.trackingInterval) {
    clearInterval(state.trackingInterval);
    state.trackingInterval = null;
  }
  
  state.activeSocialMedia = null;
  state.activeTabId = null;
}

// Cập nhật thời gian sử dụng
async function updateUsageTime(socialMedia, isStopping = false) {
  if (!state.trackingStartTime) return;
  
  const elapsedMinutes = isStopping 
    ? Math.floor((Date.now() - state.trackingStartTime) / 60000)
    : 1;
  
  state.dailyUsage[socialMedia] = (state.dailyUsage[socialMedia] || 0) + elapsedMinutes;
  
  // Lưu vào storage
  await chrome.storage.local.set({ dailyUsage: state.dailyUsage });
  
  const maxTime = state.settings.maxDailyTime[socialMedia] || 60;
  const usedTime = state.dailyUsage[socialMedia];
  const remainingTime = maxTime - usedTime;
  
  // Kiểm tra cảnh báo
  if (remainingTime <= state.settings.warningThreshold && remainingTime > 0) {
    showWarning(socialMedia, remainingTime);
  }
  
  // Kiểm tra hết thời gian
  if (remainingTime <= 0) {
    handleTimeLimitReached(socialMedia);
  }
  
  if (!isStopping) {
    state.trackingStartTime = Date.now();
  }
}

// Hiển thị cảnh báo
function showWarning(socialMedia, remainingMinutes) {
  chrome.notifications.create({
    type: 'basic',
    title: 'Cảnh báo thời gian',
    message: `Bạn đã sử dụng ${socialMedia} quá lâu! Còn lại ${remainingMinutes} phút. Hãy nghỉ ngơi!`
  });
}

// Xử lý khi hết thời gian
async function handleTimeLimitReached(socialMedia) {
  stopTracking();
  
  // Chặn trong thời gian nghỉ
  const breakDuration = state.settings.breakDuration || 30;
  const blockedUntil = new Date();
  blockedUntil.setMinutes(blockedUntil.getMinutes() + breakDuration);
  
  state.blockedUntil[socialMedia] = blockedUntil.toISOString();
  await chrome.storage.local.set({ blockedUntil: state.blockedUntil });
  
  // Chặn tab hiện tại nếu đang ở mạng xã hội đó
  if (state.activeTabId && state.activeSocialMedia === socialMedia) {
    blockTab(state.activeTabId, socialMedia);
  }
  
  // Thông báo
  chrome.notifications.create({
    type: 'basic',
    title: 'Hết thời gian sử dụng',
    message: `Bạn đã hết thời gian sử dụng ${socialMedia}. Nghỉ ngơi ${breakDuration} phút nhé!`
  });
}

// Pomodoro Timer
function startPomodoroWork() {
  state.pomodoroState = 'work';
  const workTime = (state.settings.pomodoroWorkTime || 25) * 60 * 1000;
  state.pomodoroStartTime = Date.now();
  state.pomodoroEndTime = state.pomodoroStartTime + workTime;
  
  // Lưu trạng thái
  chrome.storage.local.set({ 
    pomodoroState: state.pomodoroState,
    pomodoroStartTime: state.pomodoroStartTime,
    pomodoroEndTime: state.pomodoroEndTime
  });
  
  // Đặt timer để chuyển sang break
  clearTimeout(state.pomodoroTimer);
  state.pomodoroTimer = setTimeout(() => {
    startPomodoroBreak();
  }, workTime);
}

function startPomodoroBreak() {
  state.pomodoroState = 'break';
  const breakTime = (state.settings.pomodoroBreakTime || 5) * 60 * 1000;
  state.pomodoroStartTime = Date.now();
  state.pomodoroEndTime = state.pomodoroStartTime + breakTime;
  
  // Chặn tất cả mạng xã hội trong thời gian break
  const blockedUntil = new Date();
  blockedUntil.setTime(state.pomodoroEndTime);
  
  for (const [domain, name] of Object.entries(socialMediaSites)) {
    state.blockedUntil[name] = blockedUntil.toISOString();
  }
  
  chrome.storage.local.set({ 
    pomodoroState: state.pomodoroState,
    pomodoroStartTime: state.pomodoroStartTime,
    pomodoroEndTime: state.pomodoroEndTime,
    blockedUntil: state.blockedUntil
  });
  
  // Chặn các tab mạng xã hội đang mở
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const socialMedia = isSocialMedia(tab.url);
      if (socialMedia) {
        blockTab(tab.id, socialMedia);
      }
    });
  });
  
  // Thông báo
  chrome.notifications.create({
    type: 'basic',
    title: 'Thời gian nghỉ Pomodoro',
    message: `Đã đến lúc nghỉ ngơi! Mạng xã hội sẽ bị chặn trong ${state.settings.pomodoroBreakTime || 5} phút.`
  });
  
  // Đặt timer để quay lại work
  clearTimeout(state.pomodoroTimer);
  state.pomodoroTimer = setTimeout(() => {
    startPomodoroWork();
  }, breakTime);
}

// Lắng nghe thông điệp từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getState') {
    sendResponse({
      pomodoroState: state.pomodoroState,
      pomodoroStartTime: state.pomodoroStartTime,
      pomodoroEndTime: state.pomodoroEndTime,
      dailyUsage: state.dailyUsage,
      blockedUntil: state.blockedUntil,
      activeSocialMedia: state.activeSocialMedia,
      settings: state.settings
    });
  } else if (request.action === 'updateSettings') {
    // Merge với defaultSettings trước để đảm bảo có đầy đủ thuộc tính
    state.settings = { ...defaultSettings, ...state.settings, ...request.settings };
    
    // Nếu có maxDailyTime trong request, merge nó đúng cách
    if (request.settings.maxDailyTime) {
      state.settings.maxDailyTime = { ...defaultSettings.maxDailyTime, ...state.settings.maxDailyTime, ...request.settings.maxDailyTime };
    }
    
    // Lưu vào storage
    chrome.storage.local.set({ settings: state.settings });
    
    // Nếu đang trong Pomodoro, restart với thời gian mới
    if (state.pomodoroState === 'work' || state.pomodoroState === 'break') {
      if (request.settings.pomodoroWorkTime || request.settings.pomodoroBreakTime) {
        clearTimeout(state.pomodoroTimer);
        if (state.pomodoroState === 'work') {
          startPomodoroWork();
        } else {
          startPomodoroBreak();
        }
      }
    }
    
    sendResponse({ success: true, settings: state.settings });
  } else if (request.action === 'resetDailyUsage') {
    state.dailyUsage = {};
    chrome.storage.local.set({ dailyUsage: {} });
    sendResponse({ success: true });
  } else if (request.action === 'resetPomodoro') {
    clearTimeout(state.pomodoroTimer);
    startPomodoroWork();
    sendResponse({ success: true });
  }
  
  return true; // Giữ kết nối để sendResponse hoạt động bất đồng bộ
});

// Load state khi khởi động
chrome.runtime.onStartup.addListener(async () => {
  await loadState();
});

async function loadState() {
  const result = await chrome.storage.local.get([
    'settings', 
    'dailyUsage', 
    'blockedUntil',
    'pomodoroState',
    'pomodoroStartTime',
    'pomodoroEndTime'
  ]);
  
  if (result.settings) {
    state.settings = { ...defaultSettings, ...result.settings };
  } else {
    state.settings = defaultSettings;
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  
  state.dailyUsage = result.dailyUsage || {};
  state.blockedUntil = result.blockedUntil || {};
  state.pomodoroState = result.pomodoroState || 'idle';
  state.pomodoroStartTime = result.pomodoroStartTime || null;
  state.pomodoroEndTime = result.pomodoroEndTime || null;
  
  await resetDailyUsageIfNeeded();
  
  // Nếu đang trong Pomodoro, tiếp tục timer
  if (state.pomodoroState !== 'idle' && state.pomodoroEndTime) {
    const remaining = state.pomodoroEndTime - Date.now();
    if (remaining > 0) {
      clearTimeout(state.pomodoroTimer);
      state.pomodoroTimer = setTimeout(() => {
        if (state.pomodoroState === 'work') {
          startPomodoroBreak();
        } else {
          startPomodoroWork();
        }
      }, remaining);
    } else {
      // Đã hết thời gian, chuyển trạng thái
      if (state.pomodoroState === 'work') {
        startPomodoroBreak();
      } else {
        startPomodoroWork();
      }
    }
  } else if (state.pomodoroState === 'idle') {
    startPomodoroWork();
  }
}

// Khởi tạo khi extension khởi động
loadState();

