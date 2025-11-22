/**
 * Hàm kiểm tra định dạng Email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Hàm kiểm tra số điện thoại VN (10 số, bắt đầu bằng các đầu số hợp lệ)
 */
export const isValidPhone = (phone) => {
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
};

/**
 * Hàm kiểm tra URL Website
 */
export const isValidUrl = (url) => {
  // Regex đơn giản cho URL
  return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
};

/**
 * Hàm kiểm tra Mã số thuế (10 hoặc 13 số)
 */
export const isValidTaxCode = (taxCode) => {
  return /^[0-9]{10,13}$/.test(taxCode);
};

/**
 * Hàm validate tổng hợp cho Supplier Form
 * @param {string} name - Tên trường
 * @param {any} value - Giá trị
 * @returns {string} - Thông báo lỗi (rỗng nếu hợp lệ)
 */
export const validateSupplierField = (name, value) => {
  let error = '';
  
  switch (name) {
    case 'company_name':
      if (!value || !value.trim()) error = 'Tên nhà cung cấp không được để trống';
      else if (value.length < 3) error = 'Tên phải có ít nhất 3 ký tự';
      break;

    case 'code':
      if (!value || !value.trim()) error = 'Mã NCC không được để trống';
      else if (!/^[A-Za-z0-9-_]{3,20}$/.test(value)) error = 'Mã chỉ chứa chữ, số, -, _ (3-20 ký tự)';
      break;

    case 'phone':
      if (!value || !value.trim()) error = 'Số điện thoại không được để trống';
      else if (!isValidPhone(value)) error = 'Số điện thoại không hợp lệ';
      break;

    case 'email':
      if (value && !isValidEmail(value)) error = 'Email không hợp lệ';
      break;

    case 'tax_code':
      if (value && !isValidTaxCode(value)) error = 'Mã số thuế phải là 10-13 số';
      break;

    case 'website':
      if (value && !isValidUrl(value)) error = 'Website không hợp lệ (ví dụ: https://domain.com)';
      break;

    case 'rating':
      if (value < 0 || value > 5) error = 'Đánh giá phải từ 0 đến 5';
      break;

    default:
      break;
  }
  return error;
};