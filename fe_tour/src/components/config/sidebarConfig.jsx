import {
  LayoutDashboard,
  Map,
  CalendarDays,
  Users,
  Ticket,
  Wallet,
  UserCog,
  Building2,
  BarChart3,
  FileText,
  CheckSquare,
  Briefcase,
  Star,
  List,
  FileCheck,
  Shield
} from 'lucide-react';

export const ROLES = {
  ADMIN: 'admin',
  GUIDE: 'guide',
  SUPPLIER: 'supplier'
};

export const SIDEBAR_CONFIG = [
  // =================================================================
  // 1. VAI TRÒ: ADMIN (ĐIỀU HÀNH TOUR)
  // =================================================================
  {
    label: 'Quản lý Danh mục Tour',
    icon: List,
    path: '/categories',
    allowedRoles: [ROLES.ADMIN],
    permissions: ['categories.manage'], 
    children: [] 
  },
  {
    label: 'Quản lý Tour',
    icon: Map,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['tours.view', 'tours.manage', 'toursVersion.manage', 'quotes.manage'], 
    children: [
      { label: 'Thông tin chi tiết tour', path: '/tours', permissions: ['tours.view'] },
      { label: 'Quản lý phiên bản tour', path: '/tour-versions', permissions: ['toursVersion.manage'] },
      { label: 'Tạo nhanh báo giá', path: '/quotes', permissions: ['quotes.manage'] },
    ]
  },
  {
    label: 'Lịch khởi hành & Vận hành',
    icon: CalendarDays,
    allowedRoles: [ROLES.ADMIN],
    path: '/departures',
    permissions: ['schedules.manage', 'assignments.manage', 'departures.checkin'],
    children: []
  },
  {
    label: 'Quản lý Booking',
    icon: Ticket,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['bookings.create', 'booking.manage', 'bookingStatus.manage'],
    children: [
      { label: 'Quản lý booking', path: '/bookings', permissions: ['booking.manage'] },
      { label: 'Quản lý lịch sử trạng thái booking', path: '/booking-kanban', permissions: ['bookingStatus.manage'] },
    ]
  },
  {
    label: 'Quản lý Khách hàng',
    icon: Users,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['customer.manage', 'customers.history'],
    children: [
      { label: 'Danh sách khách hàng', path: '/customers', permissions: ['customer.manage'] },
      { label: 'Lịch sử giao dịch nội bộ', path: '/customers/transactions', permissions: ['customers.history'] },     
      { label: 'Ghi nhận yêu cầu đặc biệt', path: '/admin/customers/requests', permissions: ['customers.requests'] }
    ]
  },
  {
    label: 'Tài chính & Công nợ',
    icon: Wallet,
    path: '/finance/transactions',
    allowedRoles: [ROLES.ADMIN],
    permissions: ['finance.transactions', 'finance.debts', 'finance.payments'],
    children: []
  },
  {
    label: 'Quản lý Nhân sự',
    icon: UserCog,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['staff.manage', 'staff.schedules'],
    children: [
      { label: 'Quản lý hồ sơ nhân sự', path: '/staff', permissions: ['staff.manage'] },
      { label: 'Lịch làm việc phân công', path: '/operations/staff-allocation', permissions: ['guide.schedule'] },
      { label: 'Lịch làm việc & Phân công', path: '/admin/staff/schedules', permissions: ['staff.schedules'] }
    ]
  },
  {
    label: 'Quản lý Nhà cung cấp',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['suppliers.manage'],
    children: [
      { label: 'Danh sách đối tác', path: '/providers', permissions: ['suppliers.manage'] },
      { label: 'Đánh giá chất lượng', path: '/operations/supplier-ratings', permissions: ['suppliers.ratings'] },
      { label: 'Quản lý hợp đồng', path: '/admin/suppliers/contracts', permissions: ['suppliers.contracts'] }
    ]
  },
  {
    label: 'Báo cáo thống kê',
    icon: BarChart3,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['reports.dashboard', 'reports.detail'],
    children: [
      { label: 'Dashboard tổng quan', path: '/dashboard', permissions: ['reports.dashboard'] },
      { label: 'Báo cáo chi tiết', path: '/reports', permissions: ['reports.detail'] },
      { label: 'Tỷ lệ chuyển đổi booking', path: '/admin/reports/conversion', permissions: ['reports.conversion'] }
    ]
  },
  {
    label: 'Hệ thống & Phân quyền',
    icon: Shield,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['roles.view', 'permissions.view'],
    children: [
      { label: 'Vai trò & Quyền hạn', path: '/admin/roles', permissions: ['roles.view'] }
    ]
  },

  // =================================================================
  // 2. VAI TRÒ: HƯỚNG DẪN VIÊN (GUIDE)
  // =================================================================
  {
    label: 'Quản lý Lịch trình cá nhân',
    icon: CalendarDays,
    allowedRoles: [ROLES.GUIDE],
    permissions: ['guide.schedule', 'guide.tours'],
    children: [
      
      { label: 'Chi tiết tour sắp dẫn', path: '/guide/my-tours', permissions: ['guide.tours'] }
    ]
  },
  {
    label: 'Đánh giá',
    icon: Star,
    allowedRoles: [ROLES.GUIDE],
    permissions: ['guide.ratings'],
    children: [
      { label: 'Gửi đánh giá dịch vụ', path: '/guide/ratings/create', permissions: ['guide.ratings'] }
    ]
  },

  // =================================================================
  // 3. VAI TRÒ: NHÀ CUNG CẤP (SUPPLIER)
  // =================================================================
  {
    label: 'Quản lý hợp đồng',
    icon: FileCheck,
    allowedRoles: [ROLES.SUPPLIER],
    permissions: ['supplier.contracts'],
    children: [
      { label: 'Xem hợp đồng', path: '/supplier/contracts', permissions: ['supplier.contracts'] },
      { label: 'Gửi hồ sơ liên quan (hóa đơn)', path: '/supplier/documents', permissions: ['supplier.documents'] }
    ]
  },
];