import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import supplierService from '../../services/api/supplierService';
import SupplierTable from '../../components/suppliers/SupplierTable';
import SupplierFilter from '../../components/suppliers/SupplierFilter';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal'; // Import Modal
import SupplierForm from '../../components/suppliers/SupplierForm';
import toast from 'react-hot-toast';

const ProviderList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- STATE CHO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedSupplierData, setSelectedSupplierData] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAll();
      if (res.success) {
        setSuppliers(res.data.suppliers || []);
        setFilteredSuppliers(res.data.suppliers || []); // Reset filter khi load mới
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter logic Client-side (Nếu BE chưa hỗ trợ filter params)
  useEffect(() => {
    let result = suppliers;
    if (filters.type) result = result.filter(s => s.type === filters.type);
    if (filters.status) result = result.filter(s => s.status === filters.status);
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      result = result.filter(s => 
         s.company_name?.toLowerCase().includes(lower) || 
         s.code?.toLowerCase().includes(lower) ||
         s.phone?.includes(filters.search)
      );
    }
    setFilteredSuppliers(result);
    setCurrentPage(1); 
  }, [filters, suppliers]);

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- HÀM MỞ MODAL CREATE ---
  const handleOpenCreate = () => {
    setSelectedSupplierId(null);
    setSelectedSupplierData(null);
    setIsModalOpen(true);
  };

  // --- HÀM MỞ MODAL EDIT ---
  const handleOpenEdit = async (supplier) => {
    if (!supplier || !supplier.id) return;

    setSelectedSupplierId(supplier.id);
    setIsModalOpen(true);
    setIsFetchingDetail(true);

    try {
        const res = await supplierService.getById(supplier.id);
        if (res.success) {
            // Xử lý format trả về của API (array hoặc object)
            const data = Array.isArray(res.data.supplier) ? res.data.supplier[0] : res.data.supplier;
            setSelectedSupplierData(data);
        }
    } catch (error) {
        console.error(error);
        // Nếu 404 -> Xóa khỏi list
        if (error.response && error.response.status === 404) {
            toast.error("Nhà cung cấp không tồn tại.");
            fetchSuppliers();
            setIsModalOpen(false);
        } else {
            toast.error("Lỗi tải chi tiết nhà cung cấp");
        }
    } finally {
        setIsFetchingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
        setSelectedSupplierId(null);
        setSelectedSupplierData(null);
    }, 300);
  };

  const handleSuccess = () => {
    fetchSuppliers();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-sm">Bạn có chắc chắn muốn xóa NCC này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="btn-confirm" 
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await supplierService.delete(id);
                toast.success("Đã xóa nhà cung cấp");
                fetchSuppliers(); 
              } catch (error) {
                toast.error("Lỗi: " + (error.response?.data?.message || error.message));
              }
            }}
          >
            Xóa
          </button>
          <button
            className="btn-cancel" 
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ), {
      className: 'my-toast-confirm', 
      position: 'top-center',
      duration: 5000,
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhà cung cấp</h1>
            <p className="text-slate-500 text-sm">Danh sách đối tác Khách sạn, Nhà hàng, Vận chuyển...</p>
        </div>
        <button 
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
            <Plus size={20} /> Thêm mới
        </button>
      </div>

      <SupplierFilter filters={filters} onChange={setFilters} />

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
      ) : (
         <>
            <SupplierTable suppliers={currentItems} onDelete={handleDelete} onEdit={handleOpenEdit} />
            
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

      {/* --- MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSupplierId ? `Cập nhật NCC` : "Thêm Nhà Cung Cấp Mới"}
        maxWidth="max-w-5xl"
      >
        {isFetchingDetail ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
                <Loader2 className="animate-spin w-8 h-8 mr-2 text-blue-600"/> Đang tải dữ liệu...
            </div>
        ) : (
            <SupplierForm 
                supplierId={selectedSupplierId} 
                initialData={selectedSupplierData} 
                onSuccess={handleSuccess}
                onClose={handleCloseModal}
                isInModal={true} // Prop mới để chỉnh UI
            />
        )}
      </Modal>
    </div>
  );
};

export default ProviderList;