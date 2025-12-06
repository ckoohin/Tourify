import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, AlertCircle, RefreshCcw, FileText, 
  BadgeAlert, Banknote, Plus, Edit2, Trash2, 
  CheckCircle2, XCircle 
} from 'lucide-react';
import tourService from '../../../services/api/tourService';
import toast from 'react-hot-toast';
import TourPolicyForm from './TourPolicyForm'; 

const TourPolicy = ({ tourId }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const fetchPolicies = async () => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await tourService.getPolicies(tourId);
      if (res.success) {
        setPolicies(res.data.policies || []);
      }
    } catch (error) {
      console.error("Lỗi tải chính sách:", error);
      toast.error("Không thể tải danh sách chính sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [tourId]);


  const handleOpenCreate = () => {
    setEditingPolicy({
      tour_id: tourId,
      display_order: policies.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (policy) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
  };


  const handleSubmit = async (formData) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    try {
      if (editingPolicy && editingPolicy.id) {
        // UPDATE
        await tourService.updatePolicy(editingPolicy.id, formData);
        toast.success("Cập nhật chính sách thành công");
      } else {
        // CREATE
        await tourService.createPolicy({ ...formData, tour_id: tourId });
        toast.success("Thêm chính sách mới thành công");
      }
      handleCloseForm();
      fetchPolicies();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;
    try {
      await tourService.deletePolicy(id);
      toast.success("Đã xóa chính sách");
      fetchPolicies();
    } catch (error) {
      toast.error("Lỗi khi xóa chính sách");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await tourService.updatePolicyStatus(id, !currentStatus);
      toast.success("Đã cập nhật trạng thái");
      fetchPolicies();
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const getPolicyStyle = (type) => {
    switch (type) {
      case 'cancellation':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Hủy tour' };
      case 'refund':
        return { icon: RefreshCcw, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Hoàn tiền' };
      case 'deposit':
        return { icon: Banknote, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Đặt cọc' };
      case 'change':
        return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Thay đổi' };
      default:
        return { icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Quy định khác' };
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={24}/>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Chính sách & Quy định</h3>
            <p className="text-sm text-slate-500">Thiết lập các điều khoản cho tour này</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
        >
          <Plus size={18}/> Thêm chính sách
        </button>
      </div>

      {/* POPUP MODAL FORM */}
      {isModalOpen && (
        <TourPolicyForm 
          initialData={editingPolicy}
          title={editingPolicy?.id ? 'Cập nhật chính sách' : 'Thêm chính sách mới'}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      )}

      {/* LIST OF POLICIES */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-500 gap-2">
          <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
          Đang tải chính sách...
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <BadgeAlert size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">Chưa có chính sách nào được thiết lập.</p>
          <p className="text-sm text-slate-400">Nhấn "Thêm chính sách" để tạo mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {policies.map((policy, index) => {
            const style = getPolicyStyle(policy.policy_type);
            const Icon = style.icon;
            const isActive = Boolean(policy.is_active);
            
            return (
              <div 
                key={policy.id} 
                className={`group relative bg-white p-5 rounded-xl border transition-all hover:shadow-md ${isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'}`}
              >
                {/* Actions Toolbar (Visible on Hover) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleStatus(policy.id, isActive)}
                    className={`p-1.5 rounded-lg border transition-colors ${isActive ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                    title={isActive ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                  >
                    {isActive ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(policy)} 
                    className="p-1.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(policy.id)} 
                    className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-24">
                  {/* Icon Box */}
                  <div className={`p-3 rounded-xl ${style.bg} ${style.border} border shrink-0`}>
                    <Icon size={24} className={style.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style.bg} ${style.color} ${style.border}`}>
                        {style.label}
                      </span>
                      {!isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-500 border border-slate-300">
                          Đã ẩn
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto mr-2">
                        Thứ tự: {index + 1}
                      </span>
                    </div>
                    
                    <h4 className={`text-base font-bold mb-2 ${isActive ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                      {policy.title}
                    </h4>
                    
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-3 border-l-2 border-slate-100">
                      {policy.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TourPolicy;