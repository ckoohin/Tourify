import { 
  LayoutDashboard, Map, CalendarDays, ShoppingCart, 
  Users, Truck, Wallet, Settings, UserCog, ClipboardList, Bus, FileText
} from 'lucide-react';

// Danh sách quyền (Roles) định nghĩa ai được thấy gì
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  OPERATOR: 'operator',
  GUIDE: 'guide'
};

export const sidebarItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES, ROLES.OPERATOR] 
  },

  // 2. SẢN PHẨM (Dành cho Admin, Manager, Operator)
  {
    title: "Quản lý Tour",
    icon: <Map size={20} />,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR],
    children: [
      { title: "Danh sách Tour", path: "/tours" },
      { title: "Bảng giá & Version", path: "/tours/prices" },
      { title: "Danh mục Tour", path: "/tours/categories", roles: [ROLES.ADMIN] }, // Chỉ Admin sửa danh mục
    ]
  },

  // 3. KINH DOANH (Dành cho Sales, Manager)
  {
    title: "Kinh doanh",
    icon: <ShoppingCart size={20} />,
    roles: [ROLES.SALES, ROLES.MANAGER, ROLES.ADMIN],
    children: [
      { title: "Đơn hàng (Bookings)", path: "/bookings" },
      { title: "Báo giá (Quotes)", path: "/quotes" },
      { title: "Khách hàng (CRM)", path: "/customers" },
      { title: "Mã giảm giá", path: "/coupons", roles: [ROLES.MANAGER, ROLES.ADMIN] },
    ]
  },

  // 4. ĐIỀU HÀNH (Dành cho Operator, Manager)
  {
    title: "Điều hành",
    icon: <CalendarDays size={20} />,
    roles: [ROLES.OPERATOR, ROLES.MANAGER, ROLES.ADMIN],
    children: [
      { title: "Lịch khởi hành", path: "/operations/departures" },
      { title: "Danh sách đoàn", path: "/operations/groups" },
      { title: "Đặt dịch vụ (NCC)", path: "/operations/service-bookings" },
      { title: "Phân công HDV/Xe", path: "/operations/assignments" },
    ]
  },

  // 5. ĐỐI TÁC (Dành cho Operator)
  {
    title: "Nhà cung cấp",
    icon: <Truck size={20} />,
    roles: [ROLES.OPERATOR, ROLES.ADMIN],
    children: [
      { title: "Danh sách NCC", path: "/suppliers" },
      { title: "Hợp đồng NCC", path: "/suppliers/contracts" },
    ]
  },

  // 6. TÀI CHÍNH (Dành cho Admin, Manager, Kế toán - ở đây gộp Manager)
  {
    title: "Tài chính",
    icon: <Wallet size={20} />,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
    children: [
      { title: "Thu chi", path: "/finance/transactions" },
      { title: "Công nợ", path: "/finance/debts" },
      { title: "Hóa đơn", path: "/finance/invoices" },
    ]
  },

  // 7. GUIDE APP (Dành riêng cho Hướng dẫn viên)
  {
    title: "Công tác Tour",
    icon: <Bus size={20} />,
    roles: [ROLES.GUIDE],
    children: [
      { title: "Tour của tôi", path: "/guide/my-tours" },
      { title: "Danh sách khách", path: "/guide/guests" },
      { title: "Chi phí đường đi", path: "/guide/expenses" },
      { title: "Nhật ký tour", path: "/guide/logs" },
    ]
  },

  // 8. HỆ THỐNG (Chỉ Admin)
  {
    title: "Hệ thống",
    icon: <Settings size={20} />,
    roles: [ROLES.ADMIN],
    children: [
      { title: "Nhân viên", path: "/system/staff" },
      { title: "Tài khoản User", path: "/system/users" },
      { title: "Phân quyền", path: "/system/roles" },
      { title: "Cài đặt chung", path: "/system/settings" },
    ]
  }
];