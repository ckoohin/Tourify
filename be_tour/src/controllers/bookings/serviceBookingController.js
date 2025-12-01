const ServiceBooking = require('../../models/bookings/ServiceBooking');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class ServiceBookingController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const booking = await ServiceBooking.create(req.body, req.user.id);

      return ApiResponse.success(res, {data:booking, message:'Đặt dịch vụ thành công', statusCode:201});
    } catch (error) {
      console.error('Create service booking error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi đặt dịch vụ',
        errors: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const booking = await ServiceBooking.getById(id);

      if (!booking) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy dịch vụ',
          statusCode: 404
        });
      }

      return ApiResponse.success(res,{ data: booking, message:'Lấy chi tiết dịch vụ thành công'});
    } catch (error) {
      console.error('Get service booking error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết dịch vụ',
        errors: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const { id } = req.params;

      const existingBooking = await ServiceBooking.getById(id);
      if (!existingBooking) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy dịch vụ',
          statusCode: 404
        });
      }

      const booking = await ServiceBooking.update(id, req.body);

      return ApiResponse.success(res,{ data: booking, message: 'Cập nhật dịch vụ thành công'});
    } catch (error) {
      console.error('Update service booking error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật dịch vụ',
        errors: error.message
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, confirmation_number } = req.body;

      if (!status) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp trạng thái',
          statusCode: 400
        });
      }

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ApiResponse.error(res, {
          message: 'Trạng thái không hợp lệ',
          statusCode: 400
        });
      }

      const booking = await ServiceBooking.updateStatus(id, status, confirmation_number);

      return ApiResponse.success(res, {data: booking, message: 'Cập nhật trạng thái thành công'});
    } catch (error) {
      console.error('Update status error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật trạng thái',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingBooking = await ServiceBooking.getById(id);
      if (!existingBooking) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy dịch vụ',
          statusCode: 404
        });
      }

      await ServiceBooking.delete(id);

      return ApiResponse.success(res, {data: null, message: 'Xóa dịch vụ thành công'});
    } catch (error) {
      console.error('Delete service booking error:', error);
      return ApiResponse.error(res, {
        message: error.message || 'Lỗi khi xóa dịch vụ',
        statusCode: 400
      });
    }
  }

  static async getByDepartureId(req, res) {
    try {
      const { departureId } = req.params;

      const bookings = await ServiceBooking.getByDepartureId(departureId);

      return ApiResponse.success(res, {data: bookings, message: 'Lấy danh sách dịch vụ thành công'});
    } catch (error) {
      console.error('Get service bookings error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách dịch vụ',
        errors: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { departureId } = req.params;

      const stats = await ServiceBooking.getStatsByDepartureId(departureId);

      return ApiResponse.success(res, {data: stats, message: 'Lấy thống kê dịch vụ thành công'});
    } catch (error) {
      console.error('Get service stats error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy thống kê dịch vụ',
        errors: error.message
      });
    }
  }
}

module.exports = ServiceBookingController;