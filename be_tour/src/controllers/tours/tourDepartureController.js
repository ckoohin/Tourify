const TourDeparture = require('../../models/tours/TourDeparture');
const StaffAssignment = require('../../models/staff/StaffAssignment');
const ServiceBooking = require('../../models/bookings/ServiceBooking');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class TourDepartureController {
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10,
        tour_version_id,
        status,
        departure_date_from,
        departure_date_to,
        search
      } = req.query;

      const result = await TourDeparture.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        tour_version_id,
        status,
        departure_date_from,
        departure_date_to,
        search
      });

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách lịch khởi hành thành công',
        data: result.data,
        page: result.pagination.currentPage,
        limit: result.pagination.pageSize,
        total: result.pagination.totalItems
      });
    } catch (error) {
      console.error('Get tour departures error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách lịch khởi hành',
        errors: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const departure = await TourDeparture.getById(id);

      if (!departure) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy lịch khởi hành',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'Lấy chi tiết lịch khởi hành thành công',
        data: departure
      });
    } catch (error) {
      console.error('Get tour departure error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết lịch khởi hành',
        errors: error.message
      });
    }
  }

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

      const departure = await TourDeparture.create(req.body, req.user.id);

      return ApiResponse.success(res, {
        message: 'Tạo lịch khởi hành thành công',
        data: departure,
        statusCode: 201
      });
    } catch (error) {
      console.error('Create tour departure error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi tạo lịch khởi hành',
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

      const existingDeparture = await TourDeparture.getById(id);
      if (!existingDeparture) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy lịch khởi hành',
          statusCode: 404
        });
      }

      const departure = await TourDeparture.update(id, req.body);

      return ApiResponse.success(res, {
        message: 'Cập nhật lịch khởi hành thành công',
        data: departure
      });
    } catch (error) {
      console.error('Update tour departure error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật lịch khởi hành',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingDeparture = await TourDeparture.getById(id);
      if (!existingDeparture) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy lịch khởi hành',
          statusCode: 404
        });
      }

      await TourDeparture.delete(id);

      return ApiResponse.success(res, {
        message: 'Xóa lịch khởi hành thành công'
      });
    } catch (error) {
      console.error('Delete tour departure error:', error);
      return ApiResponse.error(res, {
        message: error.message || 'Lỗi khi xóa lịch khởi hành',
        statusCode: 400
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp trạng thái',
          statusCode: 400
        });
      }

      const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ApiResponse.error(res, {
          message: 'Trạng thái không hợp lệ',
          statusCode: 400
        });
      }

      const departure = await TourDeparture.updateStatus(id, status);

      return ApiResponse.success(res, {
        message: 'Cập nhật trạng thái thành công',
        data: departure
      });
    } catch (error) {
      console.error('Update status error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật trạng thái',
        errors: error.message
      });
    }
  }

  static async getGuests(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await TourDeparture.getGuests(id, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách khách thành công',
        data: result.data,
        page: result.pagination.currentPage,
        limit: result.pagination.pageSize,
        total: result.pagination.totalItems
      });
    } catch (error) {
      console.error('Get guests error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách khách',
        errors: error.message
      });
    }
  }

  static async checkInGuest(req, res) {
    try {
      const { id, guestId } = req.params;

      await TourDeparture.checkInGuest(guestId, req.user.id);

      return ApiResponse.success(res, {
        message: 'Check-in khách thành công'
      });
    } catch (error) {
      console.error('Check-in guest error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi check-in khách',
        errors: error.message
      });
    }
  }

  static async assignRoom(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const { id, guestId } = req.params;

      await TourDeparture.assignRoom(guestId, req.body);

      return ApiResponse.success(res, {
        message: 'Phân phòng thành công'
      });
    } catch (error) {
      console.error('Assign room error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi phân phòng',
        errors: error.message
      });
    }
  }
}

module.exports = TourDepartureController;