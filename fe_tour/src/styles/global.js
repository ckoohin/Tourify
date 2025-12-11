/**
 * Hàm hiển thị thông báo xác nhận dạng Top Dialog (Nhỏ, ở trên cùng)
 */
const showConfirmDialog = ({
    title = 'Xác nhận',
    text = 'Bạn có chắc chắn muốn thực hiện?',
    icon = 'warning',
    confirmText = 'Tiếp tục',
    cancelText = 'Hủy bỏ',
    confirmColor = '#ef4444', // Màu đỏ (theo style delete của bạn)
    cancelColor = '#78716c',  // Màu xám nhẹ cho nút hủy
} = {}) => {
    return Swal.fire({
        // --- CẤU HÌNH VỊ TRÍ & KÍCH THƯỚC ---
        position: 'top',       // Xuất hiện ở đỉnh màn hình
        width: '24rem',        // ~384px (Nhỏ gọn)
        padding: '1rem',       // Giảm padding cho gọn
        
        // --- CẤU HÌNH GIAO DIỆN ---
        title: title,
        text: text,
        icon: icon,
        
        // --- CẤU HÌNH NÚT BẤM ---
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: cancelColor,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        
        // --- HIỆU ỨNG & UX ---
        backdrop: `rgba(0,0,0,0.4)`, // Làm tối nền nhẹ để tập trung
        allowOutsideClick: false,    // Buộc người dùng phải chọn (không click ra ngoài được)
        
        // Tùy chỉnh CSS class để giao diện đẹp hơn (giống CSS bạn gửi)
        customClass: {
            title: 'text-lg font-bold text-slate-700', // Chỉnh font tiêu đề
            htmlContainer: 'text-sm text-slate-600',   // Chỉnh font nội dung
            actions: 'gap-2',                           // Khoảng cách giữa 2 nút
            popup: 'rounded-lg shadow-lg'               // Bo góc và đổ bóng
        }
    });
};

// Gán vào window (nếu không dùng module)
window.showConfirmDialog = showConfirmDialog;
export default showConfirmDialog;