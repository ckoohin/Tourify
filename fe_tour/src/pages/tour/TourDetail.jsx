import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, MapPin, Clock, Users, 
  Tag, CheckCircle, XCircle, Globe, Image as ImageIcon 
} from 'lucide-react';
import toast from 'react-hot-toast'; 

import tourService from '../../services/api/tourService';
import TourVersionManager from '../../components/tours/versions/TourVersionManager';
import TourForm from '../../components/tours/TourForm'; 

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
        const res = await tourService.getCategories();
        if (res.success) {
            setCategories(res.data.categories || res.data || []);
        }
    } catch (error) {
        console.error("Lỗi tải danh mục", error);
    }
  };

  const fetchTour = async () => {
    try {
      const res = await tourService.getTourById(id);
      if (res.success) {
        const data = Array.isArray(res.data.tour) ? res.data.tour[0] : res.data.tour;
        setTour(data);
        
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const featured = data.images.find(img => img.is_featured === 1 || img.is_featured === true);
          if (featured) setSelectedImage(getImgUrl(featured));
          else {
              const sorted = [...data.images].sort((a, b) => Number(a.id) - Number(b.id));
              setSelectedImage(getImgUrl(sorted[sorted.length - 1]));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTour();
    fetchCategories(); 
  }, [id]);

  const handleUpdateTour = async (formData) => {
    const toastId = toast.loading("Đang cập nhật...");
    try {
        // Gọi API Update
        await tourService.updateTour(tour.id, formData);
        toast.success("Cập nhật thành công");
        setIsEditOpen(false);
        fetchTour(); 
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
        toast.dismiss(toastId);
    }
  };

  const getImgUrl = (imgItem) => {
    if (!imgItem) return '';
    return typeof imgItem === 'string' ? imgItem : imgItem.url;
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-500">Đang tải dữ liệu...</div>;
  if (!tour) return <div className="flex justify-center items-center h-screen text-slate-500">Không tìm thấy tour.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <button 
            onClick={() => navigate('/tours')} 
            className="flex items-center text-slate-500 hover:text-blue-600 mb-2 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{tour.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-sm font-mono font-bold">
              {tour.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
              tour.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {tour.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
              {tour.status === 'active' ? 'Đang mở bán' : 'Bản nháp'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md font-medium"
        >
          <Edit size={18}/> Chỉnh sửa Tour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-100 relative group flex items-center justify-center">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={tour.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Error+Loading+Image';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ImageIcon size={48} className="mb-2 opacity-50"/>
                    <span>Chưa có hình ảnh</span>
                </div>
              )}
            </div>
            {/* Thumbs */}
            {tour.images && tour.images.length > 0 && (
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 pb-2">
                  {tour.images.map((img, idx) => {
                    const url = getImgUrl(img);
                    return (
                      <button 
                        key={img.id || idx}
                        onClick={() => setSelectedImage(url)}
                        className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${url === selectedImage ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`}/>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">Giới thiệu</h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line mb-8">
              {tour.description || <span className="text-slate-400 italic">Chưa có mô tả chi tiết.</span>}
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

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <TourVersionManager tourId={tour.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-5 pb-2 border-b">Thông tin hành trình</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Clock size={20} /></div>
                <div><span className="block font-bold text-slate-700 mb-0.5">Thời lượng</span><span className="text-slate-600 font-medium">{tour.duration_days} Ngày / {tour.duration_nights} Đêm</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0"><MapPin size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Điểm khởi hành</span><span className="text-slate-600 font-medium">{tour.departure_location || "Chưa cập nhật"}</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0"><Globe size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Điểm đến</span><span className="text-slate-600 font-medium">{tour.destination || "Chưa cập nhật"}</span></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0"><Users size={20} /></div>
                 <div><span className="block font-bold text-slate-700 mb-0.5">Quy mô nhóm</span><span className="text-slate-600 font-medium">{tour.min_group_size} - {tour.max_group_size} khách</span></div>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase">Cài đặt khác</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-500">Thiết kế riêng</span><span className={`font-bold px-2 py-0.5 rounded text-xs ${tour.is_customizable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{tour.is_customizable ? 'Có' : 'Không'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Danh mục ID</span><span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{tour.category_id}</span></div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* [MỚI] Modal Chỉnh sửa Tour */}
      <TourForm 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateTour}
        initialData={tour}
        categories={categories}
        title={`Cập nhật Tour: ${tour.code}`}
      />
    </div>
  );
};

export default TourDetail;