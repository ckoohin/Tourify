
export const validateStaff = (data) => {
  const errors = {};

  // 1. Validate HỌ TÊN (Bắt buộc)
  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = 'Họ tên không được để trống';
  } else if (data.full_name.length < 2) {
    errors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
  }

  // 2. Validate SỐ ĐIỆN THOẠI (Bắt buộc & Đúng định dạng VN)
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Số điện thoại là bắt buộc';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (phải là số VN 10 chữ số)';
  }

  // 3. Validate EMAIL (Không bắt buộc nhưng nếu nhập phải đúng)
  if (data.email && data.email.trim() !== '') {
    if (!isValidEmail(data.email)) {
      errors.email = 'Email không đúng định dạng';
    }
  }

  // 4. Validate riêng cho TÀI XẾ (Driver)
  if (data.staff_type === 'driver') {
    if (!data.driver_license_number || !data.driver_license_number.trim()) {
      errors.driver_license_number = 'Tài xế bắt buộc phải có số GPLX';
    }
    if (!data.driver_license_class || !data.driver_license_class.trim()) {
      errors.driver_license_class = 'Tài xế bắt buộc phải có hạng bằng lái';
    }
  }

  // 5. Validate riêng cho HƯỚNG DẪN VIÊN (Tour Guide/Leader)
  if (['tour_guide', 'tour_leader'].includes(data.staff_type)) {
    if (!data.languages || !data.languages.trim()) {
        errors.languages = 'Vui lòng nhập ngoại ngữ'; 
    }
  }

  return errors;
};