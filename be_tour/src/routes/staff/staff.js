const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const staffController = require('../../controllers/staff/staffController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');
const StaffAssignmentController = require('../../controllers/staff/staffAssignmentController');
const AuthMiddleware = require('../../middleware/authMiddleware');

router.get(
  '/',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.getAll
);

router.get(
  '/available',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.findAvailable
);

router.get(
  '/type/:type',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.getByType
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.getById
);

router.get(
  '/:id/stats',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.getStats
);

router.get(
  '/:id/schedule',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.getSchedule
);

router.get(
  '/:id/availability',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  staffController.checkAvailability
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('staff_code')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Mã nhân viên tối đa 50 ký tự'),
    body('staff_type')
      .notEmpty().withMessage('Loại nhân viên không được để trống')
      .isIn(['tour_guide', 'tour_leader', 'driver', 'coordinator', 'other'])
      .withMessage('Loại nhân viên không hợp lệ'),
    body('full_name')
      .trim()
      .notEmpty().withMessage('Họ tên không được để trống')
      .isLength({ max: 255 }).withMessage('Họ tên tối đa 255 ký tự'),
    body('phone')
      .trim()
      .notEmpty().withMessage('Số điện thoại không được để trống')
      .matches(/^[0-9]{10}$/).withMessage('Số điện thoại không hợp lệ'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email không hợp lệ'),
    body('birthday')
      .optional()
      .isDate().withMessage('Ngày sinh không hợp lệ'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
    body('languages')
      .optional()
      .isArray().withMessage('Ngôn ngữ phải là mảng'),
    body('certifications')
      .optional()
      .isArray().withMessage('Chứng chỉ phải là mảng'),
    body('specializations')
      .optional()
      .isArray().withMessage('Chuyên môn phải là mảng'),
    body('experience_years')
      .optional()
      .isInt({ min: 0 }).withMessage('Số năm kinh nghiệm phải >= 0'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'on_leave']).withMessage('Trạng thái không hợp lệ')
  ],
  staffController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('staff_code')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Mã nhân viên tối đa 50 ký tự'),
    body('staff_type')
      .optional()
      .isIn(['tour_guide', 'tour_leader', 'driver', 'coordinator', 'other'])
      .withMessage('Loại nhân viên không hợp lệ'),
    body('full_name')
      .optional()
      .trim()
      .notEmpty().withMessage('Họ tên không được để trống')
      .isLength({ max: 255 }).withMessage('Họ tên tối đa 255 ký tự'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/).withMessage('Số điện thoại không hợp lệ'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email không hợp lệ'),
    body('birthday')
      .optional()
      .isDate().withMessage('Ngày sinh không hợp lệ'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
    body('languages')
      .optional()
      .isArray().withMessage('Ngôn ngữ phải là mảng'),
    body('certifications')
      .optional()
      .isArray().withMessage('Chứng chỉ phải là mảng'),
    body('specializations')
      .optional()
      .isArray().withMessage('Chuyên môn phải là mảng'),
    body('experience_years')
      .optional()
      .isInt({ min: 0 }).withMessage('Số năm kinh nghiệm phải >= 0'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'on_leave']).withMessage('Trạng thái không hợp lệ')
  ],
  staffController.update
);

router.post(
  '/:id/schedule',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('schedule_date')
      .notEmpty().withMessage('Ngày không được để trống')
      .isDate().withMessage('Ngày không hợp lệ'),
    body('schedule_type')
      .notEmpty().withMessage('Loại lịch không được để trống')
      .isIn(['available', 'busy', 'day_off', 'sick_leave', 'annual_leave'])
      .withMessage('Loại lịch không hợp lệ'),
    body('start_time')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu không hợp lệ'),
    body('end_time')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc không hợp lệ')
  ],
  staffController.addSchedule
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  staffController.delete
);

router.get('/:staffId/schedule',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  StaffAssignmentController.getStaffSchedule
);

router.get('/:staffId/availability',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  StaffAssignmentController.checkAvailability
);

module.exports = router;