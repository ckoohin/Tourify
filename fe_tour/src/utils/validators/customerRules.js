
export const customerRules = (data) => {
  const errors = {};

  // 1. Tên khách hàng (Required, max 255)
  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = "Tên khách hàng không được để trống";
  } else if (data.full_name.length > 255) {
    errors.full_name = "Tên khách hàng tối đa 255 ký tự";
  }

  // 2. Số điện thoại (Required, max 20)
  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Số điện thoại không được để trống";
  } else if (data.phone.length > 20) {
    errors.phone = "Số điện thoại tối đa 20 ký tự";
  }

  // 3. Email (Optional, valid email, max 255)
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "Email không hợp lệ";
    } else if (data.email.length > 255) {
      errors.email = "Email tối đa 255 ký tự";
    }
  }

  // 4. Loại khách hàng (Enum)
  const validTypes = ["individual", "company", "agent"];
  if (data.customer_type && !validTypes.includes(data.customer_type)) {
    errors.customer_type = "Loại khách hàng không hợp lệ";
  }

  // 5. Mã khách hàng (Optional, max 50)
  if (data.customer_code && data.customer_code.length > 50) {
    errors.customer_code = "Mã khách hàng tối đa 50 ký tự";
  }

  // 6. CMND/CCCD (Optional, number, max 50)
  if (data.id_number) {
    if (isNaN(data.id_number)) {
        errors.id_number = "CMND/CCCD phải là số";
    } else if (data.id_number.length > 50) {
        errors.id_number = "CMND/CCCD tối đa 50 ký tự";
    }
  }


  if (data.tax_code) {

    if (isNaN(data.tax_code.replace(/-/g, ''))) { 
    }
    if (data.tax_code.length > 50) {
        errors.tax_code = "Mã số thuế tối đa 50 ký tự";
    }
  }

  if (data.nationality && data.nationality.length > 100) errors.nationality = "Quốc tịch tối đa 100 ký tự";
  if (data.city && data.city.length > 100) errors.city = "Thành phố tối đa 100 ký tự";
  if (data.country && data.country.length > 100) errors.country = "Quốc gia tối đa 100 ký tự";
  if (data.company_name && data.company_name.length > 255) errors.company_name = "Tên công ty tối đa 255 ký tự";
  if (data.customer_source && data.customer_source.length > 100) errors.customer_source = "Nguồn khách tối đa 100 ký tự";

  return errors;
};