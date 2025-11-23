const { query } = require('../../config/db');

class PermissionRoleModel {
  static async assignPermissions(roleId, permissionIds) {
    if (!permissionIds || permissionIds.length === 0) return 0;

    const values = permissionIds.map(permissionId => [permissionId, roleId]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flattenedValues = values.flat();

    const sql = `INSERT IGNORE INTO permission_role (permission_id, role_id) VALUES ${placeholders}`;
    const result = await query(sql, flattenedValues);

    return result.affectedRows;
  }

  static async revokePermissions(roleId, permissionIds) {
    if (!permissionIds || permissionIds.length === 0) return 0;

    const placeholders = permissionIds.map(() => '?').join(', ');
    const sql = `DELETE FROM permission_role WHERE role_id = ? AND permission_id IN (${placeholders})`;
    const result = await query(sql, [roleId, ...permissionIds]);

    return result.affectedRows;
  }

  static async getRolePermissions(roleId) {
    const sql = `
      SELECT p.* 
      FROM permissions p
      INNER JOIN permission_role pr ON p.id = pr.permission_id
      WHERE pr.role_id = ?
      ORDER BY p.name ASC
    `;
    const permissions = await query(sql, [roleId]);
    return permissions;
  }

  static async checkPermissionsExist(roleId, permissionIds) {
    if (!permissionIds || permissionIds.length === 0) return [];

    const placeholders = permissionIds.map(() => '?').join(',');
    const sql = `
      SELECT permission_id 
      FROM permission_role 
      WHERE role_id = ? AND permission_id IN (${placeholders})
    `;
    const rows = await query(sql, [roleId, ...permissionIds]);
    return rows.map(row => row.permission_id);
  }
}

module.exports = PermissionRoleModel;