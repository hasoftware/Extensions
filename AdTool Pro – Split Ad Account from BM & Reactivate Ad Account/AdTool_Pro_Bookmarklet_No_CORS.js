// AdTool Pro Bookmarklet - Không bị chặn CORS
// Copy toàn bộ dòng này làm bookmark URL

javascript:(function(){
    // Kiểm tra xem đã chạy chưa
    if (window.AdToolProLoaded) {
        alert('AdTool Pro đã được tải!');
        return;
    }
    
    // Tạo loading indicator
    var loading = document.createElement('div');
    loading.innerHTML = '🔄 Đang khởi động AdTool Pro...';
    loading.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#fff;padding:10px;border-radius:5px;z-index:9999;font-size:14px;';
    document.body.appendChild(loading);
    
    // Kiểm tra xem script đã được lưu trong localStorage chưa
    if (localStorage.getItem('AdToolProScript')) {
        try {
            eval(localStorage.getItem('AdToolProScript'));
            if (typeof startAdToolPro === 'function') {
                startAdToolPro();
                loading.innerHTML = '✅ AdTool Pro đã khởi động!';
                setTimeout(function() {
                    document.body.removeChild(loading);
                }, 2000);
            } else {
                throw new Error('Không tìm thấy hàm startAdToolPro');
            }
        } catch (error) {
            console.error('Lỗi khi chạy AdTool Pro:', error);
            loading.innerHTML = '❌ Lỗi khi chạy AdTool Pro!';
            loading.style.background = '#f00';
            setTimeout(function() {
                document.body.removeChild(loading);
            }, 3000);
        }
    } else {
        // Nếu chưa có script, hướng dẫn người dùng
        loading.innerHTML = '📋 Chưa có script AdTool Pro!';
        loading.style.background = '#ffa500';
        
        var instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,0.5);z-index:10000;max-width:500px;">
                <h3>🚀 Hướng dẫn cài đặt AdTool Pro</h3>
                <p><strong>Bước 1:</strong> Copy toàn bộ nội dung file <code>AdTool_Pro_Combined.js</code></p>
                <p><strong>Bước 2:</strong> Paste vào console và nhấn Enter</p>
                <p><strong>Bước 3:</strong> Click bookmark này lại</p>
                <button onclick="this.parentElement.remove()" style="background:#007bff;color:#fff;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Đã hiểu</button>
            </div>
        `;
        document.body.appendChild(instructions);
        
        console.log('📋 Hướng dẫn cài đặt AdTool Pro:');
        console.log('1. Copy nội dung file AdTool_Pro_Combined.js');
        console.log('2. Paste vào console và nhấn Enter');
        console.log('3. Click bookmark này lại');
    }
    
    // Đánh dấu đã tải
    window.AdToolProLoaded = true;
    
})(); 