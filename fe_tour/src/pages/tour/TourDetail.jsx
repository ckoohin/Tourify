import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, MapPin, Clock, Users, 
  Tag, Globe, Image as ImageIcon,
  FileText, Layers, QrCode, Link as LinkIcon, Copy, ExternalLink, Download // [NEW] Import thêm icon
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import tourService from '../../services/api/tourService';

import TourForm from '../../components/tours/TourForm'; 
import TourItineraryManager from '../../components/tours/itinerary/TourItineraryManager'; 
import TourPolicy from '../../components/tours/policy/TourPolicy';
import TourVersionViewer from '../../components/tours/TourVersionViewer';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('overview'); 
  const [defaultVersionId, setDefaultVersionId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0); 

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch Categories & Tour Data
  const fetchData = async () => {
    try {
        const [catRes, tourRes] = await Promise.all([
            tourService.getCategories(),
            tourService.getTourById(id)
        ]);

        if (catRes.success) setCategories(catRes.data.categories || catRes.data || []);
        
        if (tourRes.success) {
            const data = Array.isArray(tourRes.data.tour) ? tourRes.data.tour[0] : tourRes.data.tour;
            setTour(data);
            
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                const featured = data.images.find(img => img.is_featured);
                setSelectedImage(getImgUrl(featured || data.images[0]));
            }

            fetchDefaultVersion(data.id);
        }
    } catch (error) {
        console.error("Error loading tour data:", error);
        toast.error("Lỗi tải dữ liệu");
    } finally {
        setLoading(false);
    }
  };

  const fetchDefaultVersion = async (tourId) => {
      try {
          const res = await tourService.getVersions(tourId);
          if (res.success) {
              const list = res.data.tourVersions || res.data.versions || [];
              const def = list.find(v => v.is_default) || list[0];
              if (def) setDefaultVersionId(def.id);
          }
      } catch (e) { 
          console.error("Lỗi tải default version:", e); 
      }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleUpdateSuccess = () => {
    fetchData(); 
    setRefreshKey(prev => prev + 1); 
  };

  const getImgUrl = (imgItem) => {
    if (!imgItem) return '';
    return typeof imgItem === 'string' ? imgItem : imgItem.url;
  };

  // [NEW] Helper Copy Link
  const handleCopyLink = (text) => {
      if(!text) return;
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép liên kết!");
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-500">Đang tải dữ liệu...</div>;
  if (!tour) return <div className="flex justify-center items-center h-screen text-slate-500">Không tìm thấy tour.</div>;

  // [NEW] Lấy thông tin QR và URL
  const bookingUrl = tourService.getBookingUrl(tour);
  const qrCodeUrl = tourService.getQrCodeImageUrl(tour.qr_code);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="aspect-video bg-slate-100 relative group flex items-center justify-center">
                {selectedImage ? (
                    <img 
                    src={selectedImage} 
                    alt={tour.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=No+Image'; }}
                    />
                ) : (
                    <div className="text-slate-400 flex flex-col items-center"><ImageIcon size={48} className="mb-2"/>Chưa có hình ảnh</div>
                )}
                </div>
                {tour.images && tour.images.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3 overflow-x-auto">
                    {tour.images.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(getImgUrl(img))} className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 ${getImgUrl(img) === selectedImage ? 'border-blue-600' : 'border-transparent'}`}>
                        <img src={getImgUrl(img)} className="w-full h-full object-cover" />
                    </button>
                    ))}
                </div>
                )}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">Giới thiệu</h2>
                <div className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line mb-8">
                {tour.description || <span className="text-slate-400 italic">Chưa có mô tả.</span>}
                </div>
                {tour.highlights && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Tag size={18}/> Điểm nổi bật</h3>
                    <ul className="space-y-2">
                        {tour.highlights.split('\n').map((line, idx) => line.trim() && (
                            <li key={idx} className="flex items-start gap-2 text-blue-900 text-sm">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>{line}
                            </li>
                        ))}
                    </ul>
                </div>
                )}
            </div>
          </div>
        );
      
      case 'itinerary':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
             <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 flex items-start gap-3">
                <Clock className="shrink-0 mt-0.5" size={18}/>
                <div>
                  <p className="font-bold mb-1">Đang quản lý lịch trình của Phiên bản Mặc định (ID: {defaultVersionId || '...'})</p>
                  <p className="opacity-90">Những thay đổi tại đây sẽ áp dụng cho phiên bản chính của tour.</p>
                </div>
             </div>
             <TourItineraryManager 
                key={`itinerary-${refreshKey}`} 
                tourVersionId={defaultVersionId} 
             />
          </div>
        );

      case 'policy':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
             <TourPolicy 
                key={`policy-${refreshKey}`} 
                tourId={tour.id} 
             />
          </div>
        );

      case 'versions':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
             <TourVersionViewer 
                key={`versions-${refreshKey}`} 
                tourId={tour.id} 
             />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button 
            onClick={() => navigate('/tours')} 
            className="flex items-center text-slate-500 hover:text-blue-600 mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} className="mr-1"/> Quay lại danh sách
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{tour.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${tour.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {tour.status === 'active' ? 'Active' : tour.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1 font-mono">{tour.code}</p>
        </div>
        
        <button 
          onClick={() => setIsEditOpen(true)}
          className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all font-medium text-sm shadow-sm"
        >
          <Edit size={16}/> Chỉnh sửa thông tin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Tổng quan', icon: Globe },
                    { id: 'itinerary', label: 'Lịch trình', icon: MapPin },
                    { id: 'policy', label: 'Chính sách', icon: FileText },
                    { id: 'versions', label: 'Phiên bản & Giá', icon: Layers },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-blue-50 text-blue-700 shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>
            {renderTabContent()}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* [NEW] Box: Chia sẻ & QR Code */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b flex items-center gap-2">
                <QrCode size={18} className="text-purple-600"/> Chia sẻ Tour
            </h3>
            
            <div className="flex flex-col items-center mb-6">
                <div className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-2 mb-2 relative group overflow-hidden">
                    {qrCodeUrl ? (
                        <>
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                            <a 
                                href={qrCodeUrl} 
                                download={`QR-${tour.code}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Download size={24} />
                                <span className="text-xs font-medium mt-1">Tải xuống</span>
                            </a>
                        </>
                    ) : (
                        <span className="text-xs text-slate-400 text-center px-2">Chưa có QR. Vui lòng cập nhật tour.</span>
                    )}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block flex items-center gap-1">
                    <LinkIcon size={12}/> Link đặt tour
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={bookingUrl} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono focus:outline-none truncate"
                    />
                    <button 
                        onClick={() => handleCopyLink(bookingUrl)}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                        title="Sao chép"
                    >
                        <Copy size={16}/>
                    </button>
                    {bookingUrl && (
                        <a 
                            href={bookingUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Mở link"
                        >
                            <ExternalLink size={16}/>
                        </a>
                    )}
                </div>
            </div>
          </div>

          {/* Existing General Info Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-5 pb-2 border-b">Thông tin chung</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Clock size={20} /></div>
                <div><span className="block font-bold text-slate-700 mb-0.5">Thời lượng</span><span className="text-slate-600 font-medium">{tour.duration_days} Ngày / {tour.duration_nights} Đêm</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0"><MapPin size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Khởi hành</span><span className="text-slate-600 font-medium">{tour.departure_location || "---"}</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0"><Globe size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Điểm đến</span><span className="text-slate-600 font-medium">{tour.destination || "---"}</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0"><Users size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Quy mô</span><span className="text-slate-600 font-medium">{tour.min_group_size} - {tour.max_group_size} khách</span></div>
              </li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">ID Danh mục</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{tour.category_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Tour thiết kế riêng</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${tour.is_customizable ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        {tour.is_customizable ? 'CÓ' : 'KHÔNG'}
                    </span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <TourForm 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleUpdateSuccess} 
        initialData={tour}
        categories={categories}
        title={`Cập nhật Tour: ${tour.code}`}
      />
    </div>
  );
};

export default TourDetail;