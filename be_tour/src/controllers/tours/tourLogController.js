const TourLog = require('../../models/tours/TourLog');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class TourLogController {
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

      const log = await TourLog.create(req.body, req.user.id);

      return ApiResponse.success(res, {data: log, message:'Tạo nhật ký thành công', statusCode:201});
    } catch (error) {
      console.error('Create tour log error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi tạo nhật ký',
        errors: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const log = await TourLog.getById(id);

      if (!log) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy nhật ký',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {data: log, message:'Lấy chi tiết nhật ký thành công'});
    } catch (error) {
      console.error('Get tour log error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết nhật ký',
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

      const existingLog = await TourLog.getById(id);
      if (!existingLog) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy nhật ký',
          statusCode: 404
        });
      }

      const log = await TourLog.update(id, req.body);

      return ApiResponse.success(res, {data: log, message: 'Cập nhật nhật ký thành công'});
    } catch (error) {
      console.error('Update tour log error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật nhật ký',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingLog = await TourLog.getById(id);
      if (!existingLog) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy nhật ký',
          statusCode: 404
        });
      }

      await TourLog.delete(id);

      return ApiResponse.success(res, {data:null, message:'Xóa nhật ký thành công'});
    } catch (error) {
      console.error('Delete tour log error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xóa nhật ký',
        errors: error.message
      });
    }
  }

  static async getByDepartureId(req, res) {
    try {
      const { departureId } = req.params;
      const { page = 1, limit = 20, log_type } = req.query;

      const result = await TourLog.getByDepartureId(departureId, {
        page: parseInt(page),
        limit: parseInt(limit),
        log_type
      });

      return ApiResponse.success(res, {data:result, message:'Lấy danh sách nhật ký thành công'});
    } catch (error) {
      console.error('Get tour logs error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách nhật ký',
        errors: error.message
      });
    }
  }

  static async getByDate(req, res) {
    try {
      const { departureId } = req.params;
      const { date } = req.query;

      if (!date) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp ngày',
          statusCode: 400
        });
      }

      const logs = await TourLog.getByDate(departureId, date);

      return ApiResponse.success(res, {data:logs, message:'Lấy nhật ký theo ngày thành công'});
    } catch (error) {
      console.error('Get logs by date error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy nhật ký theo ngày',
        errors: error.message
      });
    }
  }

  static async getIncidentsAndFeedback(req, res) {
    try {
      const { departureId } = req.params;

      const logs = await TourLog.getIncidentsAndFeedback(departureId);

      return ApiResponse.success(res, {data:logs, message: 'Lấy sự cố và phản hồi thành công'});
    } catch (error) {
      console.error('Get incidents and feedback error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy sự cố và phản hồi',
        errors: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { departureId } = req.params;

      const stats = await TourLog.getStats(departureId);

      return ApiResponse.success(res,{data: stats, message:'Lấy thống kê nhật ký thành công'});
    } catch (error) {
      console.error('Get log stats error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy thống kê nhật ký',
        errors: error.message
      });
    }
  }
}

module.exports = TourLogController;