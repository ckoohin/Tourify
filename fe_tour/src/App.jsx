import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TourCategoryList from './pages/tourCategory/TourCategoryList.jsx';
import TourList from './pages/tour/TourList';
import TourDetail from './pages/tour/TourDetail';
import TourCreate from './pages/tour/TourCreate';
import TourEdit from './pages/tour/TourEdit';
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
import GuideList from './pages/guide/GuideList';
import StaffCreate from './pages/guide/StaffCreate';
import StaffEdit from './pages/guide/StaffEdit';
import StaffDetail from './pages/guide/StaffDetail';
import ProviderList from './pages/provider/ProviderList';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound.jsx';
import TourCategories from './pages/tourCategory/TourCategories';
import Staff from './pages/staff/Staff';
import SupplierManagement from './pages/suppliers/Suppliers.jsx';

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
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Tour Category Management */}
            <Route
            path="/tour-categories"
            element={
              <ProtectedRoute>
                <TourCategories />
              </ProtectedRoute>
            }
          />

            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier"
              element={
                <ProtectedRoute>
                  <SupplierManagement />
                </ProtectedRoute>
              }
            />

            {/* Tour Management */}
            <Route path="/tours" element={<TourList />} />
            <Route path="/tours/create" element={<TourCreate />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/tours/:id/edit" element={<TourEdit />} />

            {/* Schedule Management*/}
            <Route path="/schedules" element={<SchedulePage />} />
            <Route path="/schedules/create" element={<ScheduleCreate />} />
            <Route path="/schedules/:id" element={<ScheduleDetail />} />

            {/* Attraction Management*/}
            <Route path="/attractions" element={<TourList />} />
            <Route path="/attractions/create" element={<TourCreate />} />
            <Route path="/attractions/:id" element={<TourDetail />} />
            <Route path="/attractions/:id/edit" element={<TourEdit />} />
            
            {/* Booking Management */}
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/create" element={<BookingCreate />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            
            {/* Customer Management */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            
            {/* Guide Management */}
            <Route path="/guides" element={<GuideList />} />
            <Route path="/guides/create" element={<StaffCreate />} />
            <Route path="/guides/edit/:id" element={<StaffEdit />} />
            <Route path="/guides/:id" element={<StaffDetail />} />
            
            {/* Provider Management */}
            <Route path="/providers" element={<ProviderList />} />
            
            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Trang không tồn tại</p>
                  <a
                    href="/dashboard"
                    className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Về trang chủ
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
        </AuthProvider>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}

export default App;