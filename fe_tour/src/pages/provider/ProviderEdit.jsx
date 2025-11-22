import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import supplierService from '../../services/api/supplierService'; // Kiểm tra lại đường dẫn import này
import SupplierForm from '../../components/suppliers/SupplierForm';

const ProviderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await supplierService.getById(id);
        if (res.success) {
          const data = Array.isArray(res.data.supplier) ? res.data.supplier[0] : res.data.supplier;
          
          if (!data) {
             throw new Error("Không tìm thấy dữ liệu");
          }
          
          setSupplierData(data);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        alert("Không tìm thấy nhà cung cấp!");
        navigate('/providers');
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-3"/>
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
        </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate('/providers')} 
        className="group flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
      >
        <div className="p-1 rounded-full group-hover:bg-slate-200 mr-2 transition-colors">
             <ArrowLeft size={18} />
        </div>
        Quay lại danh sách
      </button>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa Nhà Cung Cấp</h1>
            <p className="text-slate-500 text-sm mt-1">
                Cập nhật thông tin cho <span className="font-bold text-blue-600">{supplierData?.company_name}</span>
            </p>
        </div>
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-500 shadow-sm">
            ID: {id}
        </span>
      </div>
      
      <SupplierForm supplierId={id} initialData={supplierData} />
    </div>
  );
};

export default ProviderEdit;