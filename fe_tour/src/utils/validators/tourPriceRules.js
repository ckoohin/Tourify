export const validateTourPrice = (data) => {
  const errors = {};

  if (!data.tour_version_id) {
    errors.tour_version_id = "Vui lòng liên kết với một phiên bản tour";
  }

  // 2. Loại giá (Enum)
  const validTypes = ["adult", "child", "infant", "senior", "group"];
  if (!data.price_type || !validTypes.includes(data.price_type)) {
    errors.price_type = "Vui lòng chọn loại đối tượng áp dụng";
  }

  // 3. Giá tiền (Decimal/Number)
  if (!data.price || isNaN(data.price) || Number(data.price) < 0) {
    errors.price = "Giá tiền không hợp lệ";
  }

  // 4. Số lượng khách (Pax) - Optional nhưng nếu nhập phải hợp lệ
  if (data.min_pax && (isNaN(data.min_pax) || Number(data.min_pax) < 0)) {
    errors.min_pax = "Số khách tối thiểu không hợp lệ";
  }
  if (data.max_pax && (isNaN(data.max_pax) || Number(data.max_pax) < 0)) {
    errors.max_pax = "Số khách tối đa không hợp lệ";
  }
  // Logic: Max phải >= Min
  if (data.min_pax && data.max_pax && Number(data.max_pax) < Number(data.min_pax)) {
    errors.max_pax = "Số khách tối đa phải lớn hơn hoặc bằng tối thiểu";
  }

  // 5. Ngày hiệu lực
  if (data.valid_from && data.valid_to) {
    const from = new Date(data.valid_from);
    const to = new Date(data.valid_to);
    if (from > to) {
      errors.valid_to = "Ngày kết thúc phải sau ngày bắt đầu";
    }
  }

  return errors;
};