const StaffAssignment = require('../../models/staff/StaffAssignment');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class StaffAssignmentController {
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

      const assignment = await StaffAssignment.create(req.body, req.user.id);

      return ApiResponse.success(res, {
        message: 'Phân công nhân sự thành công',
        data: assignment,
        statusCode: 201
      });
    } catch (error) {
      console.error('Create staff assignment error:', error);
      return ApiResponse.error(res, {
        message: error.message || 'Lỗi khi phân công nhân sự',
        statusCode: 400
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const assignment = await StaffAssignment.getById(id);

      if (!assignment) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy phân công',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'Lấy chi tiết phân công thành công',
        data: assignment
      });
    } catch (error) {
      console.error('Get staff assignment error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết phân công',
        errors: error.message
      });
    }
  }

  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10,
        search,
        role,
        confirmed,
        tour_departure_id,
        staff_id,
        date_from,
        date_to,
        status
      } = req.query;

      const result = await StaffAssignment.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        confirmed: confirmed !== undefined ? parseInt(confirmed) : undefined,
        tour_departure_id,
        staff_id,
        date_from,
        date_to,
        status
      });

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách phân công thành công',
        data: result.data,
        page: result.pagination.currentPage,
        limit: result.pagination.pageSize,
        total: result.pagination.totalItems
      });
    } catch (error) {
      console.error('Get staff assignments error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách phân công',
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

      const existingAssignment = await StaffAssignment.getById(id);
      if (!existingAssignment) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy phân công',
          statusCode: 404
        });
      }

      const assignment = await StaffAssignment.update(id, req.body);

      return ApiResponse.success(res, {
        message: 'Cập nhật phân công thành công',
        data: assignment
      });
    } catch (error) {
      console.error('Update staff assignment error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật phân công',
        errors: error.message
      });
    }
  }

  static async confirm(req, res) {
    try {
      const { id } = req.params;

      const existingAssignment = await StaffAssignment.getById(id);
      if (!existingAssignment) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy phân công',
          statusCode: 404
        });
      }

      const assignment = await StaffAssignment.confirm(id);

      return ApiResponse.success(res, {
        message: 'Xác nhận phân công thành công',
        data: assignment
      });
    } catch (error) {
      console.error('Confirm staff assignment error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xác nhận phân công',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingAssignment = await StaffAssignment.getById(id);
      if (!existingAssignment) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy phân công',
          statusCode: 404
        });
      }

      await StaffAssignment.delete(id);

      return ApiResponse.success(res, {
        message: 'Xóa phân công thành công'
      });
    } catch (error) {
      console.error('Delete staff assignment error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xóa phân công',
        errors: error.message
      });
    }
  }

  static async getStaffSchedule(req, res) {
    try {
      const { staffId } = req.params;
      const { date_from, date_to } = req.query;

      if (!date_from || !date_to) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp khoảng thời gian',
          statusCode: 400
        });
      }

      const schedule = await StaffAssignment.getStaffSchedule(staffId, {
        date_from,
        date_to
      });

      return ApiResponse.success(res, {
        message: 'Lấy lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      console.error('Get staff schedule error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy lịch làm việc',
        errors: error.message
      });
    }
  }

  static async checkAvailability(req, res) {
    try {
      const { staffId } = req.params;
      const { departure_date, return_date } = req.query;

      if (!departure_date || !return_date) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp ngày khởi hành và kết thúc',
          statusCode: 400
        });
      }

      const isAvailable = await StaffAssignment.checkAvailability(
        staffId,
        departure_date,
        return_date
      );

      return ApiResponse.success(res, {
        message: 'Kiểm tra tính khả dụng thành công',
        data: {
          staff_id: staffId,
          departure_date,
          return_date,
          is_available: isAvailable
        }
      });
    } catch (error) {
      console.error('Check availability error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi kiểm tra tính khả dụng',
        errors: error.message
      });
    }
  }
}

module.exports = StaffAssignmentController;