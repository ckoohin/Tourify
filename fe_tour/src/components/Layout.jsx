// fe_tour/src/components/Layout.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Danh mục Tour', path: '/tour-categories', icon: '📋' },
    { name: 'Nhân sự', path: '/staff', icon: '👥' },
    { name: 'Nhà cung cấp', path: '/supplier', icon: '👥' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
                Tour Management
              </Link>
              
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <nav className="flex overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium ${
                isActive(item.path)
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;