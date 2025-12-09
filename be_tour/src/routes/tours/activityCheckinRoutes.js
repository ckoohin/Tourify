const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const ActivityCheckinController = require('../../controllers/tours/activityCheckinController');

const bulkCheckinValidation = [
  body('guestIds')
    .isArray({ min: 1 })
    .withMessage('Danh sách khách phải là mảng và không rỗng'),
  body('guestIds.*')
    .isInt()
    .withMessage('ID khách phải là số nguyên')
];

const excuseValidation = [
  body('excuse_reason')
    .notEmpty()
    .withMessage('Lý do vắng mặt không được để trống')
    .isLength({ max: 500 })
    .withMessage('Lý do vắng mặt tối đa 500 ký tự')
];

// Khởi tạo check-in cho tất cả khách của một departure
router.post(
  '/departures/:departureId/initialize',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  ActivityCheckinController.initializeCheckins
);

// Lấy thống kê check-in của departure
router.get(
  '/departures/:departureId/stats',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getStats
);

// Lấy các hoạt động đang trong khung giờ check-in
router.get(
  '/departures/:departureId/active',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getActiveCheckins
);

// Lấy các hoạt động của ngày hôm nay (chỉ hiển thị hoạt động trong ngày)
router.get(
  '/departures/:departureId/today',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getTodayActivities
);

// Lấy danh sách check-in theo ngày
router.get(
  '/departures/:departureId/by-date',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getByDate
);

// Chạy auto processing (auto check-in và mark missed)
router.post(
  '/auto-process',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  ActivityCheckinController.runAutoProcessing
);

// Lấy danh sách check-in của một hoạt động
router.get(
  '/departures/:departureId/activities/:activityId',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getByActivity
);

// Check-in hàng loạt cho một hoạt động
router.post(
  '/departures/:departureId/activities/:activityId/bulk-checkin',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  bulkCheckinValidation,
  ActivityCheckinController.bulkCheckIn
);

// Lấy lịch sử check-in của một khách
router.get(
  '/guests/:guestId',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  ActivityCheckinController.getByGuest
);

// Check-in một khách cho một hoạt động
router.patch(
  '/checkins/:checkinId/check-in',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  ActivityCheckinController.checkInGuest
);

// Đánh dấu vắng mặt có phép
router.patch(
  '/checkins/:checkinId/excuse',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  excuseValidation,
  ActivityCheckinController.markExcused
);

module.exports = router;