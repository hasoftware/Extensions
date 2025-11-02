// Mapping tên mạng xã hội
const socialMediaMap = {
  'Facebook': { used: 'fbUsed', max: 'fbMax', progress: 'fbProgress', input: 'fbMaxTime' },
  'Instagram': { used: 'igUsed', max: 'igMax', progress: 'igProgress', input: 'igMaxTime' },
  'Twitter': { used: 'twUsed', max: 'twMax', progress: 'twProgress', input: 'twMaxTime' },
  'TikTok': { used: 'tkUsed', max: 'tkMax', progress: 'tkProgress', input: 'tkMaxTime' }
};

// Đảm bảo popup có kích thước đúng
function ensurePopupSize() {
  try {
    // Đặt kích thước cho body và html với !important (675px = 75% của 900px)
    document.body.style.setProperty('width', '675px', 'important');
    document.body.style.setProperty('min-width', '675px', 'important');
    document.body.style.setProperty('max-width', '675px', 'important');
    
    document.documentElement.style.setProperty('width', '675px', 'important');
    document.documentElement.style.setProperty('min-width', '675px', 'important');
    document.documentElement.style.setProperty('max-width', '675px', 'important');
    
    // Đặt kích thước cho container
    const container = document.querySelector('.container');
    if (container) {
      container.style.setProperty('width', '675px', 'important');
      container.style.setProperty('min-width', '675px', 'important');
      container.style.setProperty('max-width', '675px', 'important');
    }
    
    // Đặt kích thước cho main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.setProperty('min-width', '675px', 'important');
      mainContent.style.setProperty('max-width', '675px', 'important');
      mainContent.style.setProperty('width', '675px', 'important');
      mainContent.style.setProperty('display', 'flex', 'important');
      mainContent.style.setProperty('flex-direction', 'row', 'important');
    }
    
    // Đảm bảo left-column và right-column hiển thị đúng (337px và 338px = 675px)
    const leftColumn = document.querySelector('.left-column');
    if (leftColumn) {
      leftColumn.style.setProperty('display', 'flex', 'important');
      leftColumn.style.setProperty('flex-direction', 'column', 'important');
      leftColumn.style.setProperty('width', '337px', 'important');
      leftColumn.style.setProperty('min-width', '337px', 'important');
    }
    
    const rightColumn = document.querySelector('.right-column');
    if (rightColumn) {
      rightColumn.style.setProperty('display', 'flex', 'important');
      rightColumn.style.setProperty('flex-direction', 'column', 'important');
      rightColumn.style.setProperty('width', '338px', 'important');
      rightColumn.style.setProperty('min-width', '338px', 'important');
    }
  } catch (e) {
    console.log('Cannot set popup size:', e);
  }
}

// Gọi lại sau khi DOM load xong
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensurePopupSize);
} else {
  ensurePopupSize();
}

