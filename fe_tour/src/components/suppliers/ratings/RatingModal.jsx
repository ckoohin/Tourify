import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Award, Clock, Smile, DollarSign, Layers, Star, Loader2 } from 'lucide-react';
import supplierRatingService from '../../../services/api/supplierRatingService';
import toast from 'react-hot-toast';

// StarInput Component
const StarInput = ({ value, onChange, size = 24 }) => {
  const [hoverVal, setHoverVal] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverVal(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverVal(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star 
            size={size} 
            className={`${(hoverVal || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
          />
        </button>
      ))}
    </div>
  );
};

const CRITERIA = [
  { key: 'overall', label: 'Tổng quan', icon: Layers, desc: 'Trải nghiệm chung về dịch vụ', required: true },
  { key: 'service_quality', label: 'Chất lượng', icon: Award, desc: 'Chất lượng xe/phòng/món ăn' },
  { key: 'punctuality', label: 'Đúng giờ', icon: Clock, desc: 'Thời gian đón/trả/phục vụ' },
  { key: 'communication', label: 'Thái độ', icon: Smile, desc: 'Giao tiếp, hỗ trợ của nhân viên' },
  { key: 'value', label: 'Giá trị', icon: DollarSign, desc: 'Tương xứng với giá tiền' },
];

const RatingModal = ({ isOpen, onClose, supplier, tourDepartureId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [ratings, setRatings] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [existingMap, setExistingMap] = useState({}); 

  useEffect(() => {
    if (isOpen && supplier && tourDepartureId) {
      fetchExistingRating();
    } else {
        setRatings({});
        setComments({});
        setExistingMap({});
    }
  }, [isOpen, supplier, tourDepartureId]);

  const fetchExistingRating = async () => {
    setFetching(true);
    try {
      const res = await supplierRatingService.getByTourAndSupplier(tourDepartureId, supplier.id);
      
      // [FIX LOGIC] Xử lý linh hoạt cấu trúc response
      const data = res.data?.ratings || res.data?.data?.ratings;

      if (res.success && data && Array.isArray(data)) {
        const newRatings = {};
        const newComments = {};
        const newMap = {};

        data.forEach(item => {
            newRatings[item.rating_type] = Number(item.rating);
            if(item.comment) newComments[item.rating_type] = item.comment;
            newMap[item.rating_type] = item.id; 
        });

        setRatings(newRatings);
        setComments(newComments);
        setExistingMap(newMap);
      }
    } catch (error) {
      console.error("Lỗi tải đánh giá cũ:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleRate = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleComment = (key, value) => {
    setComments(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!ratings.overall) {
      toast.error("Vui lòng đánh giá điểm Tổng quan");
      return;
    }

    setLoading(true);
    try {
      const promises = [];
      const newItemsToCreate = [];

      Object.keys(ratings).forEach(type => {
          const score = ratings[type];
          const comment = comments[type] || '';

          if (score > 0) {
              if (existingMap[type]) {
                  // Update
                  const id = existingMap[type];
                  promises.push(
                      supplierRatingService.update(id, {
                          rating_type: type,
                          rating: score,
                          comment: comment
                      })
                  );
              } else {
                  // Create
                  newItemsToCreate.push({
                      supplier_id: supplier.id,
                      rating_type: type,
                      rating: score,
                      comment: comment
                  });
              }
          }
      });

      if (promises.length > 0) await Promise.all(promises);

      if (newItemsToCreate.length > 0) {
          await supplierRatingService.createBulk({
              tour_departure_id: tourDepartureId,
              ratings: newItemsToCreate
          });
      }

      toast.success("Đánh giá đã được lưu thành công!");
      onSuccess(); 
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu đánh giá");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
                <h3 className="font-bold text-xl text-slate-800">Đánh giá Nhà cung cấp</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100">{supplier.type}</span>
                    <span className="text-sm text-slate-500 font-medium">{supplier.company_name}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={24}/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
            {fetching ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
                <div className="space-y-4">
                    {CRITERIA.map((crit) => {
                        const isRated = ratings[crit.key] > 0;
                        return (
                            <div key={crit.key} className={`flex gap-4 p-5 rounded-xl border transition-all ${isRated ? 'bg-white border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                                <div className={`p-3 rounded-full h-fit shrink-0 ${isRated ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <crit.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-1">
                                                {crit.label} {crit.required && <span className="text-red-500">*</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500">{crit.desc}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <StarInput 
                                                value={ratings[crit.key] || 0} 
                                                onChange={(val) => handleRate(crit.key, val)}
                                            />
                                            <span className={`text-xs font-bold mt-1 ${isRated ? 'text-blue-600' : 'text-slate-300'}`}>
                                                {ratings[crit.key] ? ['Rất tệ', 'Kém', 'Bình thường', 'Tốt', 'Tuyệt vời'][ratings[crit.key]-1] : 'Chạm để đánh giá'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {(isRated || comments[crit.key]) && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                            <div className="relative">
                                                <MessageSquare size={16} className="absolute top-3 left-3 text-slate-400"/>
                                                <input 
                                                    type="text" 
                                                    value={comments[crit.key] || ''}
                                                    onChange={(e) => handleComment(crit.key, e.target.value)}
                                                    placeholder={`Nhận xét chi tiết về ${crit.label.toLowerCase()}...`}
                                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-10">
            <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Đóng</button>
            <button 
                onClick={handleSubmit} 
                disabled={loading || fetching}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                {loading ? 'Đang lưu...' : 'Lưu đánh giá'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;