const TourExpense = require('../../models/tours/TourExpense');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class TourExpenseController {
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

      const expense = await TourExpense.create(req.body, req.user.id);

      return ApiResponse.success(res, {data: expense, message: 'Ghi nhận chi phí thành công', statusCode:201});
    } catch (error) {
      console.error('Create tour expense error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi ghi nhận chi phí',
        errors: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const expense = await TourExpense.getById(id);

      if (!expense) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy chi phí',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {data:expense, message:'Lấy chi tiết chi phí thành công'});
    } catch (error) {
      console.error('Get tour expense error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết chi phí',
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

      const existingExpense = await TourExpense.getById(id);
      if (!existingExpense) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy chi phí',
          statusCode: 404
        });
      }

      const expense = await TourExpense.update(id, req.body);

      return ApiResponse.success(res, {data: expense, message: 'Cập nhật chi phí thành công'});
    } catch (error) {
      console.error('Update tour expense error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật chi phí',
        errors: error.message
      });
    }
  }

  static async approve(req, res) {
    try {
      const { id } = req.params;

      const existingExpense = await TourExpense.getById(id);
      if (!existingExpense) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy chi phí',
          statusCode: 404
        });
      }

      if (existingExpense.approved_by) {
        return ApiResponse.error(res, {
          message: 'Chi phí đã được phê duyệt',
          statusCode: 400
        });
      }

      const expense = await TourExpense.approve(id, req.user.id);

      return ApiResponse.success(res, {data: expense, message: 'Phê duyệt chi phí thành công'});
    } catch (error) {
      console.error('Approve tour expense error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi phê duyệt chi phí',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingExpense = await TourExpense.getById(id);
      if (!existingExpense) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy chi phí',
          statusCode: 404
        });
      }

      await TourExpense.delete(id);

      return ApiResponse.success(res, {data: null, message:'Xóa chi phí thành công'});
    } catch (error) {
      console.error('Delete tour expense error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xóa chi phí',
        errors: error.message
      });
    }
  }

  static async getByDepartureId(req, res) {
    try {
      const { departureId } = req.params;

      const expenses = await TourExpense.getByDepartureId(departureId);

      return ApiResponse.success(res,{ data: expenses, message: 'Lấy danh sách chi phí thành công'});
    } catch (error) {
      console.error('Get tour expenses error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách chi phí',
        errors: error.message
      });
    }
  }

  static async compareWithBudget(req, res) {
    try {
      const { departureId } = req.params;

      const comparison = await TourExpense.compareWithBudget(departureId);

      return ApiResponse.success(res, {data: comparison, message: 'So sánh chi phí thành công'});
    } catch (error) {
      console.error('Compare budget error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi so sánh chi phí',
        errors: error.message
      });
    }
  }
}

module.exports = TourExpenseController;