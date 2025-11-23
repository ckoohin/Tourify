const { body, param, query } = require('express-validator');

const permissionValidator = {
  create: [
    body('slug')
      .trim()
      .notEmpty().withMessage('Tên quyền không được để trống')
      .isLength({ min: 3, max: 100 }).withMessage('Tên quyền phải từ 3-100 ký tự')
      .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Tên quyền chỉ chứa chữ, số, dấu chấm, gạch dưới và gạch ngang'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không quá 500 ký tự')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID không hợp lệ'),
    body('slug')
      .optional()
      .trim()
      .notEmpty().withMessage('Tên quyền không được để trống')
      .isLength({ min: 3, max: 100 }).withMessage('Tên quyền phải từ 3-100 ký tự')
      .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Tên quyền chỉ chứa chữ, số, dấu chấm, gạch dưới và gạch ngang'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không quá 500 ký tự')
  ],

  delete: [
    param('id').isInt({ min: 1 }).withMessage('ID không hợp lệ')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('ID không hợp lệ')
  ],

  getAll: [
    query('page').optional().isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Từ khóa tìm kiếm quá dài')
  ]
};

module.exports = permissionValidator;