// Load state từ background
async function loadState() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getState' });
    
    if (response) {
      updatePomodoroTimer(response);
      updateSocialMediaStats(response);
      updateSettings(response.settings);
      updateCurrentStatus(response);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Cập nhật Pomodoro Timer
function updatePomodoroTimer(state) {
  const timeDisplay = document.getElementById('pomodoroTime');
  const statusDisplay = document.getElementById('pomodoroStatus');
  
  if (!state.pomodoroStartTime || !state.pomodoroEndTime) {
    timeDisplay.textContent = '--:--';
    statusDisplay.textContent = 'Chưa bắt đầu';
    return;
  }
  
  const now = Date.now();
  const remaining = state.pomodoroEndTime - now;
  
  if (remaining <= 0) {
    timeDisplay.textContent = '00:00';
    statusDisplay.textContent = 'Đã hết thời gian';
    return;
  }
  
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  if (state.pomodoroState === 'work') {
    statusDisplay.textContent = 'Đang làm việc';
    statusDisplay.className = 'status-text status-work';
  } else if (state.pomodoroState === 'break') {
    statusDisplay.textContent = 'Thời gian nghỉ';
    statusDisplay.className = 'status-text status-break';
  }
}

// Cập nhật thống kê mạng xã hội
function updateSocialMediaStats(state) {
  const dailyUsage = state.dailyUsage || {};
  const settings = state.settings || {};
  const maxDailyTime = settings.maxDailyTime || {};
  
  Object.keys(socialMediaMap).forEach(socialMedia => {
    const used = dailyUsage[socialMedia] || 0;
    const max = maxDailyTime[socialMedia] || 60;
    const config = socialMediaMap[socialMedia];
    
    // Cập nhật số liệu
    document.getElementById(config.used).textContent = used;
    document.getElementById(config.max).textContent = max;
    
    // Cập nhật progress bar
    const percentage = Math.min((used / max) * 100, 100);
    const progressBar = document.getElementById(config.progress);
    progressBar.style.width = `${percentage}%`;
    
    // Đổi màu theo mức độ sử dụng
    if (percentage >= 100) {
      progressBar.className = 'progress-fill progress-danger';
    } else if (percentage >= 80) {
      progressBar.className = 'progress-fill progress-warning';
    } else {
      progressBar.className = 'progress-fill progress-safe';
    }
    
    // Cập nhật input - chỉ khi input không đang được focus hoặc vừa blur
    if (shouldUpdateInput(config.input)) {
      document.getElementById(config.input).value = max;
    }
  });
}

// Theo dõi input nào đang được focus hoặc vừa blur
let focusedInputs = new Set();
let blurredInputs = new Map(); // Lưu thời gian blur để không reset ngay

// Đánh dấu input đang được focus - khởi tạo sau khi DOM ready
function initInputFocusTracking() {
  const inputs = ['workTime', 'breakTime', 'breakDuration', 'warningThreshold', 
                  'fbMaxTime', 'igMaxTime', 'twMaxTime', 'tkMaxTime'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('focus', () => {
        focusedInputs.add(id);
        blurredInputs.delete(id); // Xóa khỏi danh sách blurred khi focus lại
      });
      
      input.addEventListener('blur', () => {
        focusedInputs.delete(id);
        // Đánh dấu thời gian blur - giữ giá trị ít nhất 2 giây sau khi blur
        blurredInputs.set(id, Date.now());
        // Sau 2 giây, xóa khỏi danh sách blurred để có thể reset
        setTimeout(() => {
          blurredInputs.delete(id);
        }, 2000);
      });
    }
  });
}

// Khởi tạo tracking khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInputFocusTracking);
} else {
  initInputFocusTracking();
}

// Kiểm tra xem input có nên được cập nhật không
function shouldUpdateInput(inputId) {
  // Không cập nhật nếu đang focus hoặc vừa blur (< 2 giây)
  if (focusedInputs.has(inputId)) {
    return false;
  }
  if (blurredInputs.has(inputId)) {
    const blurTime = blurredInputs.get(inputId);
    if (Date.now() - blurTime < 2000) {
      return false;
    }
  }
  return true;
}

// Cập nhật cài đặt - chỉ cập nhật khi input không đang được focus hoặc vừa blur
function updateSettings(settings) {
  if (!settings) return;
  
  if (settings.pomodoroWorkTime && shouldUpdateInput('workTime')) {
    document.getElementById('workTime').value = settings.pomodoroWorkTime;
  }
  if (settings.pomodoroBreakTime && shouldUpdateInput('breakTime')) {
    document.getElementById('breakTime').value = settings.pomodoroBreakTime;
  }
  if (settings.breakDuration && shouldUpdateInput('breakDuration')) {
    document.getElementById('breakDuration').value = settings.breakDuration;
  }
  if (settings.warningThreshold && shouldUpdateInput('warningThreshold')) {
    document.getElementById('warningThreshold').value = settings.warningThreshold;
  }
}

// Cập nhật trạng thái hiện tại
function updateCurrentStatus(state) {
  const activeSocialMediaEl = document.getElementById('activeSocialMedia');
  const blockedInfoEl = document.getElementById('blockedInfo');
  
  if (state.activeSocialMedia) {
    activeSocialMediaEl.textContent = `Đang sử dụng: ${state.activeSocialMedia}`;
    activeSocialMediaEl.className = 'active-social-media';
  } else {
    activeSocialMediaEl.textContent = 'Không có mạng xã hội đang hoạt động';
    activeSocialMediaEl.className = '';
  }
  
  // Kiểm tra mạng xã hội bị chặn
  const blockedUntil = state.blockedUntil || {};
  const blockedSites = [];
  
  Object.keys(blockedUntil).forEach(site => {
    const blockedUntilTime = new Date(blockedUntil[site]);
    if (new Date() < blockedUntilTime) {
      const remainingMinutes = Math.ceil((blockedUntilTime - new Date()) / 60000);
      blockedSites.push(`${site} (${remainingMinutes} phút)`);
    }
  });
  
  if (blockedSites.length > 0) {
    blockedInfoEl.textContent = `Bị chặn: ${blockedSites.join(', ')}`;
    blockedInfoEl.classList.remove('hidden');
  } else {
    blockedInfoEl.classList.add('hidden');
  }
}

