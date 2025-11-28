
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd') 
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/_/g, '-') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
};

/**
 * @param {Object} data 
 * @param {Number|String} currentId 
 */
export const validateCategory = (data, currentId = null) => {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (data.name.length > 100) {
    errors.name = 'Tên danh mục tối đa 100 ký tự';
  }

  if (!data.slug || !data.slug.trim()) {
    errors.slug = 'Slug không được để trống';
  } else if (data.slug.length > 100) {
    errors.slug = 'Slug tối đa 100 ký tự';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug chỉ chứa chữ thường, số và dấu gạch ngang';
  }

  if (data.parent_id && currentId) {
    if (String(data.parent_id) === String(currentId)) {
      errors.parent_id = 'Danh mục cha không thể là chính nó';
    }
  }

  if (data.display_order !== undefined && data.display_order !== '') {
    const order = Number(data.display_order);
    if (isNaN(order) || order < 0 || !Number.isInteger(order)) {
      errors.display_order = 'Thứ tự hiển thị phải là số nguyên >= 0';
    }
  }

  return errors;
};