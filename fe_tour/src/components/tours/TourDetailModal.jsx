import React from 'react';
import { X, MapPin, Clock, Calendar, Users, FileText, Tag, DollarSign } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const TourDetailModal = ({ isOpen, onClose, tour }) => {
  if (!isOpen || !tour) return null;

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderVersionType = (type) => {
    const styles = {
      standard: 'bg-blue-100 text-blue-800',
      seasonal: 'bg-green-100 text-green-800',
      promotion: 'bg-orange-100 text-orange-800',
      special: 'bg-purple-100 text-purple-800'
    };
    return <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${styles[type] || 'bg-gray-100'}`}>{type}</span>;
  };

  const renderPriceType = (type) => {
    const labels = {
        adult: 'Người lớn',
        child: 'Trẻ em',
        infant: 'Em bé',
        senior: 'Người cao tuổi',
        group: 'Nhóm'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{tour.code}</span>
                <StatusBadge text={tour.status} level={tour.status === 'active' ? 'success' : 'warning'} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{tour.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">Thời lượng</p>
                            <p className="font-medium">{tour.duration}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">Hành trình</p>
                            <p className="font-medium text-sm">{tour.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <Users className="w-5 h-5 text-green-500" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase">Quy mô nhóm</p>
                            <p className="font-medium">{tour.min_group_size} - {tour.max_group_size || '∞'} khách</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <FileText size={18}/> Điểm nổi bật (Highlights)
                    </h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {tour.highlights || "Chưa cập nhật điểm nổi bật."}
                    </p>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b">
                    <Tag size={20} className="text-blue-600"/> 
                    Các phiên bản & Bảng giá
                </h3>

                {tour.versions && tour.versions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {tour.versions.map((ver) => (
                            <div key={ver.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Header của Version */}
                                <div className="bg-slate-50 px-4 py-3 flex flex-wrap justify-between items-center border-b border-slate-100 gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-700">{ver.name}</span>
                                        {renderVersionType(ver.type)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                                        <Calendar size={14}/>
                                        <span>Hiệu lực: {formatDate(ver.valid_from)} - {formatDate(ver.valid_to)}</span>
                                    </div>
                                </div>

                                <div className="p-0">
                                    {ver.prices && ver.prices.length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white text-slate-500 font-medium border-b">
                                                <tr>
                                                    <th className="px-4 py-2 w-1/3">Đối tượng</th>
                                                    <th className="px-4 py-2 w-1/3">Đơn giá</th>
                                                    <th className="px-4 py-2 w-1/3 text-right">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {ver.prices.map((price) => (
                                                    <tr key={price.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                                                            {renderPriceType(price.type)}
                                                        </td>
                                                        <td className="px-4 py-3 text-emerald-600 font-bold">
                                                            {formatCurrency(price.amount, price.currency)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-400 italic">
                                                            --
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-4 text-center text-slate-400 text-sm italic">
                                            Chưa cấu hình bảng giá cho phiên bản này.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                        Chưa có phiên bản nào được tạo cho tour này.
                    </div>
                )}
            </div>

            <div>
                <h3 className="font-bold text-lg text-slate-800 mb-3">Mô tả chi tiết</h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                    {tour.description || "Chưa có mô tả chi tiết."}
                </div>
            </div>

        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default TourDetailModal;