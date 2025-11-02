// AdTool Pro Bookmarklet - Copy toàn bộ dòng này làm bookmark URL
javascript:(function(){
    // Tạo loading indicator
    var loading = document.createElement('div');
    loading.innerHTML = '🔄 Đang tải AdTool Pro...';
    loading.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#fff;padding:10px;border-radius:5px;z-index:9999;font-size:14px;';
    document.body.appendChild(loading);
    
    // Load script từ GitHub
    var script = document.createElement('script');
    script.src = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/AdTool_Pro_Combined.js';
    
    script.onload = function() {
        loading.innerHTML = '✅ AdTool Pro đã tải xong!';
        setTimeout(function() {
            document.body.removeChild(loading);
        }, 2000);
        
        // Chạy tool
        if (typeof startAdToolPro === 'function') {
            startAdToolPro();
        } else {
            console.error('Không tìm thấy hàm startAdToolPro');
        }
    };
    
    script.onerror = function() {
        loading.innerHTML = '❌ Lỗi tải AdTool Pro!';
        loading.style.background = '#f00';
        setTimeout(function() {
            document.body.removeChild(loading);
        }, 3000);
        console.error('Không thể tải AdTool Pro từ GitHub');
    };
    
    document.head.appendChild(script);
})(); 