// Lưu cài đặt Pomodoro
document.getElementById('savePomodoroSettings').addEventListener('click', () => {
  const workTime = parseInt(document.getElementById('workTime').value);
  const breakTime = parseInt(document.getElementById('breakTime').value);
  
  if (isNaN(workTime) || isNaN(breakTime) || workTime < 1 || breakTime < 1) {
    alert('Vui lòng nhập thời gian hợp lệ (>= 1 phút)');
    return;
  }
  
  // Xóa khỏi danh sách blurred để có thể cập nhật sau khi lưu
  blurredInputs.delete('workTime');
  blurredInputs.delete('breakTime');
  
  chrome.runtime.sendMessage({
    action: 'updateSettings',
    settings: {
      pomodoroWorkTime: workTime,
      pomodoroBreakTime: breakTime
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error saving Pomodoro settings:', chrome.runtime.lastError);
      alert('Có lỗi xảy ra khi lưu cài đặt');
      return;
    }
    
    if (response && response.success) {
      alert('Đã lưu cài đặt Pomodoro!');
      // Reload state để cập nhật UI sau khi đã lưu
      setTimeout(() => {
        loadState();
      }, 100);
    } else {
      alert('Có lỗi xảy ra khi lưu cài đặt');
    }
  });
});

// Reset Pomodoro
document.getElementById('resetPomodoro').addEventListener('click', async () => {
  if (confirm('Bạn có chắc muốn reset Pomodoro timer?')) {
    try {
      await chrome.runtime.sendMessage({ action: 'resetPomodoro' });
      alert('Đã reset Pomodoro timer!');
      loadState();
    } catch (error) {
      console.error('Error resetting Pomodoro:', error);
      alert('Có lỗi xảy ra khi reset Pomodoro');
    }
  }
});

// Lưu tất cả cài đặt
document.getElementById('saveAllSettings').addEventListener('click', () => {
  const workTime = parseInt(document.getElementById('workTime').value);
  const breakTime = parseInt(document.getElementById('breakTime').value);
  const breakDuration = parseInt(document.getElementById('breakDuration').value);
  const warningThreshold = parseInt(document.getElementById('warningThreshold').value);
  
  const maxDailyTime = {
    Facebook: parseInt(document.getElementById('fbMaxTime').value),
    Instagram: parseInt(document.getElementById('igMaxTime').value),
    Twitter: parseInt(document.getElementById('twMaxTime').value),
    TikTok: parseInt(document.getElementById('tkMaxTime').value)
  };
  
  // Validation
  if (isNaN(workTime) || isNaN(breakTime) || isNaN(breakDuration) || isNaN(warningThreshold) ||
      workTime < 1 || breakTime < 1 || breakDuration < 1 || warningThreshold < 1) {
    alert('Vui lòng nhập tất cả giá trị hợp lệ (>= 1)');
    return;
  }
  
  let hasInvalidTime = false;
  Object.values(maxDailyTime).forEach(time => {
    if (isNaN(time) || time < 1) {
      hasInvalidTime = true;
    }
  });
  
  if (hasInvalidTime) {
    alert('Thời gian tối đa mỗi mạng xã hội phải >= 1 phút');
    return;
  }
  
  // Xóa tất cả khỏi danh sách blurred để có thể cập nhật sau khi lưu
  blurredInputs.clear();
  
  chrome.runtime.sendMessage({
    action: 'updateSettings',
    settings: {
      pomodoroWorkTime: workTime,
      pomodoroBreakTime: breakTime,
      breakDuration: breakDuration,
      warningThreshold: warningThreshold,
      maxDailyTime: maxDailyTime
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
      alert('Có lỗi xảy ra khi lưu cài đặt');
      return;
    }
    
    if (response && response.success) {
      alert('Đã lưu tất cả cài đặt!');
      // Reload state để cập nhật UI sau khi đã lưu
      setTimeout(() => {
        loadState();
      }, 100);
    } else {
      alert('Có lỗi xảy ra khi lưu cài đặt');
    }
  });
});

// Reset thời gian sử dụng hôm nay
document.getElementById('resetDailyUsage').addEventListener('click', async () => {
  if (confirm('Bạn có chắc muốn reset thời gian sử dụng hôm nay?')) {
    try {
      await chrome.runtime.sendMessage({ action: 'resetDailyUsage' });
      alert('Đã reset thời gian sử dụng hôm nay!');
      loadState();
    } catch (error) {
      console.error('Error resetting daily usage:', error);
      alert('Có lỗi xảy ra khi reset thời gian sử dụng');
    }
  }
});

// Cập nhật Pomodoro timer mỗi giây
setInterval(() => {
  loadState();
}, 1000);

// Load state khi mở popup
loadState();

