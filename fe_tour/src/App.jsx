import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import TourList from './pages/tour/TourList';
import TourDetail from './pages/tour/TourDetail';
import TourCreate from './pages/tour/TourCreate';
import BookingList from './pages/booking/BookingList';
import CustomerList from './pages/customer/CustomerList';
// ... import other pages

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Tour Management */}
            <Route path="/tours" element={<TourList />} />
            <Route path="/tours/create" element={<TourCreate />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/tours/:id/edit" element={<TourEdit />} />
            
            {/* Booking Management */}
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/create" element={<BookingCreate />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            
            {/* Customer Management */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            
            {/* Guide Management */}
            <Route path="/guides" element={<GuideList />} />
            
            {/* Provider Management */}
            <Route path="/providers" element={<ProviderList />} />
            
            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}

export default App;