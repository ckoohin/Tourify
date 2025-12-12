import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SupplierForm from '../../components/suppliers/SupplierForm';

const ProviderCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-slate-50">
      <button 
        onClick={() => navigate('/providers')} 
        className="group flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
      >
        <div className="p-1 rounded-full group-hover:bg-slate-200 mr-2 transition-colors">
             <ArrowLeft size={18} />
        </div>
        Quay lại danh sách
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Thêm Nhà Cung Cấp Mới</h1>
        <p className="text-slate-500 text-sm mt-1">Nhập thông tin đối tác khách sạn, nhà hàng, vận chuyển để bắt đầu hợp tác.</p>
      </div>
      
      <SupplierForm />
    </div>
  );
};

export default ProviderCreate;