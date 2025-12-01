import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '../../../services/api/tourService';
import TourPriceTable from './TourPriceTable';
import TourPriceForm from './TourPriceForm';

const TourPriceManager = ({ tourVersionId }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
        const res = await tourService.getPrices();
        if (res.success) {
            let data = res.data.tourPrices || [];
            if (tourVersionId) {
                data = data.filter(p => String(p.tour_version_id) === String(tourVersionId));
            }
            // Sort: Adult -> Child -> Infant
            const order = { adult: 1, child: 2, infant: 3, senior: 4, group: 5 };
            data.sort((a, b) => (order[a.price_type] || 99) - (order[b.price_type] || 99));
            setPrices(data);
        }
    } catch (error) {
        console.error(error);
        toast.error("Lỗi tải bảng giá");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (tourVersionId) fetchPrices();
  }, [tourVersionId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mức giá này?")) return;
    try {
        await tourService.deletePrice(id);
        toast.success("Xóa thành công");
        fetchPrices();
    } catch (e) { toast.error("Xóa thất bại"); }
  };

  const handleSave = async (data) => {
    try {
        if (editingItem) {
            await tourService.updatePrice(editingItem.id, data);
            toast.success("Cập nhật thành công");
        } else {
            await tourService.createPrice(data);
            toast.success("Thêm giá mới thành công");
        }
        setModalOpen(false);
        fetchPrices();
    } catch (error) {
        toast.error("Có lỗi xảy ra khi lưu");
        console.error(error);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-slate-700 text-sm uppercase">Cấu hình Bảng giá</h4>
        <button 
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1 font-medium border border-blue-100"
        >
            <Plus size={14}/> Thêm giá
        </button>
      </div>

      {loading ? (
        <div className="text-center text-xs text-slate-400 py-4">Đang tải giá...</div>
      ) : (
        <TourPriceTable 
            prices={prices} 
            onEdit={(item) => { setEditingItem(item); setModalOpen(true); }}
            onDelete={(id) => handleDelete(id)}
        />
      )}

      <TourPriceForm 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingItem}
        tourVersionId={tourVersionId}
      />
    </div>
  );
};

export default TourPriceManager;