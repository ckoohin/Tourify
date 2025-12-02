export const validateServiceBooking = (data) => {
  const errors = {};

  if (!data.supplier_id) {
    errors.supplier_id = "Vui lòng chọn nhà cung cấp";
  }

  if (!data.service_date) {
    errors.service_date = "Ngày sử dụng dịch vụ không được để trống";
  }

  if (!data.quantity || Number(data.quantity) <= 0) {
    errors.quantity = "Số lượng phải lớn hơn 0";
  }

  if (!data.unit_price || Number(data.unit_price) < 0) {
    errors.unit_price = "Đơn giá không hợp lệ";
  }

  return errors;
};