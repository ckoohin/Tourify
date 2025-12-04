import React, { useState } from 'react';
import { Edit, Trash2, FileText, CheckCircle, Clock, X, Eye } from 'lucide-react';

// FIX: Thêm " = []" vào sau expenses để đảm bảo nó luôn là mảng, tránh lỗi undefined
const TourExpenseList = ({ expenses = [], loading, onEdit, onDelete }) => {
  // State để lưu ảnh đang xem (nếu có)
  const [previewImage, setPreviewImage] = useState(null);

  if (loading) return <div className="text-center py-10">Đang tải danh sách...</div>;
  
  if (!expenses || expenses.length === 0) {
    return <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl text-slate-500">Chưa có khoản chi nào được ghi nhận.</div>;
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-3">Ngày chi</th>
                <th className="px-6 py-3">Hạng mục</th>
                <th className="px-6 py-3">Nội dung</th>
                <th className="px-6 py-3 text-right">Số tiền</th>
                <th className="px-6 py-3">Hình thức</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(item.expense_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                      {item.expense_category}
                  </td>
                  <td className="px-6 py-4">
                      <p className="text-slate-600 truncate max-w-[200px]" title={item.description}>{item.description || '-'}</p>
                      {item.supplier_name && <p className="text-xs text-blue-500 mt-0.5">{item.supplier_name}</p>}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: item.currency || 'VND' }).format(item.amount)}
                  </td>
                  <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200 capitalize">
                          {item.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 
                           item.payment_method === 'credit_card' ? 'Thẻ tín dụng' : 
                           item.payment_method === 'cash' ? 'Tiền mặt' : item.payment_method}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                      {item.approved_by ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                              <CheckCircle size={14}/> Đã duyệt
                          </span>
                      ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                              <Clock size={14}/> Chờ duyệt
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Nút Xem Hóa Đơn - Thay đổi logic mở popup */}
                          {item.receipt_url && (
                              <button 
                                  onClick={() => setPreviewImage(item.receipt_url)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                                  title="Xem hóa đơn"
                              >
                                  <Eye size={16}/>
                              </button>
                          )}
                          {onEdit && (
                              <button 
                                  onClick={() => onEdit(item)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                              >
                                  <Edit size={16}/>
                              </button>
                          )}
                          {onDelete && !item.approved_by && (
                              <button 
                                  onClick={() => onDelete(item.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
                              >
                                  <Trash2 size={16}/>
                              </button>
                          )}
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup Xem Ảnh */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)} // Click ra ngoài để đóng
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Hóa đơn chi tiết" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Nút đóng */}
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 md:-right-10 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TourExpenseList;