class ApiResponse {
  static success(res, {
    message = 'Thành công',
    data = null,
    statusCode = 200,
    meta = null
  } = {}) {
    const response = {
      success: true,
      message
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;

    return res.status(statusCode).json(response);
  }

  static error(res, {
    message = 'Có lỗi xảy ra',
    statusCode = 500,
    errors = null
  } = {}) {
    const response = {
      success: false,
      message
    };

    if (errors !== null) response.errors = errors;

    return res.status(statusCode).json(response);
  }

  static paginate(res, {
    message = 'Lấy danh sách thành công',
    data = [],
    page = 1,
    limit = 10,
    total = 0
  } = {}) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}

module.exports = ApiResponse;