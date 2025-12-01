import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Sửa lại đường dẫn import nếu cần
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để truy cập trang này!", {
        id: 'auth-required', 
        icon: '🔒',
      });
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 1. Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền (Role)
  // Logic: Nếu route có yêu cầu allowedRoles VÀ user không có quyền đó -> Chặn
  // Lưu ý: Đảm bảo object 'user' từ AuthContext có chứa field 'role' là object hoặc string slug
  // Ví dụ structure mong đợi: user = { id: 1, name: '...', role: { slug: 'admin' } }
  
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleSlug = user?.role?.slug || user?.role; // Support cả object hoặc string

    if (!userRoleSlug || !allowedRoles.includes(userRoleSlug)) {
      // Có thể redirect về trang 403 hoặc trang chủ
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;