import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth/authService';
import permissionService from '../services/api/permissionService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchUserPermissions = async (roleId) => {
    try {
      if (!roleId) return;
      const res = await permissionService.getPermissionsByRole(roleId);
      
      if (res.success && res.data) {
        const { role, permissions: permsData } = res.data;

        if (Array.isArray(permsData)) {
          const perms = permsData.map(p => p.slug);
          setPermissions(perms);
          localStorage.setItem('user_permissions', JSON.stringify(perms));
        }
        if (role && role.slug) {
          setUser(prev => ({ ...prev, role: role, role_slug: role.slug }));
        }
      }
    } catch (error) {
      console.error("Lỗi lấy quyền:", error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          
          if (currentUser?.role_id) {
             const cachedPerms = localStorage.getItem('user_permissions');
             if (cachedPerms) setPermissions(JSON.parse(cachedPerms));
             await fetchUserPermissions(currentUser.role_id);
          }
        }
      } catch (error) {
        console.error('Load user error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    localStorage.removeItem('current_role_slug');
    localStorage.removeItem('user_permissions');

    const response = await authService.login(email, password);
    if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        if (userData?.role_id) {
            await fetchUserPermissions(userData.role_id);
        }
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
    localStorage.clear();
  };

  const hasPermission = (requiredPerms) => {
    if (!requiredPerms || requiredPerms.length === 0) return true; 
    if (!permissions || permissions.length === 0) return false;
    return requiredPerms.some(perm => permissions.includes(perm));
  };
  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.role && user.role.slug) return user.role.slug;
    if (user.role_slug) return user.role_slug;

    const roleMap = {
      1: 'admin',
      4: 'guide',
      6: 'supplier'
    };
    
    const mappedRole = roleMap[user.role_id];
    if (mappedRole) return mappedRole;

    return 'guest';
  };

  const refreshPermissions = async () => {
    if (user?.role_id) {
      await fetchUserPermissions(user.role_id);
    }
  };

  const value = {
    user,
    permissions,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    getUserRole,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;