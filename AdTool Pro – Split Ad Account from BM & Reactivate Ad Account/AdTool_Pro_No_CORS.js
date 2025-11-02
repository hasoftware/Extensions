// AdTool Pro - Phiên bản chạy trực tiếp (Không cần tải từ GitHub)
// Copy toàn bộ nội dung này và paste vào console Facebook Business Manager

(function() {
    'use strict';
    
    // Kiểm tra xem đã chạy chưa
    if (window.AdToolProLoaded) {
        console.log('AdTool Pro đã được tải!');
        return;
    }
    
    console.log('🚀 Đang khởi động AdTool Pro...');
    
    // Đánh dấu đã tải
    window.AdToolProLoaded = true;
    
    // Tạo loading indicator
    var loading = document.createElement('div');
    loading.innerHTML = '🔄 Đang tải AdTool Pro...';
    loading.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#fff;padding:10px;border-radius:5px;z-index:9999;font-size:14px;';
    document.body.appendChild(loading);
    
    // Tạo script element và load nội dung trực tiếp
    var script = document.createElement('script');
    
    // Nội dung script sẽ được load từ localStorage hoặc paste trực tiếp
    script.textContent = `
        // AdTool Pro Combined Script sẽ được paste ở đây
        // Hoặc load từ localStorage nếu đã lưu trước đó
        
        if (localStorage.getItem('AdToolProScript')) {
            eval(localStorage.getItem('AdToolProScript'));
        } else {
            console.log('Vui lòng paste nội dung AdTool_Pro_Combined.js vào console trước');
            console.log('Hoặc sử dụng lệnh: loadAdToolProScript()');
        }
    `;
    
    // Thêm script vào page
    document.head.appendChild(script);
    
    // Hàm để load script từ localStorage
    window.loadAdToolProScript = function() {
        var scriptContent = prompt('Paste nội dung AdTool_Pro_Combined.js vào đây:');
        if (scriptContent) {
            localStorage.setItem('AdToolProScript', scriptContent);
            eval(scriptContent);
            if (typeof startAdToolPro === 'function') {
                startAdToolPro();
            }
            loading.innerHTML = '✅ AdTool Pro đã tải xong!';
            setTimeout(function() {
                document.body.removeChild(loading);
            }, 2000);
        }
    };
    
    // Hàm để chạy trực tiếp
    window.runAdToolPro = function() {
        if (typeof startAdToolPro === 'function') {
            startAdToolPro();
            loading.innerHTML = '✅ AdTool Pro đã khởi động!';
            setTimeout(function() {
                document.body.removeChild(loading);
            }, 2000);
        } else {
            loading.innerHTML = '❌ Chưa tải script AdTool Pro!';
            loading.style.background = '#f00';
        }
    };
    
    // Thông báo hướng dẫn
    console.log('📋 Hướng dẫn sử dụng:');
    console.log('1. Copy nội dung file AdTool_Pro_Combined.js');
    console.log('2. Paste vào console và nhấn Enter');
    console.log('3. Chạy lệnh: runAdToolPro()');
    console.log('Hoặc sử dụng: loadAdToolProScript() để load từ prompt');
    
    loading.innerHTML = '📋 Vui lòng paste script AdTool Pro vào console';
    
})(); 