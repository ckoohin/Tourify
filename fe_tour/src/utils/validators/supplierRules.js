/**
 * Các hàm Regex Helper
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) => /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
// Regex URL cơ bản
export const isValidUrl = (url) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
export const isValidTaxCode = (taxCode) => /^[0-9]{10,13}$/.test(taxCode);

/**
 * Hàm validate từng trường riêng lẻ (Dùng cho Realtime validation)
 */
export const validateSupplierField = (name, value) => {
  let error = '';
  
  // Chuyển value về string để trim() an toàn nếu cần, trừ các trường số
  const strValue = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    // --- 1. ĐỊNH DANH ---
    case 'company_name':
      if (!strValue) error = 'Tên nhà cung cấp là bắt buộc';
      else if (strValue.length < 3) error = 'Tên quá ngắn (tối thiểu 3 ký tự)';
      break;

    case 'code':
      if (!strValue) error = 'Mã NCC là bắt buộc';
      else if (!/^[A-Za-z0-9-_]{3,20}$/.test(strValue)) error = 'Mã chỉ chứa chữ, số, -, _ (3-20 ký tự)';
      break;
    
    case 'type':
      if (!strValue) error = 'Vui lòng chọn loại hình';
      break;

    case 'tax_code':
      if (!strValue) error = 'Mã số thuế là bắt buộc';
      else if (!isValidTaxCode(strValue)) error = 'MST phải là 10 hoặc 13 chữ số';
      break;

    case 'website':
      if (!strValue) error = 'Website là bắt buộc';
      else if (!isValidUrl(strValue)) error = 'Link website không hợp lệ';
      break;

    // --- 2. LIÊN HỆ & ĐỊA CHỈ ---
    case 'contact_person':
      if (!strValue) error = 'Người liên hệ là bắt buộc';
      break;

    case 'phone':
      if (!strValue) error = 'Số điện thoại là bắt buộc';
      else if (!isValidPhone(strValue)) error = 'SĐT không hợp lệ (VN 10 số)';
      break;

    case 'email':
      if (!strValue) error = 'Email là bắt buộc';
      else if (!isValidEmail(strValue)) error = 'Email không đúng định dạng';
      break;

    case 'address':
      if (!strValue) error = 'Địa chỉ chi tiết là bắt buộc';
      break;
      
    case 'city':
      if (!strValue) error = 'Tỉnh/Thành phố là bắt buộc';
      break;

    case 'country':
      if (!strValue) error = 'Quốc gia là bắt buộc';
      break;

    // --- 3. TÀI CHÍNH ---
    case 'payment_terms':
      if (!strValue) error = 'Điều khoản thanh toán là bắt buộc';
      break;

    case 'credit_limit':
      if (value === '' || value === null || value === undefined) error = 'Hạn mức nợ là bắt buộc';
      else if (Number(value) < 0) error = 'Hạn mức không được âm';
      break;

    case 'rating':
      if (value === '' || value === null) error = 'Đánh giá là bắt buộc';
      else if (Number(value) < 0 || Number(value) > 5) error = 'Đánh giá phải từ 0 đến 5';
      break;
      
    case 'status':
      if (!strValue) error = 'Vui lòng chọn trạng thái';
      break;

    default:
      break;
  }
  return error;
};

/**
 * Hàm validate toàn bộ dữ liệu form (Dùng khi Submit)
 * Kiểm tra tất cả các trường bắt buộc
 */
export const validateSupplier = (data) => {
  const errors = {};
  
  // Danh sách tất cả các trường cần kiểm tra (trừ 'notes')
  const requiredFields = [
    'company_name', 'code', 'type', 'tax_code', 'website',
    'contact_person', 'phone', 'email', 
    'address', 'city', 'country',
    'payment_terms', 'credit_limit', 'rating', 'status'
  ];

  requiredFields.forEach(field => {
    const error = validateSupplierField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};