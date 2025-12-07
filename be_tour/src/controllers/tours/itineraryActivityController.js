const ItineraryActivity = require('../../models/tours/ItineraryActivity');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class ItineraryActivityController {
  static async getByItinerary(req, res) {
    try {
      const { itineraryId } = req.params;

      const activities = await ItineraryActivity.getByItinerary(itineraryId);

      return ApiResponse.success(res, {
        message: 'Lấy danh sách hoạt động thành công',
        data: { activities }
      });
    } catch (error) {
      console.error('Get activities error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách hoạt động',
        errors: error.message
      });
    }
  }

  static async getByTourVersion(req, res) {
    try {
      const { tourVersionId } = req.params;

      const activities = await ItineraryActivity.getByTourVersion(tourVersionId);

      const groupedByDay = activities.reduce((acc, activity) => {
        const key = activity.day_number;
        if (!acc[key]) {
          acc[key] = {
            day_number: activity.day_number,
            day_title: activity.day_title,
            activities: []
          };
        }
        acc[key].activities.push(activity);
        return acc;
      }, {});

      return ApiResponse.success(res, {
        message: 'Lấy danh sách hoạt động thành công',
        data: {
          activities,
          grouped_by_day: Object.values(groupedByDay)
        }
      });
    } catch (error) {
      console.error('Get activities by tour version error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách hoạt động',
        errors: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const activity = await ItineraryActivity.getById(id);

      if (!activity) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy hoạt động',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'Lấy chi tiết hoạt động thành công',
        data: { activity }
      });
    } catch (error) {
      console.error('Get activity error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy chi tiết hoạt động',
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

      const { itinerary_id, activity_order } = req.body;

      const exists = await ItineraryActivity.isActivityOrderExists(
        itinerary_id,
        activity_order
      );
      if (exists) {
        return ApiResponse.error(res, {
          message: `Thứ tự hoạt động ${activity_order} đã tồn tại`,
          statusCode: 400
        });
      }

      const activityId = await ItineraryActivity.create(req.body);
      const newActivity = await ItineraryActivity.getById(activityId);

      return ApiResponse.success(res, {
        message: 'Tạo hoạt động thành công',
        data: { activity: newActivity },
        statusCode: 201
      });
    } catch (error) {
      console.error('Create activity error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi tạo hoạt động',
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

      const existingActivity = await ItineraryActivity.getById(id);
      if (!existingActivity) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy hoạt động',
          statusCode: 404
        });
      }

      // Kiểm tra activity_order nếu có thay đổi
      const { activity_order } = req.body;
      if (activity_order && activity_order !== existingActivity.activity_order) {
        const exists = await ItineraryActivity.isActivityOrderExists(
          existingActivity.itinerary_id,
          activity_order,
          id
        );
        if (exists) {
          return ApiResponse.error(res, {
            message: `Thứ tự hoạt động ${activity_order} đã tồn tại`,
            statusCode: 400
          });
        }
      }

      const updatedActivity = await ItineraryActivity.update(id, req.body);

      return ApiResponse.success(res, {
        message: 'Cập nhật hoạt động thành công',
        data: { activity: updatedActivity }
      });
    } catch (error) {
      console.error('Update activity error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật hoạt động',
        errors: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const activity = await ItineraryActivity.getById(id);
      if (!activity) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy hoạt động',
          statusCode: 404
        });
      }

      await ItineraryActivity.delete(id);

      return ApiResponse.success(res, {
        message: 'Xóa hoạt động thành công'
      });
    } catch (error) {
      console.error('Delete activity error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xóa hoạt động',
        errors: error.message
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

      const validStatuses = ['not_started', 'in_progress', 'closed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ApiResponse.error(res, {
          message: 'Trạng thái không hợp lệ. Cho phép: not_started, in_progress, closed, cancelled',
          statusCode: 400
        });
      }

      const activity = await ItineraryActivity.updateStatus(id, status);

      return ApiResponse.success(res, {
        message: 'Cập nhật trạng thái hoạt động thành công',
        data: { activity }
      });
    } catch (error) {
      console.error('Update activity status error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật trạng thái',
        errors: error.message
      });
    }
  }

  static async autoUpdateStatus(req, res) {
    try {
      const { departureId } = req.params;

      await ItineraryActivity.autoUpdateActivityStatus(departureId);

      return ApiResponse.success(res, {
        message: 'Cập nhật trạng thái tự động thành công'
      });
    } catch (error) {
      console.error('Auto update status error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật trạng thái tự động',
        errors: error.message
      });
    }
  }

  static async getByDepartureDate(req, res) {
    try {
      const { departureId } = req.params;
      const { date } = req.query;

      if (!date) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp ngày',
          statusCode: 400
        });
      }

      const activities = await ItineraryActivity.getActivitiesByDepartureDate(
        departureId,
        date
      );

      return ApiResponse.success(res, {
        message: 'Lấy danh sách hoạt động theo ngày thành công',
        data: { 
          date,
          activities 
        }
      });
    } catch (error) {
      console.error('Get activities by date error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách hoạt động',
        errors: error.message
      });
    }
  }
}

module.exports = ItineraryActivityController;