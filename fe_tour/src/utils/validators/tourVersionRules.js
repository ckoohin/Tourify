export const validateTourVersion = (data) => {
  const errors = {};

  // 1. Tên phiên bản
  if (!data.name || !data.name.trim()) {
    errors.name = "Tên phiên bản không được để trống";
  } else if (data.name.length > 100) {
    errors.name = "Tên phiên bản tối đa 100 ký tự";
  }

  // 2. Loại
  const validTypes = ["seasonal", "promotion", "special", "standard"];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = "Vui lòng chọn loại phiên bản hợp lệ";
  }

  // 3. Ngày hiệu lực
  if (data.valid_from && data.valid_to) {
    const from = new Date(data.valid_from);
    const to = new Date(data.valid_to);
    if (from > to) {
      errors.valid_to = "Ngày kết thúc phải lớn hơn ngày bắt đầu";
    }
  }

  // 4. Tour ID (Bắt buộc để liên kết)
  if (!data.tour_id) {
    errors.tour_id = "Lỗi hệ thống: Không tìm thấy ID Tour";
  }

  return errors;
};