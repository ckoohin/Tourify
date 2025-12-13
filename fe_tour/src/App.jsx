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
import BookingList from './pages/booking/BookingList';
import CustomerList from './pages/customer/CustomerList';
import StaffList from './pages/staff/StaffList';
import StaffCreate from './pages/staff/StaffCreate';
import StaffEdit from './pages/staff/StaffEdit';
import ProviderList from './pages/provider/ProviderList';
import ProviderCreate from './pages/provider/ProviderCreate';
import ProviderEdit from './pages/provider/ProviderEdit';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound.jsx';
import RBACPage from './pages/rbac/RBACPage';
import DashboardController from './pages/dashboard/DashboardController.jsx';
import TourVersionList from './pages/tour/TourVersionList';
import BookingKanban from './pages/booking/BookingKanban';
import QuoteList from './pages/quote/QuoteList';
import DepartureList from './pages/operation/DepartureList';
import DepartureDetail from './pages/operation/DepartureDetail';
import ServiceList from './components/operations/service/ServiceList.jsx';
import FinancialPage from './pages/financial/FinancialPage.jsx';
import FeedbackList from './pages/feedback/FeedbackList.jsx';
import Reports from './pages/reports/Reports.jsx';
import GuideTourManager from './pages/operation/tour-guide/GuideTourManager.jsx';
import DepartureDetailGuide from './pages/operation/tour-guide/DepartureDetailGuide.jsx';

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
            <Route path="/quotes" element={<QuoteList />} />

            {/* Tour_Version Management */}
            <Route path="/tour-versions" element={<TourVersionList />} />

            {/* Tour_Categories Management */}
            <Route path="/categories" element={<CategoryList />} />
            
            {/* Booking Management */}
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/booking-kanban" element={<BookingKanban />} />
            <Route path="/bookings-services" element={<ServiceList />} />
            

            <Route path="/departures" element={<DepartureList />} />
        
            <Route path="/departures/:id" element={<DepartureDetail />} />
        
            {/* Trang báo cáo chi phí riêng biệt */}
            
            {/* Customer Management */}
            <Route path="/customers" element={<CustomerList />} />
            
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
            <Route path="/finance/transactions" element={<FinancialPage />} />

            {/* Feedback */}
            <Route path="/feedbacks" element={<FeedbackList />} />

            <Route path="/departures_guide" element={<GuideTourManager />} />
            <Route  path="/my-assignments/:departureId" element={<DepartureDetailGuide />}/>


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