const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const TourDepartureController = require('../../controllers/tours/tourDepartureController');
const ServiceBookingController = require('../../controllers/bookings/serviceBookingController');
const TourExpenseController = require('../../controllers/tours/tourExpenseController');
const TourLogController = require('../../controllers/tours/tourLogController');

const tourDepartureValidators = {
  create: [
    body('tour_version_id').isInt().withMessage('Tour version ID không hợp lệ'),
    body('departure_date').isDate().withMessage('Ngày khởi hành không hợp lệ'),
    body('return_date').isDate().withMessage('Ngày kết thúc không hợp lệ'),
    body('max_guests').isInt({ min: 1 }).withMessage('Số khách tối đa không hợp lệ'),
    body('departure_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Thời gian khởi hành không hợp lệ'),
    body('min_guests').optional().isInt({ min: 1 }).withMessage('Số khách tối thiểu không hợp lệ')
  ],
  update: [
    body('departure_date').isDate().withMessage('Ngày khởi hành không hợp lệ'),
    body('return_date').isDate().withMessage('Ngày kết thúc không hợp lệ'),
    body('max_guests').isInt({ min: 1 }).withMessage('Số khách tối đa không hợp lệ'),
    body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
    body('departure_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Thời gian khởi hành không hợp lệ')
  ],
  assignRoom: [
    body('room_number').optional().isString().withMessage('Số phòng không hợp lệ'),
    body('room_type').optional().isString().withMessage('Loại phòng không hợp lệ'),
    body('roommate_id').optional().isInt().withMessage('ID bạn cùng phòng không hợp lệ')
  ]
};

router.get('/', 
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourDepartureController.getAll
);

router.get('/:id', 
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourDepartureController.getById
);

router.post('/',
  AuthMiddleware.authenticate,
  authorize('tours.create'),
  tourDepartureValidators.create,
  TourDepartureController.create
);

router.put('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  tourDepartureValidators.update,
  TourDepartureController.update
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete'),
  TourDepartureController.delete
);

router.patch('/:id/status',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  TourDepartureController.updateStatus
);

router.get('/:id/guests',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourDepartureController.getGuests
);

router.patch('/:id/guests/:guestId/check-in',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  TourDepartureController.checkInGuest
);

router.patch('/:id/guests/:guestId/assign-room',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  tourDepartureValidators.assignRoom,
  TourDepartureController.assignRoom
);

router.get('/:departureId/services',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ServiceBookingController.getByDepartureId
);

router.get('/:departureId/services/stats',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ServiceBookingController.getStats
);

router.get('/:departureId/expenses',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourExpenseController.getByDepartureId
);

router.get('/:departureId/expenses/compare-budget',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourExpenseController.compareWithBudget
);

router.get('/:departureId/logs',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourLogController.getByDepartureId
);

router.get('/:departureId/logs/by-date',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourLogController.getByDate
);

router.get('/:departureId/logs/incidents-feedback',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourLogController.getIncidentsAndFeedback
);

router.get('/:departureId/logs/stats',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourLogController.getStats
);

module.exports = router;