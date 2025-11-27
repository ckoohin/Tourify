const isValidSlug = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export const validateTour = (data) => {
  const errors = {};

  // 1. Các trường NOT NULL trong DB
  if (!data.name?.trim()) errors.name = 'Tên tour là bắt buộc';
  if (!data.code?.trim()) errors.code = 'Mã tour là bắt buộc';
  if (!data.category_id) errors.category_id = 'Vui lòng chọn danh mục';
  
  // Slug NOT NULL
  if (!data.slug?.trim()) errors.slug = 'Slug là bắt buộc';
  else if (!isValidSlug(data.slug)) errors.slug = 'Slug không hợp lệ (chỉ dùng chữ thường, số và gạch ngang)';

  // Duration NOT NULL
  if (data.duration_days === '' || data.duration_days < 0) errors.duration_days = 'Số ngày không hợp lệ';
  if (data.duration_nights === '' || data.duration_nights < 0) errors.duration_nights = 'Số đêm không hợp lệ';

  // 2. Các trường Nullable nhưng nên bắt buộc về mặt nghiệp vụ
  if (!data.departure_location?.trim()) errors.departure_location = 'Điểm khởi hành là bắt buộc';
  if (!data.destination?.trim()) errors.destination = 'Điểm đến là bắt buộc';

  // 3. Logic số lượng khách
  if (data.min_group_size < 1) errors.min_group_size = 'Tối thiểu 1 khách';
  if (data.max_group_size && data.max_group_size < data.min_group_size) {
      errors.max_group_size = 'Max phải lớn hơn hoặc bằng Min';
  }

  return errors;
};