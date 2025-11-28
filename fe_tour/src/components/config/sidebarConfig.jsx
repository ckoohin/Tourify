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
    permissions: ['categories.manage'], // Yêu cầu quyền này
    children: [] 
  },
  {
    label: 'Quản lý Tour',
    icon: Map,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['tours.view', 'tours.manage'], // Có quyền xem hoặc quản lý đều thấy
    children: [
      { label: 'Thông tin chi tiết tour', path: '/tours', permissions: ['tours.view'] },
      { label: 'Quản lý phiên bản tour', path: '/admin/tour-versions', permissions: ['tour_versions.manage'] },
      { label: 'Tạo nhanh báo giá', path: '/admin/quotes/create', permissions: ['quotes.create'] },
      { label: 'Mã QR & Link đặt tour', path: '/admin/tours/qr', permissions: ['tours.share'] }
    ]
  },
  {
    label: 'Lịch khởi hành & Vận hành',
    icon: CalendarDays,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['schedules.manage', 'assignments.manage', 'departures.checkin'],
    children: [
      { label: 'Quản lý lịch & điểm đón', path: '/schedules', permissions: ['schedules.manage'] },
      { label: 'Phân bổ nhân sự & dịch vụ', path: '/admin/assignments', permissions: ['assignments.manage'] },
      { label: 'Danh sách đoàn & Check-in', path: '/admin/departures/checkin', permissions: ['departures.checkin'] },
      { label: 'Phân phòng khách sạn', path: '/admin/departures/rooms', permissions: ['departures.rooms'] },
      { label: 'Theo dõi chi phí thực tế', path: '/admin/departures/costs', permissions: ['departures.costs'] }
    ]
  },
  {
    label: 'Quản lý Booking',
    icon: Ticket,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['bookings.create', 'bookings.manage'],
    children: [
      { label: 'Tạo booking mới', path: '/bookings/create', permissions: ['bookings.create'] },
      { label: 'Quản lý tình trạng booking', path: '/bookings', permissions: ['bookings.manage'] },
      { label: 'Xuất Báo giá/Hợp đồng', path: '/admin/bookings/documents', permissions: ['bookings.documents'] }
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
    allowedRoles: [ROLES.ADMIN],
    permissions: ['finance.transactions', 'finance.debts'],
    children: [
      { label: 'Theo dõi thu - chi', path: '/admin/finance/transactions', permissions: ['finance.transactions'] },
      { label: 'Công nợ phải thu/trả', path: '/admin/finance/debts', permissions: ['finance.debts'] },
      { label: 'Lịch sử thanh toán', path: '/admin/finance/payments', permissions: ['finance.payments'] },
      { label: 'Báo cáo lãi lỗ', path: '/admin/finance/pnl', permissions: ['finance.pnl'] }
    ]
  },
  {
    label: 'Quản lý Nhân sự',
    icon: UserCog,
    allowedRoles: [ROLES.ADMIN],
    permissions: ['staff.manage', 'staff.schedules'],
    children: [
      { label: 'Quản lý hồ sơ nhân sự', path: '/staff', permissions: ['staff.manage'] },
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
      { label: 'Đánh giá chất lượng', path: '/admin/suppliers/ratings', permissions: ['suppliers.ratings'] },
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
      { label: 'Lịch làm việc phân công', path: '/guide/my-schedule', permissions: ['guide.schedule'] },
      { label: 'Chi tiết tour sắp dẫn', path: '/guide/my-tours', permissions: ['guide.tours'] }
    ]
  },
  {
    label: 'Quản lý Khách đoàn',
    icon: Users,
    allowedRoles: [ROLES.GUIDE],
    permissions: ['guide.guests'],
    children: [
      { label: 'Danh sách khách', path: '/guide/guests', permissions: ['guide.guests'] },
      { label: 'Xem yêu cầu đặc biệt', path: '/guide/guests/requests', permissions: ['guide.guest_requests'] },
      { label: 'Xác nhận Check-in', path: '/guide/guests/checkin', permissions: ['guide.checkin'] }
    ]
  },
  {
    label: 'Quản lý Nhật ký Tour',
    icon: FileText,
    allowedRoles: [ROLES.GUIDE],
    permissions: ['guide.daily_log', 'guide.incidents'],
    children: [
      { label: 'Cập nhật diễn biến ngày', path: '/guide/logs/daily', permissions: ['guide.daily_log'] },
      { label: 'Ghi nhận sự cố & xử lý', path: '/guide/logs/incidents', permissions: ['guide.incidents'] },
      { label: 'Ghi nhận phản hồi khách', path: '/guide/logs/feedbacks', permissions: ['guide.feedbacks'] },
      { label: 'Tải lên hình ảnh thực tế', path: '/guide/logs/gallery', permissions: ['guide.gallery'] }
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
    label: 'Dịch vụ & Báo giá',
    icon: Briefcase,
    allowedRoles: [ROLES.SUPPLIER],
    permissions: ['supplier.quotes', 'supplier.services'],
    children: [
      { label: 'Gửi báo giá', path: '/supplier/quotes', permissions: ['supplier.quotes'] },
      { label: 'Cập nhật dịch vụ', path: '/supplier/services', permissions: ['supplier.services'] },
      { label: 'Xác nhận booking', path: '/supplier/bookings', permissions: ['supplier.bookings'] }
    ]
  },
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
  {
    label: 'Quản lý công nợ - thanh toán',
    icon: Wallet,
    allowedRoles: [ROLES.SUPPLIER],
    permissions: ['supplier.debts'],
    children: [
      { label: 'Xem công nợ hiện tại', path: '/supplier/debts', permissions: ['supplier.debts'] },
      { label: 'Xem lịch sử thanh toán', path: '/supplier/payment-history', permissions: ['supplier.payment_history'] },
      { label: 'Gửi xác nhận thanh toán', path: '/supplier/payment-confirm', permissions: ['supplier.payment_confirm'] }
    ]
  }
];