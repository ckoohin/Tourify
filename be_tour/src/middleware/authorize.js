const ApiResponse = require('../utils/apiResponse');
const { query } = require('../config/db');

const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return ApiResponse.error(res, { message: 'Vui lòng đăng nhập', statusCode: 401 });
      }

      const userId = req.user.id;

      const permissions = await query(`
        SELECT DISTINCT p.slug
        FROM permissions p
        INNER JOIN permission_role pr ON p.id = pr.permission_id
        INNER JOIN roles r ON r.id = pr.role_id
        INNER JOIN users u ON u.role_id = r.id
        WHERE u.id = ?
      `, [userId]);

      const userPermissions = permissions.map(p => p.slug);

      console.log('DEBUG userPermissions:', userPermissions);
      console.log('DEBUG requiredPermissions:', requiredPermissions);

      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return ApiResponse.error(res, {
          message: 'Bạn không có quyền thực hiện thao tác này',
          statusCode: 403
        });
      }

      req.userPermissions = userPermissions;

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return ApiResponse.error(res, { message: 'Lỗi kiểm tra quyền', statusCode: 500, errors: error.message });
    }
  };
};

module.exports = { authorize };
