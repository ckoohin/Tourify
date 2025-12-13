import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import customerService from '../../services/api/customerService';
import CustomerHeader from '../../components/customers/CustomerHeader';
import CustomerFilters, { filterAndPaginateCustomers } from '../../components/customers/CustomerFilters'; 
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerNoteModal from '../../components/customers/CustomerNoteModal';
import CustomerExportButton from '../../components/customers/CustomerExportButton';
import CustomerForm from '../../components/customers/CustomerForm';
import CustomerDetailModal from '../../components/customers/CustomerDetailModal'; 
import Pagination from '../../components/ui/Pagination';

const CustomerList = () => {
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '' 
  });

  const [noteModal, setNoteModal] = useState({ open: false, content: '', name: '' });
  
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  const [formModal, setFormModal] = useState({ open: false, type: 'create', data: null });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      if (res.success) {
        const data = res.data.customers || [];
        setAllCustomers(data); 
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const { data, total, shouldResetPage } = filterAndPaginateCustomers(allCustomers, filters);

    setTotal(total);
    setCustomers(data);

    if (shouldResetPage) {
        setFilters(prev => ({ ...prev, page: 1 }));
    }

  }, [filters, allCustomers]);

  const handleAdd = () => {
    setFormModal({ open: true, type: 'create', data: null });
  };

  const handleEdit = (customer) => {
    setFormModal({ open: true, type: 'edit', data: customer });
  };

  const handleSubmitForm = async (formData) => {
    const loadingToast = toast.loading("Đang xử lý...");
    try {
      if (formModal.type === 'create') {
        const res = await customerService.create(formData);
        if (res.success) {
          toast.success("Thêm khách hàng thành công");
          fetchCustomers(); 
          setFormModal({ ...formModal, open: false });
        }
      } else {
        const res = await customerService.update(formModal.data.id, formData);
        if (res.success) {
          toast.success("Cập nhật thành công");
          fetchCustomers(); 
          setFormModal({ ...formModal, open: false });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(msg);
      if (error.response?.data?.errors) {
        console.log(error.response.data.errors);
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>Bạn có chắc chắn muốn xóa?</span>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              deleteCustomerApi(id);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
          >
            Xóa
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const deleteCustomerApi = async (id) => {
    try {
      const res = await customerService.delete(id);
      if (res.success) {
        toast.success("Đã xóa khách hàng");
        fetchCustomers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa khách hàng này");
    }
  };

  const handleViewNote = (customer) => {
    setNoteModal({ open: true, content: customer.notes, name: customer.full_name });
  };

  const handleViewDetail = (customer) => {
    setDetailModal({ open: true, data: customer });
  };

  const handleCloseNoteModal = () => {
    setNoteModal(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <CustomerHeader 
        total={total} 
        ExportAction={<CustomerExportButton filters={filters} />}
        onAdd={handleAdd} 
      />

      <CustomerFilters 
        filters={filters} 
        onChange={setFilters} 
      />

      <CustomerTable 
        customers={customers} 
        loading={loading} 
        onViewDetail={handleViewDetail} 
        onViewNote={handleViewNote}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <div className="bg-white rounded-b-xl shadow-sm border-x border-b border-gray-200 p-4">
          <Pagination 
            currentPage={filters.page}
            totalItems={total}
            itemsPerPage={filters.limit}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
      </div>

      {/* Các Modal */}
      <CustomerNoteModal 
        isOpen={noteModal.open}
        onClose={handleCloseNoteModal}
        content={noteModal.content}
        name={noteModal.name}
      />

      <CustomerDetailModal 
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ ...detailModal, open: false })}
        customer={detailModal.data}
      />

      <CustomerForm 
        isOpen={formModal.open}
        onClose={() => setFormModal({ ...formModal, open: false })}
        onSubmit={handleSubmitForm}
        initialData={formModal.data}
        title={formModal.type === 'create' ? 'Thêm Khách hàng mới' : 'Cập nhật thông tin'}
      />
    </div>
  );
};

export default CustomerList;