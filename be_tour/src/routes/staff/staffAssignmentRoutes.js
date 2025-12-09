const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const StaffAssignmentController = require('../../controllers/staff/staffAssignmentController');

const staffAssignmentValidators = {
  create: [
    body('tour_departure_id').isInt().withMessage('Tour departure ID không hợp lệ'),
    body('staff_id').isInt().withMessage('Staff ID không hợp lệ'),
    body('role').isIn(['tour_leader', 'tour_guide', 'driver', 'assistant', 'coordinator']).withMessage('Vai trò không hợp lệ'),
    body('assignment_date').isDate().withMessage('Ngày phân công không hợp lệ')
  ],
  update: [
    body('role').isIn(['tour_leader', 'tour_guide', 'driver', 'assistant', 'coordinator']).withMessage('Vai trò không hợp lệ'),
    body('assignment_date').isDate().withMessage('Ngày phân công không hợp lệ')
  ]
};

router.post('/',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  staffAssignmentValidators.create,
  StaffAssignmentController.create
);

router.get('/',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  StaffAssignmentController.getAll
);

router.get('/my-assignments',
  AuthMiddleware.authenticate,
  authorize('guide.view'),
  StaffAssignmentController.getMyAssignments
);

router.get('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  StaffAssignmentController.getById
);

router.put('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  staffAssignmentValidators.update,
  StaffAssignmentController.update
);

router.patch('/:id/confirm',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  StaffAssignmentController.confirm
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete'),
  StaffAssignmentController.delete
);

router.get('/my-assignments/:departureId',
  AuthMiddleware.authenticate,
  authorize('guide.view'),
  StaffAssignmentController.getMyAssignmentDetail
);

router.get('/my-assignments/stats/summary',
  AuthMiddleware.authenticate,
  authorize('guide.view'),
  StaffAssignmentController.getMyStats
);

module.exports = router;