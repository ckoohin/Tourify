import React from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import customerService from '../../services/api/CustomerService';

const CustomerExportButton = ({ filters }) => {
  const handleExport = async () => {
    try {
      const toastId = toast.loading("Đang chuẩn bị dữ liệu...");
      
      // Gọi API lấy dữ liệu với limit lớn để lấy hết
      const res = await customerService.getAll({
        ...filters,
        page: 1,
        limit: 1000 
      });

      if (res.success && res.data.customers.length > 0) {
        const data = res.data.customers;

        // Chuẩn bị dữ liệu cho Excel
        const excelData = data.map(item => ({
            'Mã KH': item.customer_code,
            'Họ tên': item.full_name,
            'Điện thoại': item.phone,
            'Email': item.email,
            'Loại khách': item.customer_type === 'individual' ? 'Cá nhân' : (item.customer_type === 'company' ? 'Doanh nghiệp' : 'Đại lý'),
            'Công ty': item.company_name || '',
            'Ghi chú': item.notes || '',
            'Địa chỉ': item.address || ''
        }));

        // Tạo Worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Tùy chỉnh độ rộng cột
        worksheet['!cols'] = [
            { wch: 15 }, // Mã KH
            { wch: 25 }, // Họ tên
            { wch: 15 }, // SĐT
            { wch: 25 }, // Email
            { wch: 15 }, // Loại
            { wch: 20 }, // Công ty
            { wch: 30 }, // Ghi chú
            { wch: 30 }  // Địa chỉ
        ];

        // Tạo Workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKhachHang");

        // Xuất file
        const fileName = `DS_KhachHang_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast.success("Xuất file thành công!");
      } else {
        toast.error("Không có dữ liệu để xuất.");
      }

      toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Lỗi khi tạo file Excel");
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
    >
      <Download size={18} /> Xuất Excel
    </button>
  );
};

export default CustomerExportButton;