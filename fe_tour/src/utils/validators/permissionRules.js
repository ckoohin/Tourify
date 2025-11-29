// validators/permissionRules.js

/**
 * Hàm tạo slug từ tên quyền hạn
 * VD: "Xem Báo Cáo" -> "xem-bao-cao"
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/[đĐ]/g, 'd') // Xử lý chữ đ
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
    .replace(/[^\w\-]+/g, '') // Xóa ký tự đặc biệt
    .replace(/\-\-+/g, '-') // Xóa gạch ngang kép
    .replace(/^-+/, '') // Xóa gạch ngang đầu
    .replace(/-+$/, ''); // Xóa gạch ngang cuối
};

// Validate dữ liệu (nếu cần mở rộng sau này)
export const validatePermission = (data) => {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Tên quyền phải từ 2 ký tự trở lên';
  }
  return errors;
};