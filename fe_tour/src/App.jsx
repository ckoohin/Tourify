import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Sidebar from './components/layout/Sidebar.jsx';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TourList from './pages/tour/TourList';
import TourDetail from './pages/tour/TourDetail';
import TourCreate from './pages/tour/TourCreate';
import TourEdit from './pages/tour/TourEdit';
import CategoryList from './pages/categories/CategoryList';
import SchedulePage from './pages/schedule/SchedulePage.jsx';
import ScheduleDetail from './pages/schedule/ScheduleDetail.jsx';
import ScheduleCreate from './pages/schedule/ScheduleCreate.jsx';
import AttractionList from './pages/attraction/AttractionList.jsx';
import AttractionCreate from './pages/attraction/AttractionCreate.jsx';
import AttractionDetail from './pages/attraction/AttractionDetail.jsx';
import AttractionEdit from './pages/attraction/AttractionEdit.jsx';
import BookingList from './pages/booking/BookingList';
import BookingCreate from './pages/booking/BookingCreate';
import BookingDetail from './pages/booking/BookingDetail';
import CustomerList from './pages/customer/CustomerList';
import CustomerDetail from './pages/customer/CustomerDetail';
import StaffList from './pages/staff/StaffList';
import StaffCreate from './pages/staff/StaffCreate';
import StaffEdit from './pages/staff/StaffEdit';
import ProviderList from './pages/provider/ProviderList';
import ProviderCreate from './pages/provider/ProviderCreate';
import ProviderEdit from './pages/provider/ProviderEdit';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound.jsx';
import RBACPage from './pages/rbac/RBACPage';
import DashboardController from './pages/dashboard/DashboardController.jsx';
import TourVersionList from './pages/tour/TourVersionList';


// ... import other pages

function App() {
  return (
    <>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardController />} />
            
            {/* Tour Management */}
            <Route path="/tours" element={<TourList />} />
            <Route path="/tours/create" element={<TourCreate />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/tours/:id/edit" element={<TourEdit />} />

            {/* Tour_Version Management */}
            <Route path="/tour-versions" element={<TourVersionList />} />

            {/* Tour_Categories Management */}
            <Route path="/categories" element={<CategoryList />} />
            
            {/* Booking Management */}
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/create" element={<BookingCreate />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            
            {/* Customer Management */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            
            {/* Staff Management */}
            <Route path="/staff" element={<StaffList />} />  
            <Route path="/staff/create" element={<StaffCreate />} />
            <Route path="/staff/edit/:id" element={<StaffEdit />} />     
            <Route path="/admin/roles" element={<RBACPage />} />
            <Route path="/admin/permissions" element={<RBACPage />} />
            
            {/* Provider Management */}
            <Route path="/providers" element={<ProviderList />} />
            <Route path="/providers/create" element={<ProviderCreate />} />
            <Route path="/providers/:id/edit" element={<ProviderEdit />} />
            
            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        </AuthProvider>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}

export default App;