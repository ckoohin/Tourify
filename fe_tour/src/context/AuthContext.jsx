import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth/authService';
import permissionService from '../services/api/permissionService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Hàm lấy quyền mới nhất từ Server
  const fetchUserPermissions = async (roleId) => {
    try {
      if (!roleId) return;
      const res = await permissionService.getPermissionsByRole(roleId);
      
      if (res.success && res.data?.permissions && Array.isArray(res.data.permissions)) {
        const perms = res.data.permissions.map(p => p.slug);
        console.log("Danh sách quyền thực tế:", perms);
        setPermissions(perms);
        localStorage.setItem('user_permissions', JSON.stringify(perms));
      } else {
        setPermissions([]);
        localStorage.removeItem('user_permissions');
      }
    } catch (error) {
      console.error("Lỗi lấy quyền:", error);
      setPermissions([]);
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
             if (cachedPerms) {
                setPermissions(JSON.parse(cachedPerms));
             }
             // Luôn fetch lại để đảm bảo đồng bộ mới nhất
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
    authService.logout(); 
    
    // 2. Xóa state user về null NGAY LẬP TỨC
    setUser(null); 
    
    // 3. Xóa sạch localStorage để tránh lưu cache user cũ
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Nếu bạn có lưu token riêng
    localStorage.clear(); // Biện pháp mạnh nhất: Xóa tất cả

  };

  // --- CHECK QUYỀN (PERMISSION-FIRST) ---
  const hasPermission = (requiredPerms) => {
    // 1. Menu Public -> Cho qua
    if (!requiredPerms || requiredPerms.length === 0) return true; 
    
    // 2. Chưa tải được quyền -> Chặn
    if (!permissions || permissions.length === 0) return false;
    
    // 3. Logic OR: Chỉ cần có 1 trong các quyền yêu cầu là được phép
    return requiredPerms.some(perm => permissions.includes(perm));
  };

  const getUserRole = () => {
    if (!user) return 'guest';
    
    if (user.role && user.role.slug) {
      return user.role.slug;
    }

    if (user.role_slug) {
      return user.role_slug;
    }

    if (typeof user.role === 'string') {
      return user.role;
    }

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