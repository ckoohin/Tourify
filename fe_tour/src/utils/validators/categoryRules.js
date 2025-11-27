
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/[đĐ]/g, 'd') // Xử lý chữ đ
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
    .replace(/[^\w\-]+/g, '') // Xóa ký tự đặc biệt (giữ lại a-z, 0-9, -, _)
    .replace(/_/g, '-') // Thay dấu gạch dưới bằng gạch ngang (để khớp regex BE)
    .replace(/\-\-+/g, '-') // Xóa gạch ngang kép
    .replace(/^-+/, '') // Xóa gạch ngang đầu
    .replace(/-+$/, ''); // Xóa gạch ngang cuối
};

/**
 * Hàm validate dữ liệu trước khi gửi lên Server
 * @param {Object} data - Dữ liệu form { name, slug, parent_id, display_order, ... }
 * @param {Number|String} currentId - ID của danh mục đang sửa (nếu có) để check cha-con
 */
export const validateCategory = (data, currentId = null) => {
  const errors = {};

  // 1. Validate Name (Khớp route: notEmpty, max: 100)
  if (!data.name || !data.name.trim()) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (data.name.length > 100) {
    errors.name = 'Tên danh mục tối đa 100 ký tự';
  }

  // 2. Validate Slug (Khớp route: notEmpty, max: 100, matches /^[a-z0-9-]+$/)
  if (!data.slug || !data.slug.trim()) {
    errors.slug = 'Slug không được để trống';
  } else if (data.slug.length > 100) {
    errors.slug = 'Slug tối đa 100 ký tự';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug chỉ chứa chữ thường, số và dấu gạch ngang';
  }

  // 3. Validate Parent ID (Khớp controller: Không thể set cha là chính nó)
  if (data.parent_id && currentId) {
    if (String(data.parent_id) === String(currentId)) {
      errors.parent_id = 'Danh mục cha không thể là chính nó';
    }
  }

  // 4. Validate Display Order (Khớp route: isInt, min: 0)
  if (data.display_order !== undefined && data.display_order !== '') {
    const order = Number(data.display_order);
    if (isNaN(order) || order < 0 || !Number.isInteger(order)) {
      errors.display_order = 'Thứ tự hiển thị phải là số nguyên >= 0';
    }
  }

  return errors;
};