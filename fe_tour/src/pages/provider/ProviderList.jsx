import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supplierService from '../../services/api/supplierService';
import SupplierTable from '../../components/suppliers/SupplierTable';
import SupplierFilter from '../../components/suppliers/SupplierFilter';
import Pagination from '../../components/ui/Pagination';

const ProviderList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAll();
      if (res.success) {
        setSuppliers(res.data.suppliers || []);
        setFilteredSuppliers(res.data.suppliers || []);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    let result = suppliers;

    if (filters.type) {
      result = result.filter(s => s.type === filters.type);
    }
    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(s => 
         (s.company_name && s.company_name.toLowerCase().includes(lowerSearch)) ||
         (s.code && s.code.toLowerCase().includes(lowerSearch)) ||
         (s.phone && s.phone.includes(filters.search))
      );
    }
    
    setFilteredSuppliers(result);
    setCurrentPage(1); 
  }, [filters, suppliers]);

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa NCC này?")) {
      try {
        await supplierService.delete(id);
        fetchSuppliers();
      } catch (error) {
        alert("Lỗi: " + error.response?.data?.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhà cung cấp</h1>
            <p className="text-slate-500 text-sm">Danh sách đối tác Khách sạn, Nhà hàng, Vận chuyển...</p>
        </div>
        <button 
            onClick={() => navigate('/providers/create')} // Đảm bảo route này đã khai báo trong App.jsx
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
            <Plus size={20} /> Thêm mới
        </button>
      </div>

      <SupplierFilter filters={filters} onChange={setFilters} />

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
      ) : (
         <>
            <SupplierTable suppliers={currentItems} onDelete={handleDelete} />
            
            <div className="mt-6">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                    totalItems={filteredSuppliers.length}
                />
            </div>
         </>
      )}
    </div>
  );
};

export default ProviderList;