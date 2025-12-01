
export const validateBooking = (data) => {
  const errors = {};

  // 1. Mã Booking (Required, Max 50)
  if (!data.booking_code || !data.booking_code.trim()) {
    errors.booking_code = "Mã booking không được để trống";
  } else if (data.booking_code.length > 50) {
    errors.booking_code = "Mã booking tối đa 50 ký tự";
  }

  // 2. Khách hàng (Required, Int, Max 11 chars)
  if (!data.customer_id) {
    errors.customer_id = "Vui lòng chọn khách hàng";
  } else if (isNaN(data.customer_id)) {
    errors.customer_id = "Mã khách hàng phải là số";
  }

  // 3. Tour Version (Required, Int, Max 11 chars)
  if (!data.tour_version_id) {
    errors.tour_version_id = "Vui lòng chọn phiên bản tour";
  } else if (isNaN(data.tour_version_id)) {
    errors.tour_version_id = "Mã phiên bản tour phải là số";
  }

  // 4. Loại Booking (Enum)
  const validTypes = ["individual", "group"];
  if (data.booking_type && !validTypes.includes(data.booking_type)) {
    errors.booking_type = "Loại booking không hợp lệ";
  }

  // 5. Ngày khởi hành (Required, Date)
  if (!data.departure_date) {
    errors.departure_date = "Ngày khởi hành không được để trống";
  } else {
    const date = new Date(data.departure_date);
    if (isNaN(date.getTime())) {
      errors.departure_date = "Ngày khởi hành không hợp lệ";
    }
  }

  // 6. Validate Số lượng khách (Optional nhưng phải là số nếu nhập)
  const numberFields = ['total_adults', 'total_children', 'total_infants', 'total_guests'];
  numberFields.forEach(field => {
    if (data[field] && isNaN(data[field])) {
      errors[field] = "Vui lòng chỉ nhập số";
    }
  });

  // 7. Validate Tài chính (Decimal)
  // Backend: unit_price, total_amount là required
  if (!data.unit_price || Number(data.unit_price) < 0) {
    errors.unit_price = "Đơn giá không hợp lệ";
  }
  if (!data.total_amount || Number(data.total_amount) < 0) {
    errors.total_amount = "Tổng tiền không hợp lệ";
  }

  // Các trường tài chính khác (Optional)
  const moneyFields = ['discount_amount', 'final_amount', 'paid_amount', 'remaining_amount'];
  moneyFields.forEach(field => {
    if (data[field] && isNaN(data[field])) {
      errors[field] = "Số tiền phải là dạng số";
    }
  });

  // 8. Currency (Max 3)
  if (data.currency && data.currency.length > 3) {
    errors.currency = "Đơn vị tiền tệ tối đa 3 ký tự";
  }

  // 9. Trạng thái (Enum)
  const validStatus = ["pending", "confirmed", "deposited", "paid", "completed", "cancelled"];
  if (data.status && !validStatus.includes(data.status)) {
    errors.status = "Trạng thái không hợp lệ";
  }

  // 10. Coupon Code (Max 50)
  if (data.coupon_code && data.coupon_code.length > 50) {
    errors.coupon_code = "Mã giảm giá tối đa 50 ký tự";
  }

  // 11. Created By (Required)
  // Lưu ý: Frontend thường tự lấy từ AuthContext, nhưng vẫn cần check
  if (!data.created_by) {
    errors.created_by = "Không xác định được người tạo";
  }

  return errors;
};