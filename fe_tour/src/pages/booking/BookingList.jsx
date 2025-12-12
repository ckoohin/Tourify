import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import bookingService from '../../services/api/bookingService';
import BookingTable from '../../components/bookings/BookingTable';
import BookingForm from '../../components/bookings/BookingForm';
import Pagination from '../../components/ui/Pagination';

const BookingList = () => {
  const [bookings, setBookings] = useState([]); 
  const [allBookings, setAllBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });
  const [total, setTotal] = useState(0);

  const [formModal, setFormModal] = useState({ open: false, type: 'create', data: null });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAll(); 
      if (res.success) {
        const data = res.data.bookings || [];
        setAllBookings(data);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách booking",error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let result = [...allBookings];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(b => 
        b.booking_code?.toLowerCase().includes(term) ||
        String(b.id).includes(term)
      );
    }

    if (filters.status) {
      result = result.filter(b => b.status === filters.status);
    }

    setTotal(result.length);

    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    setBookings(result.slice(start, end));

  }, [allBookings, filters]);

  const handleAdd = () => setFormModal({ open: true, type: 'create', data: null });
  
  const handleEdit = (booking) => setFormModal({ open: true, type: 'edit', data: booking });

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>Xóa booking này?</span>
        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm" onClick={async () => {
            toast.dismiss(t.id);
            try {
               await bookingService.delete(id);
               toast.success("Đã xóa thành công");
               fetchBookings();
            } catch(err) {
               toast.error("Xóa thất bại",err);
            }
          }}>Xóa</button>
          <button className="bg-gray-200 px-3 py-1 rounded text-sm" onClick={() => toast.dismiss(t.id)}>Hủy</button>
        </div>
      </div>
    ));
  };

  const handleSubmitForm = async (formData) => {
    const toastId = toast.loading("Đang xử lý...");
    try {
        if (formModal.type === 'create') {
            await bookingService.create(formData);
            toast.success("Tạo booking thành công");
        } else {
            await bookingService.update(formModal.data.id, formData);
            toast.success("Cập nhật thành công");
        }
        setFormModal({ ...formModal, open: false });
        fetchBookings();
    } catch (error) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra";
        toast.error(msg);

        if(error.response?.data?.errors) console.log(error.response.data.errors);
    } finally {
        toast.dismiss(toastId);
    }
  };

  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Booking</h1>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={18}/> Tạo Booking Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
                type="text" 
                placeholder="Tìm theo mã Booking..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
            />
        </div>
        <div className="relative w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <select 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500 appearance-none bg-white"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value, page: 1}))}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="deposited">Đã cọc</option>
                <option value="paid">Đã thanh toán</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <BookingTable 
        bookings={bookings} 
        loading={loading} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {/* Pagination */}
      <div className="bg-white p-4 border-x border-b rounded-b-xl">
        <Pagination 
            currentPage={filters.page} 
            totalItems={total} 
            itemsPerPage={filters.limit} 
            onPageChange={(page) => setFilters(prev => ({...prev, page}))} 
        />
      </div>

      {/* Form Modal */}
      <BookingForm 
        isOpen={formModal.open} 
        onClose={() => setFormModal({...formModal, open: false})} 
        onSubmit={handleSubmitForm}
        initialData={formModal.data}
        title={formModal.type === 'create' ? 'Tạo Booking Mới' : 'Cập nhật Booking'}
        action = {formModal.type}
      />
    </div>
  );
};

export default BookingList;