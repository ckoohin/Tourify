const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const ItineraryActivityController = require('../../controllers/tours/itineraryActivityController');

const activityValidation = [
  body('itinerary_id')
    .notEmpty()
    .withMessage('ID lịch trình không được để trống')
    .isInt()
    .withMessage('ID lịch trình phải là số'),
  
  body('activity_order')
    .notEmpty()
    .withMessage('Thứ tự không được để trống')
    .isInt({ min: 1 })
    .withMessage('Thứ tự phải là số nguyên dương'),
  
  body('activity_name')
    .notEmpty()
    .withMessage('Tên hoạt động không được để trống')
    .isLength({ max: 255 })
    .withMessage('Tên hoạt động tối đa 255 ký tự'),
  
  body('activity_type')
    .notEmpty()
    .withMessage('Loại hoạt động không được để trống')
    .isIn(['transportation', 'sightseeing', 'meal', 'accommodation', 'free_time', 'other'])
    .withMessage('Loại hoạt động không hợp lệ'),
  
  body('activity_status')
    .optional()
    .isIn(['not_started', 'in_progress', 'closed', 'cancelled'])
    .withMessage('Trạng thái hoạt động không hợp lệ'),
  
  body('start_time')
    .notEmpty()
    .withMessage('Thời gian bắt đầu không được để trống')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('Thời gian bắt đầu không hợp lệ'),
  
  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('Thời gian kết thúc không hợp lệ'),
  
  body('check_in_required')
    .optional()
    .isBoolean()
    .withMessage('Check-in required phải là boolean'),
  
  body('check_in_window_before')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Check-in window before phải là số nguyên không âm'),
  
  body('check_in_window_after')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Check-in window after phải là số nguyên không âm')
];

// Lấy danh sách hoạt động của một lịch trình
router.get(
  '/itinerary/:itineraryId',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ItineraryActivityController.getByItinerary
);

// Lấy danh sách hoạt động của một tour version
router.get(
  '/tour-version/:tourVersionId',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ItineraryActivityController.getByTourVersion
);

// Lấy chi tiết một hoạt động
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ItineraryActivityController.getById
);

// Tạo hoạt động mới
router.post(
  '/',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  activityValidation,
  ItineraryActivityController.create
);

// Cập nhật hoạt động
router.put(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  activityValidation,
  ItineraryActivityController.update
);

// Xóa hoạt động
router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete'),
  ItineraryActivityController.delete
);

// Cập nhật trạng thái hoạt động
router.patch(
  '/:id/status',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  ItineraryActivityController.updateStatus
);

// Tự động cập nhật trạng thái tất cả hoạt động của departure
router.post(
  '/departures/:departureId/auto-update-status',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  ItineraryActivityController.autoUpdateStatus
);

// Lấy hoạt động theo ngày của departure
router.get(
  '/departures/:departureId/by-date',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ItineraryActivityController.getByDepartureDate
);

module.exports = router;