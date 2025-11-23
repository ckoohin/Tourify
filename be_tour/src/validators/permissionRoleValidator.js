const { body, param } = require('express-validator');

const permissionRoleValidator = {
  assign: [
    param('roleId').isInt({ min: 1 }).withMessage('Role ID không hợp lệ'),
    body('permissionIds')
      .isArray({ min: 1 }).withMessage('permissionIds phải là mảng và không được rỗng')
      .custom((value) => {
        if (!value.every(id => Number.isInteger(id) && id > 0)) {
          throw new Error('Tất cả permissionIds phải là số nguyên dương');
        }
        return true;
      })
  ],

  revoke: [
    param('roleId').isInt({ min: 1 }).withMessage('Role ID không hợp lệ'),
    body('permissionIds')
      .isArray({ min: 1 }).withMessage('permissionIds phải là mảng và không được rỗng')
      .custom((value) => {
        if (!value.every(id => Number.isInteger(id) && id > 0)) {
          throw new Error('Tất cả permissionIds phải là số nguyên dương');
        }
        return true;
      })
  ],

  getPermissions: [
    param('roleId').isInt({ min: 1 }).withMessage('Role ID không hợp lệ')
  ]
};

module.exports = permissionRoleValidator;