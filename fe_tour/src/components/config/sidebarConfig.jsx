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
    label: 'Dashboard tổng quan',
    icon: BarChart3,
    allowedRoles: [ROLES.ADMIN],
    path: '/dashboard',
    permissions: ['reports.dashboard'],
    children: []
  },
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
    path: '/customers',
    allowedRoles: [ROLES.ADMIN],
    permissions: ['customer.manage', 'customers.history'],
    children: [
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
    path: '/staff',
    allowedRoles: [ROLES.ADMIN],
    permissions: ['staff.manage', 'staff.schedules'],
    children: [
    ]
  },
  {
    label: 'Quản lý Nhà cung cấp',
    icon: Building2,
    path: '/providers',
    allowedRoles: [ROLES.ADMIN],
    permissions: ['suppliers.manage'],
    children: [
    ]
  },
  {
    label: 'Báo cáo thống kê',
    icon: BarChart3,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['reports.detail'],
    children: [
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
    label: 'Phản hồi & Đánh giá',
    icon: Star,
    allowedRoles: [ROLES.GUIDE],
    path: '/Feedbacks',
    permissions: ['guide.ratings'],
    children: []
  },

  // =================================================================
  // 3. VAI TRÒ: NHÀ CUNG CẤP (SUPPLIER)
  // =================================================================
];