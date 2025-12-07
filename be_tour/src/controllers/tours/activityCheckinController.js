const { query } = require('../../config/db');
const GuestActivityCheckin = require('../../models/tours/GuestActivityCheckin');
const ItineraryActivity = require('../../models/tours/ItineraryActivity');
const ApiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');

class ActivityCheckinController {
  static async initializeCheckins(req, res) {
    try {
      const { departureId } = req.params;

      await GuestActivityCheckin.initializeCheckinsForDeparture(departureId);

      return ApiResponse.success(res, {
        message: 'Khởi tạo check-in thành công',
        statusCode: 201
      });
    } catch (error) {
      console.error('Initialize checkins error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi khởi tạo check-in',
        errors: error.message
      });
    }
  }

  static async checkInGuest(req, res) {
    try {
      const { checkinId } = req.params;
      const { location } = req.body;

      const result = await GuestActivityCheckin.checkInGuest(
        checkinId,
        req.user.id,
        'manual',
        location
      );

      if (!result) {
        return ApiResponse.error(res, {
          message: 'Không thể check-in (đã check-in hoặc không tồn tại)',
          statusCode: 400
        });
      }

      return ApiResponse.success(res, {
        message: 'Check-in thành công',
        data: result
      });
    } catch (error) {
      console.error('Check-in guest error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi check-in khách',
        errors: error.message
      });
    }
  }

  static async bulkCheckIn(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const { activityId, departureId } = req.params;
      const { guestIds } = req.body;

      if (!Array.isArray(guestIds) || guestIds.length === 0) {
        return ApiResponse.error(res, {
          message: 'Danh sách khách không hợp lệ',
          statusCode: 400
        });
      }

      await GuestActivityCheckin.bulkCheckIn(
        activityId,
        guestIds,
        req.user.id,
        'manual'
      );

      return ApiResponse.success(res, {
        message: `Đã check-in ${guestIds.length} khách thành công`
      });
    } catch (error) {
      console.error('Bulk check-in error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi check-in hàng loạt',
        errors: error.message
      });
    }
  }

  static async markExcused(req, res) {
    try {
      const { checkinId } = req.params;
      const { excuse_reason } = req.body;

      if (!excuse_reason) {
        return ApiResponse.error(res, {
          message: 'Vui lòng cung cấp lý do vắng mặt',
          statusCode: 400
        });
      }

      const result = await GuestActivityCheckin.markExcused(
        checkinId,
        excuse_reason
      );

      return ApiResponse.success(res, {
        message: 'Đã đánh dấu vắng mặt có phép',
        data: result
      });
    } catch (error) {
      console.error('Mark excused error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi đánh dấu vắng mặt',
        errors: error.message
      });
    }
  }

  static async getByActivity(req, res) {
    try {
      const { activityId, departureId } = req.params;

      const checkins = await GuestActivityCheckin.getByActivity(
        activityId,
        departureId
      );

      const stats = await GuestActivityCheckin.getStatsForActivity(
        activityId,
        departureId
      );

      return ApiResponse.success(res, {
        message: 'Lấy danh sách check-in thành công',
        data: {
          checkins,
          stats
        }
      });
    } catch (error) {
      console.error('Get checkins by activity error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách check-in',
        errors: error.message
      });
    }
  }

  static async getByGuest(req, res) {
    try {
      const { guestId } = req.params;

      const checkins = await GuestActivityCheckin.getByGuest(guestId);

      return ApiResponse.success(res, {
        message: 'Lấy lịch sử check-in thành công',
        data: { checkins }
      });
    } catch (error) {
      console.error('Get checkins by guest error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy lịch sử check-in',
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

      const checkins = await GuestActivityCheckin.getByDate(
        departureId,
        date
      );

      const groupedByActivity = checkins.reduce((acc, checkin) => {
        const key = checkin.itinerary_activity_id;
        if (!acc[key]) {
          acc[key] = {
            activity_id: checkin.itinerary_activity_id,
            activity_name: checkin.activity_name,
            activity_type: checkin.activity_type,
            location: checkin.location,
            start_time: checkin.start_time,
            end_time: checkin.end_time,
            checkins: []
          };
        }
        acc[key].checkins.push(checkin);
        return acc;
      }, {});

      return ApiResponse.success(res, {
        message: 'Lấy danh sách check-in theo ngày thành công',
        data: {
          date,
          activities: Object.values(groupedByActivity)
        }
      });
    } catch (error) {
      console.error('Get checkins by date error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách check-in',
        errors: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { departureId } = req.params;

      const stats = await GuestActivityCheckin.getStatsForDeparture(departureId);

      return ApiResponse.success(res, {
        message: 'Lấy thống kê thành công',
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy thống kê',
        errors: error.message
      });
    }
  }

  static async runAutoProcessing(req, res) {
    try {
      const autoChecked = await GuestActivityCheckin.autoCheckIn();
      const autoMissed = await GuestActivityCheckin.autoMarkMissed();

      return ApiResponse.success(res, {
        message: 'Xử lý tự động thành công',
        data: {
          auto_checked: autoChecked,
          auto_missed: autoMissed
        }
      });
    } catch (error) {
      console.error('Auto processing error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xử lý tự động',
        errors: error.message
      });
    }
  }

  static async getActiveCheckins(req, res) {
    try {
      const { departureId } = req.params;

      await ItineraryActivity.autoUpdateActivityStatus(departureId);

      const sql = `
        SELECT 
            ia.id as activity_id,
            ANY_VALUE(ia.activity_name) as activity_name,
            ANY_VALUE(ia.activity_type) as activity_type,
            ANY_VALUE(ia.activity_status) as activity_status,
            ANY_VALUE(ia.location) as location,
            ANY_VALUE(ia.start_time) as start_time,
            ANY_VALUE(ia.check_in_window_before) as check_in_window_before,
            ANY_VALUE(ia.check_in_window_after) as check_in_window_after,
            ANY_VALUE(ti.day_number) as day_number,
            ANY_VALUE(ti.title) as day_title,
            gac.activity_date,
            COUNT(*) as total_guests,
            SUM(CASE WHEN gac.check_in_status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN gac.check_in_status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
            TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(gac.activity_date, ' ', ANY_VALUE(ia.start_time))) as minutes_until_start
        FROM guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        INNER JOIN tour_itineraries ti ON gac.itinerary_id = ti.id
        WHERE gac.tour_departure_id = ?
            AND gac.check_in_status = 'pending'
            AND ia.activity_status IN ('not_started', 'in_progress')
            AND CONCAT(gac.activity_date, ' ', ia.start_time) 
                BETWEEN DATE_SUB(NOW(), INTERVAL ia.check_in_window_before MINUTE)
                AND DATE_ADD(NOW(), INTERVAL ia.check_in_window_after MINUTE)
        GROUP BY ia.id, gac.activity_date
        ORDER BY gac.activity_date ASC, ia.start_time ASC
        `;
      
      const activeActivities = await query(sql, [departureId]);

      return ApiResponse.success(res, {
        message: 'Lấy danh sách hoạt động đang check-in thành công',
        data: { activities: activeActivities }
      });
    } catch (error) {
      console.error('Get active checkins error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách hoạt động',
        errors: error.message
      });
    }
  }

  static async getTodayActivities(req, res) {
    try {
      const { departureId } = req.params;
      
      await ItineraryActivity.autoUpdateActivityStatus(departureId);
      
      const activities = await ItineraryActivity.getTodayCheckInableActivities(departureId);

      return ApiResponse.success(res, {
        message: 'Lấy danh sách hoạt động hôm nay thành công',
        data: { 
          date: new Date().toISOString().split('T')[0],
          activities 
        }
      });
    } catch (error) {
      console.error('Get today activities error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách hoạt động',
        errors: error.message
      });
    }
  }
}

module.exports = ActivityCheckinController;