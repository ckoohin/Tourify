/**
 * Hàm kiểm tra định dạng Email
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Hàm kiểm tra số điện thoại Việt Nam
 * Quy tắc: Bắt đầu bằng số 0, độ dài 10 số
 */
const isValidPhone = (phone) => {
  const re = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return re.test(phone);
};

/**
 * Hàm kiểm tra CMND (9 số) hoặc CCCD (12 số)
 */
const isValidIdNumber = (id) => {
  const re = /^(\d{9}|\d{12})$/;
  return re.test(id);
};

export const validateStaff = (data) => {
  const errors = {};

  // --- 1. THÔNG TIN CƠ BẢN (Tất cả đều bắt buộc) ---

  // Mã nhân viên
  if (!data.staff_code || !data.staff_code.trim()) {
    errors.staff_code = 'Mã nhân viên là bắt buộc';
  }

  // Họ tên
  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = 'Họ tên không được để trống';
  } else if (data.full_name.length < 2) {
    errors.full_name = 'Họ tên quá ngắn';
  }

  // Số điện thoại
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Số điện thoại là bắt buộc';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'SĐT không hợp lệ (VD: 0901234567)';
  }

  // Email (Đã chuyển thành Bắt buộc theo yêu cầu)
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email là bắt buộc';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email không đúng định dạng';
  }

  // Giới tính & Trạng thái
  if (!data.gender) errors.gender = 'Vui lòng chọn giới tính';
  if (!data.status) errors.status = 'Vui lòng chọn trạng thái';

  // --- 2. THÔNG TIN CÁ NHÂN & ĐỊA CHỈ ---

  // CCCD / CMND
  if (!data.id_number || !data.id_number.trim()) {
    errors.id_number = 'CCCD/CMND là bắt buộc';
  } else if (!isValidIdNumber(data.id_number)) {
    errors.id_number = 'CCCD/CMND phải là 9 hoặc 12 chữ số';
  }

  // Địa chỉ
  if (!data.address || !data.address.trim()) {
    errors.address = 'Địa chỉ không được để trống';
  }

  // Ngày sinh & Kiểm tra tuổi (>= 18)
  if (!data.birthday) {
    errors.birthday = 'Vui lòng chọn ngày sinh';
  } else {
    const birthDate = new Date(data.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.birthday = 'Nhân viên phải đủ 18 tuổi trở lên';
    }
  }

  // --- 3. VALIDATE THEO LOẠI NHÂN VIÊN (Các trường chuyên môn cũng bắt buộc) ---

  if (data.staff_type === 'driver') {
    // === TÀI XẾ ===
    if (!data.driver_license_class || !data.driver_license_class.trim()) {
      errors.driver_license_class = 'Hạng bằng lái là bắt buộc';
    }
    if (!data.driver_license_number || !data.driver_license_number.trim()) {
      errors.driver_license_number = 'Số giấy phép lái xe là bắt buộc';
    }
    if (!data.vehicle_types || !data.vehicle_types.trim()) {
      errors.vehicle_types = 'Vui lòng nhập loại xe chạy được';
    }

  } else {
    // === HDV / TRƯỞNG ĐOÀN / ĐIỀU HÀNH (Các role còn lại) ===
    // Theo yêu cầu "tất cả các trường đều bắt buộc", ta sẽ check cả ngoại ngữ và chứng chỉ
    
    if (!data.languages || !data.languages.trim()) {
        errors.languages = 'Vui lòng nhập ngoại ngữ'; 
    }
    
    if (!data.certifications || !data.certifications.trim()) {
        errors.certifications = 'Vui lòng nhập chứng chỉ/thẻ hành nghề';
    }

    if (!data.specializations || !data.specializations.trim()) {
        errors.specializations = 'Vui lòng nhập chuyên môn/thế mạnh';
    }
  }

  return errors;
};