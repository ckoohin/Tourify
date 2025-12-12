import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckCircle, XCircle, AlertCircle, Tag, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '../../../services/api/tourService';
import TourVersionForm from './TourVersionForm';
import TourPriceManager from '../prices/TourPriceManager';

const TourVersionManager = ({ tourId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);

  const [expandedVersionId, setExpandedVersionId] = useState(null);

  const fetchVersions = async () => {
    setLoading(true);
    try {
        const res = await tourService.getVersions(tourId);
        if (res.success) {
            let data = res.data.tourVersions || [];
            if (tourId) {
                data = data.filter(v => String(v.tour_id) === String(tourId));
            }
            data.sort((a, b) => b.is_default - a.is_default || new Date(b.valid_from) - new Date(a.valid_from));
            setVersions(data);
        }
    } catch (error) {
        console.error("Lỗi tải version:", error);
        toast.error("Không thể tải danh sách phiên bản");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) fetchVersions();
  }, [tourId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiên bản này? Dữ liệu giá liên quan cũng sẽ bị ảnh hưởng.")) return;
    try {
        await tourService.deleteVersion(id);
        toast.success("Đã xóa phiên bản");
        fetchVersions();
    } catch (error) {
        toast.error(error.response?.data?.message || "Không thể xóa phiên bản này");
    }
  };

  const handleSave = async (data) => {
    try {
        if (editingVersion) {
            await tourService.updateVersion(editingVersion.id, data);
            toast.success("Cập nhật thành công");
        } else {
            await tourService.createVersion(data);
            toast.success("Thêm mới thành công");
        }
        setModalOpen(false);
        fetchVersions();
    } catch (error) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra";
        toast.error(msg);
    }
  };

  const togglePricePanel = (id) => {
    if (expandedVersionId === id) {
        setExpandedVersionId(null);
    } else {
        setExpandedVersionId(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getVersionTypeBadge = (type) => {
    const configs = {
        standard: { text: 'Tiêu chuẩn', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        seasonal: { text: 'Theo mùa', color: 'bg-green-100 text-green-800 border-green-200' },
        promotion: { text: 'Khuyến mãi', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        special: { text: 'Đặc biệt', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    };
    const conf = configs[type] || configs.standard;
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${conf.color}`}>
            {conf.text}
        </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Tag size={20} className="text-blue-600"/> Quản lý Phiên bản & Giá
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cấu hình các phiên bản và bảng giá chi tiết cho từng thời điểm</p>
        </div>
        <button 
            onClick={() => { setEditingVersion(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
            <Plus size={16}/> Thêm Phiên bản
        </button>
      </div>

      <div className="p-0">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50">
                <AlertCircle size={48} className="mb-3 opacity-20"/>
                <p>Chưa có phiên bản nào được tạo.</p>
                <button onClick={() => { setEditingVersion(null); setModalOpen(true); }} className="text-blue-600 text-sm hover:underline mt-2">Tạo phiên bản đầu tiên</button>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {versions.map((ver) => (
                    <div key={ver.id} className="transition-colors group">
                        {/* Row Content */}
                        <div className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${expandedVersionId === ver.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-slate-800 text-base">{ver.name}</span>
                                    {getVersionTypeBadge(ver.type)}
                                    {ver.is_default === 1 && (
                                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded border border-yellow-200 font-bold">Mặc định</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-1.5" title="Thời gian hiệu lực">
                                        <Calendar size={14} className="text-slate-400"/> 
                                        <span>{formatDate(ver.valid_from)} &rarr; {formatDate(ver.valid_to)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {ver.is_active === 1 ? (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12}/> Đang hoạt động</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400 text-xs"><XCircle size={12}/> Đã ẩn</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Nút Toggle Bảng Giá */}
                                <button 
                                    onClick={() => togglePricePanel(ver.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                                        expandedVersionId === ver.id 
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <DollarSign size={14} />
                                    Bảng giá
                                    {expandedVersionId === ver.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                </button>

                                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                                <button 
                                    onClick={() => { setEditingVersion(ver); setModalOpen(true); }}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Chỉnh sửa thông tin"
                                >
                                    <Edit size={16}/>
                                </button>
                                <button 
                                    onClick={() => handleDelete(ver.id)}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa phiên bản"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>

                        {/* Price Manager Panel (Expandable) */}
                        {expandedVersionId === ver.id && (
                            <div className="border-t border-slate-200 bg-slate-50/50 p-4 pl-8 animate-in slide-in-from-top-2 duration-200">
                                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                    <div className="mb-2 flex items-center gap-2 text-slate-700 font-medium pb-2 border-b border-slate-100">
                                        <DollarSign size={16} className="text-emerald-600"/>
                                        Cấu hình giá cho: <span className="font-bold text-blue-600">{ver.name}</span>
                                    </div>
                                    <TourPriceManager tourVersionId={ver.id} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      <TourVersionForm 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingVersion}
        tourId={tourId}
      />
    </div>
  );
};

export default TourVersionManager;