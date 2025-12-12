import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Info, DollarSign, Loader2, Layers } from 'lucide-react';
import tourService from '../../services/api/tourService';

const TourVersionViewer = ({ tourId }) => {
  const [versions, setVersions] = useState([]);
  const [prices, setPrices] = useState({}); 
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
  };

  const getTypeBadge = (type) => {
    const styles = {
        standard: 'bg-slate-100 text-slate-600 border-slate-200',
        seasonal: 'bg-green-50 text-green-700 border-green-200',
        promotion: 'bg-orange-50 text-orange-700 border-orange-200',
        special: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    const labels = { standard: 'Tiêu chuẩn', seasonal: 'Theo mùa', promotion: 'Khuyến mãi', special: 'Đặc biệt' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border uppercase ${styles[type] || styles.standard}`}>{labels[type] || type}</span>;
  };

  const getPaxTypeLabel = (type) => {
      const map = { adult: 'Người lớn', child: 'Trẻ em', infant: 'Em bé', senior: 'Người cao tuổi', group: 'Nhóm' };
      return map[type] || type;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!tourId) return;
      setLoading(true);
      try {
        const verRes = await tourService.getVersions(tourId);
        
        let verList = [];
        if (verRes.success) {
            if (verRes.data && Array.isArray(verRes.data.tourVersions)) {
                verList = verRes.data.tourVersions;
            } else if (Array.isArray(verRes.data)) {
                verList = verRes.data;
            }
        }

        setVersions(verList);

        if (verList.length > 0) {
            const pricePromises = verList.map(v => 
                tourService.getPricesByVersion(v.id)
                .then(res => {
                    const pData = res.success 
                        ? (res.data.tourPrices || res.data || []) 
                        : [];
                    return { id: v.id, data: Array.isArray(pData) ? pData : [] };
                })
                .catch(err => {
                    console.error(`Lỗi lấy giá version ${v.id}`, err);
                    return { id: v.id, data: [] };
                })
            );

            const pricesResults = await Promise.all(pricePromises);
            const pricesMap = {};
            pricesResults.forEach(item => { pricesMap[item.id] = item.data; });
            setPrices(pricesMap);
        }
      } catch (error) {
        console.error("Lỗi tải phiên bản:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId]);

  if (loading) return (
      <div className="flex justify-center items-center py-8 text-slate-500 gap-2">
          <Loader2 className="animate-spin" size={20} /> Đang tải dữ liệu...
      </div>
  );

  if (versions.length === 0) return (
    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <Layers size={48} className="mx-auto mb-3 text-slate-300" />
      <p className="text-slate-500">Tour này chưa có phiên bản nào.</p>
      <p className="text-xs text-slate-400 mt-1">Vui lòng liên hệ quản trị viên để thêm phiên bản.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {versions.map(ver => {
        const versionPrices = prices[ver.id] || [];
        return (
          <div key={ver.id} className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${ver.is_default ? 'border-blue-300 ring-1 ring-blue-50' : 'border-slate-200'}`}>
            {/* Header Version */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-slate-800">{ver.name}</h4>
                        {getTypeBadge(ver.type)}
                        {ver.is_default && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">Mặc định</span>}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar size={14}/> 
                        <span className="font-medium">
                            {ver.valid_from ? `${new Date(ver.valid_from).toLocaleDateString('vi-VN')} - ${new Date(ver.valid_to).toLocaleDateString('vi-VN')}` : 'Không giới hạn thời gian'}
                        </span>
                    </div>
                </div>
                {/* ID Version Badge */}
                <div className="text-xs text-slate-400 font-mono">ID: {ver.id}</div>
            </div>

            {/* Price Body */}
            <div className="p-6">
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                    <DollarSign size={14}/> Bảng giá
                </h5>
                {versionPrices.length === 0 ? (
                    <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200 text-center">
                        Chưa có cấu hình giá cho phiên bản này.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {versionPrices.map(price => (
                            <div key={price.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors">
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Tag size={14} className="text-slate-400"/>
                                    {getPaxTypeLabel(price.price_type)}
                                </span>
                                <span className="text-base font-bold text-blue-600">{formatCurrency(price.price, price.currency)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TourVersionViewer;